import { Channel } from '@/hooks/useChannels';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelSelectorProps {
  channels: Channel[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ChannelSelector({ 
  channels, 
  selectedIds, 
  onSelectionChange 
}: ChannelSelectorProps) {
  if (channels.length === 0) {
    return null;
  }

  // Group channels by platform
  const channelsByPlatform = channels.reduce((acc, ch) => {
    if (!acc[ch.platform]) {
      acc[ch.platform] = [];
    }
    acc[ch.platform].push(ch);
    return acc;
  }, {} as Record<string, Channel[]>);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const toggleChannel = (channelId: string) => {
    if (selectedIds.includes(channelId)) {
      onSelectionChange(selectedIds.filter(id => id !== channelId));
    } else {
      onSelectionChange([...selectedIds, channelId]);
    }
  };

  const toggleAllPlatform = (platformChannels: Channel[]) => {
    const platformChannelIds = platformChannels.map(ch => ch.id);
    const allSelected = platformChannelIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      // Deselect all from this platform
      onSelectionChange(
        selectedIds.filter(id => !platformChannelIds.includes(id))
      );
    } else {
      // Select all from this platform
      const newIds = platformChannelIds.filter(id => !selectedIds.includes(id));
      onSelectionChange([...selectedIds, ...newIds]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Select Channels to Publish
        </Label>
        <Badge variant="secondary" className="text-xs">
          {selectedIds.length} selected
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(channelsByPlatform).map(([platform, platformChannels]) => {
          const allSelected = platformChannels.every(ch => selectedIds.includes(ch.id));
          const someSelected = platformChannels.some(ch => selectedIds.includes(ch.id));
          
          return (
            <div key={platform} className="space-y-2">
              {/* Platform Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold capitalize">{platform}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {platformChannels.length} {platformChannels.length === 1 ? 'channel' : 'channels'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAllPlatform(platformChannels)}
                  className="h-7 text-xs"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {/* Channel List */}
              <div className="grid gap-2">
                {platformChannels.map(channel => {
                  const isSelected = selectedIds.includes(channel.id);
                  
                  return (
                    <button
                      key={channel.id}
                      onClick={() => toggleChannel(channel.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left group",
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-sm shadow-primary/20" 
                          : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      {/* Checkbox Icon */}
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      
                      {/* Channel Info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm truncate transition-colors",
                          isSelected ? "text-foreground" : "text-foreground/80"
                        )}>
                          {channel.account_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {channel.account_handle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {channel.account_handle}
                            </p>
                          )}
                          {channel.followers_count > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {formatNumber(channel.followers_count)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {channel.is_active && (
                        <Badge 
                          variant={isSelected ? "default" : "secondary"} 
                          className="text-[10px] px-2 py-0.5 flex-shrink-0"
                        >
                          Active
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Ready to publish to {selectedIds.length} channel{selectedIds.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
