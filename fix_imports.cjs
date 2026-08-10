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
  let changed = false;

  const depth = file.split(path.sep).length - 3; // For src/components/products/ProductsView.tsx, depth=1
  let relativePath = '';
  // if depth = 0 (src/components/File.tsx), we need '../lib/storage'
  // if depth = 1 (src/components/folder/File.tsx), we need '../../lib/storage'
  for(let i=0; i<=depth; i++) relativePath += '../';
  relativePath += 'lib/storage';

  // Replace all wrong imports
  content = content.replace(/import \{ useStore \} from '\.\.[^']*';/g, `import { useStore } from '${relativePath}';`);
  
  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log('Fixed imports in', file);
  }
});
