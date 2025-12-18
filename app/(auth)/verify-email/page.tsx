'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/stores';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authService } from '@/services';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, initializeUser } = useUserStore();
  
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState<string>('');
  const [isResending, setIsResending] = useState<boolean>(false);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await authService.verifyEmail(token);
      setStatus('success');
      setMessage(response.message || 'Your email has been verified successfully!');
    } catch (error) {
      console.error('Email verification failed:', error);
      setStatus('error');
      setMessage(
        error instanceof Error 
          ? error.message 
          : 'Email verification failed. The link may be invalid or expired.'
      );
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail(token);
  }, [searchParams, verifyEmail]);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await authService.resendVerification();
      setMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      console.error('Failed to resend verification:', error);
      setMessage('Failed to resend verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-4xl font-bold tracking-tight">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
          {status === 'no-token' && 'Invalid Link'}
        </CardTitle>
        <CardDescription className="text-2xl text-neutral-400">
          {status === 'loading' && 'Please wait while we verify your email address'}
          {status === 'success' && 'Your email has been successfully verified'}
          {status === 'error' && 'We could not verify your email address'}
          {status === 'no-token' && 'The verification link is missing or invalid'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {status === 'loading' && (
            <div className="size-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
              <Loader2 className="size-10 text-neutral-400 animate-spin" />
            </div>
          )}

          {status === 'success' && (
            <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-green-500" />
            </div>
          )}

          {(status === 'error' || status === 'no-token') && (
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="size-10 text-red-500" />
            </div>
          )}

          <p className="text-center text-xl text-neutral-300 max-w-sm">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="space-y-4">
            {isAuthenticated ? (
              <Button
                asChild
                className="w-full h-14 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              >
                <Link href="/settings">
                  <ArrowLeft className="size-6" />
                  Back to Settings
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  className="w-full h-14 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                >
                  <Link href="/login">
                    Continue to Login
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-14 text-xl border-neutral-700 hover:bg-neutral-800"
                >
                  <Link href="/">
                    Go to Home
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}

        {(status === 'error' || status === 'no-token') && (
          <div className="space-y-4">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full h-14 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            >
              {isResending ? (
                <>
                  Sending...
                  <Loader2 className="size-7 animate-spin" />
                </>
              ) : (
                <>
                  Resend Verification Email
                  <Mail className="size-7" />
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-14 text-xl border-neutral-700 hover:bg-neutral-800"
            >
              <Link href="/login">
                Back to Login
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}