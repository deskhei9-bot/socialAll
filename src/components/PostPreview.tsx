import { useState } from 'react';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Music2, 
  Twitter, 
  Linkedin,
  Send as TelegramIcon,
  Pin,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  MoreHorizontal,
  Play,
  Eye,
  Repeat2,
  Globe,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UploadedMedia } from '@/hooks/useMediaUpload';

interface PostPreviewProps {
  content: string;
  title?: string;
  media?: UploadedMedia[];
  platforms: string[];
  scheduledAt?: string;
  postType?: string;
}

const PLATFORM_CONFIG = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    bgClass: 'bg-[#1877F2]/10',
    borderClass: 'border-[#1877F2]/30',
    iconClass: 'text-[#1877F2]',
    maxLength: 63206,
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    bgClass: 'bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10',
    borderClass: 'border-[#E4405F]/30',
    iconClass: 'text-[#E4405F]',
    maxLength: 2200,
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    bgClass: 'bg-[#FF0000]/10',
    borderClass: 'border-[#FF0000]/30',
    iconClass: 'text-[#FF0000]',
    maxLength: 5000,
  },
  tiktok: {
    name: 'TikTok',
    icon: Music2,
    bgClass: 'bg-gradient-to-br from-[#00F2EA]/10 to-[#FF0050]/10',
    borderClass: 'border-[#00F2EA]/30',
    iconClass: 'text-foreground',
    maxLength: 2200,
  },
  twitter: {
    name: 'Twitter/X',
    icon: Twitter,
    bgClass: 'bg-[#1DA1F2]/10',
    borderClass: 'border-[#1DA1F2]/30',
    iconClass: 'text-[#1DA1F2]',
    maxLength: 280,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    bgClass: 'bg-[#0A66C2]/10',
    borderClass: 'border-[#0A66C2]/30',
    iconClass: 'text-[#0A66C2]',
    maxLength: 3000,
  },
  telegram: {
    name: 'Telegram',
    icon: TelegramIcon,
    bgClass: 'bg-[#0088CC]/10',
    borderClass: 'border-[#0088CC]/30',
    iconClass: 'text-[#0088CC]',
    maxLength: 4096,
  },
  pinterest: {
    name: 'Pinterest',
    icon: Pin,
    bgClass: 'bg-[#E60023]/10',
    borderClass: 'border-[#E60023]/30',
    iconClass: 'text-[#E60023]',
    maxLength: 500,
  },
};

// Facebook Preview
const FacebookPreview = ({ content, title, media, scheduledAt }: Omit<PostPreviewProps, 'platforms' | 'postType'>) => {
  const truncatedContent = content.length > 500 ? content.slice(0, 500) + '...' : content;
  
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
          Y
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Your Page</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {scheduledAt ? (
              <>
                <Clock className="w-3 h-3" />
                <span>Scheduled</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" />
                <span>Just now</span>
              </>
            )}
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-2">
        <p className="text-sm whitespace-pre-wrap">{truncatedContent}</p>
      </div>
      
      {/* Media */}
      {media && media.length > 0 && (
        <div className="relative">
          {media[0].type === 'video' ? (
            <div className="aspect-video bg-muted flex items-center justify-center">
              <video src={media[0].url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </div>
          ) : (
            <img src={media[0].url} alt="" className="w-full object-cover max-h-[300px]" />
          )}
          {media.length > 1 && (
            <Badge className="absolute bottom-2 right-2 bg-black/70">
              +{media.length - 1} more
            </Badge>
          )}
        </div>
      )}
      
      {/* Engagement Bar */}
      <div className="px-3 py-2 border-t flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-1 text-xs">
          <ThumbsUp className="w-4 h-4 text-blue-500 fill-blue-500" />
          <span>0</span>
        </div>
        <div className="text-xs">0 Comments · 0 Shares</div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-3 py-2 border-t grid grid-cols-3 gap-1">
        <button className="flex items-center justify-center gap-2 py-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground">
          <ThumbsUp className="w-4 h-4" />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

// Instagram Preview
const InstagramPreview = ({ content, media }: Omit<PostPreviewProps, 'platforms' | 'postType' | 'title' | 'scheduledAt'>) => {
  const truncatedContent = content.length > 125 ? content.slice(0, 125) + '... more' : content;
  
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden max-w-[350px] mx-auto">
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-xs font-bold">
            Y
          </div>
        </div>
        <p className="font-semibold text-sm flex-1">your_account</p>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Media */}
      <div className="aspect-square bg-muted relative">
        {media && media.length > 0 ? (
          media[0].type === 'video' ? (
            <>
              <video src={media[0].url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-16 h-16 text-white fill-white opacity-80" />
              </div>
            </>
          ) : (
            <img src={media[0].url} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No media
          </div>
        )}
        {media && media.length > 1 && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              1/{media.length}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Heart className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
          <Share2 className="w-6 h-6" />
        </div>
        <Bookmark className="w-6 h-6" />
      </div>
      
      {/* Likes & Caption */}
      <div className="px-3 pb-3 space-y-1">
        <p className="text-sm font-semibold">0 likes</p>
        <p className="text-sm">
          <span className="font-semibold">your_account</span>{' '}
          {truncatedContent}
        </p>
        <p className="text-xs text-muted-foreground">View all 0 comments</p>
      </div>
    </div>
  );
};

// Twitter Preview
const TwitterPreview = ({ content, media }: Omit<PostPreviewProps, 'platforms' | 'postType' | 'title' | 'scheduledAt'>) => {
  const isOverLimit = content.length > 280;
  const displayContent = isOverLimit ? content.slice(0, 280) : content;
  
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold shrink-0">
          Y
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-bold text-sm">Your Name</p>
            <p className="text-muted-foreground text-sm">@youraccount · now</p>
          </div>
          
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">
            {displayContent}
            {isOverLimit && <span className="text-destructive font-medium">...</span>}
          </p>
          
          {isOverLimit && (
            <Badge variant="destructive" className="mt-2 text-xs">
              {content.length}/280 - Over limit!
            </Badge>
          )}
          
          {media && media.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden border">
              {media[0].type === 'video' ? (
                <div className="aspect-video bg-muted relative">
                  <video src={media[0].url} className="w-full h-full object-cover" />
                  <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white fill-white" />
                </div>
              ) : (
                <img src={media[0].url} alt="" className="w-full object-cover max-h-[200px]" />
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-[300px] text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-sky-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <Repeat2 className="w-4 h-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-sky-500 transition-colors">
              <Eye className="w-4 h-4" />
              <span className="text-xs">0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// YouTube Preview
const YouTubePreview = ({ content, title, media }: Omit<PostPreviewProps, 'platforms' | 'postType' | 'scheduledAt'>) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative">
        {media && media.length > 0 ? (
          <>
            {media[0].type === 'video' ? (
              <video src={media[0].url} className="w-full h-full object-cover" />
            ) : (
              <img src={media[0].url} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
              0:00
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No thumbnail
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3 flex gap-3">
        <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shrink-0 text-sm">
          Y
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm line-clamp-2">{title || 'Video Title'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your Channel</p>
          <p className="text-xs text-muted-foreground">0 views · Just now</p>
        </div>
      </div>
      
      {/* Description Preview */}
      {content && (
        <div className="px-3 pb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">{content}</p>
        </div>
      )}
    </div>
  );
};

// LinkedIn Preview
const LinkedInPreview = ({ content, title, media }: Omit<PostPreviewProps, 'platforms' | 'postType' | 'scheduledAt'>) => {
  const truncatedContent = content.length > 200 ? content.slice(0, 200) + '... see more' : content;
  
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
          Y
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Your Name</p>
          <p className="text-xs text-muted-foreground">Your Title at Company</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Just now</span>
            <span>·</span>
            <Globe className="w-3 h-3" />
          </p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-2">
        <p className="text-sm whitespace-pre-wrap">{truncatedContent}</p>
      </div>
      
      {/* Media */}
      {media && media.length > 0 && (
        <div className="relative">
          <img src={media[0].url} alt="" className="w-full object-cover max-h-[250px]" />
        </div>
      )}
      
      {/* Engagement */}
      <div className="px-3 py-2 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-card"></div>
            <div className="w-4 h-4 rounded-full bg-green-500 border border-card"></div>
            <div className="w-4 h-4 rounded-full bg-red-500 border border-card"></div>
          </div>
          <span>0</span>
        </div>
        <span>0 comments · 0 reposts</span>
      </div>
      
      {/* Actions */}
      <div className="px-3 py-2 border-t grid grid-cols-4 gap-1">
        {['Like', 'Comment', 'Repost', 'Send'].map((action) => (
          <button key={action} className="flex items-center justify-center gap-1 py-2 rounded hover:bg-muted transition-colors text-xs text-muted-foreground">
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

// TikTok Preview
const TikTokPreview = ({ content, media }: Omit<PostPreviewProps, 'platforms' | 'postType' | 'title' | 'scheduledAt'>) => {
  return (
    <div className="bg-black rounded-lg border shadow-sm overflow-hidden max-w-[250px] mx-auto aspect-[9/16] relative">
      {/* Video Background */}
      {media && media.length > 0 ? (
        media[0].type === 'video' ? (
          <video src={media[0].url} className="w-full h-full object-cover" />
        ) : (
          <img src={media[0].url} alt="" className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black" />
      )}
      
      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        {/* Right Side Actions */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs mt-1">0</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs mt-1">0</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs mt-1">0</span>
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="text-white space-y-2">
          <p className="font-semibold text-sm">@youraccount</p>
          <p className="text-xs line-clamp-2">{content}</p>
          <div className="flex items-center gap-2 text-xs">
            <Music2 className="w-3 h-3" />
            <span className="truncate">Original Sound - youraccount</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pinterest Preview
const PinterestPreview = ({ content, title, media }: Omit<PostPreviewProps, 'platforms' | 'postType' | 'scheduledAt'>) => {
  return (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden max-w-[236px] mx-auto">
      {/* Image */}
      <div className="relative">
        {media && media.length > 0 ? (
          <img src={media[0].url} alt="" className="w-full object-cover" style={{ maxHeight: '350px' }} />
        ) : (
          <div className="aspect-[2/3] bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors">
            Save
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3 space-y-2">
        {title && (
          <p className="font-semibold text-sm line-clamp-2">{title}</p>
        )}
        {content && (
          <p className="text-xs text-muted-foreground line-clamp-2">{content}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
            Y
          </div>
          <span className="text-xs text-muted-foreground">Your Account</span>
        </div>
      </div>
    </div>
  );
};

// Telegram Preview
const TelegramPreview = ({ content, media }: Omit<PostPreviewProps, 'platforms' | 'postType' | 'title' | 'scheduledAt'>) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden max-w-[350px] mx-auto">
      <div className="p-3 bg-muted/50 flex items-center gap-3 border-b">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
          C
        </div>
        <div>
          <p className="font-semibold text-sm">Your Channel</p>
          <p className="text-xs text-muted-foreground">subscribers</p>
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        {media && media.length > 0 && (
          <div className="rounded-lg overflow-hidden">
            {media[0].type === 'video' ? (
              <div className="aspect-video bg-muted relative">
                <video src={media[0].url} className="w-full h-full object-cover" />
                <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white fill-white" />
              </div>
            ) : (
              <img src={media[0].url} alt="" className="w-full object-cover max-h-[200px]" />
            )}
          </div>
        )}
        
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Just now</span>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PostPreview = ({ content, title, media, platforms, scheduledAt, postType }: PostPreviewProps) => {
  const [activeTab, setActiveTab] = useState(platforms[0] || 'facebook');
  
  const availablePlatforms = platforms.filter(p => PLATFORM_CONFIG[p as keyof typeof PLATFORM_CONFIG]);
  
  if (availablePlatforms.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-8 text-center text-muted-foreground">
          Select platforms to preview your post
        </CardContent>
      </Card>
    );
  }

  const renderPreview = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <FacebookPreview content={content} title={title} media={media} scheduledAt={scheduledAt} />;
      case 'instagram':
        return <InstagramPreview content={content} media={media} />;
      case 'twitter':
        return <TwitterPreview content={content} media={media} />;
      case 'youtube':
        return <YouTubePreview content={content} title={title} media={media} />;
      case 'linkedin':
        return <LinkedInPreview content={content} title={title} media={media} />;
      case 'tiktok':
        return <TikTokPreview content={content} media={media} />;
      case 'pinterest':
        return <PinterestPreview content={content} title={title} media={media} />;
      case 'telegram':
        return <TelegramPreview content={content} media={media} />;
      default:
        return null;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Post Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
            {availablePlatforms.map((platform) => {
              const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2 py-1.5 data-[state=active]:bg-background",
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", config.iconClass)} />
                  <span className="hidden sm:inline">{config.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {availablePlatforms.map((platform) => (
            <TabsContent key={platform} value={platform} className="mt-4">
              <div className="flex flex-col items-center">
                {/* Character Limit Warning */}
                {PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG] && (
                  <div className="w-full mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Character count</span>
                      <span className={cn(
                        content.length > PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG].maxLength
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      )}>
                        {content.length} / {PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG].maxLength}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300 rounded-full",
                          content.length > PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG].maxLength
                            ? "bg-destructive"
                            : "bg-primary"
                        )}
                        style={{ 
                          width: `${Math.min(100, (content.length / PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG].maxLength) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {renderPreview(platform)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
