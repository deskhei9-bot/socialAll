import { useState } from 'react';
import { PublishingProfile } from '@/hooks/usePublishingProfiles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Folder, 
  Plus, 
  Check, 
  Star,
  Briefcase,
  User,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileSelectorProps {
  profiles: PublishingProfile[];
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string | null) => void;
  onCreateProfile: () => void;
  channelCount?: number;
}

const PROFILE_ICONS: Record<string, any> = {
  folder: Folder,
  star: Star,
  briefcase: Briefcase,
  user: User,
  zap: Zap,
  target: Target,
};

export function ProfileSelector({ 
  profiles, 
  selectedProfileId, 
  onSelectProfile,
  onCreateProfile,
  channelCount = 0
}: ProfileSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const displayProfiles = showAll ? profiles : profiles.slice(0, 4);

  if (profiles.length === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-medium text-muted-foreground">
            Quick Select Profiles
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateProfile}
            className="h-7 text-xs gap-1"
          >
            <Plus className="w-3 h-3" />
            Create Profile
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Create profiles to save your favorite channel combinations for quick publishing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          Quick Select Profiles
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateProfile}
          className="h-7 text-xs gap-1"
        >
          <Plus className="w-3 h-3" />
          New
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {/* Manual Selection Option */}
        <button
          onClick={() => onSelectProfile(null)}
          className={cn(
            "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
            selectedProfileId === null
              ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
              : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          {selectedProfileId === null && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            selectedProfileId === null ? "bg-primary/20" : "bg-muted"
          )}>
            <Folder className="w-4 h-4" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium">Manual</p>
            <p className="text-[10px] text-muted-foreground">
              {channelCount} selected
            </p>
          </div>
        </button>

        {/* Profile Options */}
        {displayProfiles.map((profile) => {
          const Icon = PROFILE_ICONS[profile.icon] || Folder;
          const isSelected = selectedProfileId === profile.id;

          return (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
                  : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              
              {profile.is_default && (
                <div className="absolute -top-1 -left-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
              )}

              <div 
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isSelected ? "shadow-sm" : ""
                )}
                style={{ backgroundColor: profile.color + '30' }}
              >
                <Icon className="w-4 h-4" style={{ color: profile.color }} />
              </div>

              <div className="text-center">
                <p className="text-xs font-medium truncate max-w-[100px]">
                  {profile.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {profile.channel_ids.length} channels
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {profiles.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full h-7 text-xs"
        >
          {showAll ? 'Show Less' : `Show All (${profiles.length})`}
        </Button>
      )}

      {selectedProfileId && (
        <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs font-medium text-primary flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            Using profile: {profiles.find(p => p.id === selectedProfileId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
