const fs = require('fs');

// Fix FinancialSimulator.tsx
let sim = fs.readFileSync('src/components/analytics/FinancialSimulator.tsx', 'utf8');
sim = sim.replace(/step="1"/g, 'step="5"');
fs.writeFileSync('src/components/analytics/FinancialSimulator.tsx', sim);

// Fix DashboardView.tsx
let dash = fs.readFileSync('src/components/dashboard/DashboardView.tsx', 'utf8');
dash = dash.replace(/\{ratios\.currentRatio\}x/g, '{formatNumber(ratios.currentRatio, 2)}x');
dash = dash.replace(/\{ratios\.quickRatio\}x/g, '{formatNumber(ratios.quickRatio, 2)}x');
dash = dash.replace(/\{ratios\.debtToEquityRatio\}x/g, '{formatNumber(ratios.debtToEquityRatio, 2)}x');
fs.writeFileSync('src/components/dashboard/DashboardView.tsx', dash);

// Fix AnalyticsView.tsx 
let analytics = fs.readFileSync('src/components/analytics/AnalyticsView.tsx', 'utf8');
analytics = analytics.replace(/\{formatNumber\(ratios\.currentRatio, 1\)\}x/g, '{formatNumber(ratios.currentRatio, 2)}x');
analytics = analytics.replace(/\{formatNumber\(ratios\.quickRatio, 1\)\}x/g, '{formatNumber(ratios.quickRatio, 2)}x');
analytics = analytics.replace(/\{formatNumber\(ratios\.debtToEquityRatio, 1\)\}x/g, '{formatNumber(ratios.debtToEquityRatio, 2)}x');
fs.writeFileSync('src/components/analytics/AnalyticsView.tsx', analytics);

console.log("UX issues fixed!");
