'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/user.store';

import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Lộ trình học tập', href: '/academic-pathways' },
  { label: 'Lộ trình nghề nghiệp', href: '/career-pathways' },
  { label: 'Liên hệ', href: '/contact' },
];

export default function Home() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const initializeUser = useUserStore((state) => state.initializeUser);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <div className="min-h-screen relative bg-neutral-950">
      <header className="fixed top-0 w-full h-24 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="size-full px-16 grid grid-cols-3 items-center">
          <Link 
            href="/"
            className="text-4xl font-bold tracking-tight hover:text-neutral-300 transition-colors justify-start-safe"
          >
            Pathfinder.
          </Link>

          <nav className="hidden lg:flex items-center gap-10 justify-center-safe">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-2 text-lg font-medium text-neutral-300 hover:text-white transition-colors group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.label}
                
                <span 
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-white transition-all duration-300 ease-out ${
                    hoveredIndex === index ? 'w-full' : 'w-0'
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 justify-end-safe">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="!h-12 rounded-full text-base border border-neutral-700 hover:border-white hover:bg-white/5 transition-all duration-300"
                >
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                
                <Button
                  asChild
                  size="lg"
                  className="!h-12 rounded-full text-base bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300"
                >
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="min-h-screen flex items-center justify-center px-8">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-base text-neutral-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              AI-Powered Pathway Recommendation
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              Định hướng{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                tương lai
              </span>
              <br />
              với AI
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              Hệ thống khuyến nghị lộ trình học tập và nghề nghiệp thông minh, 
              giúp bạn đưa ra quyết định đúng đắn cho tương lai
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full bg-white text-neutral-950 hover:bg-neutral-200 hover:scale-105 transition-all duration-300 text-lg px-10 py-6"
              >
                <Link href="/register">
                  Khám phá lộ trình của bạn
                </Link>
              </Button>
              
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto rounded-full border border-neutral-700 hover:border-white hover:bg-white/5 hover:scale-105 transition-all duration-300 text-lg px-10 py-6"
              >
                <Link href="/about-ai">
                  Tìm hiểu về AI
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-16 text-base text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">AI-Powered</span>
                <span>Phân tích thông minh</span>
              </div>
              <div className="h-4 w-px bg-neutral-800" />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">Cá nhân hóa</span>
                <span>Lộ trình riêng biệt</span>
              </div>
              <div className="h-4 w-px bg-neutral-800" />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">Chính xác</span>
                <span>Khuyến nghị tối ưu</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}