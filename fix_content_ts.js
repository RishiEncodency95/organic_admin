const fs = require('fs');
const path = require('path');

const urlMap = JSON.parse(fs.readFileSync('/Users/mac/Documents/moksha-sewa-all-folder/moksha_clone_voyage/cloudinary-url-map.json', 'utf8'));

const dir = '/Users/mac/Documents/moksha-sewa-all-folder/moksha-admin-v1/lib';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Content.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = 0;
  
  for (const [localUrl, cloudUrl] of Object.entries(urlMap)) {
    // Replace all occurrences of localUrl with cloudUrl
    // Need to handle exact matches within quotes
    const regex = new RegExp(`(["'])${localUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
    
    content = content.replace(regex, (match, quote) => {
      replaced++;
      return `${quote}${cloudUrl}${quote}`;
    });
  }
  
  if (replaced > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced ${replaced} images in ${file}`);
  }
}
