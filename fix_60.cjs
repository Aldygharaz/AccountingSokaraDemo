const fs = require('fs');

function R(file, find, replace) {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes(find)) {
    c = c.replace(find, replace);
    fs.writeFileSync(file, c);
    console.log('[OK] ' + file.split('/').pop());
  } else {
    console.log('[FAIL] ' + file.split('/').pop() + ' - substring not found');
  }
}

// 1. accountingEngine.ts
R('src/lib/accountingEngine.ts', 
  `const currentLiabilities = bs.totalCurrentLiabilities || 1;
    const totalEquity = bs.totalEquity || 1;
    const revenue = pnl.totalRevenue || 1;`, 
  `const currentLiabilities = bs.totalCurrentLiabilities === 0 ? 1 : bs.totalCurrentLiabilities;
    const totalEquity = bs.totalEquity === 0 ? 1 : bs.totalEquity;
    const revenue = pnl.totalRevenue === 0 ? 1 : pnl.totalRevenue;`
);

R('src/lib/accountingEngine.ts', 
  `const currentMs = new Date(asOfDate).getTime();`,
  `const currentStr = new Date(asOfDate).toISOString().split('T')[0];
    const currentMs = new Date(currentStr).getTime();`
);

R('src/lib/accountingEngine.ts',
  `const dueMs = new Date(item.dueDate).getTime();`,
  `const dueStr = new Date(item.dueDate).toISOString().split('T')[0];
      const dueMs = new Date(dueStr).getTime();`
);

// 2. storage.ts - Fix notify() array spread
R('src/lib/storage.ts',
  `{ ...this.state }`,
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

// 3. eclEngine.ts
R('src/lib/eclEngine.ts',
  `accountId: 'acc-1103', // Gross AR`,
  `accountId: 'acc-1107', // ECL Allowance (Contra-Asset)`
);

// 4. costAccountingEngine.ts
R('src/lib/costAccountingEngine.ts',
  `accountId: 'acc-1104', // Finished goods
      debit: 0,
      kredit: dmDec.toNumber()`,
  `accountId: 'acc-1106', // WIP
      debit: 0,
      kredit: dmDec.toNumber()`
);

R('src/lib/costAccountingEngine.ts',
  `accountId: 'acc-6101', // FOH
      debit: 0,
      kredit: fohDec.toNumber()`,
  `accountId: 'acc-1106', // WIP FOH
      debit: 0,
      kredit: fohDec.toNumber()`
);

R('src/lib/costAccountingEngine.ts',
  `dividedBy(job.targetQuantity).round().toNumber();`,
  `dividedBy(job.targetQuantity).toDecimalPlaces(2).toNumber();`
);

