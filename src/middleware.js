import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const { pathname, search } = request.nextUrl;

  const dynamicPublicUrls = [
    /^\/dashboard\/quiz\/[^\/]+\/view$/, 
    /^\/dashboard\/quiz\/response\/[^\/]+/,
    /^\/pub\/[^\/]+/
  ];
  const authUrls = [
    /^\/login\/?$/,
    /^\/social-sign-in\/[^\/]+\/?$/,
    /^\/register\/?$/, 
    /^\/password\/reset\/?$/, 
    /^\/?$/
  ];

  const isAuthUrl = authUrls.some((regex) => regex.test(pathname));
  const isDynamicPublicUrl = dynamicPublicUrls.some((regex) => regex.test(pathname));

  if (token && isAuthUrl) {
    const url = request.nextUrl.clone();
    const urlSearchParams = new URLSearchParams(search);
    let toRedirect = '/dashboard';
    if (pathname.includes('/login')) {
      const target = urlSearchParams?.get('target');
      toRedirect = target || '/dashboard';
    }

    url.pathname = toRedirect;
    return NextResponse.redirect(url);
  } else if (!token && !isDynamicPublicUrl && !isAuthUrl) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    const urlSearchParams = new URLSearchParams(search);
    const target = urlSearchParams.get('target');
    if (target && !authUrls.some((regex) => regex.test(target))) {
      url.search = `target=${encodeURIComponent(pathname + search)}`;
    } else if (!target) {
      url.search = `target=${encodeURIComponent(pathname + search)}`;
    }

    return NextResponse.redirect(url);}

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};