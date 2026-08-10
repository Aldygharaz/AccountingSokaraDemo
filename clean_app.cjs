const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove useState for state
code = code.replace(/const \[state, setState\] = useState<AppState>\(store\.getState\(\)\);\s*/g, '');

// 2. Remove subscribe effect
code = code.replace(/useEffect\(\(\) => \{\s*const unsubscribe = store\.subscribe\(\(\) => \{\s*setState\(\{ \.\.\.store\.getState\(\) \}\);\s*\}\);\s*return \(\) => \{\s*unsubscribe\(\);\s*\};\s*\}, \[\]\);\s*/g, '');
code = code.replace(/useEffect\(\(\) => \{\s*const unsubscribe = store\.subscribe\(\(\) => \{\s*setState\(\{ \.\.\.store\.getState\(\)(?:.|\n)*?\}\);\s*\}\);\s*return \(\) => \{\s*unsubscribe\(\);\s*\};\s*\}, \[\]\);\s*/g, '');

// 3. Remove state={state} prop from all elements
code = code.replace(/\s+state=\{state\}/g, '');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx cleaned');
