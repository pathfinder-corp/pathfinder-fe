'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, RefreshCw, AlertTriangle, Bug } from 'lucide-react';

import { PublicHeader } from '@/components/PublicHeader';
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
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
      <PublicHeader />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 size-[500px] bg-linear-to-br from-red-500/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 size-[400px] bg-linear-to-tl from-orange-500/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative mb-12"
          >
            <div className="relative inline-flex">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-48 md:size-56 rounded-full border border-red-500/20 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-36 md:size-44 rounded-full border border-orange-500/20" />
              </div>
              
              <div className="relative size-32 md:size-36 rounded-full bg-neutral-900/80 border border-neutral-800 flex items-center justify-center backdrop-blur-sm">
                <AlertTriangle className="size-16 md:size-18 text-orange-500" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Something{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500">
              Went Wrong
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-neutral-400 mb-8 leading-relaxed max-w-2xl mx-auto"
          >
            We encountered an unexpected error. Don&apos;t worry, our team has been notified 
            and is working on a fix.
          </motion.p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mb-10 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <Bug className="size-5 text-orange-500" />
                <span className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Error Details</span>
              </div>
              <code className="text-sm text-red-400 break-all font-mono">
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
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={reset}
              className="w-full sm:w-auto rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-xl px-10 py-8 cursor-pointer"
            >
              <RefreshCw className="size-5" />
              Try Again
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 text-xl px-10 py-8"
            >
              <Link href="/">
                <Home className="size-5" />
                Go Home
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-10 border-t border-neutral-800"
          >
            <p className="text-neutral-500 mb-4">Need help? Contact our support team:</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-lg text-white hover:text-neutral-300 transition-colors"
            >
              support@pathfinder.ai
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}