'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, RefreshCw, AlertTriangle, Bug, ArrowLeft } from 'lucide-react';

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
        <div className="absolute top-1/4 left-1/4 size-[500px] bg-linear-to-br from-white/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-linear-to-tl from-neutral-400/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-8 pt-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <span className="text-[140px] md:text-[180px] font-bold text-neutral-900 leading-none select-none">
              500
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Something{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
              Went Wrong
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-400 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            We encountered an unexpected error. Don&apos;t worry, our team has been notified 
            and is working on a fix.
          </motion.p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mb-10 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <Bug className="size-5 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Error Details</span>
              </div>
              <code className="text-sm text-neutral-300 break-all font-mono">
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
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={reset}
              className="w-full sm:w-auto rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-xl px-10 py-8 cursor-pointer"
            >
              Try Again
              <RefreshCw className="size-5" />
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 text-xl px-10 py-8"
            >
              <Link href="/">
                Go Home
                <Home className="size-5" />
              </Link>
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
              className="inline-flex items-center gap-2 text-lg text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-5" />
              Go back to previous page
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 pt-10 border-t border-neutral-800"
          >
            <p className="text-neutral-500 mb-6">Need help? Contact our support team:</p>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all text-base"
            >
              support@pathfinder.ai
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}