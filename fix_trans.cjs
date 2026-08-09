const fs = require('fs');

let c = fs.readFileSync('src/components/transactions/TransactionsView.tsx', 'utf8');

c = c.replace(/const updated = \[\.\.\.invItems\];/g, 'const updated = structuredClone(invItems);');
c = c.replace(/const updated = \[\.\.\.billItems\];/g, 'const updated = structuredClone(billItems);');

// Replace mapping with VirtualJournalList
const renderRegex = /\{state\.journalEntries\.map\(\(je\) => \([\s\S]*?<\/JournalCard>\n\s*\)\)\}/;
c = c.replace(renderRegex, `<VirtualJournalList journals={state.journalEntries} accounts={state.accounts} />`);

fs.writeFileSync('src/components/transactions/TransactionsView.tsx', c);
console.log('TransactionsView fixed');

// Fix FinancialSimulator
let c2 = fs.readFileSync('src/components/analytics/FinancialSimulator.tsx', 'utf8');
c2 = c2.replace(/const incomeStatement = generateIncomeStatement\(state\.accounts, state\.journalEntries\);/g, 
  `const incomeStatement = React.useMemo(() => generateIncomeStatement(state.accounts, state.journalEntries), [state.accounts, state.journalEntries]);`);
// Debounce sound
c2 = c2.replace(/soundFx\.playClick\(\);/g, `// soundFx.playClick();`);
fs.writeFileSync('src/components/analytics/FinancialSimulator.tsx', c2);
console.log('FinancialSimulator fixed');

// Fix Header offline badge dark mode
let c3 = fs.readFileSync('src/components/common/Header.tsx', 'utf8');
c3 = c3.replace(/className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200/g,
  `className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50`);
fs.writeFileSync('src/components/common/Header.tsx', c3);
console.log('Header fixed');

