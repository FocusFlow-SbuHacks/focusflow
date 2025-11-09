import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FocusGauge } from "@/components/dashboard/FocusGauge";
import { AIMotivation } from "@/components/dashboard/AIMotivation";
import { SessionControls } from "@/components/dashboard/SessionControls";
import { SessionSummary } from "@/components/dashboard/SessionSummary";
import { SessionSetup } from "@/components/dashboard/SessionSetup";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Navigation } from "@/components/Navigation";
import { Activity, Clock, TrendingUp } from "lucide-react";
import { useAuth0 } from "@/lib/auth0";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import type { User, FocusSession } from "@/lib/api";

type SessionStatus = "idle" | "active" | "paused";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [searchParams, setSearchParams] = useSearchParams();
  const [focusScore, setFocusScore] = useState(75);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [showSummary, setShowSummary] = useState(false);
  const [lastSessionScore, setLastSessionScore] = useState(0);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [avgFocus, setAvgFocus] = useState("--");
  const [bestHour, setBestHour] = useState("--");
  const [sessionCount, setSessionCount] = useState(0);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [showSessionSetup, setShowSessionSetup] = useState(false);

  // Poll for active session updates to get latest focus score
  useEffect(() => {
    if (!dbUser || !activeSession || sessionStatus !== 'active') return;

    const pollSession = async () => {
      try {
        const updatedSession = await apiClient.getSession(activeSession._id);
        if (updatedSession && updatedSession.focusDataPoints && updatedSession.focusDataPoints.length > 0) {
          // Get the latest focus score from the most recent data point
          const latestPoint = updatedSession.focusDataPoints[updatedSession.focusDataPoints.length - 1];
          setFocusScore(latestPoint.focusScore);
          
          // Find the most recent data point with AI message
          const withMessage = [...updatedSession.focusDataPoints].reverse().find((p: any) => p.aiMessage);
          if (withMessage?.aiMessage) {
            setAiMessage(withMessage.aiMessage);
          }
          
          // Find the most recent data point with voice URL
          const withVoice = [...updatedSession.focusDataPoints].reverse().find((p: any) => p.voiceUrl);
          if (withVoice?.voiceUrl) {
            setVoiceUrl(withVoice.voiceUrl);
          }
          
          setActiveSession(updatedSession);
        }
      } catch (error) {
        console.warn("Error polling session:", error);
      }
    };

    // Poll every 5 seconds if session is active
    const interval = setInterval(pollSession, 5000);
    return () => clearInterval(interval);
  }, [dbUser, activeSession?._id, sessionStatus]);

  // Initialize user data
  useEffect(() => {
    if (!isAuthenticated || !user || isLoading) return;

    const initializeUser = async () => {
      try {
        const userData = await apiClient.createOrGetUser(
          user.sub || '',
          user.email || '',
          user.name || '',
          user.picture
        );
        setDbUser(userData);

        // Check for active session (404 is normal if no active session)
        const session = await apiClient.getActiveSession(userData._id);
        if (session) {
          setActiveSession(session);
          setSessionStatus(session.status === 'paused' ? 'paused' : 'active');
          
          // Set initial focus score from session if available
          if (session.focusDataPoints && session.focusDataPoints.length > 0) {
            const latestPoint = session.focusDataPoints[session.focusDataPoints.length - 1];
            setFocusScore(latestPoint.focusScore);
            
            // Find the most recent data point with AI message
            const withMessage = [...session.focusDataPoints].reverse().find((p: any) => p.aiMessage);
            if (withMessage?.aiMessage) {
              setAiMessage(withMessage.aiMessage);
            }
            
            // Find the most recent data point with voice URL
            const withVoice = [...session.focusDataPoints].reverse().find((p: any) => p.voiceUrl);
            if (withVoice?.voiceUrl) {
              setVoiceUrl(withVoice.voiceUrl);
            }
          } else if (session.averageFocusScore > 0) {
            setFocusScore(Math.round(session.averageFocusScore));
          }
        } else {
          // No active session - get latest focus score from history
          try {
            // Get more history to find one with AI message/voice
            const focusHistory = await apiClient.getFocusHistory(userData._id, undefined, undefined, 10);
            if (focusHistory && focusHistory.length > 0) {
              const latest = focusHistory[0];
              setFocusScore(latest.focusScore || 75);
              
              // Find the most recent entry with AI message
              const withMessage = focusHistory.find((entry: any) => entry.aiMessage);
              if (withMessage?.aiMessage) {
                setAiMessage(withMessage.aiMessage);
              }
              
              // Find the most recent entry with voice URL
              const withVoice = focusHistory.find((entry: any) => entry.voiceUrl);
              if (withVoice?.voiceUrl) {
                setVoiceUrl(withVoice.voiceUrl);
              }
            }
          } catch (error) {
            console.warn("Could not load latest focus score:", error);
          }
        }

        // Load analytics
        try {
          const analyticsData = await apiClient.getFocusAnalytics(userData._id, 7);
          setAnalytics(analyticsData);
          setAvgFocus(`${Math.round(analyticsData.averageScore || 0)}%`);
          
          if (analyticsData.bestHour !== null) {
            const hour = analyticsData.bestHour;
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            setBestHour(`${displayHour}-${displayHour + 1} ${period}`);
          }
        } catch (error) {
          console.warn("Could not load analytics:", error);
          // Analytics failure is not critical, continue
        }

        // Get session count
        try {
          const sessions = await apiClient.getSessionHistory(userData._id, 100);
          const today = new Date().toISOString().split('T')[0];
          const todaySessions = sessions.filter((s: any) => 
            new Date(s.startTime).toISOString().split('T')[0] === today
          );
          setSessionCount(todaySessions.length);
        } catch (error) {
          console.warn("Could not load session history:", error);
          // Session history failure is not critical, continue
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        toast.error("Failed to load dashboard data");
      }
    };

    initializeUser();
  }, [isAuthenticated, user, isLoading]);

  const [sessionSummaryData, setSessionSummaryData] = useState<{
    task?: string;
    duration?: number;
    idleTime?: number;
    aiMessage?: string;
  } | null>(null);

  // Handle session end from URL params
  useEffect(() => {
    const session = searchParams.get("session");
    const score = searchParams.get("score");
    const task = searchParams.get("task");
    const duration = searchParams.get("duration");
    const idleTime = searchParams.get("idleTime");
    const aiMessage = searchParams.get("aiMessage");
    
    if (session === "ended" && score) {
      setShowSummary(true);
      setLastSessionScore(parseInt(score));
      setSessionSummaryData({
        task: task || undefined,
        duration: duration ? parseInt(duration) : undefined,
        idleTime: idleTime ? parseInt(idleTime) : undefined,
        aiMessage: aiMessage || undefined,
      });
      setSearchParams({});
      
      // Refresh data
      if (dbUser) {
        apiClient.getFocusAnalytics(dbUser._id, 7).then(setAnalytics);
        apiClient.getActiveSession(dbUser._id).then(session => {
          if (!session) {
            setActiveSession(null);
            setSessionStatus("idle");
          }
        });
      }
    }
  }, [searchParams, setSearchParams, dbUser]);

  const handleSessionStart = () => {
    if (sessionStatus === "idle") {
      setShowSessionSetup(true);
    } else {
      navigate("/focus-session");
    }
  };

  const handleSessionSetupComplete = async (config: { task: string; duration: number; mood: string }) => {
    if (!dbUser) return;
    
    try {
      await apiClient.createSession(dbUser._id, config.task, config.mood, config.duration);
      setShowSessionSetup(false);
      navigate("/focus-session");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to start session");
    }
  };

  const handleSessionPause = async () => {
    if (!activeSession || !dbUser) return;
    
    try {
      await apiClient.updateSession(activeSession._id, 'paused');
      setSessionStatus("paused");
    } catch (error) {
      console.error("Error pausing session:", error);
      toast.error("Failed to pause session");
    }
  };

  const handleSessionEnd = async () => {
    if (!activeSession || !dbUser) return;
    
    try {
      await apiClient.endSession(activeSession._id);
      setActiveSession(null);
      setSessionStatus("idle");
      toast.success("Session ended");
      
      // Refresh data
      const analyticsData = await apiClient.getFocusAnalytics(dbUser._id, 7);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end session");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FocusFlow</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Productivity Dashboard</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                FocusFlow tracks your study concentration using typing, tab switches, and idle time — giving you a real-time Focus Score.
              </p>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            {showSummary && (
              <SessionSummary 
                score={lastSessionScore}
                task={sessionSummaryData?.task}
                duration={sessionSummaryData?.duration}
                idleTime={sessionSummaryData?.idleTime}
                aiMessage={sessionSummaryData?.aiMessage}
              />
            )}
            
            <div>
              <h2 className="mb-4 text-xl font-semibold">Today's Overview</h2>
              <div className="space-y-3">
                <StatCard
                  title="Avg Focus"
                  value={avgFocus}
                  icon={<Activity className="h-5 w-5" />}
                  trend={analytics?.averageScore ? `+${Math.round((analytics.averageScore - 70) / 10)}%` : "--"}
                />
                <StatCard
                  title="Best Hour"
                  value={bestHour}
                  icon={<Clock className="h-5 w-5" />}
                  trend="Peak Time"
                />
                <StatCard
                  title="Sessions"
                  value={sessionCount.toString()}
                  icon={<TrendingUp className="h-5 w-5" />}
                  trend="Today"
                />
              </div>
            </div>

            <AIMotivation message={aiMessage || undefined} voiceUrl={voiceUrl || undefined} />
          </div>

          {/* Center Column - Focus Gauge */}
          <div className="space-y-6">
            {showSessionSetup ? (
              <SessionSetup onStart={handleSessionSetupComplete} />
            ) : (
              <>
                <Card className="p-8">
                  <FocusGauge score={focusScore} status={sessionStatus} />
                </Card>
                <SessionControls
                  status={sessionStatus}
                  onStart={handleSessionStart}
                  onPause={handleSessionPause}
                  onEnd={handleSessionEnd}
                />
              </>
            )}
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold">Focus History</h2>
              <Card className="p-6">
                <AnalyticsChart data={analytics?.dailyData || []} />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
