'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface VideoSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videos: string[];
  onSelect: (videoUrl: string, index: number) => void;
}

export function VideoSelectModal({
  open,
  onOpenChange,
  videos,
  onSelect,
}: VideoSelectModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onSelect(videos[selectedIndex], selectedIndex);
      onOpenChange(false);
      setSelectedIndex(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>Select Video to Edit</DialogTitle>
        <DialogDescription>
          Choose which video you want to edit
        </DialogDescription>

        <div
          className={`grid gap-3 mt-4 ${
            videos.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
          }`}
        >
          {videos.map((url, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                selectedIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <video
                src={url}
                className="w-full h-full object-cover"
                muted
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />

              {/* Selection indicator */}
              {selectedIndex === index && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}

              {/* Video number badge */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                Video {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedIndex(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIndex === null}>
            Proceed To Edit Video
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}