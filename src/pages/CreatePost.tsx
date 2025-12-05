import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Music2, 
  Twitter, 
  Linkedin,
  Send as TelegramIcon,
  Pin,
  Hash,
  Smile,
  Calendar,
  Send,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Maximize2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePosts } from "@/hooks/usePosts";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { usePublishPost } from "@/hooks/usePublishPost";
import { usePublishingProfiles } from "@/hooks/usePublishingProfiles";
import { MediaUploader } from "@/components/MediaUploader";
import { UploadedMedia } from "@/hooks/useMediaUpload";
import { CaptionTemplateManager } from "@/components/CaptionTemplateManager";
import { CaptionTemplate } from "@/hooks/useCaptionTemplates";
import { HashtagSuggestions } from "@/components/HashtagSuggestions";
import { CaptionGenerator } from "@/components/CaptionGenerator";
import { ChannelSelector } from "@/components/ChannelSelector";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ProfileManager } from "@/components/ProfileManager";

const platforms = [
  { id: "facebook", icon: Facebook, label: "Facebook", color: "hover:border-blue-500 hover:bg-blue-500/10", apiSupported: true },
  { id: "instagram", icon: Instagram, label: "Instagram", color: "hover:border-pink-500 hover:bg-pink-500/10", apiSupported: false },
  { id: "youtube", icon: Youtube, label: "YouTube", color: "hover:border-red-500 hover:bg-red-500/10", apiSupported: true },
  { id: "tiktok", icon: Music2, label: "TikTok", color: "hover:border-cyan-400 hover:bg-cyan-400/10", apiSupported: true },
  { id: "twitter", icon: Twitter, label: "Twitter", color: "hover:border-sky-400 hover:bg-sky-400/10", apiSupported: false },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn", color: "hover:border-blue-600 hover:bg-blue-600/10", apiSupported: false },
  { id: "telegram", icon: TelegramIcon, label: "Telegram", color: "hover:border-blue-400 hover:bg-blue-400/10", apiSupported: true },
  { id: "pinterest", icon: Pin, label: "Pinterest", color: "hover:border-red-600 hover:bg-red-600/10", apiSupported: true },
];

export default function CreatePost() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]); // NEW
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null); // NEW: For profile-based selection
  const [profileManagerOpen, setProfileManagerOpen] = useState(false); // NEW: Profile manager dialog
  const [postType, setPostType] = useState<string>("text");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [fullscreenMedia, setFullscreenMedia] = useState<UploadedMedia | null>(null);
  
  // Link metadata
  const [linkUrl, setLinkUrl] = useState("");

  const { createPost } = usePosts();
  const { addLog } = useActivityLogs();
  const { 
    publishToSelectedChannels, 
    publishing, 
    results, 
    channelsLoading,
    getChannelsForPlatforms // NEW: Get ALL channels for platforms
  } = usePublishPost();
  const { 
    profiles, 
    createProfile, 
    updateProfile, 
    deleteProfile,
    loading: profilesLoading 
  } = usePublishingProfiles(); // NEW: Publishing profiles hook
  const navigate = useNavigate();

  // Universal post types that work across multiple platforms
  const UNIVERSAL_POST_TYPES = [
    { 
      value: 'text', 
      label: 'Text Post',
      description: 'Text-only post (Facebook, Twitter, LinkedIn, Telegram)',
      platforms: ['facebook', 'twitter', 'linkedin', 'telegram']
    },
    { 
      value: 'photo', 
      label: 'Photo/Image',
      description: 'Single photo (Facebook, Instagram, Twitter, Telegram, LinkedIn, Pinterest)',
      platforms: ['facebook', 'instagram', 'twitter', 'telegram', 'linkedin', 'pinterest']
    },
    { 
      value: 'video', 
      label: 'Video',
      description: 'Regular video (Facebook, YouTube, Instagram, TikTok, Twitter, Telegram)',
      platforms: ['facebook', 'youtube', 'instagram', 'tiktok', 'twitter', 'telegram']
    },
    { 
      value: 'reel', 
      label: 'Short Video/Reel',
      description: 'Short-form video (Facebook Reel, Instagram Reel, YouTube Shorts, TikTok)',
      platforms: ['facebook', 'instagram', 'youtube', 'tiktok']
    },
    { 
      value: 'album', 
      label: 'Photo Album',
      description: 'Multiple photos (Facebook only)',
      platforms: ['facebook']
    },
    { 
      value: 'link', 
      label: 'Link/Article',
      description: 'Share a link with preview (Facebook, LinkedIn, Twitter)',
      platforms: ['facebook', 'linkedin', 'twitter']
    },
    { 
      value: 'pin', 
      label: 'Pin (Pinterest)',
      description: 'Image pin with description and link (Pinterest only)',
      platforms: ['pinterest']
    },
  ];

  // Map universal type to platform-specific type
  const mapPostTypeToPlatform = (universalType: string, platform: string): string => {
    const mapping: Record<string, Record<string, string>> = {
      'text': {
        'facebook': 'text',
        'twitter': 'text',
        'linkedin': 'post',
        'telegram': 'text',
      },
      'photo': {
        'facebook': 'photo',
        'instagram': 'photo',
        'twitter': 'media',
        'telegram': 'photo',
        'linkedin': 'image',
        'pinterest': 'pin',
      },
      'video': {
        'facebook': 'video',
        'youtube': 'video',
        'instagram': 'video',
        'tiktok': 'video',
        'twitter': 'media',
        'telegram': 'video',
      },
      'reel': {
        'facebook': 'reel',
        'instagram': 'reel',
        'youtube': 'short',
        'tiktok': 'video',
      },
      'album': {
        'facebook': 'album',
        'telegram': 'album',
      },
      'link': {
        'facebook': 'link',
        'linkedin': 'post',
        'twitter': 'text',
      },
      'pin': {
        'pinterest': 'pin',
      },
    };

    return mapping[universalType]?.[platform] || universalType;
  };

  // Get available universal types based on selected platforms
  const getAvailableUniversalTypes = () => {
    if (selectedPlatforms.length === 0) return UNIVERSAL_POST_TYPES;
    
    return UNIVERSAL_POST_TYPES.filter(type => {
      // Type is available if at least one selected platform supports it
      return selectedPlatforms.some(platform => type.platforms.includes(platform));
    });
  };

  const availablePostTypes = getAvailableUniversalTypes();

  const handleApplyTemplate = (template: CaptionTemplate) => {
    // Replace {title} placeholder with actual title
    let newContent = template.content.replace(/{title}/gi, title || '');
    
    // Append hashtags
    if (template.hashtags && template.hashtags.length > 0) {
      const hashtagString = template.hashtags.map(tag => `#${tag}`).join(' ');
      newContent = newContent ? `${newContent}\n\n${hashtagString}` : hashtagString;
    }
    
    setContent(newContent);
    setTemplateDialogOpen(false);
  };

  const handleAddHashtags = (hashtags: string[]) => {
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
    setContent(prev => {
      if (prev.trim()) {
        return `${prev}\n\n${hashtagString}`;
      }
      return hashtagString;
    });
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Auto-filter platforms when post type changes
  useEffect(() => {
    const currentType = UNIVERSAL_POST_TYPES.find(t => t.value === postType);
    if (currentType) {
      // Remove platforms that don't support the current post type
      setSelectedPlatforms(prev => 
        prev.filter(platformId => currentType.platforms.includes(platformId))
      );
    }
  }, [postType]);

  // Auto-select channels when platforms change
  useEffect(() => {
    // If a profile is selected, don't auto-select channels
    if (selectedProfileId) return;
    
    if (selectedPlatforms.length > 0) {
      const availableChannels = getChannelsForPlatforms(selectedPlatforms);
      // Auto-select all available channels
      setSelectedChannelIds(availableChannels.map(ch => ch.id));
    } else {
      setSelectedChannelIds([]);
    }
  }, [selectedPlatforms, selectedProfileId]);

  // Auto-load default profile on mount
  useEffect(() => {
    if (!profilesLoading && profiles.length > 0) {
      const defaultProfile = profiles.find(p => p.is_default);
      if (defaultProfile) {
        setSelectedProfileId(defaultProfile.id);
        setSelectedChannelIds(defaultProfile.channel_ids);
      }
    }
  }, [profilesLoading, profiles]);

  // Handle profile selection
  const handleProfileSelect = (profileId: string | null) => {
    setSelectedProfileId(profileId);
    if (profileId) {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        setSelectedChannelIds(profile.channel_ids);
      }
    } else {
      // Manual mode - reset to auto-select based on platforms
      if (selectedPlatforms.length > 0) {
        const availableChannels = getChannelsForPlatforms(selectedPlatforms);
        setSelectedChannelIds(availableChannels.map(ch => ch.id));
      }
    }
  };

  // Handle manual channel selection (switches to manual mode)
  const handleChannelSelectionChange = (channelIds: string[]) => {
    setSelectedChannelIds(channelIds);
    setSelectedProfileId(null); // Switch to manual mode
  };

  const handleSaveProfile = async (profileData: any) => {
    await createProfile({
      name: profileData.name,
      description: profileData.description,
      channel_ids: profileData.channel_ids,
      is_default: profileData.is_default,
      color: profileData.color,
      icon: profileData.icon,
    });
  };

  const availableChannels = getChannelsForPlatforms(selectedPlatforms);

  const handleSubmit = async (status: 'draft' | 'scheduled' | 'queued' | 'published') => {
    if (!content.trim() || selectedPlatforms.length === 0) return;

    setIsSubmitting(true);

    let scheduledAt: string | undefined;
    if (scheduleMode && scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    const mediaUrls = media.map(m => m.url);

    // Build metadata object
    const metadata: any = {};
    
    // Add media_urls for album/multiple media support
    if (mediaUrls.length > 1) {
      metadata.media_urls = mediaUrls;
    }
    
    // Link metadata
    if (postType === 'link' && linkUrl) {
      metadata.link_url = linkUrl;
    }

    // First create the post in database
    const { data: post, error } = await createPost({
      title: title || undefined,
      content,
      platforms: selectedPlatforms,
      status: status === 'published' && selectedChannelIds.length > 0 ? 'publishing' : status,
      scheduled_at: scheduledAt,
      media_urls: mediaUrls,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      post_type: postType, // TypeScript might complain, but backend accepts this
      selected_channel_ids: selectedChannelIds, // NEW: Send selected channel IDs
    } as any); // Use 'as any' to bypass type checking

    if (error || !post) {
      setIsSubmitting(false);
      return;
    }

    // If publishing immediately and we have selected channels, publish to APIs
    if (status === 'published' && selectedChannelIds.length > 0) {
      const { success } = await publishToSelectedChannels(
        post.id,
        selectedChannelIds,
        title || 'Untitled',
        content,
        mediaUrls
      );

      if (success) {
        await addLog({
          type: 'success',
          message: `Post published to ${selectedChannelIds.length} channel(s)`,
          platform: selectedPlatforms[0],
          post_id: post.id,
        });
      }
    } else if (status !== 'published') {
      await addLog({
        type: 'success',
        message: status === 'scheduled' ? 'Post scheduled successfully' : 
                 status === 'queued' ? 'Post added to queue' : 'Draft saved',
        platform: selectedPlatforms[0],
        post_id: post.id,
      });
    }

    setIsSubmitting(false);
    navigate('/');
  };

  const isProcessing = isSubmitting || publishing;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold neon-text">Create Post</h1>
        <p className="text-muted-foreground text-sm">Compose and schedule your content across multiple platforms.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Editor */}
        <div className="xl:col-span-2 space-y-6">
          {/* Platform Selection */}
          <Card className="glass-card animate-fade-in border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Select Platforms</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Choose where to publish</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {platforms.map((platform) => {
                  // Check if current post type supports this platform
                  const currentType = UNIVERSAL_POST_TYPES.find(t => t.value === postType);
                  const isSupported = currentType?.platforms.includes(platform.id) ?? true;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      disabled={!isSupported}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 group",
                        !isSupported && "opacity-40 cursor-not-allowed grayscale",
                        isSupported && isSelected
                          ? "border-primary bg-primary/15 shadow-md shadow-primary/20 scale-[1.02]"
                          : "border-border/60 bg-card/50 hover:border-primary/60 hover:bg-primary/5 hover:scale-[1.02]",
                      )}
                      title={!isSupported ? `${currentType?.label || 'This post type'} is not supported on ${platform.label}` : platform.label}
                    >
                      {/* Selection Checkmark */}
                      {isSelected && isSupported && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md shadow-primary/40 z-10">
                          <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      {/* API Support Indicator */}
                      {platform.apiSupported && isSupported && (
                        <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50 animate-pulse" title="Direct API Publishing" />
                      )}
                      
                      {/* Platform Icon */}
                      <div className={cn(
                        "transition-transform duration-300",
                        isSelected && "scale-105",
                        !isSelected && "group-hover:scale-105"
                      )}>
                        <platform.icon className="w-8 h-8 sm:w-9 sm:h-9" />
                      </div>
                      
                      {/* Platform Label */}
                      <span className={cn(
                        "text-xs sm:text-sm font-semibold text-center transition-colors",
                        isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {platform.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Profile Selection - NEW */}
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <ProfileSelector
                    profiles={profiles}
                    selectedProfileId={selectedProfileId}
                    onSelectProfile={handleProfileSelect}
                    onCreateProfile={() => setProfileManagerOpen(true)}
                    channelCount={selectedChannelIds.length}
                  />
                </div>
              )}
              
              {/* Channel Selection - NEW */}
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  {channelsLoading ? (
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Loading connected channels...</p>
                    </div>
                  ) : availableChannels.length > 0 ? (
                    <ChannelSelector
                      channels={availableChannels}
                      selectedIds={selectedChannelIds}
                      onSelectionChange={handleChannelSelectionChange}
                    />
                  ) : (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        No connected channels for selected platforms. <a href="/channels" className="underline font-medium">Connect now</a>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Compact Post Type Selection */}
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Post Type:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {availablePostTypes.map(type => {
                      const isSelected = postType === type.value;
                      const supportedPlatforms = type.platforms.filter(p => selectedPlatforms.includes(p));
                      const isCompatible = supportedPlatforms.length > 0;
                      
                      return (
                        <button
                          key={type.value}
                          onClick={() => setPostType(type.value)}
                          disabled={!isCompatible}
                          className={cn(
                            "relative px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all duration-200",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                            isSelected
                              ? "border-primary bg-primary/20 text-primary shadow-sm shadow-primary/20"
                              : isCompatible
                                ? "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                                : "border-border/30 bg-muted/20 text-muted-foreground"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />
                            </div>
                          )}
                          <span>{type.label}</span>
                          {isCompatible && (
                            <span className="ml-1 opacity-60">
                              ({supportedPlatforms.length})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    Numbers show compatible platforms
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Media Section */}
          {selectedPlatforms.length > 0 && postType && (
            <Card className="glass-card animate-fade-in border-2" style={{ animationDelay: "75ms" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Upload Media
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Add images or videos for <span className="font-semibold text-primary">{postType}</span>
                </p>
              </CardHeader>
              <CardContent>
                <MediaUploader 
                  onMediaChange={setMedia}
                  media={media}
                />
              </CardContent>
            </Card>
          )}

          {/* Link URL Field */}
          {postType === 'link' && (
            <Card className="glass-card animate-fade-in" style={{ animationDelay: "75ms" }}>
              <CardHeader>
                <CardTitle className="text-lg">Link Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-muted/30 border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  The link you want to share with your post
                </p>
              </CardContent>
            </Card>
          )}

          {/* Content Editor */}
          <Card className="glass-card animate-fade-in border-2" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Content
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Craft your message
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title Field */}
              <div className="space-y-1.5">
                <Label htmlFor="post-title" className="text-xs font-medium text-foreground/80">
                  Post Title <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="post-title"
                  placeholder="Add a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 text-sm bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Caption/Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="post-content" className="text-xs font-medium text-foreground/80">
                    Caption / Description
                  </Label>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    content.length > 2000 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {content.length}/2200
                  </span>
                </div>
                <Textarea
                  id="post-content"
                  placeholder="What do you want to share today?..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[180px] text-sm leading-relaxed bg-muted/30 border-border/50 focus:border-primary/50 resize-none transition-colors"
                />
              </div>
              
              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div className="flex gap-1.5">
                  {/* AI Caption Generator */}
                  <CaptionGenerator
                    topic={title}
                    platforms={selectedPlatforms}
                    currentCaption={content}
                    onGenerate={setContent}
                  />
                  
                  {/* Templates */}
                  <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 rounded-lg gap-1.5 text-xs border hover:border-primary/50 hover:bg-primary/10 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Templates</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Apply Template</DialogTitle>
                      </DialogHeader>
                      <CaptionTemplateManager mode="select" onApply={handleApplyTemplate} />
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  <span className="hidden sm:inline">Auto-saves</span>
                </div>
              </div>

              {/* Hashtags Section - Integrated */}
              <div className="pt-3 border-t border-border/30 space-y-3">
                <HashtagSuggestions
                  content={content}
                  platforms={selectedPlatforms}
                  onAdd={handleAddHashtags}
                />
              </div>
            </CardContent>
          </Card>



          {/* Media Upload - REMOVED, moved to Preview panel */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scheduling */}
          <Card className="glass-card animate-fade-in" style={{ animationDelay: "150ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule-mode">Schedule for later</Label>
                <Switch
                  id="schedule-mode"
                  checked={scheduleMode}
                  onCheckedChange={setScheduleMode}
                />
              </div>

              {scheduleMode && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <div>
                    <Label className="text-sm text-muted-foreground">Date</Label>
                    <Input 
                      type="date" 
                      className="mt-1 bg-muted/30 border-border/50" 
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Time</Label>
                    <Input 
                      type="time" 
                      className="mt-1 bg-muted/30 border-border/50"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="glass-card animate-fade-in" style={{ animationDelay: "250ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 min-h-[150px] border border-border/30 space-y-3">
                {/* Text Content Preview */}
                {(content || title) ? (
                  <div className="space-y-2">
                    {title && <p className="font-semibold text-base">{title}</p>}
                    {content && <p className="text-sm whitespace-pre-wrap text-muted-foreground">{content}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50 text-center py-2">
                    Start typing to see preview
                  </p>
                )}

                {/* Media Section */}
                <div className="space-y-3">
                  {media.length > 0 ? (
                    <>
                      {/* Visual Preview - Top (No X icons) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {media.length} media {media.length === 1 ? 'file' : 'files'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMedia([])}
                            className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Clear All
                          </Button>
                        </div>
                        
                        {/* Media Preview Grid */}
                        <div className={cn(
                          "grid gap-2",
                          media.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          {media.slice(0, 4).map((item, index) => (
                            <div 
                              key={item.id} 
                              className={cn(
                                "relative rounded-lg overflow-hidden bg-background border border-border/30 group cursor-pointer",
                                item.type === 'image' ? "aspect-square" : ""
                              )}
                              onClick={() => setFullscreenMedia(item)}
                            >
                              {item.type === 'image' ? (
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Preview image error:', item.url);
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23222" width="100" height="100"/%3E%3Ctext fill="%23666" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              ) : (
                                <div className="relative w-full bg-black">
                                  <video
                                    src={item.url}
                                    className="w-full max-h-60 object-contain"
                                    controls
                                    preload="metadata"
                                    playsInline
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                              
                              {/* File info badge - Top left */}
                              <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs font-medium text-white flex items-center gap-1">
                                {item.type === 'image' ? (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                                <span>{item.type === 'image' ? 'Photo' : 'Video'}</span>
                              </div>

                              {/* Full View icon on hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                  <Maximize2 className="w-4 h-4" />
                                  <span className="text-sm font-medium">Full View</span>
                                </div>
                              </div>

                              {/* More items indicator */}
                              {index === 3 && media.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                  <span className="text-2xl font-bold text-white">
                                    +{media.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Text-based Media List - Bottom (With X icons) */}
                      <div className="space-y-1.5 pt-2 border-t border-border/30">
                        {media.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* Media Icon */}
                              <div className="flex-shrink-0">
                                {item.type === 'image' ? (
                                  <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              {/* File Name */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.type === 'image' ? 'Photo' : 'Video'} • {(item.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            
                            {/* Remove Button - X Icon */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMedia(media.filter(m => m.id !== item.id))}
                              className="h-7 w-7 p-0 flex-shrink-0 opacity-70 hover:opacity-100 hover:bg-destructive/10"
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Info about media */}
                      <div className="pt-3 border-t border-border/30 mt-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {media.length} file{media.length !== 1 ? 's' : ''} uploaded
                          {postType === 'album' && selectedPlatforms.includes('facebook') && ' • Facebook album supports up to 10 photos'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">No media uploaded yet</p>
                      <p className="text-xs text-muted-foreground/70">
                        Upload media in the section above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Results */}
          {results.length > 0 && (
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Publishing Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={`${result.platform}-${index}`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-sm",
                        result.success ? "bg-neon-green/10 text-neon-green" : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {result.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="capitalize">{result.platform}</span>
                      {result.error && <span className="text-xs">({result.error})</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full gap-2 bg-neon-gradient hover:opacity-90 neon-glow"
              onClick={() => handleSubmit(scheduleMode ? 'scheduled' : 'published')}
              disabled={isProcessing || !content.trim() || selectedChannelIds.length === 0}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : scheduleMode ? (
                <>
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish to {selectedChannelIds.length} Channel{selectedChannelIds.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => handleSubmit('queued')}
              disabled={isProcessing || !content.trim() || selectedChannelIds.length === 0}
            >
              <Clock className="w-4 h-4" />
              Add to Queue
            </Button>
            <Button 
              variant="ghost" 
              className="w-full gap-2"
              onClick={() => handleSubmit('draft')}
              disabled={isProcessing || !content.trim()}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      <Dialog open={!!fullscreenMedia} onOpenChange={() => setFullscreenMedia(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {fullscreenMedia?.type === 'image' ? (
              <img
                src={fullscreenMedia.url}
                alt={fullscreenMedia.name}
                className="max-w-full max-h-[95vh] w-auto h-auto object-contain"
              />
            ) : fullscreenMedia?.type === 'video' ? (
              <video
                src={fullscreenMedia.url}
                className="max-w-full max-h-[95vh] w-auto h-auto object-contain"
                controls
                autoPlay
              />
            ) : null}
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setFullscreenMedia(null)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* File info overlay */}
            {fullscreenMedia && (
              <div className="absolute bottom-4 left-4 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white">
                <p className="text-sm font-medium">{fullscreenMedia.name}</p>
                <p className="text-xs text-gray-300">
                  {fullscreenMedia.type === 'image' ? 'Photo' : 'Video'} • {(fullscreenMedia.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Manager Dialog */}
      <ProfileManager
        open={profileManagerOpen}
        onOpenChange={setProfileManagerOpen}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
