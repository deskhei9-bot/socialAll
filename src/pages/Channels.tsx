import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Music2, 
  Twitter, 
  Linkedin,
  Send as TelegramIcon,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useChannels } from "@/hooks/useChannels";
import { useFacebookOAuth } from "@/hooks/useFacebookOAuth";
import { useYouTubeOAuth } from "@/hooks/useYouTubeOAuth";
import { useTikTokOAuth } from "@/hooks/useTikTokOAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const availablePlatforms = [
  { id: "facebook", icon: Facebook, label: "Facebook Page", color: "bg-blue-500", oauth: true },
  { id: "instagram", icon: Instagram, label: "Instagram Business", color: "bg-gradient-to-br from-purple-500 to-pink-500", oauth: true },
  { id: "youtube", icon: Youtube, label: "YouTube Channel", color: "bg-red-500", oauth: true },
  { id: "tiktok", icon: Music2, label: "TikTok Account", color: "bg-foreground", oauth: true },
  { id: "twitter", icon: Twitter, label: "Twitter / X", color: "bg-sky-500", oauth: false },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn Page", color: "bg-blue-600", oauth: false },
  { id: "telegram", icon: TelegramIcon, label: "Telegram Channel", color: "bg-blue-400", oauth: false },
];

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  tiktok: <Music2 className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  telegram: <TelegramIcon className="w-5 h-5" />,
};

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500",
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  youtube: "bg-red-500",
  tiktok: "bg-foreground",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-600",
  telegram: "bg-blue-400",
};

export default function Channels() {
  const { channels, loading, addChannel, removeChannel, refetch } = useChannels();
  const { connectFacebook, handleCallback: handleFacebookCallback, loading: fbLoading } = useFacebookOAuth();
  const { connectYouTube, handleCallback: handleYouTubeCallback, loading: ytLoading } = useYouTubeOAuth();
  const { connectTikTok, handleCallback: handleTikTokCallback, loading: ttLoading } = useTikTokOAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTelegramDialogOpen, setIsTelegramDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);
  const [newChannel, setNewChannel] = useState({
    platform: "",
    account_name: "",
    account_handle: "",
    followers_count: 0,
  });
  const [telegramConfig, setTelegramConfig] = useState({
    bot_token: "",
    chat_id: "",
  });

  // Handle OAuth callbacks and URL parameters
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (success) {
      toast({
        title: "Success!",
        description: message || `${success.replace('_', ' ')} successfully`,
        variant: "default",
      });
      refetch();
      navigate('/channels', { replace: true });
    } else if (error) {
      let errorMsg = message || error.replace(/_/g, ' ');
      
      // Custom error messages
      if (error === 'no_facebook_pages') {
        errorMsg = 'You need to create a Facebook Page first. Visit facebook.com/pages/create';
      } else if (error === 'no_instagram_business_account') {
        errorMsg = 'Your Facebook Page needs an Instagram Business Account. Connect it in Page Settings → Instagram';
      }
      
      toast({
        title: "Connection Failed",
        description: errorMsg,
        variant: "destructive",
      });
      navigate('/channels', { replace: true });
    }

    const isFbCallback = searchParams.get('fb_callback') === 'true';
    const isYtCallback = searchParams.get('yt_callback') === 'true';
    const isTtCallback = searchParams.get('tt_callback') === 'true';
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if ((isFbCallback || isYtCallback || isTtCallback) && !processingCallback) {
      if (error) {
        navigate('/channels', { replace: true });
        return;
      }

      if (code && state) {
        setProcessingCallback(true);
        
        const handleOAuth = async () => {
          if (isFbCallback) {
            const result = await handleFacebookCallback(code, state);
            if (result.error) {
              toast({
                title: "Connection Failed",
                description: result.error,
                variant: "destructive",
              });
            }
          } else if (isYtCallback) {
            const result = await handleYouTubeCallback(code, state);
            if (result.error) {
              toast({
                title: "Connection Failed",
                description: result.error,
                variant: "destructive",
              });
            }
          } else if (isTtCallback) {
            const result = await handleTikTokCallback(code, state);
            if (result.error) {
              toast({
                title: "Connection Failed",
                description: result.error,
                variant: "destructive",
              });
            }
          }
          refetch();
          navigate('/channels', { replace: true });
          setProcessingCallback(false);
        };
        
        handleOAuth();
      }
    }
  }, [searchParams, handleFacebookCallback, handleYouTubeCallback, handleTikTokCallback, navigate, refetch, processingCallback, toast]);

  const connectedPlatforms = channels.map(c => c.platform);

  const handleConnectPlatform = (platformId: string) => {
    const platform = availablePlatforms.find(p => p.id === platformId);
    
    if (platformId === 'telegram') {
      // Open Telegram setup dialog
      setIsTelegramDialogOpen(true);
    } else if (platform?.oauth) {
      if (platformId === 'facebook' || platformId === 'instagram') {
        // Both use same OAuth flow (Instagram Graph API via Facebook)
        connectFacebook();
      } else if (platformId === 'youtube') {
        connectYouTube();
      } else if (platformId === 'tiktok') {
        connectTikTok();
      }
    } else {
      // Manual connection for non-OAuth platforms
      setNewChannel(prev => ({ ...prev, platform: platformId }));
      setIsDialogOpen(true);
    }
  };

  const handleTelegramConnect = async () => {
    if (!telegramConfig.bot_token || !telegramConfig.chat_id) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/oauth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(telegramConfig),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsTelegramDialogOpen(false);
        setTelegramConfig({ bot_token: "", chat_id: "" });
        refetch();
      } else {
        alert(data.error || 'Failed to connect Telegram');
      }
    } catch (error) {
      console.error('Telegram connection error:', error);
      alert('Failed to connect Telegram');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChannel = async () => {
    if (!newChannel.platform || !newChannel.account_name) return;
    
    setIsSubmitting(true);
    const { error } = await addChannel(newChannel);
    setIsSubmitting(false);
    
    if (!error) {
      setIsDialogOpen(false);
      setNewChannel({ platform: "", account_name: "", account_handle: "", followers_count: 0 });
    }
  };

  const handleRemoveChannel = async (id: string) => {
    await removeChannel(id);
  };

  const isConnecting = fbLoading || ytLoading || ttLoading || processingCallback;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text">Channels</h1>
          <p className="text-muted-foreground mt-1">Manage your connected social media accounts.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-neon-gradient hover:opacity-90 neon-glow" disabled={isConnecting}>
              {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Plus className="w-4 h-4" />
              Connect Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect New Channel</DialogTitle>
              <DialogDescription>
                Add a new social media account to your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={newChannel.platform}
                  onValueChange={(value) => setNewChannel(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.filter(p => !p.oauth).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <p.icon className="w-4 h-4" />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  placeholder="e.g., My Brand Page"
                  value={newChannel.account_name}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, account_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Handle (optional)</Label>
                <Input
                  placeholder="e.g., @mybrand"
                  value={newChannel.account_handle}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, account_handle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Followers Count</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newChannel.followers_count}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, followers_count: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddChannel} 
                disabled={isSubmitting || !newChannel.platform || !newChannel.account_name}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Telegram Setup Dialog */}
        <Dialog open={isTelegramDialogOpen} onOpenChange={setIsTelegramDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Connect Telegram Channel/Group</DialogTitle>
              <DialogDescription>
                Set up your Telegram bot to post messages to your channel or group.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Bot Token</Label>
                <Input
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  value={telegramConfig.bot_token}
                  onChange={(e) => setTelegramConfig(prev => ({ ...prev, bot_token: e.target.value }))}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Get your bot token from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@BotFather</a> on Telegram
                </p>
              </div>
              <div className="space-y-2">
                <Label>Chat ID</Label>
                <Input
                  placeholder="-1001234567890 or @channelname"
                  value={telegramConfig.chat_id}
                  onChange={(e) => setTelegramConfig(prev => ({ ...prev, chat_id: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Your channel ID (starts with -100) or username (@yourchannelname). Make sure bot is admin in the channel.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-semibold">Setup Instructions:</h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Create a bot via @BotFather and get the bot token</li>
                  <li>Add your bot to your channel/group as an administrator</li>
                  <li>Get your channel/group ID (use @userinfobot)</li>
                  <li>Paste both values above and click Connect</li>
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTelegramDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleTelegramConnect} 
                disabled={isSubmitting || !telegramConfig.bot_token || !telegramConfig.chat_id}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Connect Telegram
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connecting Status */}
      {isConnecting && (
        <Card className="glass-card border-primary/50 animate-pulse">
          <CardContent className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Connecting to Facebook... Please wait.</span>
          </CardContent>
        </Card>
      )}

      {/* Available Platforms */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>Available Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {availablePlatforms.map((platform) => {
              const isConnected = connectedPlatforms.includes(platform.id);
              return (
                <div
                  key={platform.id}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all cursor-pointer",
                    isConnected
                      ? "border-neon-green/30 bg-neon-green/5"
                      : "border-border/50 bg-muted/30 hover:border-primary/50"
                  )}
                >
                  {isConnected && (
                    <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-neon-green" />
                  )}
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", platform.color)}>
                    <platform.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-center">{platform.label}</span>
                  {platform.oauth && (
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">OAuth</span>
                  )}
                  {!isConnected && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      disabled={isConnecting}
                      onClick={() => handleConnectPlatform(platform.id)}
                    >
                      {isConnecting && platform.id === 'facebook' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No channels connected yet. Click "Connect Channel" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                      platformColors[channel.platform]
                    )}>
                      {platformIcons[channel.platform]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{channel.account_name}</p>
                        {channel.status === "connected" ? (
                          <CheckCircle2 className="w-4 h-4 text-neon-green" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      {channel.account_handle && (
                        <p className="text-sm text-muted-foreground">{channel.account_handle}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{(channel.followers_count || 0).toLocaleString()} followers</span>
                        {channel.account_id && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">API Connected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl text-destructive"
                      onClick={() => handleRemoveChannel(channel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
