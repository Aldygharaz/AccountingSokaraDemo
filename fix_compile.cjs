const fs = require('fs');

let seed = fs.readFileSync('src/lib/seedData.ts', 'utf8');
seed = seed.replace(/initialBalance: 0,\n\s*/g, '');
fs.writeFileSync('src/lib/seedData.ts', seed);

let storage = fs.readFileSync('src/lib/storage.ts', 'utf8');
storage = storage.replace(/const cashAccount = this\.state\.accounts\.find\(\(a\) => a\.code === '1101'\);/g, `let cashAccount = this.state.accounts.find((a) => a.code === '1101');`);
fs.writeFileSync('src/lib/storage.ts', storage);

console.log('Fixed compile errors.');
