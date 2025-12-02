import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  Twitter,
  Linkedin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-3 h-3" />,
  instagram: <Instagram className="w-3 h-3" />,
  youtube: <Youtube className="w-3 h-3" />,
  tiktok: <Music2 className="w-3 h-3" />,
  twitter: <Twitter className="w-3 h-3" />,
  linkedin: <Linkedin className="w-3 h-3" />,
};

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
  tiktok: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30",
  twitter: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  linkedin: "bg-blue-600/20 text-blue-400 border-blue-600/30",
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  scheduled: { icon: <Clock className="w-3 h-3" />, label: "Scheduled", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  publishing: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Publishing", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  published: { icon: <CheckCircle2 className="w-3 h-3" />, label: "Published", color: "bg-neon-green/20 text-neon-green border-neon-green/30" },
  failed: { icon: <AlertCircle className="w-3 h-3" />, label: "Failed", color: "bg-destructive/20 text-destructive border-destructive/30" },
  queued: { icon: <Clock className="w-3 h-3" />, label: "Queued", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  draft: { icon: <Calendar className="w-3 h-3" />, label: "Draft", color: "bg-muted text-muted-foreground border-border" },
};

export default function Scheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { posts, loading } = usePosts();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      if (!post.scheduled_at) return false;
      const postDate = new Date(post.scheduled_at);
      return postDate.getDate() === day && 
             postDate.getMonth() === month && 
             postDate.getFullYear() === year;
    });
  };

  const scheduledPosts = posts.filter(p => p.status === 'scheduled' && p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
  
  const queuedPosts = posts.filter(p => p.status === 'queued');
  const recentlyPublished = posts.filter(p => p.status === 'published' && p.published_at)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
    .slice(0, 3);
  const failedPosts = posts.filter(p => p.status === 'failed');

  const nextScheduledPost = scheduledPosts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text">Scheduler</h1>
          <p className="text-muted-foreground mt-1">Plan and schedule your content calendar.</p>
        </div>
        <Link to="/create">
          <Button className="gap-2 bg-neon-gradient hover:opacity-90 neon-glow">
            <Plus className="w-4 h-4" />
            Schedule Post
          </Button>
        </Link>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledPosts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            {nextScheduledPost && (
              <p className="text-xs text-muted-foreground mt-2">
                Next: {formatDistanceToNow(new Date(nextScheduledPost.scheduled_at!), { addSuffix: true })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-in" style={{ animationDelay: "50ms" }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Queue</p>
                <p className="text-2xl font-bold">{queuedPosts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'published').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-neon-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-in" style={{ animationDelay: "150ms" }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failedPosts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Info Banner */}
      <Card className="glass-card border-primary/30 animate-fade-in">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm">
              <span className="font-medium text-neon-green">Queue Active</span>
              <span className="text-muted-foreground ml-2">• Posts are automatically published at their scheduled time (checked every minute)</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="glass-card animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-xl">
              {months[month]} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square p-1" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPosts = getPostsForDay(day);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square p-1 rounded-xl transition-all cursor-pointer hover:bg-muted/50",
                    isToday && "bg-primary/10 border border-primary/30"
                  )}
                >
                  <div className="h-full flex flex-col">
                    <span className={cn(
                      "text-sm font-medium",
                      isToday && "text-primary"
                    )}>
                      {day}
                    </span>
                    <div className="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
                      {dayPosts.slice(0, 2).map((post, j) => (
                        <div
                          key={j}
                          className={cn(
                            "flex items-center gap-1 px-1 py-0.5 rounded text-[10px] border truncate",
                            platformColors[post.platforms[0]] || "bg-muted"
                          )}
                        >
                          {platformIcons[post.platforms[0]]}
                          <span className="truncate hidden sm:inline">{post.title || post.content.slice(0, 15)}</span>
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          +{dayPosts.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Posts */}
      <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
        <CardHeader>
          <CardTitle>Upcoming Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled posts. Create a post and schedule it for later.</p>
              <Link to="/create">
                <Button className="mt-4" variant="outline">Schedule a Post</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map((post) => {
                const status = statusConfig[post.status] || statusConfig.draft;
                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {post.platforms.slice(0, 3).map((platform, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center border-2 border-background",
                              platformColors[platform] || "bg-muted"
                            )}
                          >
                            {platformIcons[platform]}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium">{post.title || post.content.slice(0, 40)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {post.scheduled_at && format(new Date(post.scheduled_at), "MMM d 'at' h:mm a")}
                          </p>
                          <Badge variant="outline" className={cn("text-[10px] px-2 py-0", status.color)}>
                            {status.icon}
                            <span className="ml-1">{status.label}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Published */}
      {recentlyPublished.length > 0 && (
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-green" />
              Recently Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyPublished.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-neon-green/5 border border-neon-green/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {post.platforms.slice(0, 3).map((platform, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border-2 border-background",
                            platformColors[platform] || "bg-muted"
                          )}
                        >
                          {platformIcons[platform]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium">{post.title || post.content.slice(0, 40)}...</p>
                      <p className="text-sm text-muted-foreground">
                        Published {post.published_at && formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Posts */}
      {failedPosts.length > 0 && (
        <Card className="glass-card border-destructive/30 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Failed Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {post.platforms.slice(0, 3).map((platform, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border-2 border-background",
                            platformColors[platform] || "bg-muted"
                          )}
                        >
                          {platformIcons[platform]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium">{post.title || post.content.slice(0, 40)}...</p>
                      <p className="text-sm text-destructive">Publishing failed - check activity logs</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Retry</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
