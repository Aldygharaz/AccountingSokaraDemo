const fs = require('fs');

function replaceInFile(filePath, searchRegex, replaceText) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replaceText);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No match: ${filePath}`);
  }
}

// 1. accountingEngine.ts - Fix Ratio Accounts
replaceInFile('src/lib/accountingEngine.ts', 
  /const invAccount = bs\.currentAssets\.find\(\(a\) => a\.accountCode === '1104'\);/g,
  `const invAccount = bs.currentAssets.find((a) => a.accountName.toLowerCase().includes('persediaan'));`
);

replaceInFile('src/lib/accountingEngine.ts',
  /const cashAccounts = bs\.currentAssets\.filter\(\(a\) => a\.accountCode === '1101' \|\| a\.accountCode === '1102'\);/g,
  `const cashAccounts = bs.currentAssets.filter((a) => a.accountName.toLowerCase().includes('kas') || a.accountName.toLowerCase().includes('bank'));`
);

// Fix Ratio Fallback distortion
replaceInFile('src/lib/accountingEngine.ts',
  /const currentRatio = bs\.totalCurrentAssets \/ \(bs\.totalCurrentLiabilities \|\| 1\);/g,
  `const currentRatio = bs.totalCurrentLiabilities === 0 ? 0 : bs.totalCurrentAssets / bs.totalCurrentLiabilities;`
);
replaceInFile('src/lib/accountingEngine.ts',
  /const quickRatio = \(bs\.totalCurrentAssets - inventoryAmount\) \/ \(bs\.totalCurrentLiabilities \|\| 1\);/g,
  `const quickRatio = bs.totalCurrentLiabilities === 0 ? 0 : (bs.totalCurrentAssets - inventoryAmount) / bs.totalCurrentLiabilities;`
);
replaceInFile('src/lib/accountingEngine.ts',
  /const cashRatio = cashAmount \/ \(bs\.totalCurrentLiabilities \|\| 1\);/g,
  `const cashRatio = bs.totalCurrentLiabilities === 0 ? 0 : cashAmount / bs.totalCurrentLiabilities;`
);

// Fix Aging Bucket Timezone
replaceInFile('src/lib/accountingEngine.ts',
  /const currentMs = new Date\(asOfDate\)\.getTime\(\);/g,
  `const currentStr = new Date(asOfDate).toISOString().split('T')[0];
  const currentMs = new Date(currentStr).getTime();`
);
replaceInFile('src/lib/accountingEngine.ts',
  /const dueMs = new Date\(item\.dueDate\)\.getTime\(\);/g,
  `const dueStr = new Date(item.dueDate).toISOString().split('T')[0];
      const dueMs = new Date(dueStr).getTime();`
);

// 2. storage.ts - Fix array spread in notify()
replaceInFile('src/lib/storage.ts',
  /\{ \.\.\.this\.state \}/g,
  `{ 
      ...this.state,
      journalEntries: [...this.state.journalEntries],
      invoices: [...this.state.invoices],
      purchaseBills: [...this.state.purchaseBills],
      accounts: [...this.state.accounts],
      contacts: [...this.state.contacts],
      products: [...this.state.products],
      stockMovements: [...this.state.stockMovements],
      fixedAssets: [...this.state.fixedAssets],
      bankStatements: [...this.state.bankStatements],
      closedPeriods: [...this.state.closedPeriods],
      prepaidExpenses: [...this.state.prepaidExpenses],
      forexRates: [...this.state.forexRates],
      forexExposures: [...this.state.forexExposures],
    }`
);

// Fix VoidInvoice stock valuation divergence
replaceInFile('src/lib/storage.ts',
  /stockMovements\.push\(\{\n\s*id: Math\.random\(\)\.toString\(36\)\.substr\(2, 9\),\n\s*productId: item\.productId,\n\s*type: 'in',\n\s*quantity: item\.quantity,\n\s*unitPrice: prod\.avgCost,/g,
  `stockMovements.push({
          id: Math.random().toString(36).substr(2, 9),
          productId: item.productId,
          type: 'in',
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Use historical unit price from the invoice item`
);

// Fix overpayment precision
replaceInFile('src/lib/storage.ts',
  /if \(data\.amount <= 0 \|\| data\.amount > invoice\.remainingAmount\) \{/g,
  `if (data.amount <= 0 || data.amount - invoice.remainingAmount > 0.01) {`
);
replaceInFile('src/lib/storage.ts',
  /if \(data\.amount <= 0 \|\| data\.amount > bill\.remainingAmount\) \{/g,
  `if (data.amount <= 0 || data.amount - bill.remainingAmount > 0.01) {`
);

// 3. eclEngine.ts - Fix ECL credit account
replaceInFile('src/lib/eclEngine.ts',
  /accountId: 'acc-1103', \/\/ Gross AR/g,
  `accountId: 'acc-1107', // ECL Allowance`
);

// 4. costAccountingEngine.ts - Fix double acc-1104
replaceInFile('src/lib/costAccountingEngine.ts',
  /accountId: 'acc-1104', \/\/ Finished goods\n\s*debit: 0,\n\s*kredit: dmDec\.toNumber\(\)/g,
  `accountId: 'acc-1106', // WIP / Raw Materials
      debit: 0,
      kredit: dmDec.toNumber()`
);
replaceInFile('src/lib/costAccountingEngine.ts',
  /accountId: 'acc-6101', \/\/ FOH\n\s*debit: 0,\n\s*kredit: fohDec\.toNumber\(\)/g,
  `accountId: 'acc-1106', // WIP FOH
      debit: 0,
      kredit: fohDec.toNumber()`
);

