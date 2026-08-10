const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Inject atomic selectors
const selectors = `
  const currentUser = useStore(s => s.currentUser);
  const journalEntries = useStore(s => s.journalEntries);
  const products = useStore(s => s.products);
  const contacts = useStore(s => s.contacts);
  const invoices = useStore(s => s.invoices);
`;

const appDefRegex = /export default function App\(\) \{/;
if (appDefRegex.test(content) && !content.includes('const currentUser = useStore')) {
  content = content.replace(appDefRegex, `export default function App() {${selectors}`);
}

// Replace state.xxx
content = content.replace(/state\.currentUser/g, 'currentUser');
content = content.replace(/state\.journalEntries/g, 'journalEntries');
content = content.replace(/state\.products/g, 'products');
content = content.replace(/state\.contacts/g, 'contacts');
content = content.replace(/state\.invoices/g, 'invoices');

fs.writeFileSync('src/App.tsx', content);

// Also fix AnalyticsView
let analytics = fs.readFileSync('src/components/analytics/AnalyticsView.tsx', 'utf8');
analytics = analytics.replace("import { useStore } from '../../lib/storage';\n", "");
analytics = analytics.replace("import { AppState } from '../../lib/storage';", "import { useStore } from '../../lib/storage';");
fs.writeFileSync('src/components/analytics/AnalyticsView.tsx', analytics);

console.log('App and Analytics fixed!');
