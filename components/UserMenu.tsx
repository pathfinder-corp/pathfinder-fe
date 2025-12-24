'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, LayoutDashboard, MessageCircle } from 'lucide-react';
import { useUserStore } from '@/stores';
import { authService } from '@/services';
import { toast } from 'sonner';
import { USER_ROLES } from '@/constants';
import { getInitials } from '@/lib';

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
        error instanceof Error
          ? error.message
          : 'An error occurred while logging out. Please try again.';
      toast.error('Logout failed', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center rounded-full p-1"
      >
        {user.avatar ? (
          <div className="relative size-14 overflow-hidden rounded-full border-2 border-neutral-700">
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
          <div className="flex size-14 items-center justify-center rounded-full border-2 border-neutral-600 bg-linear-to-br from-neutral-700 to-neutral-800 text-lg font-bold">
            {getInitials(user.firstName, user.lastName)}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl">
            <div className="border-b border-neutral-800 p-5">
              <p className="text-xl font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p
                className="truncate text-lg text-neutral-400"
                title={user.email}
              >
                {user.email}
              </p>
            </div>

            {user.role === USER_ROLES.ADMIN && (
              <Link
                href="/admin/dashboard"
                className="flex cursor-pointer items-center gap-3 px-5 py-4 text-lg text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="size-6" />
                Dashboard
              </Link>
            )}

            <Link
              href="/messages"
              className="flex cursor-pointer items-center gap-3 px-5 py-4 text-lg text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <MessageCircle className="size-6" />
              Messages
            </Link>

            <Link
              href="/settings"
              className="flex cursor-pointer items-center gap-3 px-5 py-4 text-lg text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="size-6" />
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-lg text-red-400 transition-colors hover:bg-neutral-800 hover:text-red-300"
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
