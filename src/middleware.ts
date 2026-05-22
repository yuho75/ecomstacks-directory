import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If the admin session cookie exists, we delete it because the user is leaving/accessing a non-admin page
  if (request.cookies.has('ecomstacks_admin_session')) {
    // Check if this is a Next.js prefetch request. We don't want to kill the active session on link prefetch hovers!
    const isPrefetch = 
      request.headers.get('purpose') === 'prefetch' || 
      request.headers.get('x-purpose') === 'prefetch';
    
    if (!isPrefetch) {
      const response = NextResponse.next();
      response.cookies.delete('ecomstacks_admin_session');
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - admin (admin page and its subroutes)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.png, .jpg, .jpeg, .gif, .svg, etc. matched by detecting dots in the filename extension)
     */
    '/((?!admin|api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
