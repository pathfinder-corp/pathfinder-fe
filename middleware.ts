import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutePrefixes = ['/', '/contact'];
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  const isPublicRoute = publicRoutePrefixes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
  
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (!token && !isPublicRoute && !isAuthRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico|.*\\.webp).*)',
  ],
};