'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { authService } from '@/services';
import type { IRegisterRequest } from '@/types';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password is too long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least 1 uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least 1 lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least 1 number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least 1 special character' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm password' }),
  firstName: z
    .string()
    .min(1, { message: 'First name is required' })
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name is too long' }),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name is too long' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Confirm password does not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const registerService = authService?.register;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const registerPayload: IRegisterRequest = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      };

      await registerService?.(registerPayload);

      toast.success('Registration successful!', {
        description: 'Redirecting to login page...'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      router.push('/login?registered=true');
    } catch (error: unknown) {
      console.error('Register error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred while registering. Please try again.';

      toast.error('Registration failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Register
        </CardTitle>
        <CardDescription className="text-xl text-neutral-400">
          Create a new account to start your journey
        </CardDescription>
      </CardHeader>
  
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-lg">
                First name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                autoComplete="off"
                disabled={isLoading}
                className={`!text-lg h-12 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 ${
                  errors.firstName ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-lg text-red-500">{errors.firstName.message}</p>
              )}
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-lg">
                Last name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                autoComplete="off"
                disabled={isLoading}
                className={`!text-lg h-12 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 ${
                  errors.lastName ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-lg text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">
              Email address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              autoComplete="off"
              disabled={isLoading}
              className={`!text-lg h-12 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 ${
                errors.email ? 'border-red-500 focus:border-red-500' : ''
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-lg text-red-500">{errors.email.message}</p>
            )}
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className={`!text-lg h-12 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 pr-12 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="size-6" />
                ) : (
                  <Eye className="size-6" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-lg text-red-500">{errors.password.message}</p>
            )}
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-lg">
              Confirm password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className={`!text-lg h-12 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 pr-12 ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-6" />
                ) : (
                  <Eye className="size-6" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-lg text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
  
        <CardFooter className="flex flex-col space-y-4 mt-6">
          <Button
            type="submit"
            className="w-full h-12 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Registering...
                <Loader2 className="ml-2 size-6 animate-spin" />
              </>
            ) : (
              'Register'
            )}
          </Button>
  
          <p className="text-center text-lg text-neutral-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-neutral-200 hover:underline"
            >
              Login now
            </Link>
          </p>
  
          <p className="text-center text-base text-neutral-500">
            By registering, you agree to the{' '}
            <Link href="/terms" className="underline hover:text-neutral-400">
              Terms of service
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="underline hover:text-neutral-400">
              Privacy policy
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}