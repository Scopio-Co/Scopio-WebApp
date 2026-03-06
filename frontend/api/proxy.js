export default async function handler(req, res) {
  try {
    const backendBase = 'http://20.17.98.254.nip.io';
    const path = req.url.replace('/api/proxy', ''); // Remove /api/proxy prefix
    const fullUrl = `${backendBase}${path}`;

    console.log(`[PROXY] ${req.method} ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Cookie': req.headers.cookie || '',
        'Authorization': req.headers.authorization || '',
        'Accept': req.headers.accept || '*/*',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-Host': req.headers.host || '',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
      redirect: 'manual',
    });

    // Copy response headers
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) res.setHeader('set-cookie', setCookie);

    const location = response.headers.get('location');
    if (location) res.setHeader('location', location);

    res.status(response.status);
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('[PROXY ERROR]', error);
    res.status(502).json({ detail: 'Proxy failed', error: error.message });
  }
}
