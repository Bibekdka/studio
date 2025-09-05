'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PartyPopper } from 'lucide-react';

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: number;
}

export default function MilestoneDialog({ open, onOpenChange, milestone }: MilestoneDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PartyPopper className="h-8 w-8 text-amber-500" />
            Milestone Reached!
          </DialogTitle>
          <DialogDescription className="pt-2">
            Congratulations! You've reached a new milestone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
            <Image 
                src="https://picsum.photos/400/300" 
                alt="Celebration" 
                width={400} 
                height={300}
                data-ai-hint="celebration fireworks"
                className="rounded-lg object-cover"
            />
          <p className="text-4xl font-bold text-primary">{milestone.toLocaleString()} Points!</p>
          <p className="text-center text-muted-foreground">
            You're doing an amazing job building consistent habits. Keep up the fantastic work!
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Keep Going!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
