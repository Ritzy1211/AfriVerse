async function test() {
  try {
    const r = await fetch('https://amp.atunwadigital.com/v2/AtunwaPlayer.4c04188e.js');
    const text = await r.text();
    console.log('JS size:', text.length);
    
    // Find all URLs
    const urlPattern = /https?:\/\/[^\s"'`<>\\)]+/g;
    const urls = [...new Set(text.match(urlPattern) || [])];
    console.log('\nURLs found:');
    urls.forEach(u => console.log(u));
    
    // Look for stream/audio/api patterns
    const patterns = /["']([^"']*(?:stream|audio|api|listen|live|icecast|mp3)[^"']*)["']/gi;
    const matches = [...text.matchAll(patterns)];
    console.log('\nStream-related strings:');
    matches.forEach(m => console.log(m[1]));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
