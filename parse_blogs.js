const fs = require('fs');
const content = fs.readFileSync('/Users/harshitru/.gemini/antigravity/brain/8ff7ec5c-45d7-42c0-9b4d-585054f51e99/.system_generated/steps/82/content.md', 'utf8');

// The JSON is on the last line or after the "---" separator.
const lines = content.split('\n');
let jsonString = '';
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].startsWith('{')) {
    jsonString = lines[i];
    break;
  }
}

try {
  const data = JSON.parse(jsonString);
  if (data.blogs && data.blogs.length > 0) {
    fs.writeFileSync('scripts/dhruvi1_blogs.json', JSON.stringify(data, null, 2));
    console.log(`Saved ${data.blogs.length} blogs to dhruvi1_blogs.json`);
  } else {
    console.log('No blogs found in JSON');
  }
} catch(e) {
  console.log('Error parsing JSON:', e.message);
}
