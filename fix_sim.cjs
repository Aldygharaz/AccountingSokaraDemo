const fs = require('fs');

let content = fs.readFileSync('src/components/analytics/FinancialSimulator.tsx', 'utf8');

// 1. Change step="1" to step="5"
content = content.replace(/step="1"/g, 'step="5"');

// 2. Remove state from props interface
content = content.replace(/interface FinancialSimulatorProps \{\s+state: AppState;\s+\}/, 'interface FinancialSimulatorProps {}');

// 3. Remove state destructuring in FC definition
content = content.replace(/export const FinancialSimulator: React\.FC<FinancialSimulatorProps> = \(\{\s*state\s*\}\) => \{/, 'export const FinancialSimulator: React.FC<FinancialSimulatorProps> = ({}) => {\n  const accounts = useStore(s => s.accounts);\n  const journalEntries = useStore(s => s.journalEntries);');

// 4. Add useStore import if missing
if (!content.includes('import { useStore }')) {
  content = content.replace(/import \{ soundFx \} from '\.\.\/\.\.\/lib\/soundFx';/, "import { soundFx } from '../../lib/soundFx';\nimport { useStore } from '../../lib/storage';");
}

// 5. Replace state.accounts and state.journalEntries
content = content.replace(/state\.accounts/g, 'accounts');
content = content.replace(/state\.journalEntries/g, 'journalEntries');

fs.writeFileSync('src/components/analytics/FinancialSimulator.tsx', content);
console.log('Fixed FinancialSimulator.tsx');
