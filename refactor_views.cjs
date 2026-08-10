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

  // If it doesn't use AppState from props, skip
  if (!content.includes('state: AppState') && !content.includes('state?: AppState')) return;

  // 1. Remove state from props interface
  content = content.replace(/state\??:\s*AppState;?\s*\n?/g, '');
  
  // 2. Remove state from component args
  // This matches `state,` or `state` in the destructuring
  content = content.replace(/(?:\bstate\b,\s*|\s*,\s*\bstate\b)/g, '');
  // sometimes it's just { state }
  content = content.replace(/\{\s*state\s*\}/g, '{}');
  
  // 3. Find all state properties used (e.g. state.accounts)
  const stateKeys = new Set();
  const regex = /state\.([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    stateKeys.add(match[1]);
  }

  // 4. Inject import useStore
  // determine relative path to src/lib/storage
  const depth = file.split(path.sep).length - 3; // src/components is depth 0
  let relativePath = '';
  for(let i=0; i<depth; i++) relativePath += '../';
  relativePath += 'lib/storage';
  
  if (!content.includes('useStore')) {
    // find last import
    const lastImportIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, nextLineIndex + 1) + 
              `import { useStore } from '${relativePath}';\n` + 
              content.slice(nextLineIndex + 1);
  }

  // 5. Inject selectors inside the component body
  // We look for the component definition: export const ComponentName: React.FC<Props> = ({...}) => {
  const componentRegex = /export const [a-zA-Z0-9_]+\s*(?::\s*React\.FC(?:<[^>]+>)?\s*)?=\s*\([^)]*\)\s*=>\s*\{/g;
  const compMatch = componentRegex.exec(content);
  
  if (compMatch) {
    let selectors = '\\n';
    stateKeys.forEach(key => {
      selectors += `  const ${key} = useStore(s => s.${key});\n`;
    });
    content = content.slice(0, compMatch.index + compMatch[0].length) + 
              selectors + 
              content.slice(compMatch.index + compMatch[0].length);
  } else {
    // Try alternative function definition
    const altRegex = /export function [a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/g;
    const altMatch = altRegex.exec(content);
    if (altMatch) {
      let selectors = '\\n';
      stateKeys.forEach(key => {
        selectors += `  const ${key} = useStore(s => s.${key});\n`;
      });
      content = content.slice(0, altMatch.index + altMatch[0].length) + 
                selectors + 
                content.slice(altMatch.index + altMatch[0].length);
    }
  }

  // 6. Replace `state.key` with `key`
  stateKeys.forEach(key => {
    // using regex with word boundary to avoid partial replacements
    const replaceRegex = new RegExp(`state\\.${key}\\b`, 'g');
    content = content.replace(replaceRegex, key);
  });

  fs.writeFileSync(file, content);
  console.log('Processed', file);
});

console.log('Done refactoring components');
