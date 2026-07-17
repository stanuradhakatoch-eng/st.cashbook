const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace fontWeight in JSX/JS
  content = content.replace(/fontWeight:\s*800/g, "fontWeight: 600");
  content = content.replace(/fontWeight:\s*700/g, "fontWeight: 500");
  content = content.replace(/fontWeight:\s*900/g, "fontWeight: 600");

  // Replace font-weight in CSS
  content = content.replace(/font-weight:\s*800/g, "font-weight: 600");
  content = content.replace(/font-weight:\s*700/g, "font-weight: 500");
  content = content.replace(/font-weight:\s*900/g, "font-weight: 600");

  // Remove Inter font override if any
  content = content.replace(/,\s*fontFamily:\s*"'Inter',\s*sans-serif"/g, "");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated fonts in ${file}`);
  }
});
