import { useState, useEffect } from 'react';
import { PublishingProfile } from '@/hooks/usePublishingProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Folder, Star, Briefcase, User, Zap, Target } from 'lucide-react';
import { ChannelSelector } from './ChannelSelector';

interface ProfileManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: Omit<PublishingProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editProfile?: PublishingProfile | null;
}

const PROFILE_ICONS = [
  { value: 'folder', label: 'Folder', icon: Folder },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { value: 'user', label: 'User', icon: User },
  { value: 'zap', label: 'Lightning', icon: Zap },
  { value: 'target', label: 'Target', icon: Target },
];

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function ProfileManager({ open, onOpenChange, onSave, editProfile }: ProfileManagerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('folder');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editProfile) {
      setName(editProfile.name);
      setDescription(editProfile.description || '');
      setSelectedChannelIds(editProfile.channel_ids);
      setIsDefault(editProfile.is_default);
      setColor(editProfile.color);
      setIcon(editProfile.icon);
    } else {
      // Reset form for new profile
      setName('');
      setDescription('');
      setSelectedChannelIds([]);
      setIsDefault(false);
      setColor('#3b82f6');
      setIcon('folder');
    }
  }, [editProfile, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a profile name');
      return;
    }
    
    if (selectedChannelIds.length === 0) {
      alert('Please select at least one channel');
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        name: name.trim(),
        description: description.trim() || undefined,
        channel_ids: selectedChannelIds,
        is_default: isDefault,
        color,
        icon,
      };
      
      await onSave(profileData);
      console.log('✅ Profile saved:', name);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Failed to save profile:', error);
      alert('Failed to save profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const SelectedIcon = PROFILE_ICONS.find(i => i.value === icon)?.icon || Folder;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editProfile ? 'Edit Profile' : 'Create Publishing Profile'}
          </DialogTitle>
          <DialogDescription>
            Save your favorite channel combinations for quick one-click publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name">
              Profile Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="profile-name"
              placeholder="e.g., PT Brand, Company Official, Personal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Choose a descriptive name for your profile
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="profile-description">Description (Optional)</Label>
            <Textarea
              id="profile-description"
              placeholder="Add a description to help remember what this profile is for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Visual Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Profile Color</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => setColor(presetColor)}
                    className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: presetColor,
                      borderColor: color === presetColor ? '#000' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Profile Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_ICONS.map((iconOption) => {
                    const Icon = iconOption.icon;
                    return (
                      <SelectItem key={iconOption.value} value={iconOption.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {iconOption.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: color + '30' }}
              >
                <SelectedIcon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="font-medium">{name || 'Profile Name'}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedChannelIds.length} channels selected
                </p>
              </div>
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>
              Select Channels <span className="text-destructive">*</span>
            </Label>
            <ChannelSelector
              selectedChannelIds={selectedChannelIds}
              onSelectionChange={setSelectedChannelIds}
            />
            {selectedChannelIds.length === 0 && (
              <p className="text-xs text-destructive">
                Please select at least one channel
              </p>
            )}
          </div>

          {/* Default Profile Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="space-y-0.5">
              <Label htmlFor="default-profile" className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Set as Default Profile
              </Label>
              <p className="text-xs text-muted-foreground">
                Auto-select this profile when creating new posts
              </p>
            </div>
            <Switch
              id="default-profile"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || selectedChannelIds.length === 0 || saving}
            >
              {saving ? 'Saving...' : editProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
