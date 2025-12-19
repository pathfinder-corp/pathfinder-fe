'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores';
import { Menu, X, LogOut, Settings, LayoutDashboard, MessageCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';

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
  { label: 'Contact', href: '/contact' }
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
        error instanceof Error ? error.message : 'An error occurred. Please try again.';
      toast.error('Logout failed', {
        description: errorMessage,
      });
    }
  };

  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const menuItems = [
    ...(user.role === USER_ROLES.ADMIN
      ? [{ icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' }]
      : []),
    { icon: MessageCircle, label: 'Messages', href: '/messages' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/50">
        {user.avatar ? (
          <div className="relative size-16 rounded-full overflow-hidden border-2 border-neutral-600">
            <Image
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="size-16 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border-2 border-neutral-600 flex items-center justify-center text-xl font-bold">
            {getInitials()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xl font-semibold text-white truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-base text-neutral-400 truncate">{user.email}</p>
        </div>
      </div>

      <div className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-4 px-4 py-3 text-lg text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <item.icon className="size-6" />
            {item.label}
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-lg font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all bg-red-500/10 border border-red-500/20"
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
    <header className="fixed top-0 w-full h-30 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="size-full px-8 lg:px-16 flex lg:grid lg:grid-cols-3 items-center justify-between lg:justify-normal">
        <Link 
          href="/"
          className="text-4xl xl:text-5xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
        >
          Pathfinder.
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-10 justify-center-safe">
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 text-lg xl:text-xl font-medium transition-colors group whitespace-nowrap ${
                  isActive 
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.label}
                
                <span 
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-white transition-all duration-300 ease-out ${
                    isActive || hoveredIndex === index ? 'w-full' : 'w-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3 justify-end-safe">
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
                className="!h-16 rounded-full text-xl border border-neutral-700 hover:border-white hover:bg-white/5 transition-all duration-300"
              >
                <Link href="/login">Login</Link>
              </Button>
              
              <Button
                asChild
                size="lg"
                className="!h-16 rounded-full text-xl bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300"
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
              className="lg:hidden size-12 text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="size-8" /> : <Menu className="size-8" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800 p-0">
            <div className="flex flex-col h-full">
              <div className="px-6 py-8 border-b border-neutral-800/50">
                <SheetTitle className="text-4xl font-bold text-white">Menu</SheetTitle>
              </div>
              
              <nav className="flex flex-col gap-2 px-4 py-6 flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || 
                                 (item.href !== '/' && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative text-xl font-medium transition-all py-4 px-6 rounded-2xl flex items-center gap-4 ${
                        isActive 
                          ? 'text-white bg-white/10 shadow-lg'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-4 py-6 border-t border-neutral-800/50 bg-neutral-900/50">
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
                      className="w-full !h-14 text-xl border-2 border-neutral-700 hover:border-white hover:bg-white/5 rounded-2xl"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    
                    <Button
                      asChild
                      className="w-full !h-14 text-xl bg-white text-neutral-950 hover:bg-neutral-200 rounded-2xl shadow-lg"
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