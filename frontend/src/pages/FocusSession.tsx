import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PomodoroTimer } from "@/components/dashboard/PomodoroTimer";
import { FocusGauge } from "@/components/dashboard/FocusGauge";
import { AIMotivation } from "@/components/dashboard/AIMotivation";
import { ArrowLeft } from "lucide-react";
import { useAuth0 } from "@/lib/auth0";
import { useFocusTracking } from "@/hooks/useFocusTracking";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import type { FocusSession, User } from "@/lib/api";

const FocusSession = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [focusScore, setFocusScore] = useState(75);
  const [focusLabel, setFocusLabel] = useState<'Focused' | 'Losing Focus' | 'Distracted'>('Focused');
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(true);
  const [session, setSession] = useState<FocusSession | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize user and session
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    const initializeSession = async () => {
      try {
        // Get or create user
        const userData = await apiClient.createOrGetUser(
          user.sub || '',
          user.email || '',
          user.name || '',
          user.picture
        );
        setDbUser(userData);
        setUserId(userData._id);

        // Get or create active session
        let activeSession = await apiClient.getActiveSession(userData._id);
        if (!activeSession) {
          activeSession = await apiClient.createSession(userData._id);
        }
        setSession(activeSession);
      } catch (error) {
        console.error("Error initializing session:", error);
        toast.error("Failed to start session");
      }
    };

    initializeSession();
  }, [isAuthenticated, user, navigate]);

  // Focus tracking callback - use useCallback to prevent recreation
  const handleFocusDataUpdate = useCallback(async (metrics: { typingSpeed: number; idleTime: number; tabSwitches: number }) => {
    console.log("🔄 handleFocusDataUpdate called with:", metrics);
    console.log("🔄 Current state:", { userId, session: session?._id, isRunning });
    
    if (!userId || !session) {
      console.warn("⚠️ Focus tracking skipped: userId or session missing", { userId, session: !!session });
      return;
    }

    try {
      console.log("📤 Sending focus metrics to backend:", {
        userId,
        sessionId: session._id,
        metrics
      });
      
      const result = await apiClient.trackFocus(
        userId,
        session._id,
        metrics.typingSpeed,
        metrics.idleTime,
        metrics.tabSwitches
      );

      console.log("✅ Focus tracking result:", result);
      setFocusScore(result.focusScore);
      setFocusLabel(result.focusLabel);
      if (result.aiMessage) {
        setAiMessage(result.aiMessage);
      }
      if (result.voiceUrl) {
        setVoiceUrl(result.voiceUrl);
        // Play voice feedback
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(result.voiceUrl);
        audioRef.current = audio;
        audio.play().catch(err => console.error("Error playing audio:", err));
      }
    } catch (error) {
      console.error("❌ Error tracking focus:", error);
    }
  }, [userId, session]);

  const { resetMetrics } = useFocusTracking(isRunning && session !== null, handleFocusDataUpdate);

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft === 0 || !session) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, session]);

  // Update session duration
  useEffect(() => {
    if (!session || !isRunning) return;

    const interval = setInterval(async () => {
      if (session) {
        const duration = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
        try {
          await apiClient.updateSession(session._id, undefined, duration);
        } catch (error) {
          console.error("Error updating session:", error);
        }
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [session, isRunning]);

  const handlePause = async () => {
    if (!session) return;
    
    const newStatus = isRunning ? 'paused' : 'active';
    setIsRunning(!isRunning);
    
    try {
      await apiClient.updateSession(session._id, newStatus);
    } catch (error) {
      console.error("Error updating session status:", error);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;

    try {
      await apiClient.endSession(session._id);
      const finalScore = focusScore;
      navigate(`/?session=ended&score=${finalScore}`);
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Error ending session");
    }
  };

  if (!isAuthenticated || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Focus Session Active</h1>
            <p className="text-muted-foreground">Stay focused and track your progress</p>
          </div>

          <Card className="p-8">
            <PomodoroTimer 
              timeLeft={timeLeft} 
              isRunning={isRunning}
              onPause={handlePause}
              onEnd={handleEndSession}
            />
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Focus Score</h3>
              <FocusGauge score={focusScore} status={isRunning ? "active" : "paused"} />
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Status: {focusLabel}</p>
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-4">AI Feedback</h3>
              <AIMotivation message={aiMessage || undefined} voiceUrl={voiceUrl || undefined} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FocusSession;
