const urls = [
  'https://atunwadigital.streamguys1.com/wazobiafmlagos',
  'https://atunwadigital.streamguys1.com/wazobia_fm',
  'https://atunwadigital.streamguys1.com/wazobiafm951',
  'https://atunwadigital.streamguys1.com/wazobiafmabuja',
  'https://atunwadigital.streamguys1.com/wazobiafm-lagos',
  'https://atunwadigital.streamguys1.com/wazobia-fm',
  'https://atunwadigital.streamguys1.com/wazobia95',
  'https://atunwadigital.streamguys1.com/wazobia951',
];

async function test() {
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const r = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      console.log(`STATUS ${r.status}: ${url} CT=${r.headers.get('content-type')}`);
    } catch (e) {
      console.log(`FAIL: ${url} -> ${e.message}`);
    }
  }
}

test();
