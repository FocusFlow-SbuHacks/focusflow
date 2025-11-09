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
  const [liveMetrics, setLiveMetrics] = useState({ typingSpeed: 0, idleTime: 0, tabSwitches: 0 });

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
          // If no active session, redirect to dashboard to set up
          navigate("/");
          return;
        }
        setSession(activeSession);
        // Set timer based on session duration or default to 25 minutes
        // Note: duration in session is total duration, but we need timeLeft for countdown
        // If session was just created, use the duration from creation
        // Otherwise, calculate remaining time
        if (activeSession.duration && activeSession.duration > 0) {
          const sessionStartTime = new Date(activeSession.startTime).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - sessionStartTime) / 1000);
          const remaining = Math.max(0, activeSession.duration - elapsed);
          setTimeLeft(remaining);
        } else {
          // Default to 25 minutes if no duration set
          setTimeLeft(25 * 60);
        }
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
    
    // Update live metrics immediately
    setLiveMetrics(metrics);
    
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
      const endedSession = await apiClient.endSession(session._id);
      // Use average focus score from session, not current score
      const finalScore = Math.round(endedSession.averageFocusScore || focusScore);
      
      // Calculate total idle time from session data points
      let totalIdleTime = 0;
      if (endedSession.focusDataPoints && endedSession.focusDataPoints.length > 0) {
        // Get the maximum idle time (not sum, as idle time is cumulative)
        totalIdleTime = Math.max(...endedSession.focusDataPoints.map(p => p.idleTime || 0));
      }
      
      // Get last AI message
      const lastAiMessage = endedSession.focusDataPoints && endedSession.focusDataPoints.length > 0
        ? endedSession.focusDataPoints[endedSession.focusDataPoints.length - 1]?.aiMessage
        : aiMessage;
      
      const params = new URLSearchParams({
        session: "ended",
        score: finalScore.toString(),
      });
      
      if (endedSession.task) params.set("task", endedSession.task);
      if (endedSession.duration) params.set("duration", endedSession.duration.toString());
      if (totalIdleTime) params.set("idleTime", totalIdleTime.toString());
      if (lastAiMessage) params.set("aiMessage", lastAiMessage);
      
      navigate(`/?${params.toString()}`);
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
            {session?.task && (
              <p className="text-lg font-medium text-primary">Task: {session.task}</p>
            )}
          </div>

          <Card className="p-8">
            <PomodoroTimer 
              timeLeft={timeLeft} 
              isRunning={isRunning}
              onPause={handlePause}
              onEnd={handleEndSession}
            />
          </Card>

          {/* Live Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Metrics</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Typing Activity</p>
                <p className="text-2xl font-bold">
                  {liveMetrics.typingSpeed > 0 ? "Active" : "Idle"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {liveMetrics.typingSpeed} keys/min
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tab Switches</p>
                <p className="text-2xl font-bold">{liveMetrics.tabSwitches}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Idle Time</p>
                <p className="text-2xl font-bold">
                  {liveMetrics.idleTime < 60 
                    ? `${liveMetrics.idleTime}s` 
                    : `${Math.floor(liveMetrics.idleTime / 60)}m ${liveMetrics.idleTime % 60}s`}
                </p>
              </div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">
                AI analyzing your focus behavior in real time…
              </p>
            </div>
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
              {aiMessage && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  AI analyzing your focus behavior in real time…
                </p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FocusSession;
