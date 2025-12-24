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
        description:
          'Please check your email (and spam folder) to find the email containing the reset password link. This link will expire after 15 minutes.',
      });
    } catch (error: unknown) {
      console.error('Forgot password error:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while sending email. Please try again.';

      toast.error('Failed to send email', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-4xl font-bold tracking-tight">
          Forgot password?
        </CardTitle>
        <CardDescription className="text-2xl text-neutral-400">
          {emailSent
            ? 'We have sent you an email with instructions to reset your password'
            : 'Enter your email to receive instructions to reset your password'}
        </CardDescription>
      </CardHeader>

      {!emailSent ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xl">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 size-6 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  autoComplete="off"
                  disabled={isLoading}
                  className={`h-14 border-neutral-800 bg-neutral-900/50 pl-14 text-xl! focus:border-neutral-600 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xl text-red-500">{errors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="mt-8 flex flex-col space-y-5">
            <Button
              type="submit"
              className="h-14 w-full bg-neutral-100 text-xl text-neutral-900 hover:bg-neutral-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Sending...
                  <Loader2 className="size-7 animate-spin" />
                </>
              ) : (
                'Send email'
              )}
            </Button>

            <p className="text-center text-xl text-neutral-400">
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
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex size-20 items-center justify-center rounded-full bg-neutral-800/50">
              <Mail className="size-10 text-neutral-200" />
            </div>

            <div className="space-y-2 text-center">
              <p className="text-2xl text-neutral-300">
                Email has been sent to
              </p>
              <p className="text-2xl font-semibold text-white">
                {getValues('email')}
              </p>
            </div>

            <div className="max-w-md rounded-lg border border-neutral-800 bg-neutral-900/50 p-5">
              <p className="text-lg leading-relaxed text-neutral-400">
                Please check your email (and spam folder) to find the email
                containing the reset password link. This link will expire after
                15 minutes.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => setEmailSent(false)}
              variant="ghost"
              className="h-14 w-full border border-neutral-700 text-xl hover:border-white hover:bg-white/5"
            >
              Send email again
            </Button>

            <Button
              asChild
              className="h-14 w-full bg-neutral-100 text-xl text-neutral-900 hover:bg-neutral-200"
            >
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
