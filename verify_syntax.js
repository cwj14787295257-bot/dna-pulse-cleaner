const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
console.log(`[Syntax Verification] Found ${scriptMatches.length} script tag(s) in index.html`);

if (scriptMatches.length === 0) {
  console.error('Error: No script tags found in index.html!');
  process.exit(1);
}

let idx = 0;
for (const match of scriptMatches) {
  idx++;
  const js = match[1];
  if (!js.trim()) {
    console.log(`Script ${idx} is empty or external source only.`);
    continue;
  }
  try {
    new vm.Script(js, { filename: `inline-script-${idx}.js` });
    console.log(`✔ Script ${idx} passed syntax check (Length: ${js.length} chars)`);
  } catch (e) {
    console.error(`✖ Script ${idx} FAILED syntax check:`, e);
    process.exit(1);
  }
}

console.log('\n=============================================');
console.log(' ALL INLINE SCRIPTS IN INDEX.HTML COMPILED OK ');
console.log('=============================================\n');
