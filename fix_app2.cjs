const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Inject atomic selectors
const selectors = `\n
  const currentUser = useStore(s => s.currentUser);
  const journalEntries = useStore(s => s.journalEntries);
  const products = useStore(s => s.products);
  const contacts = useStore(s => s.contacts);
  const invoices = useStore(s => s.invoices);
`;

const appDefRegex = /export const App: React\.FC = \(\) => \{/;
if (appDefRegex.test(content) && !content.includes('const currentUser = useStore')) {
  content = content.replace(appDefRegex, `export const App: React.FC = () => {${selectors}`);
  
  if (!content.includes('import { useStore }')) {
    content = content.replace("import { store", "import { store, useStore");
  }
}

// Replace state.xxx
content = content.replace(/state\.currentUser/g, 'currentUser');
content = content.replace(/state\.journalEntries/g, 'journalEntries');
content = content.replace(/state\.products/g, 'products');
content = content.replace(/state\.contacts/g, 'contacts');
content = content.replace(/state\.invoices/g, 'invoices');

fs.writeFileSync('src/App.tsx', content);

// Fix ContactsView self reference
let contacts = fs.readFileSync('src/components/contacts/ContactsView.tsx', 'utf8');
contacts = contacts.replace(/const purchaseBills = purchaseBills\.map/g, "const mappedBills = purchaseBills.map");
fs.writeFileSync('src/components/contacts/ContactsView.tsx', contacts);

// Fix ReportsView FinancialSimulator
let reports = fs.readFileSync('src/components/reports/ReportsView.tsx', 'utf8');
reports = reports.replace(/<FinancialSimulator state=\{\} \/>/g, "<FinancialSimulator />");
fs.writeFileSync('src/components/reports/ReportsView.tsx', reports);

// Fix storage.ts _state TS error
let storage = fs.readFileSync('src/lib/storage.ts', 'utf8');
if (storage.includes("localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));")) {
  storage = storage.replace(/localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(this\.state\)\);/g, "localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));");
}
// wait, the error was "Property '_state' does not exist on type 'AccountingStore'". This means I didn't successfully inject classProxyDef into storage.ts!
fs.writeFileSync('src/lib/storage.ts', storage);
