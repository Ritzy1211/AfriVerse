// Test fetching the Atunwa player JS and finding stream patterns
async function test() {
  try {
    const r = await fetch('https://amp.atunwadigital.com/v2/main.js');
    const text = await r.text();
    console.log('JS size:', text.length);
    
    // Find all URLs in the JS
    const urlPattern = /https?:\/\/[^\s"'`<>\\]+/g;
    const urls = [...new Set(text.match(urlPattern) || [])];
    console.log('\nURLs found:');
    urls.forEach(u => console.log(u));
    
    // Look for stream-related patterns
    const streamPatterns = /stream|audio|mp3|icecast|shoutcast|live|player|hls|m3u8/gi;
    const lines = text.split('\n');
    for (const line of lines) {
      if (streamPatterns.test(line) && line.length < 300) {
        console.log('\nStream-related line:', line.trim().substring(0, 200));
      }
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

test();
