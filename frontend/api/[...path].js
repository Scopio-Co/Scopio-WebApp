const BACKEND_BASE_URL = 'http://20.17.98.254.nip.io';

module.exports = async (req, res) => {
  try {
    const path = req.url || '/';
    const upstreamUrl = `${BACKEND_BASE_URL}${path}`;
    const method = req.method || 'GET';

    const headers = {
      'accept': req.headers['accept'] || '*/*',
      'content-type': req.headers['content-type'] || 'application/json',
      'cookie': req.headers['cookie'] || '',
      'authorization': req.headers['authorization'] || '',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': req.headers['host'] || '',
    };

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
    const body = hasBody && req.body ? JSON.stringify(req.body) : undefined;

    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    });

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

    res.status(upstreamResponse.status);
    const responseText = await upstreamResponse.text();
    res.send(responseText);
  } catch (error) {
    res.status(502).json({
      detail: 'API proxy request failed',
      error: String(error),
    });
  }
};
