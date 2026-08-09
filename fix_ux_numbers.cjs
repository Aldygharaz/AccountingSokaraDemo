const fs = require('fs');

// 1. Hide number input spinners in index.css
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('::-webkit-inner-spin-button')) {
  css += `\n
/* Hide number input spinners */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
`;
  fs.writeFileSync('src/index.css', css);
  console.log('Fixed CSS spinners');
}

// 2. Fix unformatted discrepancy in ReportsView
let reports = fs.readFileSync('src/components/reports/ReportsView.tsx', 'utf8');
reports = reports.replace(
  /\`SELISIH Rp \$\{balanceSheet\.discrepancy\}\`/g,
  "`SELISIH Rp ${balanceSheet.discrepancy.toLocaleString('id-ID')}`"
);
fs.writeFileSync('src/components/reports/ReportsView.tsx', reports);
console.log('Fixed ReportsView format');

// 3. FinancialSimulator sliders step="1"
let sim = fs.readFileSync('src/components/analytics/FinancialSimulator.tsx', 'utf8');
sim = sim.replace(/step="5"/g, 'step="1"');
fs.writeFileSync('src/components/analytics/FinancialSimulator.tsx', sim);
console.log('Fixed FinancialSimulator slider step');

