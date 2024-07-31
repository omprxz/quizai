import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;
  
  const isPublicUrl = pathname === '/login' || pathname === '/register' || pathname === '/password/reset'

  if (token && isPublicUrl) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }else if(!token && !isPublicUrl){
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