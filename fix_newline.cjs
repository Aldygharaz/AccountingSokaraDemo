const fs = require('fs');
const path = require('path');

function getTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      getTsxFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = getTsxFiles('src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('\\n  const ')) {
    content = content.replace(/\\n\s+const /g, '\n  const ');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
