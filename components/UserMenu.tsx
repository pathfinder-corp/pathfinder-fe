'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, LayoutDashboard, MessageCircle, GraduationCap } from 'lucide-react';
import { useUserStore } from '@/stores';
import { authService } from '@/services';
import { toast } from 'sonner';
import { USER_ROLES } from '@/constants';

export function UserMenu() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const logoutService = authService?.logout;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logoutService?.();
      clearUser();
      router.push('/login');
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred. Please try again.';
      toast.error('Logout failed', {
        description: errorMessage,
      });
    }
  };

  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-1 rounded-full cursor-pointer"
      >
        {user.avatar ? (
          <div className="relative size-14 rounded-full overflow-hidden border-2 border-neutral-700">
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
          <div className="size-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border-2 border-neutral-600 flex items-center justify-center text-lg font-bold">
            {getInitials()}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-5 border-b border-neutral-800">
              <p className="text-xl font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-lg text-neutral-400">{user.email}</p>
            </div>

            {user.role === USER_ROLES.ADMIN && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 px-5 py-4 text-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="size-6" />
                Dashboard
              </Link>
            )}

            <Link
              href="/messages"
              className="flex items-center gap-3 px-5 py-4 text-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <MessageCircle className="size-6" />
              Messages
            </Link>

            <Link
                href="/settings"
              className="flex items-center gap-3 px-5 py-4 text-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
              <Settings className="size-6" />
                Settings
              </Link>

              <button
                onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 text-lg text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-colors cursor-pointer"
              >
              <LogOut className="size-6" />
              Logout
              </button>
          </div>
        </>
      )}
    </div>
  );
}