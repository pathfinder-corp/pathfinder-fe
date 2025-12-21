'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="dark min-h-screen bg-neutral-950 text-white antialiased">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 size-[500px] rounded-full blur-3xl" 
            style={{ background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(115, 115, 115, 0.05), transparent)' }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 size-[400px] rounded-full blur-3xl"
            style={{ background: 'linear-gradient(to top left, rgba(163, 163, 163, 0.05), rgba(115, 115, 115, 0.05), transparent)' }}
          />
        </div>

        <main className="relative z-10 min-h-screen flex items-center justify-center px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative">
              <span 
                className="text-[140px] md:text-[180px] font-bold leading-none select-none"
                style={{ color: 'rgb(23, 23, 23)' }}
              >
                500
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Critical{' '}
              <span 
                className="bg-clip-text"
                style={{ 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage: 'linear-gradient(to right, rgb(255, 255, 255), rgb(163, 163, 163))'
                }}
              >
                Error
              </span>
            </h1>

            <p 
              className="text-xl md:text-2xl mb-12 leading-relaxed max-w-2xl mx-auto"
              style={{ color: 'rgb(163, 163, 163)' }}
            >
              A critical error occurred in the application. We apologize for the inconvenience. 
              Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div 
                className="mb-10 p-6 rounded-2xl text-left"
                style={{ background: 'rgba(23, 23, 23, 0.5)', border: '1px solid rgb(38, 38, 38)' }}
              >
                <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'rgb(163, 163, 163)' }}>
                  Error Details
                </p>
                <code className="text-sm break-all font-mono" style={{ color: 'rgb(212, 212, 212)' }}>
                  {error.message}
                </code>
                {error.digest && (
                  <p className="mt-3 text-xs" style={{ color: 'rgb(82, 82, 82)' }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={reset}
                className="w-full sm:w-auto rounded-full text-xl px-10 py-5 cursor-pointer flex items-center justify-center gap-3 font-medium transition-colors hover:bg-neutral-200"
                style={{ background: 'white', color: 'rgb(10, 10, 10)' }}
              >
                Try Again
                <RefreshCw className="size-5" />
              </button>
              
              <Link
                href="/"
                className="w-full sm:w-auto rounded-full text-xl px-10 py-5 flex items-center justify-center gap-3 transition-all hover:bg-white/10 hover:border-white/40"
                style={{ 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(24px)'
                }}
              >
                Go Home
                <Home className="size-5" />
              </Link>
            </div>

            <div className="mt-12">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-lg transition-colors cursor-pointer hover:text-white"
                style={{ color: 'rgb(115, 115, 115)' }}
              >
                <ArrowLeft className="size-5" />
                Go back to previous page
              </button>
            </div>

            <div 
              className="mt-16 pt-10"
              style={{ borderTop: '1px solid rgb(38, 38, 38)' }}
            >
              <p className="mb-6" style={{ color: 'rgb(115, 115, 115)' }}>
                Need help? Contact our support team:
              </p>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-full text-base transition-all inline-block hover:text-white hover:border-neutral-700"
                style={{ 
                  background: 'rgba(23, 23, 23, 0.5)', 
                  border: '1px solid rgb(38, 38, 38)',
                  color: 'rgb(163, 163, 163)'
                }}
              >
                support@pathfinder.ai
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}