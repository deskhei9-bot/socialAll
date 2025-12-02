import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  ArrowUpRight,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useChannels } from "@/hooks/useChannels";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const logStyles: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  success: { icon: <CheckCircle2 className="w-4 h-4" />, bg: "bg-neon-green/10", text: "text-neon-green" },
  error: { icon: <XCircle className="w-4 h-4" />, bg: "bg-destructive/10", text: "text-destructive" },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, bg: "bg-yellow-500/10", text: "text-yellow-500" },
  info: { icon: <Clock className="w-4 h-4" />, bg: "bg-neon-cyan/10", text: "text-neon-cyan" },
};

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
};

const platformColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  youtube: "#FF0000",
  tiktok: "#00F2EA",
};

const statusColors: Record<string, string> = {
  published: "#22C55E",
  scheduled: "#3B82F6",
  draft: "#6B7280",
  failed: "#EF4444",
  queued: "#A855F7",
  publishing: "#F59E0B",
};

const CHART_COLORS = ["#818CF8", "#22D3EE", "#A78BFA", "#34D399", "#F472B6"];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const { logs, loading: logsLoading } = useActivityLogs(10);
  const { channels, loading: channelsLoading } = useChannels();
  const { data: analytics, loading: analyticsLoading } = useAnalytics(parseInt(dateRange));

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const overviewStats = [
    { 
      label: "Total Reach", 
      value: formatNumber(analytics?.totalReach || 0), 
      change: "+18%", 
      trend: "up", 
      icon: Eye,
      description: "Impressions across all platforms"
    },
    { 
      label: "Engagement", 
      value: formatNumber(analytics?.totalEngagement || 0), 
      change: "+12%", 
      trend: "up", 
      icon: Heart,
      description: "Likes, comments, shares"
    },
    { 
      label: "Posts Published", 
      value: analytics?.publishedPosts || 0, 
      change: `${analytics?.totalPosts || 0} total`, 
      trend: "neutral", 
      icon: Share2,
      description: "Successfully published"
    },
    { 
      label: "Success Rate", 
      value: `${analytics?.successRate || 0}%`, 
      change: analytics?.successRate && analytics.successRate >= 90 ? "Excellent" : "Good", 
      trend: analytics?.successRate && analytics.successRate >= 90 ? "up" : "neutral", 
      icon: Target,
      description: "Publishing success"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track performance and engagement metrics.</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, i) => (
          <Card key={stat.label} className="glass-card-hover animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {analyticsLoading ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  )}
                  <div className={cn(
                    "flex items-center gap-1 text-sm mt-1",
                    stat.trend === "up" ? "text-neon-green" : 
                    stat.trend === "down" ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {stat.trend === "up" && <TrendingUp className="w-4 h-4" />}
                    {stat.trend === "down" && <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reach & Engagement Trends */}
        <Card className="glass-card lg:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Reach & Engagement Trends
            </CardTitle>
            <CardDescription>Daily performance over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : analytics?.dailyTrends && analytics.dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyTrends}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="reach" 
                    stroke="#818CF8" 
                    fillOpacity={1} 
                    fill="url(#colorReach)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#22D3EE" 
                    fillOpacity={1} 
                    fill="url(#colorEngagement)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No data available for this period. Publish posts to see trends.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post Status Distribution */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Post Status
            </CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : analytics?.postStatusDistribution && analytics.postStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.postStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {analytics.postStatusDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={statusColors[entry.status] || CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>No posts yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance Bar Chart */}
      <Card className="glass-card animate-fade-in" style={{ animationDelay: "150ms" }}>
        <CardHeader>
          <CardTitle>Platform Comparison</CardTitle>
          <CardDescription>Reach and engagement by platform</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : analytics?.platformBreakdown && analytics.platformBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.platformBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="platform" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="reach" fill="#818CF8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engagement" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="posts" fill="#A78BFA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No platform data available. Connect channels and publish posts.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Channels Performance */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>Connected accounts overview</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href="/channels">
                Manage <ArrowUpRight className="w-3 h-3" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {channelsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Connect channels to see performance.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/channels">Connect Channel</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {channels.map((channel) => {
                  const platformData = analytics?.platformBreakdown.find(p => p.platform === channel.platform);
                  const reach = platformData?.reach || 0;
                  const engagement = platformData?.engagement || 0;
                  const engagementRate = reach > 0 ? ((engagement / reach) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={channel.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: platformColors[channel.platform] || '#6B7280' }}
                      >
                        {platformIcons[channel.platform]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{channel.account_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{channel.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatNumber(reach)}</p>
                        <p className="text-xs text-muted-foreground">reach</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neon-cyan">{engagementRate}%</p>
                        <p className="text-xs text-muted-foreground">eng. rate</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "250ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activity yet. Create posts to see logs.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {logs.map((log) => {
                  const style = logStyles[log.type] || logStyles.info;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn("p-2 rounded-lg shrink-0", style.bg, style.text)}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{log.message}</p>
                          {log.platform && (
                            <div 
                              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: platformColors[log.platform] || '#6B7280' }}
                            >
                              {platformIcons[log.platform]}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
