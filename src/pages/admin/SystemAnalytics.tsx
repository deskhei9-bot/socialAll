import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SystemAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalChannels: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${apiClient['apiUrl']}/users/stats`, {
          headers: {
            'Authorization': `Bearer ${apiClient['token']}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.total_users || 0,
            totalPosts: data.total_posts || 0,
            totalChannels: data.total_channels || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const analyticsCards = [
    { 
      title: "Total Users", 
      value: stats.totalUsers, 
      icon: Users, 
      color: "text-blue-500",
      description: "Registered users in the system"
    },
    { 
      title: "Total Posts", 
      value: stats.totalPosts, 
      icon: BarChart3, 
      color: "text-green-500",
      description: "Posts created across all platforms"
    },
    { 
      title: "Connected Channels", 
      value: stats.totalChannels, 
      icon: Activity, 
      color: "text-purple-500",
      description: "Active social media connections"
    },
    { 
      title: "Growth Rate", 
      value: "+12%", 
      icon: TrendingUp, 
      color: "text-orange-500",
      description: "Month over month growth"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <p className="text-muted-foreground">Platform usage and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card) => (
          <Card key={card.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {loading ? "..." : card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">User Engagement</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Post Success Rate</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Channel Health</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "78%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
