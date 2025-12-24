'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 size-[500px] rounded-full blur-3xl"
            style={{
              background:
                'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(115, 115, 115, 0.05), transparent)',
            }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 size-[400px] rounded-full blur-3xl"
            style={{
              background:
                'linear-gradient(to top left, rgba(163, 163, 163, 0.05), rgba(115, 115, 115, 0.05), transparent)',
            }}
          />
        </div>

        <main className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="relative">
              <span
                className="text-[140px] leading-none font-bold select-none md:text-[180px]"
                style={{ color: 'rgb(23, 23, 23)' }}
              >
                500
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold md:text-6xl">
              Critical{' '}
              <span
                className="bg-clip-text"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage:
                    'linear-gradient(to right, rgb(255, 255, 255), rgb(163, 163, 163))',
                }}
              >
                Error
              </span>
            </h1>

            <p
              className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed md:text-2xl"
              style={{ color: 'rgb(163, 163, 163)' }}
            >
              A critical error occurred in the application. We apologize for the
              inconvenience. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div
                className="mb-10 rounded-2xl p-6 text-left"
                style={{
                  background: 'rgba(23, 23, 23, 0.5)',
                  border: '1px solid rgb(38, 38, 38)',
                }}
              >
                <p
                  className="mb-4 text-sm font-medium tracking-wider uppercase"
                  style={{ color: 'rgb(163, 163, 163)' }}
                >
                  Error Details
                </p>
                <code
                  className="font-mono text-sm break-all"
                  style={{ color: 'rgb(212, 212, 212)' }}
                >
                  {error.message}
                </code>
                {error.digest && (
                  <p
                    className="mt-3 text-xs"
                    style={{ color: 'rgb(82, 82, 82)' }}
                  >
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={reset}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full px-10 py-5 text-xl font-medium transition-colors hover:bg-neutral-200 sm:w-auto"
                style={{ background: 'white', color: 'rgb(10, 10, 10)' }}
              >
                Try Again
              </button>

              <Link
                href="/"
                className="flex w-full items-center justify-center gap-3 rounded-full px-10 py-5 text-xl transition-all hover:border-white/40 hover:bg-white/10 sm:w-auto"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                Go Home
              </Link>
            </div>

            <div className="mt-12">
              <button
                onClick={() => window.history.back()}
                className="inline-flex cursor-pointer items-center gap-2 text-lg transition-colors hover:text-white"
                style={{ color: 'rgb(115, 115, 115)' }}
              >
                <ArrowLeft className="size-5" />
                Go back to previous page
              </button>
            </div>

            <div
              className="mt-8 pt-10"
              style={{ borderTop: '1px solid rgb(38, 38, 38)' }}
            >
              <p className="mb-6" style={{ color: 'rgb(115, 115, 115)' }}>
                Need help? Contact our support team:
              </p>
              <Link
                href="/contact"
                className="inline-block rounded-full px-5 py-2.5 text-base transition-all hover:border-neutral-700 hover:text-white"
                style={{
                  background: 'rgba(23, 23, 23, 0.5)',
                  border: '1px solid rgb(38, 38, 38)',
                  color: 'rgb(163, 163, 163)',
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
