const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchRegex, replaceText) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replaceText);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No match found in: ${filePath}`);
  }
}

// --- 1. seedData.ts ---
replaceInFile('src/lib/seedData.ts', 
  /\{ id: 'acc-1105'.*?\},/s,
  `{ id: 'acc-1105', code: '1105', name: 'Persediaan Bahan Baku', type: 'aset', subType: 'lancar', normalBalance: 'debit', initialBalance: 0, isActive: true },
  { id: 'acc-1106', code: '1106', name: 'Persediaan Dalam Proses (WIP)', type: 'aset', subType: 'lancar', normalBalance: 'debit', initialBalance: 0, isActive: true },
  { id: 'acc-1107', code: '1107', name: 'Cadangan Kerugian Piutang (ECL)', type: 'aset', subType: 'lancar', normalBalance: 'kredit', initialBalance: 0, isActive: true },`
);

replaceInFile('src/lib/seedData.ts',
  /\{ id: 'acc-7101'.*?\},/s,
  `{ id: 'acc-7101', code: '7101', name: 'Pendapatan Bunga', type: 'pendapatan', subType: 'lainnya', normalBalance: 'kredit', initialBalance: 0, isActive: true },
  { id: 'acc-7102', code: '7102', name: 'Laba/Rugi Selisih Kurs', type: 'pendapatan', subType: 'lainnya', normalBalance: 'kredit', initialBalance: 0, isActive: true },`
);

// --- 2. accountingEngine.ts ---
replaceInFile('src/lib/accountingEngine.ts',
  /journalEntries\.forEach\(\(entry\) => \{/s,
  `journalEntries.forEach((entry) => {
    if (entry.sourceType === 'closing_entry' || entry.isVoided) return;`
);

replaceInFile('src/lib/accountingEngine.ts',
  /const totalEquityDec = totalBaseEquity\.plus\(currentPeriodNetIncomeDec\);/g,
  `// If closing entries exist for this period, net income is already in retained earnings
  const hasClosingEntries = journalEntries.some(j => j.sourceType === 'closing_entry' && j.date <= asOfDate && !j.isVoided);
  const totalEquityDec = hasClosingEntries ? totalBaseEquity : totalBaseEquity.plus(currentPeriodNetIncomeDec);`
);

replaceInFile('src/lib/accountingEngine.ts',
  /if \(entry\.description\.includes\('Kasir'\) \|\| entry\.description\.includes\('Penjualan'\)\) \{/g,
  `if (entry.sourceType === 'sales' || entry.sourceType === 'pos_receipt' || entry.description.toLowerCase().includes('kasir') || entry.description.toLowerCase().includes('penjualan')) {`
);

// --- 3. storage.ts ---
replaceInFile('src/lib/storage.ts',
  /const monthlyDepr = \(asset\.acquisitionCost - asset\.salvageValue\) \/ asset\.usefulLifeMonths;/g,
  `const baseDepr = (asset.acquisitionCost - asset.salvageValue) / asset.usefulLifeMonths;
        const monthlyDepr = Math.min(baseDepr, asset.netBookValue - asset.salvageValue);`
);

replaceInFile('src/lib/storage.ts',
  /if \(cashAccount\) \{/g,
  `// Allow fallback if ID is slightly modified
        if (!cashAccount) cashAccount = this.state.accounts.find(a => a.name.toLowerCase().includes('kas') || a.code.startsWith('1101'));
        if (cashAccount) {`
);

replaceInFile('src/lib/storage.ts',
  /p\.remainingBalance -= p\.monthlyAmortization;/g,
  `const amortizeAmount = Math.min(p.monthlyAmortization, p.remainingBalance);
      if (p.lastAmortizedMonth === periodMonth || amortizeAmount <= 0) return;
      
      p.remainingBalance -= amortizeAmount;
      p.lastAmortizedMonth = periodMonth;`
);

replaceInFile('src/lib/storage.ts',
  /this\.state\.contacts = this\.state\.contacts\.filter\(\(c\) => c\.id !== id\);/g,
  `const isInUse = this.state.invoices.some(i => i.contactId === id) || this.state.purchaseBills.some(b => b.contactId === id);
    if (isInUse) return { success: false, error: 'Kontak sedang digunakan dalam transaksi aktif.' };
    this.state.contacts = this.state.contacts.filter((c) => c.id !== id);`
);

replaceInFile('src/lib/storage.ts',
  /this\.state\.products = this\.state\.products\.filter\(\(p\) => p\.id !== id\);/g,
  `const isInUse = this.state.stockMovements.some(m => m.productId === id);
    if (isInUse) return { success: false, error: 'Produk memiliki riwayat pergerakan stok.' };
    this.state.products = this.state.products.filter((p) => p.id !== id);`
);

// --- 4. costAccountingEngine.ts ---
replaceInFile('src/lib/costAccountingEngine.ts',
  /accountId: 'acc-1104',\s*\/\/ Finished goods\s*debit: 0,\s*kredit: dmDec\.toNumber\(\)/g,
  `accountId: 'acc-1106', // WIP
      debit: 0,
      kredit: dmDec.toNumber()`
);

replaceInFile('src/lib/costAccountingEngine.ts',
  /accountId: 'acc-6101',\s*\/\/ FOH\s*debit: 0,\s*kredit: fohDec\.toNumber\(\)/g,
  `accountId: 'acc-1106', // WIP FOH
      debit: 0,
      kredit: fohDec.toNumber()`
);

replaceInFile('src/lib/costAccountingEngine.ts',
  /dividedBy\(job\.targetQuantity\)\.round\(\)\.toNumber\(\);/g,
  `dividedBy(job.targetQuantity).toDecimalPlaces(2).toNumber();`
);

// --- 5. eclEngine.ts ---
replaceInFile('src/lib/eclEngine.ts',
  /accountId: 'acc-1103', \/\/ Gross AR/g,
  `accountId: 'acc-1107', // ECL Allowance (Contra-Asset)`
);

console.log('Script execution finished.');
