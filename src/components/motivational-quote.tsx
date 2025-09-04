'use client';

import * as React from 'react';
import { motivationalQuotes } from '@/ai/flows/motivational-quotes';
import type { Habit } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Quote } from 'lucide-react';

interface MotivationalQuoteProps {
  habits: Habit[];
}

export default function MotivationalQuote({ habits }: MotivationalQuoteProps) {
  const [quote, setQuote] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchQuote() {
      if (habits.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const habitNames = habits.map(h => h.name);
        const result = await motivationalQuotes({ habits: habitNames });
        setQuote(result.quote);
      } catch (error) {
        console.error('Failed to fetch motivational quote:', error);
        setQuote("The journey of a thousand miles begins with a single step.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuote();
  }, [habits]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!quote) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <blockquote className="flex items-start gap-4">
          <Quote className="h-6 w-6 text-primary flex-shrink-0" aria-hidden="true" />
          <p className="text-lg italic text-foreground/80">
            {quote}
          </p>
        </blockquote>
      </CardContent>
    </Card>
  );
}
