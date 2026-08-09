const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Emojis mapping to Lucide Icons is complex, but we can just strip them from strings
// For Modal, we will use a generic icon or the specific file's icon

const replaceInFile = (filePath, replacer) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
};

// 1. Update Modal.tsx
replaceInFile('src/components/common/Modal.tsx', (content) => {
  let modified = content.replace('title: string;', 'title: string;\n  icon?: React.ReactNode;');
  modified = modified.replace('  title,\n  subtitle,', '  title,\n  icon,\n  subtitle,');
  modified = modified.replace(
    /<h2 className="text-xl font-black text-slate-900 dark:text-white truncate">([\s\S]*?)<\/h2>/,
    `<div className="flex items-center gap-2.5">
            {icon && <div className="text-slate-500 dark:text-slate-400">{icon}</div>}
            <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">
              $1
            </h2>
          </div>`
  );
  return modified;
});

// 2. Update Modal components
const modalFiles = [
  { path: 'src/components/amortization/AmortizationScheduleModal.tsx', emoji: /⚖️\s*/g, icon: 'Calculator' },
  { path: 'src/components/cfo/CfoIntelligenceModal.tsx', emoji: /🧠\s*/g, icon: 'BrainCircuit' },
  { path: 'src/components/closing/PeriodClosingModal.tsx', emoji: /🔐\s*/g, icon: 'Lock' },
  { path: 'src/components/costing/JobOrderCostingModal.tsx', emoji: /🏭\s*/g, icon: 'Factory' },
  { path: 'src/components/ecl/EclProvisioningModal.tsx', emoji: /🛡️\s*/g, icon: 'ShieldAlert' },
  { path: 'src/components/forensic/ForensicAuditModal.tsx', emoji: /🕵️‍♂️\s*/g, icon: 'SearchCode' },
  { path: 'src/components/forex/ForexStudioModal.tsx', emoji: /💱\s*/g, icon: 'Banknote' },
  { path: 'src/components/reports/OfficialReportExportModal.tsx', emoji: /🏛️\s*/g, icon: 'Landmark' },
  { path: 'src/components/tax/Tax1771Modal.tsx', emoji: /⚖️\s*/g, icon: 'Scale' },
  { path: 'src/components/valuation/DcfValuationModal.tsx', emoji: /📈\s*/g, icon: 'LineChart' },
];

modalFiles.forEach((file) => {
  replaceInFile(file.path, (content) => {
    // Add import for icon if not present
    let modified = content;
    if (!modified.includes(file.icon)) {
      modified = modified.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, `import { ${file.icon},$1} from 'lucide-react';`);
    }
    // Remove emoji from title
    modified = modified.replace(/title="([^"]+)"/, (match, p1) => {
      const cleanTitle = p1.replace(file.emoji, '');
      return `title="${cleanTitle}" icon={<${file.icon} className="w-6 h-6 text-blue-600 dark:text-blue-400" />}`;
    });
    return modified;
  });
});

// 3. Strip other emojis
replaceInFile('src/App.tsx', (content) => {
  return content.replace(/✨ /g, '').replace(/⚠️ /g, '');
});

replaceInFile('src/components/ui/PokaYokeModal.tsx', (content) => {
  return content.replace(/✨ /g, '').replace(/⚠️ /g, '');
});

replaceInFile('src/components/analytics/FinancialSimulator.tsx', (content) => {
  return content
    .replace(/🚀 /g, '')
    .replace(/✨ /g, '')
    .replace(/⚠️ /g, '')
    .replace(/🚨 /g, '');
});

replaceInFile('src/components/banking/BankReconciliationView.tsx', (content) => {
  return content.replace(/✨ /g, '');
});

replaceInFile('src/components/common/Header.tsx', (content) => {
  let mod = content.replace(/📖 /g, '');
  return mod;
});

replaceInFile('src/components/reports/ReportsView.tsx', (content) => {
  return content.replace(/✨ /g, '');
});

console.log('Emoji removal script complete.');
