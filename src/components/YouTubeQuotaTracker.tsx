import { useEffect, useState } from 'react';
import { Youtube, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

interface QuotaData {
  dailyLimit: number;
  used: number;
  remaining: number;
  videosPublished: number;
  resetTime: string;
}

export function YouTubeQuotaTracker() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotaData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchQuotaData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuotaData = async () => {
    try {
      const response = await fetch('/api/youtube/quota');
      if (response.ok) {
        const data = await response.json();
        setQuota(data);
      }
    } catch (error) {
      console.error('Failed to fetch YouTube quota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !quota) return null;

  const usagePercent = (quota.used / quota.dailyLimit) * 100;
  const estimatedVideosRemaining = Math.floor(quota.remaining / 1600); // ~1600 units per video upload
  
  const getStatusColor = () => {
    if (usagePercent >= 90) return 'text-red-500';
    if (usagePercent >= 70) return 'text-amber-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (usagePercent >= 90) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (usagePercent >= 70) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (usagePercent >= 90) return 'Quota almost exhausted!';
    if (usagePercent >= 70) return 'Quota usage is high';
    return 'All good';
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            YouTube Daily Quota
          </CardTitle>
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quota Usage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quota Usage</span>
            <span className={`font-bold ${getStatusColor()}`}>
              {quota.used.toLocaleString()} / {quota.dailyLimit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={usagePercent} 
            className="h-2"
            indicatorClassName={
              usagePercent >= 90 ? 'bg-red-500' : 
              usagePercent >= 70 ? 'bg-amber-500' : 
              'bg-green-500'
            }
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{usagePercent.toFixed(1)}% used</span>
            <span>{quota.remaining.toLocaleString()} units remaining</span>
          </div>
        </div>

        {/* Video Count */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Published today</span>
            </div>
            <p className="text-2xl font-bold">{quota.videosPublished}</p>
            <p className="text-xs text-muted-foreground">videos</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Youtube className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Can still upload</span>
              </div>
              <p className="text-2xl font-bold">{estimatedVideosRemaining}</p>
              <p className="text-xs text-muted-foreground">videos approx</p>
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-3 rounded-lg border ${
          usagePercent >= 90 ? 'bg-red-500/10 border-red-500/30' :
          usagePercent >= 70 ? 'bg-amber-500/10 border-amber-500/30' :
          'bg-green-500/10 border-green-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {usagePercent >= 70 ? (
              <AlertTriangle className={`w-4 h-4 ${getStatusColor()}`} />
            ) : (
              <CheckCircle2 className={`w-4 h-4 ${getStatusColor()}`} />
            )}
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
          </div>
          {usagePercent >= 90 && (
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Video uploads can continue tomorrow. Quota resets at 12:00 AM Pacific Time.
            </p>
          )}
          {usagePercent >= 70 && usagePercent < 90 && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Quota running low. Upload only important videos.
            </p>
          )}
        </div>

        {/* Reset Time */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          Quota resets: <span className="font-medium">{new Date(quota.resetTime).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
