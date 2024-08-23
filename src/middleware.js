// middleware.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const config = JSON.parse(process.env.CONFIG);
  const { pathname, search } = request.nextUrl;

  const authUrls = config.authUrls.map((pattern) => new RegExp(pattern));
  const dynamicPublicUrls = config.dynamicPublicUrls.map((pattern) => new RegExp(pattern));
  
  const isAuthUrl = authUrls.some((regex) => regex.test(pathname));
  const isDynamicPublicUrl = dynamicPublicUrls.some((regex) => regex.test(pathname));

  if (token && isAuthUrl) {
    const url = request.nextUrl.clone();
    url.search = '';
    const urlSearchParams = new URLSearchParams(search);
    let toRedirect = '/dashboard';
    if (pathname.includes('/login')) {
      const target = urlSearchParams.get('target');
      toRedirect = target || '/dashboard';
    }
    url.pathname = toRedirect;
    return NextResponse.redirect(url);
  } else if (!token && !isDynamicPublicUrl && !isAuthUrl) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    
    const urlSearchParams = new URLSearchParams(search);
    const target = urlSearchParams.get('target');
    urlSearchParams.delete('target');
    const modifiedSearch = urlSearchParams.toString();
    if (target && !authUrls.some((regex) => regex.test(target))) {
      url.search = `target=${encodeURIComponent(
        pathname + (modifiedSearch ? '?' + modifiedSearch : '')
      )}`;
    } else if (!target) {
      url.search = `target=${encodeURIComponent(
        pathname + (modifiedSearch ? '?' + modifiedSearch : '')
      )}`;
    }

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
