import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxPostsPerDay: 100,
    sessionTimeout: 30,
  });

  const handleSave = () => {
    // TODO: Implement save settings to backend
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable user access
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Enable new user signups
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allowRegistration: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireEmailVerification: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Limits & Quotas</CardTitle>
            <CardDescription>Set system resource limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Max Posts Per Day (per user)</Label>
              <Input
                type="number"
                value={settings.maxPostsPerDay}
                onChange={(e) =>
                  setSettings({ ...settings, maxPostsPerDay: parseInt(e.target.value) })
                }
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of posts a user can create per day
              </p>
            </div>

            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                }
              />
              <p className="text-sm text-muted-foreground">
                Automatically log out inactive users
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">Version</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">Environment</span>
              <span className="text-sm text-muted-foreground">Production</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm font-medium">Database</span>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium">API Status</span>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
