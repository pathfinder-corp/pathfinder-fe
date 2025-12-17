'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores';

import DotGrid from '@/components/ui/dot-grid';
import { PublicHeader } from '@/components/PublicHeader';
import { Button } from '@/components/ui/button';

export default function Home() {
  const initializeUser = useUserStore((state) => state.initializeUser);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <div className="min-h-screen bg-neutral-950 relative">
      <PublicHeader />

      <div className="size-full absolute inset-0">
        <DotGrid
          dotSize={6}
          gap={15}
          baseColor="#222222"
          activeColor="#FFFFFF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <main className="relative z-10">
        <section className="min-h-screen flex items-center justify-center px-8">
          <div className="max-w-6xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-base text-neutral-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              AI-Powered Roadmap Recommendation
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              Guide{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                your future
              </span>
              <br />
              with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              The system recommends learning roadmaps and career paths intelligently, 
              helping you make informed decisions for your future
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-[1.2rem] px-10 py-8"
              >
                <Link href="/login">
                  Discover your roadmap
                </Link>
              </Button>
              
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 text-[1.2rem] px-10 py-8 transition-all duration-300 shadow-lg shadow-black/20"
              >
                <Link href="/about-ai">
                  Learn about AI
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-12 pt-16 text-base text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">AI-Powered</span>
                <span>Intelligent analysis</span>
              </div>
              <div className="h-4 w-px bg-neutral-800" />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">Personalized</span>
                <span>Customized roadmap</span>
              </div>
              <div className="h-4 w-px bg-neutral-800" />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">Accurate</span>
                <span>Optimal recommendation</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}