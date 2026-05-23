const fs = require('fs');

const seedsPath = 'src/lib/seeds.ts';
let content = fs.readFileSync(seedsPath, 'utf8');

// The regex will find image_url: "..." and url: "..."
// We need to match the url and replace image_url
content = content.replace(/url:\s*"([^"]+)",\s*image_url:\s*"[^"]+"/g, (match, url) => {
    return `url: "${url}",\n    image_url: "https://image.thum.io/get/width/1200/crop/675/${url}"`;
});

fs.writeFileSync(seedsPath, content);
console.log('seeds.ts updated');
