'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useUserStore } from '@/stores/user.store';

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
    .min(1, { message: 'Email là bắt buộc' })
    .email({ message: 'Email không hợp lệ' })
    .toLowerCase(),
  password: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .max(100, { message: 'Mật khẩu quá dài' }),
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
      toast.success('Đăng ký thành công!', {
        description: 'Vui lòng đăng nhập để tiếp tục.'
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

      toast.success('Đăng nhập thành công!', {
        description: `Chào mừng ${response.user.firstName}!`
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      router.push('/');
      router.refresh();
    } catch (error: unknown) {
      console.error('Login error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.';

      toast.error('Đăng nhập thất bại', {
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
          Đăng nhập
        </CardTitle>
        <CardDescription className="text-xl text-neutral-400">
          Nhập email và mật khẩu của bạn để đăng nhập
        </CardDescription>
      </CardHeader>
  
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-lg">Mật khẩu</Label>
              <Link
                href="/forgot-password"
                className="text-lg text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
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
        </CardContent>
  
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button
            type="submit"
            className="w-full h-12 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Đang đăng nhập...
                <Loader2 className="ml-2 size-6 animate-spin" />
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>
  
          <p className="text-center text-lg text-neutral-400">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-medium text-neutral-200 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}