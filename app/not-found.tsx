'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search } from 'lucide-react';

import { PublicHeader } from '@/components/PublicHeader';
import { Button } from '@/components/ui/button';

export default function NotFound() {
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
              404
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Page{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
              Not Found
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-400 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            Oops! The page you&apos;re looking for seems to have wandered off the path. 
            Let&apos;s get you back on track.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-xl px-10 py-8"
            >
              <Link href="/">
                Go Home
                <Home className="size-5" />
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 text-xl px-10 py-8"
            >
              <Link href="/mentors">
                Explore Mentors
                <Search className="size-5" />
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
            <p className="text-neutral-500 mb-6">Or check out these pages:</p>
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
                  className="px-5 py-2.5 rounded-full bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all text-base"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}