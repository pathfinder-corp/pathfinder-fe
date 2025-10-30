'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Settings,
  Menu,
  X,
  Award
} from 'lucide-react';
import { useUserStore } from '@/stores';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { USER_ROLES } from '@/constants';

const STUDENT_NAV = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Hồ sơ học tập', href: '/profile', icon: GraduationCap },
  { label: 'Khóa học', href: '/courses', icon: BookOpen },
  { label: 'Khóa học của tôi', href: '/my-courses', icon: Award }
];

const COUNSELOR_NAV = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Học viên', href: '/students', icon: Users },
  { label: 'Khóa học', href: '/courses', icon: BookOpen }
];

const ADMIN_NAV = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Quản lý khóa học', href: '/admin/courses', icon: Settings },
  { label: 'Học viên', href: '/students', icon: Users }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, initializeUser } = useUserStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const getNavItems = () => {
    switch (user.role) {
      case USER_ROLES.STUDENT:
        return STUDENT_NAV;
      case USER_ROLES.COUNSELOR:
        return COUNSELOR_NAV;
      case USER_ROLES.ADMIN:
        return ADMIN_NAV;
      default:
        return STUDENT_NAV;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>

            <Link 
              href="/"
              className="text-2xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
            >
              Pathfinder<span className="text-neutral-400">.</span>
            </Link>
          </div>

          <UserMenu />
        </div>
      </header>

      <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-64 border-r border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
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

      {isSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 top-20"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-20 bottom-0 w-64 border-r border-neutral-800 bg-neutral-950 z-40">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                               (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
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

      <main className="lg:ml-64 pt-20 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}