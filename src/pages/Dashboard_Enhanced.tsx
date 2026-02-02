// Enhanced Dashboard with UI/UX Improvements
// This file shows the recommended improvements for Dashboard.tsx

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
  MoreHorizontal,
  Search,
  Plus,
  Filter,
  RefreshCw,
  PenSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { usePosts } from "@/hooks/usePosts";
import { useChannels } from "@/hooks/useChannels";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { TokenHealthMonitor } from "@/components/TokenHealthMonitor";
import { FailedPostsManager } from "@/components/FailedPostsManager";
import { YouTubeQuotaTracker } from "@/components/YouTubeQuotaTracker";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
  const navigate = useNavigate();
  const { posts, loading: postsLoading, refetch: refetchPosts } = usePosts();
  const { channels, loading: channelsLoading } = useChannels();
  
  // 🆕 Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🆕 Filter posts based on search
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.platforms?.some(p => p.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  // 🆕 Calculate real statistics with change
  const calculateStats = () => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentPosts = posts.filter(p => new Date(p.created_at) >= last7Days);
    const oldPosts = posts.filter(p => new Date(p.created_at) < last7Days);
    
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
    };
    
    return [
      { 
        label: "Total Posts", 
        value: posts.length.toString(), 
        change: calculateChange(recentPosts.length, oldPosts.length), 
        icon: TrendingUp, 
        color: "text-neon-indigo" 
      },
      { 
        label: "Scheduled", 
        value: posts.filter(p => p.status === 'scheduled').length.toString(), 
        change: calculateChange(
          recentPosts.filter(p => p.status === 'scheduled').length,
          oldPosts.filter(p => p.status === 'scheduled').length
        ), 
        icon: Clock, 
        color: "text-neon-cyan" 
      },
      { 
        label: "Published", 
        value: posts.filter(p => p.status === 'published').length.toString(), 
        change: calculateChange(
          recentPosts.filter(p => p.status === 'published').length,
          oldPosts.filter(p => p.status === 'published').length
        ), 
        icon: CheckCircle2, 
        color: "text-neon-green" 
      },
      { 
        label: "Failed", 
        value: posts.filter(p => p.status === 'failed').length.toString(), 
        change: posts.filter(p => p.status === 'failed').length > 0 ? 'Needs attention' : 'All clear', 
        icon: AlertCircle, 
        color: "text-destructive" 
      },
    ];
  };

  const stats = calculateStats();
  const recentPosts = filteredPosts.slice(0, 4);

  // 🆕 Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchPosts();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold neon-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your social media overview.</p>
        </div>
        
        {/* 🆕 Action buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate('/analytics')}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span className="hidden sm:inline">View Reports</span>
          </Button>
        </div>
      </div>

      {/* 🆕 Search Bar */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by title, content, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50"
            />
            {searchQuery && (
              <Badge 
                variant="secondary" 
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-destructive/20"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </Badge>
            )}
          </div>
          
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Token Health Monitor */}
      <TokenHealthMonitor />

      {/* Failed Posts Manager */}
      <FailedPostsManager />

      {/* YouTube Quota Tracker */}
      <YouTubeQuotaTracker />

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
                  <p className={`text-sm mt-1 font-medium ${stat.color}`}>{stat.change}</p>
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
            <div className="flex items-center gap-2">
              {searchQuery && (
                <Badge variant="secondary">
                  Filtered
                </Badge>
              )}
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              // 🆕 Enhanced empty state
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <PenSquare className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'No posts found' : 'No posts yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? `No posts match "${searchQuery}". Try a different search.`
                      : 'Get started by creating your first social media post'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => navigate('/create')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create First Post
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group hover:border hover:border-primary/20"
                    onClick={() => navigate(`/scheduler?post=${post.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex -space-x-2">
                        {(post.platforms || []).map((p) => (
                          <div
                            key={p}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-card group-hover:scale-110 transition-transform"
                          >
                            {platformIcons[p]}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{post.title || (post.content || '').slice(0, 30)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[post.status]}`}>
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
              // 🆕 Enhanced empty state
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No channels connected</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your social media accounts to start posting
                  </p>
                  <Button onClick={() => navigate('/channels')} size="sm">
                    Connect Channel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div 
                    key={channel.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate('/channels')}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      {platformIcons[channel.platform]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{channel.account_name}</p>
                      <p className="text-sm text-muted-foreground">{(channel.followers_count || 0).toLocaleString()} followers</p>
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
              const platformPosts = posts.filter(p => (p.platforms || []).includes(platform));
              const publishedCount = platformPosts.filter(p => p.status === 'published').length;
              const progress = platformPosts.length > 0 ? (publishedCount / platformPosts.length) * 100 : 0;
              
              return (
                <div key={platform} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{platform}</span>
                    <span className="text-muted-foreground">{publishedCount}/{platformPosts.length}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {platformPosts.length === 0 ? 'No posts' : `${progress.toFixed(0)}% published`}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
