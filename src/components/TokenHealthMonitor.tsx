import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChannels } from '@/hooks/useChannels';
import { cn } from '@/lib/utils';

interface TokenHealth {
  platform: string;
  accountName: string;
  status: 'healthy' | 'expiring' | 'expired' | 'error';
  daysUntilExpiry: number | null;
  expiresAt: string | null;
}

export function TokenHealthMonitor() {
  const { channels } = useChannels();
  const [tokenHealth, setTokenHealth] = useState<TokenHealth[]>([]);

  useEffect(() => {
    if (!channels || channels.length === 0) return;

    const healthStatus = channels.map(channel => {
      const now = new Date();
      let status: TokenHealth['status'] = 'healthy';
      let daysUntilExpiry: number | null = null;

      if (channel.token_expires_at) {
        const expiryDate = new Date(channel.token_expires_at);
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysUntilExpiry = diffDays;

        if (diffDays <= 0) {
          status = 'expired';
        } else if (diffDays <= 7) {
          status = 'expiring';
        } else {
          status = 'healthy';
        }
      } else if (!channel.is_active) {
        status = 'error';
      }

      return {
        platform: channel.platform,
        accountName: channel.account_name || channel.channel_name || 'Unknown',
        status,
        daysUntilExpiry,
        expiresAt: channel.token_expires_at,
      };
    });

    // Sort: expired/expiring first
    healthStatus.sort((a, b) => {
      const statusOrder = { expired: 0, expiring: 1, error: 2, healthy: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    setTokenHealth(healthStatus);
  }, [channels]);

  const handleReconnect = (platform: string) => {
    // Redirect to OAuth flow
    const oauthUrls: Record<string, string> = {
      facebook: '/api/oauth/facebook',
      instagram: '/api/oauth/instagram',
      youtube: '/api/oauth/youtube',
      tiktok: '/api/oauth/tiktok',
      twitter: '/api/oauth/twitter',
      linkedin: '/api/oauth/linkedin',
    };

    const url = oauthUrls[platform.toLowerCase()];
    if (url) {
      window.location.href = url;
    }
  };

  const getStatusIcon = (status: TokenHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'expiring':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'expired':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TokenHealth['status'], days: number | null) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Healthy</Badge>;
      case 'expiring':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">{days} days left</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'error':
        return <Badge variant="destructive">No Connection</Badge>;
    }
  };

  const needsAttention = tokenHealth.filter(t => t.status === 'expired' || t.status === 'expiring').length;

  if (tokenHealth.length === 0) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Channel Health Status</CardTitle>
          {needsAttention > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {needsAttention} Need Attention
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tokenHealth.map((token, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                token.status === 'expired' || token.status === 'expiring'
                  ? "bg-amber-500/5 border-amber-500/30"
                  : "bg-muted/30 border-border/30"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(token.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{token.platform}</span>
                    {getStatusBadge(token.status, token.daysUntilExpiry)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {token.accountName}
                  </p>
                </div>
              </div>

              {(token.status === 'expired' || token.status === 'expiring') && (
                <Button
                  size="sm"
                  variant={token.status === 'expired' ? 'destructive' : 'outline'}
                  onClick={() => handleReconnect(token.platform)}
                  className="gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reconnect
                </Button>
              )}
            </div>
          ))}
        </div>

        {needsAttention > 0 && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              ⚠️ Tokens are about to expire. Please reconnect.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
