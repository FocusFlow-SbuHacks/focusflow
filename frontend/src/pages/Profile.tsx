import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { User, Mail, Bell, Shield } from "lucide-react";
import { useAuth0 } from "@/lib/auth0";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { User as DbUser } from "@/lib/api";
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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

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
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive session summaries</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>Configure</Button>
                  </div>
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
                        <Label htmlFor="email-session-summary">Session Summaries</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email summaries after each focus session
                        </p>
                      </div>
                      <Switch
                        id="email-session-summary"
                        checked={emailNotifications}
                        onCheckedChange={(checked) => {
                          setEmailNotifications(checked);
                          toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
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
                        checked={emailNotifications}
                        onCheckedChange={(checked) => {
                          setEmailNotifications(checked);
                          toast.success(checked ? "Weekly reports enabled" : "Weekly reports disabled");
                        }}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    <Bell className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Get focus reminders</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>Configure</Button>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Push Notifications</DialogTitle>
                    <DialogDescription>
                      Manage your browser notification preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-focus-reminders">Focus Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your focus drops
                        </p>
                      </div>
                      <Switch
                        id="push-focus-reminders"
                        checked={pushNotifications}
                        onCheckedChange={async (checked) => {
                          if (checked) {
                            // Request notification permission
                            const permission = await Notification.requestPermission();
                            if (permission === 'granted') {
                              setPushNotifications(true);
                              toast.success("Push notifications enabled");
                            } else {
                              toast.error("Notification permission denied");
                            }
                          } else {
                            setPushNotifications(false);
                            toast.success("Push notifications disabled");
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-session-alerts">Session Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when sessions start and end
                        </p>
                      </div>
                      <Switch
                        id="push-session-alerts"
                        checked={pushNotifications}
                        onCheckedChange={async (checked) => {
                          if (checked) {
                            const permission = await Notification.requestPermission();
                            if (permission === 'granted') {
                              setPushNotifications(true);
                              toast.success("Session alerts enabled");
                            } else {
                              toast.error("Notification permission denied");
                            }
                          } else {
                            setPushNotifications(false);
                            toast.success("Session alerts disabled");
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
