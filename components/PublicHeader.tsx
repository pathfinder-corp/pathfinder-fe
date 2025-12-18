'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/stores';

import { Button } from './ui/button';
import { UserMenu } from './UserMenu';
import { NotificationDropdown } from './NotificationDropdown';
import { Skeleton } from './ui/skeleton';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Roadmap with AI', href: '/roadmap' },
  { label: 'Find Mentors', href: '/mentors' },
  { label: 'Contact', href: '/contact' }
];

export function PublicHeader() {
  const pathname = usePathname();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isInitialized = useUserStore((state) => state.isInitialized);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <header className="fixed top-0 w-full h-24 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="size-full px-8 lg:px-16 grid grid-cols-3 items-center">
        <Link 
          href="/"
          className="text-3xl lg:text-4xl font-bold tracking-tight hover:text-neutral-300 transition-colors justify-start-safe"
        >
          Pathfinder.
        </Link>

        <nav className="hidden lg:flex items-center gap-10 justify-center-safe">
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 text-lg font-medium transition-colors group ${
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

        <div className="flex items-center gap-3 justify-end-safe">
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
                className="!h-12 rounded-full text-base border border-neutral-700 hover:border-white hover:bg-white/5 transition-all duration-300"
              >
                <Link href="/login">Login</Link>
              </Button>
              
              <Button
                asChild
                size="lg"
                className="!h-12 rounded-full text-base bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}