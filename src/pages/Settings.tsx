import { useState } from "react";
import { 
  User,
  Users,
  CreditCard,
  Key,
  Bell,
  Shield,
  Mail,
  ChevronRight,
  Plus,
  Trash2,
  Crown,
  Edit2,
  Settings2
} from "lucide-react";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const teamMembers = [
  { name: "John Doe", email: "john@company.com", role: "Owner", avatar: "JD" },
  { name: "Sarah Smith", email: "sarah@company.com", role: "Admin", avatar: "SS" },
  { name: "Mike Johnson", email: "mike@company.com", role: "Editor", avatar: "MJ" },
  { name: "Emily Brown", email: "emily@company.com", role: "Publisher", avatar: "EB" },
];

const plans = [
  { name: "Starter", price: "$29", features: ["3 channels", "100 posts/mo", "Basic analytics"], current: false },
  { name: "Pro", price: "$79", features: ["10 channels", "Unlimited posts", "Advanced analytics", "Team collaboration"], current: true },
  { name: "Enterprise", price: "$199", features: ["Unlimited channels", "Priority support", "Custom integrations", "API access"], current: false },
];

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    postSuccess: true,
    postFailed: true,
    tokenExpiry: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold neon-text">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, team, and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted/30 p-1 inline-flex min-w-max sm:w-auto">
            <TabsTrigger value="profile" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Team</span>
              <span className="sm:hidden">Team</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Billing</span>
              <span className="sm:hidden">Bill</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">API Keys</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 animate-fade-in">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  JD
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="John" className="bg-muted/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Doe" className="bg-muted/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="john@company.com" className="bg-muted/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input defaultValue="Brand Inc." className="bg-muted/30 border-border/50" />
                </div>
              </div>

              <Button className="bg-neon-gradient hover:opacity-90">Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6 animate-fade-in">
          <Card className="glass-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team and their permissions.</CardDescription>
              </div>
              <Button className="gap-2 bg-neon-gradient hover:opacity-90 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center font-medium flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{member.name}</p>
                          {member.role === "Owner" && (
                            <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
                      <span className={cn(
                        "px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium",
                        member.role === "Owner" ? "bg-yellow-500/20 text-yellow-500" :
                        member.role === "Admin" ? "bg-primary/20 text-primary" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {member.role}
                      </span>
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {member.role !== "Owner" && (
                        <Button variant="ghost" size="icon" className="rounded-xl text-destructive h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6 animate-fade-in">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative p-6 rounded-xl border-2 transition-all",
                      plan.current
                        ? "border-primary bg-primary/5 neon-glow"
                        : "border-border/50 bg-muted/30 hover:border-primary/50"
                    )}
                  >
                    {plan.current && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-3xl font-bold mt-2">
                      {plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <ChevronRight className="w-3 h-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.current ? "outline" : "default"}
                      className={cn("w-full mt-6", !plan.current && "bg-neon-gradient hover:opacity-90")}
                    >
                      {plan.current ? "Manage" : "Upgrade"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 animate-fade-in">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h4 className="font-medium mb-4">Notify me about</h4>
                <div className="space-y-4">
                  {[
                    { key: "postSuccess", label: "Successful posts" },
                    { key: "postFailed", label: "Failed posts" },
                    { key: "tokenExpiry", label: "Token expiry warnings" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6 animate-fade-in">
          <ApiKeySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
