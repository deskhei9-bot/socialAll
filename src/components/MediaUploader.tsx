import { useState, useCallback } from "react";
import { Upload, X, Image, Video, Loader2, Link as LinkIcon } from "lucide-react";
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
  const { uploadMultiple, deleteMedia, uploadFromUrl, uploading, progress } = useMediaUpload();

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

    const remainingSlots = maxFiles - media.length;
    const filesToUpload = files.slice(0, remainingSlots);

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

    const remainingSlots = maxFiles - media.length;
    const filesToUpload = files.slice(0, remainingSlots);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                  <div className="space-y-2">
                    <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
                    <p className="text-sm font-medium">Uploading...</p>
                    <Progress value={progress} className="w-32 mx-auto h-1.5" />
                    <p className="text-xs text-muted-foreground">{progress}%</p>
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
                  ✅ Supported: YouTube, TikTok, Twitter/X, Facebook (public), Instagram (limited)
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  Direct media URLs (jpg, png, gif, mp4) also work • Max 500MB
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
