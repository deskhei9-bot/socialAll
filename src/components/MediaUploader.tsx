import { useState, useCallback } from "react";
import { Upload, X, Image, Video, Loader2, Link as LinkIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMediaUpload, UploadedMedia } from "@/hooks/useMediaUpload";

interface MediaUploaderProps {
  onMediaChange: (media: UploadedMedia[]) => void;
  media: UploadedMedia[];
  maxFiles?: number;
}

export function MediaUploader({ onMediaChange, media, maxFiles = 10 }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploadTab, setUploadTab] = useState<"file" | "url">("file");
  const { uploadMultiple, deleteMedia, uploadFromUrl, uploading, progress, uploadProgress } = useMediaUpload();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Validate file sizes
    const maxSizes = {
      image: 50 * 1024 * 1024, // 50MB
      video: 500 * 1024 * 1024, // 500MB
    };

    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? maxSizes.video : maxSizes.image;

      if (file.size > maxSize) {
        const limit = isVideo ? '500MB' : '50MB';
        invalidFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB > ${limit})`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      alert(`Files are too large:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    const remainingSlots = maxFiles - media.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (filesToUpload.length > 0) {
      const result = await uploadMultiple(filesToUpload);
      if (result.data && !result.error) {
        onMediaChange([...media, ...result.data]);
      } else if (result.error) {
        console.error('Upload error:', result.error);
        alert(`Upload failed: ${result.error.message}`);
      }
    }
  }, [media, maxFiles, uploadMultiple, onMediaChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file sizes before upload
    const maxSizes = {
      image: 50 * 1024 * 1024, // 50MB for images
      video: 500 * 1024 * 1024, // 500MB for videos
    };

    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? maxSizes.video : maxSizes.image;

      if (file.size > maxSize) {
        const limit = isVideo ? '500MB' : '50MB';
        invalidFiles.push(`${file.name} (${formatFileSize(file.size)} > ${limit})`);
      } else {
        validFiles.push(file);
      }
    }

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      alert(
        `The following files are too large:\n\n${invalidFiles.join('\n')}\n\nMax 50MB for images\nMax 500MB for videos`
      );
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const remainingSlots = maxFiles - media.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (filesToUpload.length > 0) {
      const result = await uploadMultiple(filesToUpload);
      if (result.data && !result.error) {
        console.log('Upload successful! Files:', result.data);
        result.data.forEach(file => {
          console.log(`- ${file.name}: ${file.url}`);
        });
        onMediaChange([...media, ...result.data]);
      } else if (result.error) {
        console.error('Upload error:', result.error);
        alert(`Upload failed: ${result.error.message}`);
      }
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemove = async (item: UploadedMedia) => {
    const result = await deleteMedia(item.id);
    if (!result.error) {
      onMediaChange(media.filter(m => m.id !== item.id));
    } else {
      console.error('Delete error:', result.error);
      alert(`Failed to delete: ${result.error.message}`);
    }
  };

  const handleUrlUpload = async () => {
    if (!mediaUrl.trim()) return;

    const result = await uploadFromUrl(mediaUrl.trim());
    if (result.data && !result.error) {
      console.log('URL upload successful:', result.data);
      onMediaChange([...media, result.data]);
      setMediaUrl("");
    } else if (result.error) {
      console.error('URL upload error:', result.error);
      alert(`Upload failed: ${result.error.message}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area Only - No Preview Grid */}
      {media.length < maxFiles && (
        <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as "file" | "url")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="file" className="text-xs">
              <Upload className="w-3 h-3 mr-1.5" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs">
              <LinkIcon className="w-3 h-3 mr-1.5" />
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-0">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer",
                isDragging 
                  ? "border-primary bg-primary/10" 
                  : "border-border/30 hover:border-primary/50 bg-muted/20",
                uploading && "pointer-events-none opacity-50"
              )}
            >
              <input
                type="file"
                id="media-upload"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                disabled={uploading || media.length >= maxFiles}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                {uploading && uploadTab === "file" ? (
                  <div className="space-y-3">
                    <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
                    <div>
                      <p className="text-sm font-medium">Uploading {uploadProgress?.fileName || ''}...</p>
                      {uploadProgress && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(uploadProgress.uploadedBytes)} / {formatFileSize(uploadProgress.totalBytes)}</span>
                            <span>{formatSpeed(uploadProgress.speed)}</span>
                          </div>
                          <Progress value={uploadProgress.percentage} className="w-full h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{uploadProgress.percentage}%</span>
                            {uploadProgress.eta > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(uploadProgress.eta)} remaining
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Upload media</p>
                      <p className="text-xs text-muted-foreground">
                        {media.length}/{maxFiles} • Images/Videos
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-0">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube, TikTok, Twitter, Facebook, Instagram, or direct media URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  disabled={uploading}
                  className="flex-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && mediaUrl.trim()) {
                      handleUrlUpload();
                    }
                  }}
                />
                <Button
                  onClick={handleUrlUpload}
                  disabled={uploading || !mediaUrl.trim() || media.length >= maxFiles}
                  size="sm"
                  className="px-3"
                >
                  {uploading && uploadTab === "url" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {uploading && uploadTab === "url" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Downloading from URL...</span>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  ✅ Supported: YouTube, TikTok, Twitter/X, Facebook, Instagram, Weibo, Xiaohongshu, Pinterest
                </p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-500/80">
                  ⚠️ Requires Auth: Douyin (抖音) - please download manually first
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  Direct media URLs (jpg, png, gif, mp4) also work • Max 500MB
                </p>
                <p className="text-[11px] text-red-600/80 dark:text-red-500/80 mt-1">
                  ❌ Not yet: Kuaishou (快手), Threads
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
