'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

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
            className="absolute top-1/3 left-1/4 size-[500px] rounded-full blur-3xl" 
            style={{ background: 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.05), rgba(115, 115, 115, 0.05), transparent)' }}
          />
          <div 
            className="absolute bottom-1/3 right-1/4 size-[400px] rounded-full blur-3xl"
            style={{ background: 'linear-gradient(to top left, rgba(249, 115, 22, 0.05), rgba(115, 115, 115, 0.05), transparent)' }}
          />
        </div>

        <main className="relative z-10 min-h-screen flex items-center justify-center px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative mb-12">
              <div className="relative inline-flex">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="size-12 md:size-14 rounded-full animate-pulse"
                    style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="size-9 md:size-11 rounded-full"
                    style={{ border: '1px solid rgba(249, 115, 22, 0.2)' }}
                  />
                </div>
                
                <div 
                  className="relative size-8 md:size-9 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{ background: 'rgba(23, 23, 23, 0.8)', border: '1px solid rgb(38, 38, 38)' }}
                >
                  <AlertTriangle className="size-4 md:size-[18px]" style={{ color: 'rgb(249, 115, 22)' }} />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Critical{' '}
              <span 
                className="bg-clip-text"
                style={{ 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage: 'linear-gradient(to right, rgb(251, 146, 60), rgb(239, 68, 68))'
                }}
              >
                Error
              </span>
            </h1>

            <p 
              className="text-xl md:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto"
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
                <code className="text-sm break-all font-mono" style={{ color: 'rgb(248, 113, 113)' }}>
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
                className="w-full sm:w-auto rounded-full text-xl px-10 py-5 cursor-pointer flex items-center justify-center gap-3 font-medium transition-colors"
                style={{ background: 'white', color: 'rgb(10, 10, 10)' }}
              >
                Try Again
                <RefreshCw className="size-5" />
              </button>
              
              <Link
                href="/"
                className="w-full sm:w-auto rounded-full text-xl px-10 py-5 flex items-center justify-center gap-3 transition-all"
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

            <div 
              className="mt-16 pt-10"
              style={{ borderTop: '1px solid rgb(38, 38, 38)' }}
            >
              <p className="mb-4" style={{ color: 'rgb(115, 115, 115)' }}>
                If the problem persists, please contact support:
              </p>
              <Link
                href="/contact"
                className="text-lg transition-colors"
                style={{ color: 'white' }}
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