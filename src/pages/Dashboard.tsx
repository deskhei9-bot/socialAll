import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePosts } from "@/hooks/usePosts";
import { useChannels } from "@/hooks/useChannels";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
};

const statusStyles: Record<string, string> = {
  published: "bg-neon-green/20 text-neon-green",
  scheduled: "bg-neon-cyan/20 text-neon-cyan",
  queued: "bg-neon-purple/20 text-neon-purple",
  draft: "bg-muted text-muted-foreground",
  failed: "bg-destructive/20 text-destructive",
};

export default function Dashboard() {
  const { posts, loading: postsLoading } = usePosts();
  const { channels, loading: channelsLoading } = useChannels();

  const stats = [
    { 
      label: "Total Posts", 
      value: posts.length.toString(), 
      change: "+12%", 
      icon: TrendingUp, 
      color: "text-neon-indigo" 
    },
    { 
      label: "Scheduled", 
      value: posts.filter(p => p.status === 'scheduled').length.toString(), 
      change: "+5", 
      icon: Clock, 
      color: "text-neon-cyan" 
    },
    { 
      label: "Published", 
      value: posts.filter(p => p.status === 'published').length.toString(), 
      change: "+8%", 
      icon: CheckCircle2, 
      color: "text-neon-green" 
    },
    { 
      label: "Failed", 
      value: posts.filter(p => p.status === 'failed').length.toString(), 
      change: "-3", 
      icon: AlertCircle, 
      color: "text-destructive" 
    },
  ];

  const recentPosts = posts.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your social media overview.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <ArrowUpRight className="w-4 h-4" />
          View Reports
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.label} className="glass-card-hover animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {postsLoading ? (
                    <Skeleton className="h-9 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  )}
                  <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <Card className="glass-card lg:col-span-2 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No posts yet. Create your first post to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {post.platforms.map((p) => (
                          <div
                            key={p}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-card"
                          >
                            {platformIcons[p]}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium">{post.title || post.content.slice(0, 30)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[post.status]}`}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Channels */}
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle>Connected Channels</CardTitle>
          </CardHeader>
          <CardContent>
            {channelsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No channels connected yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      {platformIcons[channel.platform]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{channel.account_name}</p>
                      <p className="text-sm text-muted-foreground">{channel.followers_count.toLocaleString()} followers</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${channel.status === 'connected' ? 'bg-neon-green' : 'bg-destructive'} animate-pulse`} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queue Status */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>Queue Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['facebook', 'instagram', 'youtube', 'tiktok'].map((platform) => {
              const platformPosts = posts.filter(p => p.platforms.includes(platform));
              const publishedCount = platformPosts.filter(p => p.status === 'published').length;
              const progress = platformPosts.length > 0 ? (publishedCount / platformPosts.length) * 100 : 0;
              
              return (
                <div key={platform} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{platform}</span>
                    <span className="text-muted-foreground">{publishedCount}/{platformPosts.length}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
