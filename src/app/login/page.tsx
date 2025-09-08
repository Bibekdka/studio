
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const features = [
    'Track daily habits and progress',
    'Earn points and unlock milestones',
    'AI-powered motivational quotes',
    'Sync data seamlessly across devices',
    'Beautiful and simple interface',
  ];

  const handleSignIn = () => {
    signInWithGoogle().catch((error) => {
      console.error("Sign-in error:", error);
      toast({
        title: "Sign In Failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    });
  };

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Rocket className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-3xl font-bold">Welcome to Habit Journey</CardTitle>
          <CardDescription className="text-md pt-2">
            Your personal companion for building a better, more consistent you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="my-6 space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">{feature}</p>
              </div>
            ))}
          </div>
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full text-lg h-12"
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 106.5 280.2 96 248 96c-88.8 0-160.1 71.1-160.1 160s71.3 160 160.1 160c94.9 0 131.3-64.4 137-98.2h-137v-71.7h243.9c1.3 12.2 2.1 24.8 2.1 37.8z"></path></svg>
                Sign In with Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    