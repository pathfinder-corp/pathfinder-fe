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
import { resetPassword } from '@/lib/auth';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    .max(100, { message: 'Mật khẩu quá dài' })
    .regex(/[A-Z]/, { message: 'Mật khẩu phải có ít nhất 1 chữ hoa' })
    .regex(/[a-z]/, { message: 'Mật khẩu phải có ít nhất 1 chữ thường' })
    .regex(/[0-9]/, { message: 'Mật khẩu phải có ít nhất 1 số' })
    .regex(/[^A-Za-z0-9]/, { message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Vui lòng xác nhận mật khẩu' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

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
      toast.error('Token không hợp lệ', {
        description: 'Vui lòng sử dụng liên kết từ email để đặt lại mật khẩu.'
      });
      router.push('/forgot-password');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
      });

      setResetSuccess(true);

      toast.success('Đặt lại mật khẩu thành công!', {
        description: 'Bạn có thể đăng nhập bằng mật khẩu mới.'
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      router.push('/login?reset=success');
    } catch (error: unknown) {
      console.error('Reset password error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.';

      toast.error('Đặt lại mật khẩu thất bại', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Đang xác thực...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-neutral-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {resetSuccess ? 'Thành công!' : 'Đặt lại mật khẩu'}
        </CardTitle>
        <CardDescription className="text-xl text-neutral-400">
          {resetSuccess 
            ? 'Mật khẩu của bạn đã được đặt lại thành công'
            : 'Nhập mật khẩu mới của bạn'
          }
        </CardDescription>
      </CardHeader>

      {!resetSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-lg">
                Mật khẩu mới <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`!text-lg h-12 bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 pr-12 ${
                    errors.newPassword ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="size-6" />
                  ) : (
                    <Eye className="size-6" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-lg text-red-500">{errors.newPassword.message}</p>
              )}
              
              <div className="mt-2 space-y-1">
                <p className="text-base text-neutral-500">Mật khẩu phải có:</p>
                <ul className="text-base text-neutral-500 space-y-1 ml-4">
                  <li>• Ít nhất 8 ký tự</li>
                  <li>• Ít nhất 1 chữ hoa</li>
                  <li>• Ít nhất 1 chữ thường</li>
                  <li>• Ít nhất 1 số</li>
                  <li>• Ít nhất 1 ký tự đặc biệt</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-lg">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
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

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button
              type="submit"
              className="w-full h-12 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Đang xử lý...
                  <Loader2 className="ml-2 size-6 animate-spin" />
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </Button>

            <p className="text-center text-lg text-neutral-400">
              Nhớ mật khẩu rồi?{' '}
              <Link
                href="/login"
                className="font-medium text-neutral-200 hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-xl text-neutral-300">
                Mật khẩu của bạn đã được đặt lại thành công!
              </p>
              <p className="text-base text-neutral-400">
                Bạn có thể đăng nhập bằng mật khẩu mới của mình.
              </p>
            </div>
          </div>

          <Button
            asChild
            className="w-full h-12 text-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
          >
            <Link href="/login">
              Đăng nhập ngay
            </Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}