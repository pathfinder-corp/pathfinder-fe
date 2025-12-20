'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useUserStore } from '@/stores';

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
import { setAuthCookie } from '@/lib';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .toLowerCase(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(100, { message: 'Password is too long' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  const loginService = authService?.login;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success('Registration successful!', {
        description: 'Please login to continue.'
      });
      router.replace('/login');
    }
  }, [searchParams, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await loginService?.(data);

      setAuthCookie(response.accessToken, response.expiresIn);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      setUser(response.user);

      toast.success('Login successful!', {
        description: `Welcome ${response.user.firstName}!`
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      router.push('/');
      router.refresh();
    } catch (error: unknown) {
      console.error('Login error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred while logging in. Please try again.';

      toast.error('Login failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-4xl font-bold tracking-tight">
          Login
        </CardTitle>
        <CardDescription className="text-2xl text-neutral-400">
          Enter your email and password to login
        </CardDescription>
      </CardHeader>
  
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-xl">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              autoComplete="off"
              disabled={isLoading}
              className={`text-xl! h-14 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 ${
                errors.email ? 'border-red-500 focus:border-red-500' : ''
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xl text-red-500">{errors.email.message}</p>
            )}
          </div>
  
          <div className="space-y-3">
            <Label htmlFor="password" className="text-xl">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className={`text-xl! h-14 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 pr-14 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="size-7" />
                ) : (
                  <Eye className="size-7" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xl text-red-500">{errors.password.message}</p>
            )}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xl text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </CardContent>
  
        <CardFooter className="flex flex-col space-y-5 mt-8">
          <Button
            type="submit"
            className="w-full h-14 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Logging in...
                <Loader2 className="size-7 animate-spin" />
              </>
            ) : (
              'Login'
            )}
          </Button>
  
          <p className="text-center text-xl text-neutral-400 mb-2">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-neutral-200 hover:underline"
            >
              Register now
            </Link>
          </p>

          <Link href="/" className="text-center text-xl hover:underline text-neutral-400 hover:text-neutral-200 transition-colors">
            Back to home
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}