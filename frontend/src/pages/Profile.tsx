import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { User, Mail, Shield } from "lucide-react";
import { useAuth0 } from "@/lib/auth0";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { User as DbUser, EmailNotifications } from "@/lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Profile = () => {
  const { user: auth0User, isAuthenticated, isLoading } = useAuth0();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailPrefs, setEmailPrefs] = useState<EmailNotifications>({
    enabled: true,
    focusDropAlerts: true,
    sessionSummaries: false,
    weeklyReports: false,
  });

  useEffect(() => {
    if (!isAuthenticated || !auth0User || isLoading) return;

    const loadUserData = async () => {
      try {
        const userData = await apiClient.createOrGetUser(
          auth0User.sub || '',
          auth0User.email || '',
          auth0User.name || '',
          auth0User.picture
        );
        setDbUser(userData);
        if (userData.emailNotifications) {
          setEmailPrefs(userData.emailNotifications);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, auth0User, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const displayName = dbUser?.name || auth0User?.name || "User";
  const displayEmail = dbUser?.email || auth0User?.email || "";
  const displayPicture = dbUser?.picture || auth0User?.picture;

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
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Profile Settings</h2>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              {displayPicture ? (
                <Avatar className="h-20 w-20">
                  <AvatarImage src={displayPicture} alt={displayName} />
                  <AvatarFallback>
                    <User className="h-10 w-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
                {dbUser && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Total Sessions: {dbUser.totalSessions}</p>
                    <p>Total Focus Time: {Math.floor(dbUser.totalFocusTime)} minutes</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-4 h-auto hover:bg-muted">
                    <div className="flex items-center gap-3 w-full">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="flex-1 text-left">
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Get alerts when your focus drops</p>
                      </div>
                      <span className="text-sm text-muted-foreground">Configure</span>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Email Notifications</DialogTitle>
                    <DialogDescription>
                      Manage your email notification preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-enabled">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable all email notifications
                        </p>
                      </div>
                      <Switch
                        id="email-enabled"
                        checked={emailPrefs.enabled}
                        onCheckedChange={async (checked) => {
                          const newPrefs = { ...emailPrefs, enabled: checked };
                          setEmailPrefs(newPrefs);
                          if (dbUser) {
                            try {
                              await apiClient.updateUserPreferences(dbUser._id, { emailNotifications: newPrefs });
                              toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
                            } catch (error) {
                              console.error("Error updating preferences:", error);
                              toast.error("Failed to update preferences");
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-focus-drop">Focus Drop Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your focus score drops drastically
                        </p>
                      </div>
                      <Switch
                        id="email-focus-drop"
                        checked={emailPrefs.focusDropAlerts}
                        disabled={!emailPrefs.enabled}
                        onCheckedChange={async (checked) => {
                          const newPrefs = { ...emailPrefs, focusDropAlerts: checked };
                          setEmailPrefs(newPrefs);
                          if (dbUser) {
                            try {
                              await apiClient.updateUserPreferences(dbUser._id, { emailNotifications: newPrefs });
                              toast.success(checked ? "Focus drop alerts enabled" : "Focus drop alerts disabled");
                            } catch (error) {
                              console.error("Error updating preferences:", error);
                              toast.error("Failed to update preferences");
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-session-summary">Session Summaries</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email summaries after each focus session
                        </p>
                      </div>
                      <Switch
                        id="email-session-summary"
                        checked={emailPrefs.sessionSummaries}
                        disabled={!emailPrefs.enabled}
                        onCheckedChange={async (checked) => {
                          const newPrefs = { ...emailPrefs, sessionSummaries: checked };
                          setEmailPrefs(newPrefs);
                          if (dbUser) {
                            try {
                              await apiClient.updateUserPreferences(dbUser._id, { emailNotifications: newPrefs });
                              toast.success(checked ? "Session summaries enabled" : "Session summaries disabled");
                            } catch (error) {
                              console.error("Error updating preferences:", error);
                              toast.error("Failed to update preferences");
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-weekly-report">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Get weekly productivity reports every Monday
                        </p>
                      </div>
                      <Switch
                        id="email-weekly-report"
                        checked={emailPrefs.weeklyReports}
                        disabled={!emailPrefs.enabled}
                        onCheckedChange={async (checked) => {
                          const newPrefs = { ...emailPrefs, weeklyReports: checked };
                          setEmailPrefs(newPrefs);
                          if (dbUser) {
                            try {
                              await apiClient.updateUserPreferences(dbUser._id, { emailNotifications: newPrefs });
                              toast.success(checked ? "Weekly reports enabled" : "Weekly reports disabled");
                            } catch (error) {
                              console.error("Error updating preferences:", error);
                              toast.error("Failed to update preferences");
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Privacy & Security</p>
                  <p className="text-sm text-muted-foreground">Manage your data</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info("Privacy settings coming soon!")}
                >
                  Configure
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
