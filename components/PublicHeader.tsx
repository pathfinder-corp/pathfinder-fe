'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores';
import {
  Menu,
  X,
  LogOut,
  Settings,
  LayoutDashboard,
  MessageCircle,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { getInitials } from '@/lib';

import { Button } from './ui/button';
import { UserMenu } from './UserMenu';
import { NotificationDropdown } from './NotificationDropdown';
import { Skeleton } from './ui/skeleton';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { authService } from '@/services';
import { USER_ROLES } from '@/constants';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Roadmap with AI', href: '/roadmap' },
  { label: 'Find Mentors', href: '/mentors' },
  { label: 'Contact', href: '/contact' },
];

function MobileUserSection({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await authService.logout?.();
      clearUser();
      onClose();
      router.push('/login');
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred. Please try again.';
      toast.error('Logout failed', {
        description: errorMessage,
      });
    }
  };

  const menuItems = [
    ...(user.role === USER_ROLES.ADMIN
      ? [
          {
            icon: LayoutDashboard,
            label: 'Dashboard',
            href: '/admin/dashboard',
          },
        ]
      : []),
    { icon: MessageCircle, label: 'Messages', href: '/messages' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl border border-neutral-700/50 bg-neutral-800/50 p-4">
        {user.avatar ? (
          <div className="relative size-16 overflow-hidden rounded-full border-2 border-neutral-600">
            <Image
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-neutral-600 bg-linear-to-br from-neutral-700 to-neutral-800 text-xl font-bold">
            {getInitials(user.firstName, user.lastName)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-base text-neutral-400">{user.email}</p>
        </div>
      </div>

      <div className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-lg text-neutral-300 transition-all hover:bg-white/5 hover:text-white"
          >
            <item.icon className="size-6" />
            {item.label}
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-lg font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
      >
        Logout
        <LogOut className="size-6" />
      </button>
    </div>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isInitialized = useUserStore((state) => state.isInitialized);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="fixed top-0 z-50 h-30 w-full border-b border-white/10 bg-black/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
      <div className="flex size-full items-center justify-between px-8 lg:grid lg:grid-cols-3 lg:justify-normal lg:px-16">
        <Link
          href="/"
          className="text-4xl font-bold tracking-tight transition-colors hover:text-neutral-300 xl:text-5xl"
        >
          Pathfinder.
        </Link>

        <nav className="hidden items-center justify-center-safe gap-6 lg:flex xl:gap-10">
          {NAV_ITEMS.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative py-2 text-lg font-medium whitespace-nowrap transition-colors xl:text-xl ${
                  isActive ? 'text-white' : 'text-neutral-300 hover:text-white'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.label}

                <span
                  className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 bg-white transition-all duration-300 ease-out ${
                    isActive || hoveredIndex === index ? 'w-full' : 'w-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center justify-end-safe gap-3 lg:flex">
          {!isInitialized ? (
            <Skeleton className="size-12 rounded-full" />
          ) : isAuthenticated ? (
            <>
              <NotificationDropdown />
              <div className="h-6 w-px bg-neutral-700" />
              <UserMenu />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-16! rounded-full border border-neutral-700 text-xl transition-all duration-300 hover:border-white hover:bg-white/5"
              >
                <Link href="/login">Login</Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="h-16! rounded-full bg-white text-xl text-neutral-950 transition-all duration-300 hover:bg-neutral-200"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-12 text-white hover:bg-white/10 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="size-8" />
              ) : (
                <Menu className="size-8" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full border-l border-neutral-800 bg-neutral-950/95 p-0 backdrop-blur-xl sm:w-[400px]"
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-neutral-800/50 px-6 py-8">
                <SheetTitle className="text-4xl font-bold text-white">
                  Menu
                </SheetTitle>
              </div>

              <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center gap-4 rounded-2xl px-6 py-4 text-xl font-medium transition-all ${
                        isActive
                          ? 'bg-white/10 text-white shadow-lg'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-neutral-800/50 bg-neutral-900/50 px-4 py-6">
                {!isInitialized ? (
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full rounded-2xl bg-neutral-800" />
                    <Skeleton className="h-14 w-full rounded-2xl bg-neutral-800" />
                  </div>
                ) : !isAuthenticated ? (
                  <div className="space-y-3">
                    <Button
                      asChild
                      variant="outline"
                      className="h-14! w-full rounded-2xl border-2 border-neutral-700 text-xl hover:border-white hover:bg-white/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/login">Login</Link>
                    </Button>

                    <Button
                      asChild
                      className="h-14! w-full rounded-2xl bg-white text-xl text-neutral-950 shadow-lg hover:bg-neutral-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>
                ) : (
                  <MobileUserSection onClose={() => setMobileMenuOpen(false)} />
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
