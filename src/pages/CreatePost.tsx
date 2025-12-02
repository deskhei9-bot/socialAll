import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Music2, 
  Twitter, 
  Linkedin,
  Hash,
  Smile,
  Calendar,
  Send,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText
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
import { MediaUploader } from "@/components/MediaUploader";
import { UploadedMedia } from "@/hooks/useMediaUpload";
import { CaptionTemplateManager } from "@/components/CaptionTemplateManager";
import { CaptionTemplate } from "@/hooks/useCaptionTemplates";
import { HashtagSuggestions } from "@/components/HashtagSuggestions";
import { CaptionGenerator } from "@/components/CaptionGenerator";

const platforms = [
  { id: "facebook", icon: Facebook, label: "Facebook", color: "hover:border-blue-500 hover:bg-blue-500/10", apiSupported: true },
  { id: "instagram", icon: Instagram, label: "Instagram", color: "hover:border-pink-500 hover:bg-pink-500/10", apiSupported: false },
  { id: "youtube", icon: Youtube, label: "YouTube", color: "hover:border-red-500 hover:bg-red-500/10", apiSupported: true },
  { id: "tiktok", icon: Music2, label: "TikTok", color: "hover:border-cyan-400 hover:bg-cyan-400/10", apiSupported: true },
  { id: "twitter", icon: Twitter, label: "Twitter", color: "hover:border-sky-400 hover:bg-sky-400/10", apiSupported: false },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn", color: "hover:border-blue-600 hover:bg-blue-600/10", apiSupported: false },
];

export default function CreatePost() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [postType, setPostType] = useState<string>("text");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // YouTube metadata
  const [youtubeDescription, setYoutubeDescription] = useState("");
  const [youtubeTags, setYoutubeTags] = useState("");
  const [youtubeCategory, setYoutubeCategory] = useState("22"); // People & Blogs
  const [youtubePrivacy, setYoutubePrivacy] = useState("public");
  
  // TikTok metadata
  const [tiktokPrivacy, setTiktokPrivacy] = useState("public");
  const [tiktokAllowComments, setTiktokAllowComments] = useState(true);
  const [tiktokAllowDuet, setTiktokAllowDuet] = useState(true);
  const [tiktokAllowStitch, setTiktokAllowStitch] = useState(true);
  
  // Link metadata
  const [linkUrl, setLinkUrl] = useState("");

  const { createPost } = usePosts();
  const { addLog } = useActivityLogs();
  const { publishPost, publishing, results, getConnectedChannelsForPlatforms } = usePublishPost();
  const navigate = useNavigate();

  // Get available post types based on selected platforms
  const getAvailablePostTypes = () => {
    const types = new Set<string>();
    
    selectedPlatforms.forEach(platform => {
      switch (platform) {
        case 'facebook':
          types.add('text');
          types.add('photo');
          types.add('video');
          types.add('reel');
          types.add('album');
          types.add('link');
          break;
        case 'youtube':
          types.add('video');
          types.add('short');
          break;
        case 'tiktok':
          types.add('video');
          break;
        case 'instagram':
          types.add('photo');
          types.add('video');
          types.add('reel');
          break;
        case 'twitter':
          types.add('text');
          types.add('media');
          break;
        case 'telegram':
          types.add('message');
          types.add('photo');
          types.add('video');
          break;
        case 'linkedin':
          types.add('post');
          types.add('image');
          break;
      }
    });
    
    return Array.from(types);
  };

  const availablePostTypes = getAvailablePostTypes();

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

  const connectedChannels = getConnectedChannelsForPlatforms(selectedPlatforms);

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
    
    // YouTube metadata
    if (selectedPlatforms.includes('youtube')) {
      metadata.youtube = {
        description: youtubeDescription || undefined,
        tags: youtubeTags ? youtubeTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        category_id: youtubeCategory,
        privacy_status: youtubePrivacy,
      };
    }
    
    // TikTok metadata
    if (selectedPlatforms.includes('tiktok')) {
      metadata.tiktok = {
        privacy_level: tiktokPrivacy,
        disable_comment: !tiktokAllowComments,
        disable_duet: !tiktokAllowDuet,
        disable_stitch: !tiktokAllowStitch,
      };
    }
    
    // Link metadata
    if (postType === 'link' && linkUrl) {
      metadata.link_url = linkUrl;
    }

    // First create the post in database
    const { data: post, error } = await createPost({
      title: title || undefined,
      content,
      post_type: postType,
      platforms: selectedPlatforms,
      status: status === 'published' && connectedChannels.length > 0 ? 'publishing' : status,
      scheduled_at: scheduledAt,
      media_urls: mediaUrls,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    if (error || !post) {
      setIsSubmitting(false);
      return;
    }

    // If publishing immediately and we have connected channels, publish to APIs
    if (status === 'published' && connectedChannels.length > 0) {
      const { success } = await publishPost(
        post.id,
        title || 'Untitled',
        content,
        selectedPlatforms,
        mediaUrls
      );

      if (success) {
        await addLog({
          type: 'success',
          message: `Post published to ${connectedChannels.length} channel(s)`,
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold neon-text">Create Post</h1>
        <p className="text-muted-foreground mt-1">Compose and schedule your content across platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Selection */}
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Select Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      selectedPlatforms.includes(platform.id)
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-muted/30",
                      platform.color
                    )}
                  >
                    {platform.apiSupported && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green rounded-full" title="API Publishing Available" />
                    )}
                    <platform.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{platform.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Connected Channels Info */}
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground mb-2">
                    Will publish to:
                  </p>
                  {connectedChannels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {connectedChannels.map(channel => (
                        <span
                          key={channel.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-full text-xs font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {channel.account_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No API-connected channels for selected platforms. 
                      <a href="/channels" className="underline">Connect channels</a>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Type Selection */}
          {selectedPlatforms.length > 0 && (
            <Card className="glass-card animate-fade-in" style={{ animationDelay: "50ms" }}>
              <CardHeader>
                <CardTitle className="text-lg">Post Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="post-type">Select Content Type</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger id="post-type" className="bg-muted/30 border-border/50">
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePostTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available types based on selected platforms
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* YouTube Metadata Fields */}
          {selectedPlatforms.includes('youtube') && (postType === 'video' || postType === 'short') && (
            <Card className="glass-card animate-fade-in" style={{ animationDelay: "75ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  YouTube Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube-description">Description (Optional)</Label>
                  <Textarea
                    id="youtube-description"
                    placeholder="Video description..."
                    value={youtubeDescription}
                    onChange={(e) => setYoutubeDescription(e.target.value)}
                    className="bg-muted/30 border-border/50 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube-tags">Tags (comma-separated)</Label>
                  <Input
                    id="youtube-tags"
                    placeholder="e.g. technology, tutorial, review"
                    value={youtubeTags}
                    onChange={(e) => setYoutubeTags(e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-category">Category</Label>
                    <Select value={youtubeCategory} onValueChange={setYoutubeCategory}>
                      <SelectTrigger id="youtube-category" className="bg-muted/30 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Film & Animation</SelectItem>
                        <SelectItem value="2">Autos & Vehicles</SelectItem>
                        <SelectItem value="10">Music</SelectItem>
                        <SelectItem value="15">Pets & Animals</SelectItem>
                        <SelectItem value="17">Sports</SelectItem>
                        <SelectItem value="19">Travel & Events</SelectItem>
                        <SelectItem value="20">Gaming</SelectItem>
                        <SelectItem value="22">People & Blogs</SelectItem>
                        <SelectItem value="23">Comedy</SelectItem>
                        <SelectItem value="24">Entertainment</SelectItem>
                        <SelectItem value="25">News & Politics</SelectItem>
                        <SelectItem value="26">Howto & Style</SelectItem>
                        <SelectItem value="27">Education</SelectItem>
                        <SelectItem value="28">Science & Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube-privacy">Privacy</Label>
                    <Select value={youtubePrivacy} onValueChange={setYoutubePrivacy}>
                      <SelectTrigger id="youtube-privacy" className="bg-muted/30 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TikTok Metadata Fields */}
          {selectedPlatforms.includes('tiktok') && postType === 'video' && (
            <Card className="glass-card animate-fade-in" style={{ animationDelay: "75ms" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Music2 className="w-5 h-5 text-cyan-400" />
                  TikTok Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tiktok-privacy">Privacy Level</Label>
                  <Select value={tiktokPrivacy} onValueChange={setTiktokPrivacy}>
                    <SelectTrigger id="tiktok-privacy" className="bg-muted/30 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Video Permissions</Label>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tiktok-comments" className="text-sm font-normal">
                        Allow Comments
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Let viewers comment on your video
                      </p>
                    </div>
                    <Switch
                      id="tiktok-comments"
                      checked={tiktokAllowComments}
                      onCheckedChange={setTiktokAllowComments}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tiktok-duet" className="text-sm font-normal">
                        Allow Duet
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Let others create duets with your video
                      </p>
                    </div>
                    <Switch
                      id="tiktok-duet"
                      checked={tiktokAllowDuet}
                      onCheckedChange={setTiktokAllowDuet}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tiktok-stitch" className="text-sm font-normal">
                        Allow Stitch
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Let others use parts of your video
                      </p>
                    </div>
                    <Switch
                      id="tiktok-stitch"
                      checked={tiktokAllowStitch}
                      onCheckedChange={setTiktokAllowStitch}
                    />
                  </div>
                </div>
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
          <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Post title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/30 border-border/50"
              />
              
              {/* AI Caption Generator */}
              <CaptionGenerator
                topic={title}
                platforms={selectedPlatforms}
                onGenerate={setContent}
              />

              <Textarea
                placeholder="What do you want to share today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] bg-muted/30 border-border/50 resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-xl gap-1">
                        <FileText className="w-4 h-4" />
                        Templates
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Apply Caption Template</DialogTitle>
                      </DialogHeader>
                      <CaptionTemplateManager mode="select" onApply={handleApplyTemplate} />
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Hash className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{content.length}/2200</span>
              </div>
            </CardContent>
          </Card>

          {/* Hashtag Suggestions */}
          <Card className="glass-card animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <HashtagSuggestions
                content={content}
                platforms={selectedPlatforms}
                onAdd={handleAddHashtags}
              />
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card className="glass-card animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Media</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUploader 
                media={media} 
                onMediaChange={setMedia}
                maxFiles={postType === 'album' ? 10 : 10}
              />
              {postType === 'album' && selectedPlatforms.includes('facebook') && (
                <p className="text-xs text-muted-foreground mt-2">
                  Upload multiple photos for Facebook album (max 10)
                </p>
              )}
            </CardContent>
          </Card>
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
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/30 min-h-[200px]">
                {content || media.length > 0 ? (
                  <div className="space-y-3">
                    {title && <p className="font-medium">{title}</p>}
                    {content && <p className="text-sm whitespace-pre-wrap">{content}</p>}
                    {media.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {media.slice(0, 4).map((item, i) => (
                          <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                            {item.type === 'image' ? (
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <video src={item.url} className="w-full h-full object-cover" />
                            )}
                            {i === 3 && media.length > 4 && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <span className="font-bold">+{media.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Start typing to see preview
                  </p>
                )}
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
                  {results.map((result) => (
                    <div
                      key={result.channelId}
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
                      <span>{result.channelName}</span>
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
              disabled={isProcessing || !content.trim() || selectedPlatforms.length === 0}
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
                  Publish Now {connectedChannels.length > 0 && `(${connectedChannels.length})`}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => handleSubmit('queued')}
              disabled={isProcessing || !content.trim() || selectedPlatforms.length === 0}
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
    </div>
  );
}
