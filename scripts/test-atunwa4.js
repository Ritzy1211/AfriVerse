async function test() {
  // Try both the player and bundle files
  const files = [
    'AtunwaPlayerBundle.327b4dbe.js',
    'AtunwaPlayerMeta.845dc322.js',
    'RootApp.2dffdfa.js',
    'MinimalAudioBar.494cbcbd.js'
  ];
  
  for (const file of files) {
    try {
      const r = await fetch(`https://amp.atunwadigital.com/v2/${file}`);
      if (!r.ok) { console.log(`${file}: HTTP ${r.status}`); continue; }
      const text = await r.text();
      console.log(`\n=== ${file} (${text.length} bytes) ===`);
      
      // Find all URLs
      const urlPattern = /https?:\/\/[^\s"'`<>\\)]+/g;
      const urls = [...new Set(text.match(urlPattern) || [])];
      if (urls.length > 0) {
        console.log('URLs:');
        urls.forEach(u => console.log('  ' + u));
      }
      
      // Find stream/audio/api related strings
      const patterns = /["']([^"']*(?:stream|\.mp3|\.aac|icecast|api\/|listen|\/live)[^"']*)["']/gi;
      const matches = [...text.matchAll(patterns)];
      if (matches.length > 0) {
        console.log('Stream strings:');
        matches.forEach(m => console.log('  ' + m[1].substring(0, 200)));
      }

      // Look for fetch/axios calls with URLs
      const fetchPattern = /fetch\(["']([^"']+)["']/g;
      const fetchMatches = [...text.matchAll(fetchPattern)];
      if (fetchMatches.length > 0) {
        console.log('Fetch calls:');
        fetchMatches.forEach(m => console.log('  ' + m[1]));
      }
    } catch (e) {
      console.log(`${file}: Error - ${e.message}`);
    }
  }
}
test();
