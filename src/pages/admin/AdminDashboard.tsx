import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Activity, TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeChannels: 0,
    todayPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
            activeChannels: data.total_channels || 0,
            todayPosts: 0, // TODO: Add today's posts count to API
          });
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Total Posts", value: stats.totalPosts, icon: FileText, color: "text-green-500" },
    { title: "Active Channels", value: stats.activeChannels, icon: Activity, color: "text-purple-500" },
    { title: "Posts Today", value: stats.todayPosts, icon: TrendingUp, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
