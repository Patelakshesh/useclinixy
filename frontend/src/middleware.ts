import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - opengraph-image.png, icon.png (metadata images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image.png|icon.png).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Get the current path
  const path = url.pathname;

  // Define allowed root domains (local and production)
  const isLocal = hostname.includes('localhost');
  const isVercel = hostname.includes('vercel.app');
  
  // Extract subdomain if it exists
  const parts = hostname.split('.');
  let subdomain = '';
  
  if (parts.length >= 3 && !isLocal) {
    subdomain = parts[0];
  } else if (parts.length >= 2 && isLocal) {
    subdomain = parts[0];
  }

  // If it's a known non-tenant subdomain like www or the main domain itself
  if (
    subdomain === 'www' || 
    subdomain === 'useclinixy' || 
    !subdomain || 
    isVercel ||
    hostname === 'useclinixy.online' ||
    hostname === 'www.useclinixy.online' ||
    hostname === 'localhost:3000'
  ) {
    return NextResponse.next();
  }

  // If it's a tenant subdomain (e.g., apollo.useclinixy.online)
  // We rewrite the root to /book, because /book handles the booking flow.
  if (path === '/') {
    return NextResponse.rewrite(new URL('/book', req.url));
  }
  
  // Also protect the dashboard from being accessed via the patient portal subdomain (optional but good practice)
  if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
    return NextResponse.redirect(new URL(`https://useclinixy.online${path}`, req.url));
  }

  return NextResponse.next();
}
