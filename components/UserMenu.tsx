'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings } from 'lucide-react';
import { useUserStore } from '@/stores/user.store';
import { logout } from '@/lib/auth';
import { toast } from 'sonner';

export function UserMenu() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Có lỗi khi đăng xuất');
    }
  };

  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-full cursor-pointer"
      >
        <span className="text-lg font-medium text-white hidden md:block">
          {user.firstName} {user.lastName}
        </span>
        {user.avatar ? (
          <div className="relative size-11 rounded-full overflow-hidden border-2 border-neutral-700">
            <Image
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="size-11 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border-2 border-neutral-600 flex items-center justify-center text-sm font-bold">
            {getInitials()}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <p className="text-lg font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-base text-neutral-400">{user.email}</p>
              <p className="text-sm text-neutral-500 mt-1 capitalize">
                {user.role === 'student' ? 'Học viên' : 'Giảng viên'}
              </p>
            </div>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-base text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-5 w-5" />
              Hồ sơ của tôi
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 text-base text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-5 w-5" />
              Cài đặt
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-base text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
}