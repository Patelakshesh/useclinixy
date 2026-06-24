import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Allowed root domains (local and production)
  const rootDomains = ['useclinixy.online', 'www.useclinixy.online', 'localhost:3000', 'useclinixy.vercel.app'];

  // 1. Detect if this is a subdomain request
  const isSubdomain = !rootDomains.includes(hostname) && hostname.includes('.');

  // Extract the specific subdomain (e.g., 'apollo' from 'apollo.useclinixy.online')
  const subdomain = isSubdomain ? hostname.split('.')[0] : null;

  // 2. If it is a subdomain and the user is visiting the root path '/', 
  // rewrite them to the public booking page for that clinic!
  if (isSubdomain && subdomain && url.pathname === '/') {
    // Rewrite 'apollo.useclinixy.online/' to '/booking/apollo'
    return NextResponse.rewrite(new URL(`/booking/${subdomain}`, req.url));
  }

  // 3. For all other routes (like /dashboard, /login), let them pass through normally
  // so the clinic staff can still log in at 'apollo.useclinixy.online/login'
  return NextResponse.next();
}
