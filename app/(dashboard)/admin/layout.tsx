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
    icon: <LayoutDashboard className="size-5" />
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: <Users className="size-5" />
  },
  {
    label: 'Roadmaps',
    href: '/admin/roadmaps',
    icon: <Map className="size-5" />
  },
  {
    label: 'Assessments',
    href: '/admin/assessments',
    icon: <ClipboardList className="size-5" />
  },
  {
    label: 'Mentorship',
    href: '/admin/mentorship',
    icon: <Book className="size-5" />
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
      <aside className="w-72 border-r border-neutral-800 bg-neutral-950 flex flex-col fixed inset-y-0 left-0">
        <div className="p-5 border-b border-neutral-800">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-base"
          >
            <ChevronLeft className="size-5" />
            Back to Home
          </Link>
        </div>

        <div className="p-5 border-b border-neutral-800">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <p className="text-base text-neutral-500">Manage your platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-[.65rem] px-4 py-3 rounded-lg text-base font-medium transition-colors',
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

        <div className="p-5 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-sm font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8 overflow-auto min-h-screen">
        <Breadcrumb className="mb-5">
          <BreadcrumbList className="text-base">
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

