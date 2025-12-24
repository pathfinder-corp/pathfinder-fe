'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Bug, ArrowLeft } from 'lucide-react';

import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

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
              500
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 text-4xl font-bold md:text-6xl"
          >
            Something{' '}
            <span className="bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Went Wrong
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-neutral-400 md:text-2xl"
          >
            We encountered an unexpected error. Don&apos;t worry, our team has
            been notified and is working on a fix.
          </motion.p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-left"
            >
              <div className="mb-4 flex items-center gap-3">
                <Bug className="size-5 text-neutral-400" />
                <span className="text-sm font-medium tracking-wider text-neutral-400 uppercase">
                  Error Details
                </span>
              </div>
              <code className="font-mono text-sm break-all text-neutral-300">
                {error.message}
              </code>
              {error.digest && (
                <p className="mt-3 text-xs text-neutral-600">
                  Error ID: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={reset}
              className="w-full cursor-pointer rounded-full bg-white px-10 py-8 text-xl text-neutral-950 hover:bg-neutral-200 sm:w-auto"
            >
              Try Again
            </Button>

            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full rounded-full border border-white/20 bg-white/5 px-10 py-8 text-xl backdrop-blur-xl hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              <Link href="/">Go Home</Link>
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
            <p className="mb-6 text-neutral-500">
              Need help? Contact our support team:
            </p>
            <Link
              href="/contact"
              className="rounded-full border border-neutral-800 bg-neutral-900/50 px-5 py-2.5 text-base text-neutral-400 transition-all hover:border-neutral-700 hover:text-white"
            >
              support@pathfinder.ai
            </Link>
          </motion.div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
