'use client';

import { motion } from 'motion/react';
import { ShieldX } from 'lucide-react';
import { useEffect } from 'react';
import { useUserStore } from '@/stores';
import { removeAuthCookie } from '@/lib';

export default function SuspendedPage() {
  const { clearUser } = useUserStore();

  useEffect(() => {
    clearUser();
    removeAuthCookie();
  }, [clearUser]);

  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-[500px] bg-linear-to-br from-white/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-linear-to-tl from-neutral-400/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto text-center px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="size-32 mx-auto mb-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <ShieldX className="size-16 text-neutral-500" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Access{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
            Denied
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-neutral-400 mb-12 leading-relaxed max-w-xl mx-auto"
        >
          Your account has been suspended. Please contact the administrator for support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 pt-10 border-t border-neutral-800"
        >
          <p className="text-lg text-neutral-500 mb-6">Need help?</p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 rounded-full bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all text-base"
          >
            Contact Support
          </a>
        </motion.div>
      </main>
    </div>
  );
}