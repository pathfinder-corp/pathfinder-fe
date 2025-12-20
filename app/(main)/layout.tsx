'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Map,
  Menu,
  X,
  History,
  ClipboardList,
  GraduationCap,
  FileText,
  UserPlus
} from 'lucide-react';
import { useUserStore, useRoadmapStore } from '@/stores';

import { UserMenu } from '@/components/UserMenu';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { USER_ROLES } from '@/constants';
import { Skeleton } from '@/components/ui/skeleton';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Map;
  exact: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const LEARNING_NAV: NavItem[] = [
  { label: 'Create Roadmap', href: '/roadmap', icon: Map, exact: true },
  { label: 'Assessment', href: '/assessment', icon: ClipboardList, exact: true },
  { label: 'History', href: '/history', icon: History, exact: false },
];

const STUDENT_MENTORSHIP_NAV: NavItem[] = [
  { label: 'Become a Mentor', href: '/mentor', icon: GraduationCap, exact: true },
  { label: 'My Requests', href: '/mentorship/requests', icon: UserPlus, exact: false },
  { label: 'My Application', href: '/mentor/applications', icon: FileText, exact: false },
];

const MENTOR_MENTORSHIP_NAV: NavItem[] = [
  { label: 'My Requests', href: '/mentorship/requests', icon: UserPlus, exact: false },
  { label: 'My Application', href: '/mentor/applications', icon: FileText, exact: false },
  { label: 'My Profile', href: '/mentor/profile', icon: GraduationCap, exact: true },
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

  const getNavSections = (): NavSection[] => {
    if (!user) return [];
    
    const sections: NavSection[] = [
      { title: 'Learning', items: LEARNING_NAV }
    ];

    if (user.role === USER_ROLES.STUDENT) {
      sections.push({ 
        title: 'Mentorship', 
        items: STUDENT_MENTORSHIP_NAV 
      });
    } else if (user.role === USER_ROLES.MENTOR) {
      sections.push({ 
        title: 'Mentorship', 
        items: MENTOR_MENTORSHIP_NAV 
      });
    }

    return sections;
  };

  const navSections = getNavSections();

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      if (item.href === '/roadmap') {
        return pathname === '/roadmap' || 
               (pathname.startsWith('/roadmap/') && !pathname.startsWith('/roadmap/history'));
      }
      if (item.href === '/assessment') {
        return pathname === '/assessment' || 
               (pathname.startsWith('/assessment/') && !pathname.startsWith('/assessment/history'));
      }
      if (item.href === '/mentor') {
        return pathname === '/mentor';
      }
      return pathname === item.href;
    }
    
    return pathname.startsWith(item.href);
  };

  const isMessagesPage = pathname.startsWith('/messages');
  const isSettingsPage = pathname.startsWith('/settings');
  const isNotificationsPage = pathname.startsWith('/notifications');
  const shouldShowSidebar = isInitialized && isAuthenticated && user && !isViewMode && !isMessagesPage && !isSettingsPage && !isNotificationsPage;

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="fixed top-0 left-0 right-0 h-24 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {shouldShowSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-12"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </Button>
            )}

            <Link 
              href="/"
              className="text-4xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
            >
              Pathfinder. AI
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {!isInitialized ? (
              <Skeleton className="size-14 rounded-full" />
            ) : isAuthenticated ? (
              <>
                <NotificationDropdown />
                <div className="w-px h-6 bg-neutral-700" />
                <UserMenu />
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-14! rounded-full text-lg border border-neutral-700 hover:border-white hover:bg-white/5 transition-all duration-300"
                >
                  <Link href="/login">Login</Link>
                </Button>
                
                <Button
                  asChild
                  size="lg"
                  className="h-14! rounded-full text-lg bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300"
                >
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {shouldShowSidebar && (
        <aside className="hidden lg:block fixed left-0 top-24 bottom-0 w-[22rem] border-r border-neutral-800 bg-neutral-950/50 backdrop-blur-sm overflow-y-auto">
          <nav className="p-6">
            {navSections.map((section, index) => (
              <div key={section.title}>
                {index > 0 && (
                  <div className="my-6 mx-4 border-t border-neutral-800" />
                )}
                <h3 className="px-6 mb-5 text-lg font-semibold text-neutral-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-4 px-6 py-5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-white text-neutral-950 font-medium'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                        }`}
                      >
                        <Icon className="size-7" />
                        <span className="text-xl">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      )}

      {isSidebarOpen && shouldShowSidebar && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 top-24"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-24 bottom-0 w-80 border-r border-neutral-800 bg-neutral-950 z-40 overflow-y-auto">
            <nav className="p-6">
              {navSections.map((section, index) => (
                <div key={section.title}>
                  {index > 0 && (
                    <div className="my-6 mx-4 border-t border-neutral-800" />
                  )}
                  <h3 className="px-6 mb-5 text-lg font-semibold text-neutral-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isItemActive(item);
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-4 px-6 py-5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-white text-neutral-950 font-medium'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                          }`}
                        >
                          <Icon className="size-7" />
                          <span className="text-xl">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </>
      )}

      <main className={`${shouldShowSidebar ? 'lg:ml-[22rem]' : ''} ${isMessagesPage ? 'pt-24' : 'pt-24'} min-h-screen`}>
        <div className={`${isMessagesPage ? 'h-[calc(100vh-6rem)]' : 'p-6 lg:p-8'} ${!shouldShowSidebar && !isMessagesPage && !isSettingsPage && !isNotificationsPage ? 'max-w-7xl mx-auto' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}