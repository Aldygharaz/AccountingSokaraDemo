const fs = require('fs');

function processHeader() {
  let file = 'src/components/common/Header.tsx';
  let c = fs.readFileSync(file, 'utf8');
  
  c = c.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import { BookOpen, BrainCircuit, SearchCode, Factory, Landmark, $1} from 'lucide-react';");
  
  c = c.replace(/<span>Panduan SOP<\/span>/, '<BookOpen className="w-4 h-4 shrink-0" /><span>Panduan SOP</span>');
  c = c.replace(/<span>CFO \(F9\)<\/span>/, '<BrainCircuit className="w-4 h-4 shrink-0" /><span>CFO (F9)</span>');
  c = c.replace(/<span>.*?Forensik \(F10\)<\/span>/, '<SearchCode className="w-4 h-4 shrink-0" /><span>Forensik (F10)</span>');
  c = c.replace(/<span>HPP Costing \(F7\)<\/span>/, '<Factory className="w-4 h-4 shrink-0" /><span>HPP Costing (F7)</span>');
  c = c.replace(/<span>Ekspor PSAK<\/span>/, '<Landmark className="w-4 h-4 shrink-0" /><span>Ekspor PSAK</span>');
  
  fs.writeFileSync(file, c);
}

function processReports() {
  let file = 'src/components/reports/ReportsView.tsx';
  let c = fs.readFileSync(file, 'utf8');
  
  c = c.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import { ArrowRightLeft, BrainCircuit, $1} from 'lucide-react';");
  
  c = c.replace(/{ id: 'pnl', label: 'Laba Rugi \(P&L\)' }/g, "{ id: 'pnl', label: 'Laba Rugi (P&L)', icon: <TrendingUp className=\"w-3.5 h-3.5\" /> }");
  c = c.replace(/{ id: 'balance_sheet', label: 'Neraca \(Balance Sheet\)' }/g, "{ id: 'balance_sheet', label: 'Neraca (Balance Sheet)', icon: <Scale className=\"w-3.5 h-3.5\" /> }");
  c = c.replace(/{ id: 'cash_flow', label: 'Arus Kas \(Direct\)' }/g, "{ id: 'cash_flow', label: 'Arus Kas (Direct)', icon: <ArrowRightLeft className=\"w-3.5 h-3.5\" /> }");
  c = c.replace(/{ id: 'simulation', label: 'What-If Simulator' }/g, "{ id: 'simulation', label: 'What-If Simulator', icon: <BrainCircuit className=\"w-3.5 h-3.5\" /> }");
  
  // Now modify the button render to show tab.icon
  c = c.replace(
    /\{tab\.label\}/,
    '<div className="flex items-center gap-1.5">{tab.icon && tab.icon}<span>{tab.label}</span></div>'
  );
  
  fs.writeFileSync(file, c);
}

processHeader();
processReports();
console.log('Icons added.');
