'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Map,
  Menu,
  X,
  History,
  ClipboardList
} from 'lucide-react';
import { useUserStore, useRoadmapStore } from '@/stores';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { USER_ROLES } from '@/constants';
import { Skeleton } from '@/components/ui/skeleton';

const STUDENT_NAV = [
  { label: 'Create Roadmap', href: '/roadmap', icon: Map, exact: true },
  { label: 'Assessment', href: '/assessment', icon: ClipboardList, exact: true },
  { label: 'History', href: '/history', icon: History, exact: false }
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, initializeUser } = useUserStore();
  const { isViewMode } = useRoadmapStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const getNavItems = () => {
    if (!user) return [];
    switch (user.role) {
      case USER_ROLES.STUDENT:
        return STUDENT_NAV;
      default:
        return STUDENT_NAV;
    }
  };

  const navItems = getNavItems();

  const isItemActive = (item: (typeof STUDENT_NAV)[0]) => {
    if (item.exact) {
      if (item.href === '/roadmap') {
        return pathname === '/roadmap' || 
               (pathname.startsWith('/roadmap/') && !pathname.startsWith('/roadmap/history'));
      }
      if (item.href === '/assessment') {
        return pathname === '/assessment' || 
               (pathname.startsWith('/assessment/') && !pathname.startsWith('/assessment/history'));
      }
      return pathname === item.href;
    }
    
    return pathname.startsWith(item.href);
  };

  const shouldShowSidebar = isInitialized && isAuthenticated && user && !isViewMode;

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="fixed top-0 left-0 right-0 h-22 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {shouldShowSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            )}

            <Link 
              href="/"
              className="text-3xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
            >
              Pathfinder. AI
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {!isInitialized ? (
              <Skeleton className="size-12 rounded-full" />
            ) : isAuthenticated ? (
              <UserMenu />
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

      {shouldShowSidebar && (
        <aside className="hidden lg:block fixed left-0 top-24 bottom-0 w-[18rem] border-r border-neutral-800 bg-neutral-950/50 backdrop-blur-sm overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[.75rem] px-5 py-4 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-neutral-950 font-medium'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className="size-5.5" />
                  <span className="text-[1.2rem]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      {isSidebarOpen && shouldShowSidebar && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 top-24"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-20 bottom-0 w-64 border-r border-neutral-800 bg-neutral-950 z-40 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-neutral-950 font-medium'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="text-base">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      <main className={`${shouldShowSidebar ? 'lg:ml-[18rem]' : ''} pt-24 min-h-screen`}>
        <div className={`p-6 lg:p-8 ${!shouldShowSidebar ? 'max-w-7xl mx-auto' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}