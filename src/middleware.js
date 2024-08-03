import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  const dynamicPublicUrls = [
    /^\/quiz\/[^\/]+\/view$/, /^\/quiz\/response\/[^\/]+/
  ];

  const authUrls = [
    /^\/login\/?$/, /^\/register\/?$/, /^\/password\/reset\/?$/
  ];

  const isAuthUrl = authUrls.some((regex) => regex.test(pathname));
  const isDynamicPublicUrl = dynamicPublicUrls.some((regex) => regex.test(pathname));

  if (token && isAuthUrl) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  } else if (!token && !isDynamicPublicUrl && !isAuthUrl) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};