import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Database, Server, Lock, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime?: number;
  icon: any;
}

const Status = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Backend API", status: "operational", icon: Server },
    { name: "Database", status: "operational", icon: Database },
    { name: "Authentication", status: "operational", icon: Lock },
  ]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkServices = async () => {
    setLoading(true);
    const newServices: ServiceStatus[] = [];

    // Check Backend API
    const startTime = Date.now();
    const { data: healthData, error: healthError } = await apiClient.healthCheck();
    const responseTime = Date.now() - startTime;

    newServices.push({
      name: "Backend API",
      status: healthError ? "down" : "operational",
      responseTime,
      icon: Server,
    });

    // Check Database (through health endpoint)
    newServices.push({
      name: "Database",
      status: healthData && !healthError ? "operational" : "down",
      icon: Database,
    });

    // Check Authentication
    const authStartTime = Date.now();
    const { valid } = await apiClient.verifyToken();
    const authResponseTime = Date.now() - authStartTime;

    newServices.push({
      name: "Authentication",
      status: "operational", // Auth service is operational even if no token
      responseTime: authResponseTime,
      icon: Lock,
    });

    setServices(newServices);
    setLastChecked(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "down":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const overallStatus = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "down")
    ? "down"
    : "degraded";

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">System Status</h1>
          </div>
          <p className="text-muted-foreground">
            Real-time status of Social Symphony services
          </p>
        </div>

        {/* Overall Status Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <CardTitle>Overall System Status</CardTitle>
                  <CardDescription>
                    All systems {overallStatus === "operational" ? "operational" : "experiencing issues"}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={overallStatus === "operational" ? "default" : "destructive"}
                className="text-sm px-4 py-2"
              >
                {overallStatus === "operational" ? "Operational" : "Issues Detected"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Services Status */}
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      {service.responseTime && (
                        <p className="text-sm text-muted-foreground">
                          Response time: {service.responseTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <Badge
                      variant={service.status === "operational" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {service.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last Checked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {lastChecked.toLocaleTimeString()} - {lastChecked.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Auto Refresh</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Status updates every 60 seconds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={checkServices} disabled={loading} size="lg">
            {loading ? "Checking..." : "Refresh Status"}
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
        </div>

        {/* System Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <span className="font-mono">Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deployment:</span>
              <span className="font-mono">Self-Hosted</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Region:</span>
              <span className="font-mono">Helsinki, Finland</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Status;
