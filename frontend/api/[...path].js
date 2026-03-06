const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://20.17.98.254.nip.io';

function buildUpstreamUrl(req) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  return `${BACKEND_BASE_URL}${url.pathname}${url.search}`;
}

export default async function handler(req, res) {
  try {
    const upstreamUrl = buildUpstreamUrl(req);
    const method = req.method || 'GET';

    const headers = {
      accept: req.headers.accept || '*/*',
      'content-type': req.headers['content-type'] || 'application/json',
      cookie: req.headers.cookie || '',
      authorization: req.headers.authorization || '',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': req.headers.host || '',
    };

    const hasBody = !['GET', 'HEAD'].includes(method.toUpperCase());
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      redirect: 'manual',
    });

    res.status(upstreamResponse.status);

    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) {
      res.setHeader('content-type', contentType);
    }

    const setCookie = upstreamResponse.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('set-cookie', setCookie);
    }

    const location = upstreamResponse.headers.get('location');
    if (location) {
      res.setHeader('location', location);
    }

    const responseText = await upstreamResponse.text();
    res.send(responseText);
  } catch (error) {
    res.status(502).json({
      detail: 'API proxy request failed',
      error: String(error),
    });
  }
}
