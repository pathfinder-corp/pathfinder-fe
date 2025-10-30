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
import { USER_ROLES } from '@/constants';

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
    .min(1, { message: 'Email là bắt buộc' })
    .email({ message: 'Email không hợp lệ' })
    .toLowerCase(),
  password: z
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
  firstName: z
    .string()
    .min(1, { message: 'Họ là bắt buộc' })
    .min(2, { message: 'Họ phải có ít nhất 2 ký tự' })
    .max(50, { message: 'Họ quá dài' }),
  lastName: z
    .string()
    .min(1, { message: 'Tên là bắt buộc' })
    .min(2, { message: 'Tên phải có ít nhất 2 ký tự' })
    .max(50, { message: 'Tên quá dài' }),
  role: z.enum(['student', 'counselor']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
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
      lastName: '',
      role: 'student'
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const registerPayload: IRegisterRequest = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      };

      await registerService?.(registerPayload);

      toast.success('Đăng ký thành công!', {
        description: 'Đang chuyển đến trang đăng nhập...'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      router.push('/login?registered=true');
    } catch (error: unknown) {
      console.error('Register error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';

      toast.error('Đăng ký thất bại', {
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
          Đăng ký tài khoản
        </CardTitle>
        <CardDescription className="text-xl text-neutral-400">
          Tạo tài khoản mới để bắt đầu hành trình của bạn
        </CardDescription>
      </CardHeader>
  
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-lg">
                Họ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Nguyễn Văn"
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
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="An"
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
              Email <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="password" className="text-lg">
              Mật khẩu <span className="text-red-500">*</span>
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
              Xác nhận mật khẩu <span className="text-red-500">*</span>
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
  
          <div className="space-y-2">
            <Label htmlFor="role" className="text-lg">
              Vai trò <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger 
                    className={`!h-12 !text-lg w-full bg-neutral-900/50 border-neutral-800 focus:border-neutral-600 ${
                      errors.role ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value={USER_ROLES.STUDENT} className="!text-lg focus:bg-neutral-800 focus:text-white">
                      Học viên
                    </SelectItem>
                    <SelectItem value={USER_ROLES.COUNSELOR} className="!text-lg focus:bg-neutral-800 focus:text-white">
                      Tư vấn viên
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-lg text-red-500">{errors.role.message}</p>
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
                Đang đăng ký...
                <Loader2 className="ml-2 size-6 animate-spin" />
              </>
            ) : (
              'Đăng ký'
            )}
          </Button>
  
          <p className="text-center text-lg text-neutral-400">
            Đã có tài khoản?{' '}
            <Link
              href="/login"
              className="font-medium text-neutral-200 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
  
          <p className="text-center text-base text-neutral-500">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link href="/terms" className="underline hover:text-neutral-400">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="underline hover:text-neutral-400">
              Chính sách bảo mật
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}