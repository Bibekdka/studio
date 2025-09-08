
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  monthlyTarget: z.coerce.number().min(1, { message: 'Target must be at least 1.' }).default(1000),
});

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyTarget: number;
  onTargetSave: (newTarget: number) => void;
}

export default function SettingsDialog({ open, onOpenChange, monthlyTarget, onTargetSave }: SettingsDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyTarget: monthlyTarget,
    },
  });
  
  React.useEffect(() => {
    if(open) {
        form.reset({ monthlyTarget });
    }
  }, [open, monthlyTarget, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onTargetSave(values.monthlyTarget);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Target
              </DialogTitle>
              <DialogDescription>
                Set your monthly points goal. This helps you stay motivated and track your long-term progress.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="monthlyTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points Target</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
