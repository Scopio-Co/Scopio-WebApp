// Vercel Edge Middleware for API proxying
// This runs at the edge before requests reach your static site

export async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Proxy API, glogin, and accounts requests to backend
  if (path.startsWith('/api/') || path.startsWith('/glogin/') || path.startsWith('/accounts/')) {
    const backendUrl = `http://20.17.98.254.nip.io${path}${url.search}`;
    
    // Forward the request to backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'accept': request.headers.get('accept') || '*/*',
        'content-type': request.headers.get('content-type') || 'application/json',
        'cookie': request.headers.get('cookie') || '',
        'authorization': request.headers.get('authorization') || '',
        'x-forwarded-proto': 'https',
        'x-forwarded-host': request.headers.get('host') || '',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? request.body : undefined,
      redirect: 'manual',
    });

    // Return backend response with proper headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
        'set-cookie': response.headers.get('set-cookie') || '',
        'location': response.headers.get('location') || '',
        // Add CORS headers
        'access-control-allow-origin': request.headers.get('origin') || '*',
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization, X-CSRFToken',
      },
    });
  }

  // Let other requests pass through
  return undefined;
}

export const config = {
  matcher: ['/api/:path*', '/glogin/:path*', '/accounts/:path*'],
};
