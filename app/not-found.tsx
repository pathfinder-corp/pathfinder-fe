'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search } from 'lucide-react';

import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <PublicHeader />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 size-[500px] rounded-full bg-linear-to-br from-white/5 via-neutral-500/5 to-transparent blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-[400px] rounded-full bg-linear-to-tl from-neutral-400/5 via-neutral-500/5 to-transparent blur-3xl" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-8 pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <span className="text-[140px] leading-none font-bold text-neutral-900 select-none md:text-[180px]">
              404
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 text-4xl font-bold md:text-6xl"
          >
            Page{' '}
            <span className="bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Not Found
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-neutral-400 md:text-2xl"
          >
            Oops! The page you&apos;re looking for seems to have wandered off
            the path. Let&apos;s get you back on track.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-white px-10 py-8 text-xl text-neutral-950 hover:bg-neutral-200 sm:w-auto"
            >
              <Link href="/">Go Home</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full rounded-full border border-white/20 bg-white/5 px-10 py-8 text-xl backdrop-blur-xl hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              <Link href="/mentors">Explore Mentors</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex cursor-pointer items-center gap-2 text-lg text-neutral-500 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-5" />
              Go back to previous page
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 border-t border-neutral-800 pt-10"
          >
            <p className="mb-6 text-neutral-500">Or check out these pages:</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { label: 'About AI', href: '/about-ai' },
                { label: 'Contact', href: '/contact' },
                { label: 'Login', href: '/login' },
                { label: 'Register', href: '/register' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-neutral-800 bg-neutral-900/50 px-5 py-2.5 text-base text-neutral-400 transition-all hover:border-neutral-700 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
