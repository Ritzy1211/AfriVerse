async function test() {
  try {
    const r = await fetch('https://amp.atunwadigital.com/v2/main.js');
    const text = await r.text();
    console.log(text);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
