'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .toLowerCase(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const forgotPasswordService = authService?.forgotPassword;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await forgotPasswordService?.(data.email);

      setEmailSent(true);

      toast.success('Email has been sent!', {
        description: 'Please check your email (and spam folder) to find the email containing the reset password link. This link will expire after 15 minutes.'
      });
    } catch (error: unknown) {
      console.error('Forgot password error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred while sending email. Please try again.';

      toast.error('Failed to send email', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/login"
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft className="size-6" />
          </Link>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Forgot password?
          </CardTitle>
        </div>
        <CardDescription className="text-xl text-neutral-400">
          {emailSent 
            ? 'We have sent you an email with instructions to reset your password'
            : 'Enter your email to receive instructions to reset your password'
          }
        </CardDescription>
      </CardHeader>

      {!emailSent ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  autoComplete="off"
                  disabled={isLoading}
                  className={`!text-lg h-12 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 pl-11 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-lg text-red-500">{errors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button
              type="submit"
              className="w-full h-12 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Sending...
                  <Loader2 className="ml-2 size-6 animate-spin" />
                </>
              ) : (
                'Send email'
              )}
            </Button>

            <p className="text-center text-lg text-neutral-400">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-medium text-neutral-200 hover:underline"
              >
                Login now
              </Link>
            </p>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="size-16 rounded-full bg-neutral-800/50 flex items-center justify-center">
              <Mail className="size-8 text-neutral-200" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-xl text-neutral-300">
                Email has been sent to
              </p>
              <p className="text-xl font-semibold text-white">
                {getValues('email')}
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 max-w-md">
              <p className="text-base text-neutral-400 leading-relaxed">
                Please check your email (and spam folder) to find the email containing 
                the reset password link. This link will expire after 15 minutes.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setEmailSent(false)}
              variant="ghost"
              className="w-full h-12 text-lg border border-neutral-700 hover:border-white hover:bg-white/5"
            >
              Send email again
            </Button>

            <Button
              asChild
              className="w-full h-12 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            >
              <Link href="/login">
                Back to login
              </Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}