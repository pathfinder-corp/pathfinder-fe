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
    <div className="relative min-h-screen bg-neutral-950">
      <PublicHeader />

      <div className="absolute inset-0 size-full">
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
        <section className="flex min-h-screen items-center justify-center px-8 pt-14">
          <div className="max-w-10xl mx-auto space-y-10 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/50 px-6 py-3 text-lg text-neutral-300 backdrop-blur-sm">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-white" />
              </span>
              AI-Powered Roadmap Recommendation
            </div>

            <h1 className="text-9xl leading-tight font-bold tracking-tight">
              Guide{' '}
              <span className="bg-linear-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                your future
              </span>
              <br />
              with AI
            </h1>

            <p className="mx-auto max-w-4xl leading-relaxed text-neutral-400 md:text-3xl">
              The system recommends learning roadmaps and career paths
              intelligently, helping you make informed decisions for your future
            </p>

            <div className="flex flex-col items-center justify-center gap-6 pt-6 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-white px-12 py-10 text-2xl text-neutral-950 hover:bg-neutral-200 sm:w-auto"
              >
                <Link href="/roadmap">Discover your roadmap</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="w-full rounded-full border border-white/20 bg-white/5 px-12 py-10 text-2xl shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                <Link href="/about-ai">Learn about AI</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-12 pt-16 text-lg text-neutral-500">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white">
                  AI-Powered
                </span>
                <span>Intelligent analysis</span>
              </div>
              <div className="h-7 w-[2px] bg-neutral-700" />
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white">
                  Personalized
                </span>
                <span>Customized roadmap</span>
              </div>
              <div className="h-7 w-[2px] bg-neutral-700" />
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white">Accurate</span>
                <span>Optimal recommendation</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
