'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  ClipboardList,
  ChevronLeft,
  Book
} from 'lucide-react';
import { useUserStore } from '@/stores';
import { USER_ROLES } from '@/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="size-6" />
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: <Users className="size-6" />
  },
  {
    label: 'Roadmaps',
    href: '/admin/roadmaps',
    icon: <Map className="size-6" />
  },
  {
    label: 'Assessments',
    href: '/admin/assessments',
    icon: <ClipboardList className="size-6" />
  },
  {
    label: 'Mentorship',
    href: '/admin/mentorship',
    icon: <Book className="size-6" />
  }
];

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useUserStore();

  useEffect(() => {
    if (isInitialized && (!user || user.role !== USER_ROLES.ADMIN)) {
      toast.error('Access denied. Admin only.');
      router.push('/');
    }
  }, [isInitialized, user, router]);

  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const items: { id: string; label: string; href: string; isCurrentPage: boolean }[] = [];

    const labelMap: Record<string, string> = {
      admin: 'Admin',
      dashboard: 'Overview',
      users: 'Users',
      roadmaps: 'Roadmaps',
      assessments: 'Assessments',
      mentorship: 'Mentorship'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      items.push({
        id: `breadcrumb-${index}-${segment}`,
        label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: segment === 'admin' ? '/admin/dashboard' : currentPath,
        isCurrentPage: isLast,
      });
    });

    return items;
  }, [pathname]);

  if (!isInitialized || !user || user.role !== USER_ROLES.ADMIN) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-80 border-r border-neutral-800 bg-neutral-950 flex flex-col fixed inset-y-0 left-0">
        <div className="p-6 border-b border-neutral-800">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-lg"
          >
            <ChevronLeft className="size-6" />
            Back to Home
          </Link>
        </div>

        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-semibold">Admin Panel</h2>
          <p className="text-lg text-neutral-500">Manage your platform</p>
        </div>

        <nav className="flex-1 p-5 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-5 py-4 rounded-lg text-lg font-medium transition-colors',
                  isActive 
                    ? 'bg-white text-black' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-base font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-base text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-80 p-8 overflow-auto min-h-screen">
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="text-xl">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="flex items-center gap-1.5">
                <Link href="/">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item) => (
              <span key={item.id} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {item.isCurrentPage ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {children}
      </main>
    </div>
  );
}