import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pin, Loader2 } from 'lucide-react';

export function PinterestConnect() {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/oauth/pinterest', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Pinterest connect error:', error);
      setConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      className="gap-2"
    >
      {connecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Pin className="w-4 h-4" />
      )}
      Connect Pinterest
    </Button>
  );
}
