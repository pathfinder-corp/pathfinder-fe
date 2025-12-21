import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutePrefixes = ['/', '/contact', '/about-ai', '/mentors'];
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const publicAuthRoutes = ['/verify-email'];
  const adminRoutes = ['/admin'];
  
  const studentAndMentorRoutes = ['/mentor/requests', '/mentor/applications'];
  const mentorOnlyRoutes = ['/mentor/profile'];
  
  const isPublicRoute = publicRoutePrefixes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
  
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicAuthRoute = publicAuthRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isStudentAndMentorRoute = studentAndMentorRoutes.some(route => pathname.startsWith(route));
  const isMentorOnlyRoute = mentorOnlyRoutes.some(route => pathname.startsWith(route));
  const isStudentOnlyRoute = pathname === '/mentor';

  if (isPublicAuthRoute) return NextResponse.next();

  if (!token && !isPublicRoute && !isAuthRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (token && isAuthRoute) return NextResponse.redirect(new URL('/', request.url));

  if (isAdminRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isStudentAndMentorRoute && userRole === 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isStudentOnlyRoute && userRole !== 'student') {
    if (userRole === 'mentor') {
      return NextResponse.redirect(new URL('/mentor/applications', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isMentorOnlyRoute && userRole !== 'mentor') {
    if (userRole === 'student') {
      return NextResponse.redirect(new URL('/mentor', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico|.*\\.webp).*)',
  ],
};