'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
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

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .max(100, { message: 'Password is too long' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least 1 uppercase letter',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least 1 lowercase letter',
      })
      .regex(/[0-9]/, { message: 'Password must contain at least 1 number' })
      .regex(/[^A-Za-z0-9]/, {
        message: 'Password must contain at least 1 special character',
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Confirm password does not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const resetPasswordService = authService?.resetPassword;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');

    if (!tokenFromUrl) {
      toast.error('Invalid token', {
        description:
          'Please use the link from the email to reset your password.',
      });
      router.push('/forgot-password');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid token');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordService?.({
        token,
        newPassword: data.newPassword,
      });

      setResetSuccess(true);

      toast.success('Password reset successful!', {
        description: 'You can login with your new password.',
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      router.push('/login?reset=success');
    } catch (error: unknown) {
      console.error('Reset password error:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while resetting your password. Please try again.';

      toast.error('Password reset failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-4xl font-bold tracking-tight">
            Verifying...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="size-10 animate-spin text-neutral-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-4xl font-bold tracking-tight">
          {resetSuccess ? 'Success!' : 'Reset password'}
        </CardTitle>
        <CardDescription className="text-2xl text-neutral-400">
          {resetSuccess
            ? 'Your password has been reset successfully'
            : 'Enter your new password'}
        </CardDescription>
      </CardHeader>

      {!resetSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="newPassword" className="text-xl">
                New password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`h-14 border-neutral-800 bg-neutral-900/50 pr-14 text-xl! focus:border-neutral-600 ${
                    errors.newPassword
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="size-7" />
                  ) : (
                    <Eye className="size-7" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xl text-red-500">
                  {errors.newPassword.message}
                </p>
              )}

              <div className="mt-3 space-y-2">
                <p className="text-lg text-neutral-500">
                  Password must contain:
                </p>
                <ul className="ml-4 space-y-1 text-lg text-neutral-500">
                  <li>• At least 8 characters</li>
                  <li>• At least 1 uppercase letter</li>
                  <li>• At least 1 lowercase letter</li>
                  <li>• At least 1 number</li>
                  <li>• At least 1 special character</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-xl">
                Confirm new password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`h-14 border-neutral-800 bg-neutral-900/50 pr-14 text-xl! focus:border-neutral-600 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-200"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-7" />
                  ) : (
                    <Eye className="size-7" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xl text-red-500">
                  {errors.confirmPassword.message}
                </p>
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
                  Processing...
                  <Loader2 className="size-7 animate-spin" />
                </>
              ) : (
                'Reset password'
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
            <div className="flex size-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="size-10 text-green-500" />
            </div>

            <div className="space-y-2 text-center">
              <p className="text-2xl text-neutral-300">
                Your password has been reset successfully!
              </p>
              <p className="text-lg text-neutral-400">
                You can login with your new password.
              </p>
            </div>
          </div>

          <Button
            asChild
            className="h-14 w-full bg-neutral-100 text-xl text-neutral-900 hover:bg-neutral-200"
          >
            <Link href="/login">Login now</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
