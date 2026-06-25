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
  // We explicitly ignore .vercel.app preview URLs so they don't break Vercel deployments!
  const isSubdomain = !rootDomains.includes(hostname) && !hostname.endsWith('.vercel.app') && hostname.includes('.');

  // Extract the specific subdomain (e.g., 'apollo' from 'apollo.useclinixy.online')
  const subdomain = isSubdomain ? hostname.split('.')[0] : null;

  // 2. Subdomain Routing Logic
  if (isSubdomain && subdomain) {
    // If clinic staff visits the root subdomain, redirect them to the login page
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/login', req.url));
    }
    
    // If patients visit the /book path, show them the clinic's public booking page
    if (url.pathname === '/book' || url.pathname === '/book/') {
      return NextResponse.rewrite(new URL(`/booking/${subdomain}`, req.url));
    }
  }

  // 3. For all other routes (like /dashboard), let them pass through normally
  return NextResponse.next();
}
