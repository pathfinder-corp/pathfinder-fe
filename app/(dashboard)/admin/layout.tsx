'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  ClipboardList,
  ChevronLeft,
  Book,
  MessageSquare
} from 'lucide-react';
import { useUserStore } from '@/stores';
import { USER_ROLES } from '@/constants';
import { toast } from 'sonner';
import { cn, getInitials } from '@/lib/utils';

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
    icon: <LayoutDashboard className="size-7" />
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: <Users className="size-7" />
  },
  {
    label: 'Roadmaps',
    href: '/admin/roadmaps',
    icon: <Map className="size-7" />
  },
  {
    label: 'Assessments',
    href: '/admin/assessments',
    icon: <ClipboardList className="size-7" />
  },
  {
    label: 'Mentorship',
    href: '/admin/mentorship',
    icon: <Book className="size-7" />
  },
  {
    label: 'Contacts',
    href: '/admin/contact',
    icon: <MessageSquare className="size-7" />
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
      mentorship: 'Mentorship',
      contact: 'Contact'
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
      <aside className="w-88 border-r border-neutral-800 bg-neutral-950 flex flex-col fixed inset-y-0 left-0">
        <div className="p-7 border-b border-neutral-800">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 text-neutral-400 hover:text-white transition-colors text-xl"
          >
            <ChevronLeft className="size-7" />
            Back to Home
          </Link>
        </div>

        <div className="p-7 border-b border-neutral-800">
          <h2 className="text-3xl font-semibold">Admin Dashboard</h2>
          <p className="text-xl text-neutral-500 mt-1">Manage your platform</p>
        </div>

        <nav className="flex-1 p-6 space-y-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-6 py-5 rounded-lg text-xl font-medium transition-colors',
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

        <div className="p-7 border-t border-neutral-800">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <div className="relative size-14 rounded-full overflow-hidden">
                <Image
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="size-14 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-lg font-bold">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xl font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-lg text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-88 p-8 overflow-auto min-h-screen">
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