'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Habit } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Habit name must be at least 2 characters.' }),
  description: z.string().optional(),
  points: z.coerce.number().min(0, { message: 'Points must be a positive number.' }).default(10),
  penalty: z.coerce.number().min(0, { message: 'Penalty must be a positive number.' }).default(0),
});

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitAdd: (habit: Omit<Habit, 'id'>) => void;
}

export default function AddHabitDialog({ open, onOpenChange, onHabitAdd }: AddHabitDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      points: 10,
      penalty: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onHabitAdd(values);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Create a New Habit</DialogTitle>
              <DialogDescription>
                Define a new daily habit to track. Give it a name, a short description, and assign points.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Read for 15 minutes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any book or article on a topic I enjoy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points for Completion</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="penalty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalty for Missing (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Points to deduct if this habit is not completed. Set to 0 for no penalty.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Create Habit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
