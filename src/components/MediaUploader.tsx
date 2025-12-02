import { useState, useCallback } from "react";
import { Upload, X, Image, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMediaUpload, UploadedMedia } from "@/hooks/useMediaUpload";

interface MediaUploaderProps {
  onMediaChange: (media: UploadedMedia[]) => void;
  media: UploadedMedia[];
  maxFiles?: number;
}

export function MediaUploader({ onMediaChange, media, maxFiles = 10 }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadMultiple, deleteMedia, uploading, progress } = useMediaUpload();

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
      const uploaded = await uploadMultiple(filesToUpload);
      onMediaChange([...media, ...uploaded]);
    }
  }, [media, maxFiles, uploadMultiple, onMediaChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxFiles - media.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length > 0) {
      const uploaded = await uploadMultiple(filesToUpload);
      onMediaChange([...media, ...uploaded]);
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemove = async (item: UploadedMedia) => {
    const success = await deleteMedia(item.id);
    if (success) {
      onMediaChange(media.filter(m => m.id !== item.id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border/50 hover:border-primary/50",
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
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
              <p className="font-medium">Uploading...</p>
              <Progress value={progress} className="w-48 mx-auto h-2" />
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="mt-4 font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                Images up to 50MB, videos up to 500MB
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {media.length}/{maxFiles} files uploaded
              </p>
            </>
          )}
        </label>
      </div>

      {/* Preview Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden bg-muted aspect-square"
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <div className="flex items-center gap-1 text-xs mb-2">
                  {item.type === 'image' ? (
                    <Image className="w-4 h-4" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  <span>{formatFileSize(item.size)}</span>
                </div>
                <p className="text-xs text-center truncate w-full mb-2">{item.name}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(item)}
                  className="h-7 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>

              {/* Type badge */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-background/80 text-xs font-medium">
                {item.type === 'image' ? (
                  <Image className="w-3 h-3" />
                ) : (
                  <Video className="w-3 h-3" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
