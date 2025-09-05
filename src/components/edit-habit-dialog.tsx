'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as React from 'react';

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

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit;
  onHabitEdit: (habit: Habit) => void;
}

export default function EditHabitDialog({ open, onOpenChange, habit, onHabitEdit }: EditHabitDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: habit.name,
      description: habit.description,
      points: habit.points,
      penalty: habit.penalty,
    },
  });

  React.useEffect(() => {
    if (habit) {
      form.reset(habit);
    }
  }, [habit, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onHabitEdit({ ...habit, ...values });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Edit Habit</DialogTitle>
              <DialogDescription>
                Update the details for your habit.
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
