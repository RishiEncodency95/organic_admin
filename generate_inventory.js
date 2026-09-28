const fs = require('fs');
const file = fs.readFileSync('lib/seoCheckupData.ts', 'utf8');

const regex = /export const PAGE_INVENTORY: InventoryPage\[\] = \[([\s\S]*?)\];/;
const match = file.match(regex);

if (match) {
  let inner = match[1];
  let lines = inner.trim().split('\n');
  
  let newLines = lines.map((line, i) => {
    if (!line.includes('{ id:')) return line;
    
    // random realistic values
    const score = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // 60 to 100
    const words = Math.floor(Math.random() * (2000 - 400 + 1)) + 400; // 400 to 2000
    const inLinks = Math.floor(Math.random() * (40 - 5 + 1)) + 5;
    const lcp = (Math.random() * (8.5 - 1.2) + 1.2).toFixed(2);
    const cls = (Math.random() * (0.8 - 0.001) + 0.001).toFixed(3);
    const clicks = Math.floor(Math.random() * (500 - 10 + 1)) + 10;
    const impressions = clicks * (Math.floor(Math.random() * (30 - 5 + 1)) + 5);
    const position = (Math.random() * (30 - 1) + 1).toFixed(1);
    
    return line
      .replace(/score: \d+/, `score: ${score}`)
      .replace(/words: \d+/, `words: ${words}`)
      .replace(/inLinks: \d+/, `inLinks: ${inLinks}`)
      .replace(/lcp: [\d\.]+/, `lcp: ${lcp}`)
      .replace(/cls: [\d\.]+/, `cls: ${cls}`)
      .replace(/clicks: \d+/, `clicks: ${clicks}`)
      .replace(/impressions: \d+/, `impressions: ${impressions}`)
      .replace(/position: [\d\.]+/, `position: ${position}`);
  });
  
  const newContent = file.replace(regex, `export const PAGE_INVENTORY: InventoryPage[] = [\n${newLines.join('\n')}\n];`);
  fs.writeFileSync('lib/seoCheckupData.ts', newContent);
  console.log('Updated lib/seoCheckupData.ts with unique dynamic values!');
} else {
  console.log('Could not match PAGE_INVENTORY');
}
