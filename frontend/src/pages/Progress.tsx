import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Navigation } from "@/components/Navigation";
import { Activity, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useAuth0 } from "@/lib/auth0";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const Progress = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [analytics, setAnalytics] = useState<any>(null);
  const [avgFocus, setAvgFocus] = useState("--");
  const [bestHour, setBestHour] = useState("--");
  const [sessionCount, setSessionCount] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState("--");
  const [aiInsights, setAiInsights] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user || isLoading) return;

    const loadProgressData = async () => {
      try {
        // Get user first
        const userData = await apiClient.createOrGetUser(
          user.sub || '',
          user.email || '',
          user.name || '',
          user.picture
        );

        // Load analytics
        const analyticsData = await apiClient.getFocusAnalytics(userData._id, 7);
        setAnalytics(analyticsData);
        setAvgFocus(`${Math.round(analyticsData.averageScore || 0)}%`);
        
        if (analyticsData.bestHour !== null) {
          const hour = analyticsData.bestHour;
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          setBestHour(`${displayHour}-${displayHour + 1} ${period}`);
        }

        // Get session history
        const sessions = await apiClient.getSessionHistory(userData._id, 100);
        setSessionCount(sessions.length);

        // Calculate weekly change
        if (sessions.length > 0) {
          const thisWeekSessions = sessions.filter((s: any) => {
            const sessionDate = new Date(s.startTime);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
          });
          const lastWeekSessions = sessions.length - thisWeekSessions.length;
          if (lastWeekSessions > 0) {
            const change = thisWeekSessions.length - lastWeekSessions;
            setWeeklyChange(change > 0 ? `+${change} this week` : `${change} this week`);
          } else {
            setWeeklyChange(`+${thisWeekSessions.length} this week`);
          }
        }

        // Generate AI insights
        if (analyticsData.averageScore && analyticsData.bestHour !== null) {
          const hour = analyticsData.bestHour;
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const insights = `You focused best in the ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, particularly between ${displayHour}-${displayHour + 1} ${period}. Your average focus score is ${Math.round(analyticsData.averageScore)}%. Try scheduling your most demanding tasks during your peak hours to maximize productivity.`;
          setAiInsights(insights);
        } else {
          setAiInsights("Start tracking your focus sessions to see personalized insights and recommendations based on your productivity patterns.");
        }
      } catch (error) {
        console.error("Error loading progress data:", error);
        toast.error("Failed to load progress data");
      }
    };

    loadProgressData();
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FocusFlow</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Productivity Dashboard</p>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Progress & Analytics</h2>
            <p className="text-muted-foreground">Track your focus patterns and productivity trends</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              title="Avg Focus"
              value={avgFocus}
              icon={<Activity className="h-5 w-5" />}
              trend={weeklyChange !== "--" ? `+${Math.round((analytics?.averageScore || 0) - 70)}% this week` : "--"}
            />
            <StatCard
              title="Best Hour"
              value={bestHour}
              icon={<Clock className="h-5 w-5" />}
              trend="Peak Time"
            />
            <StatCard
              title="Total Sessions"
              value={sessionCount.toString()}
              icon={<TrendingUp className="h-5 w-5" />}
              trend={weeklyChange}
            />
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Focus History</h3>
            <AnalyticsChart data={analytics?.dailyData || []} />
          </Card>

          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50 p-6">
            <div className="absolute right-4 top-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">AI Insights</h3>
              <p className="text-foreground leading-relaxed">
                {aiInsights || "Start tracking your focus sessions to see personalized insights and recommendations based on your productivity patterns."}
              </p>
              <p className="text-sm text-muted-foreground">
                Generated based on your last 7 days of activity
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Progress;
