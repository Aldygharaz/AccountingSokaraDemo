import Decimal from 'decimal.js';
import {
  Account,
  JournalEntry,
  JournalLine,
  SalesInvoice,
  PurchaseBill,
  CashTransaction,
  Product,
  StockMovement,
  SourceType,
} from '../types/accounting';

// Precision formatting utility
export const formatIDR = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const round2 = (val: number | string): number => {
  return new Decimal(val).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
};

export const validateJournalBalance = (
  lines: ({ debit?: number; kredit?: number } | JournalLine)[]
): {
  isBalanced: boolean;
  totalDebit: number;
  totalKredit: number;
  diff: number;
  error?: string;
} => {
  let sumDebit = new Decimal(0);
  let sumKredit = new Decimal(0);

  lines.forEach((line) => {
    sumDebit = sumDebit.plus(new Decimal(line.debit || 0));
    sumKredit = sumKredit.plus(new Decimal(line.kredit || 0));
  });

  const d = sumDebit.toDecimalPlaces(2).toNumber();
  const k = sumKredit.toDecimalPlaces(2).toNumber();
  const diff = sumDebit.minus(sumKredit).abs().toDecimalPlaces(2).toNumber();
  const isBalanced = diff < 0.01;

  return {
    isBalanced,
    totalDebit: d,
    totalKredit: k,
    diff,
    error: isBalanced ? undefined : `Total Debit (${formatIDR(d)}) tidak sama dengan Total Kredit (${formatIDR(k)}). Selisih: ${formatIDR(diff)}`,
  };
};

/**
 * Calculates current running balance for all accounts from Journal Lines
 */
export const calculateAccountBalances = (
  accounts: Account[],
  journalEntries: JournalEntry[]
): Map<string, number> => {
  const balanceMap = new Map<string, Decimal>();

  accounts.forEach((acc) => {
    balanceMap.set(acc.id, new Decimal(0));
  });

  journalEntries.forEach((entry) => {
    if (entry.sourceType === 'closing_entry' || entry.isVoided) return;
    entry.lines.forEach((line) => {
      const current = balanceMap.get(line.accountId) || new Decimal(0);
      const acc = accounts.find((a) => a.id === line.accountId);
      if (!acc) return;

      const debit = new Decimal(line.debit || 0);
      const kredit = new Decimal(line.kredit || 0);

      // Normal balance logic
      if (acc.normalBalance === 'debit') {
        balanceMap.set(line.accountId, current.plus(debit).minus(kredit));
      } else {
        balanceMap.set(line.accountId, current.plus(kredit).minus(debit));
      }
    });
  });

  const resultMap = new Map<string, number>();
  balanceMap.forEach((val, key) => {
    resultMap.set(key, val.toDecimalPlaces(2).toNumber());
  });

  return resultMap;
};

/**
 * Weighted Average Costing calculation when receiving goods from purchase bill
 */
export const calculateWeightedAverageCost = (
  oldQty: number,
  oldAvgCost: number,
  purchasedQty: number,
  purchaseUnitPrice: number
): { newQty: number; newAvgCost: number } => {
  const qOld = new Decimal(Math.max(0, oldQty));
  const cOld = new Decimal(Math.max(0, oldAvgCost));
  const qNew = new Decimal(Math.max(0, purchasedQty));
  const cNew = new Decimal(Math.max(0, purchaseUnitPrice));

  const totalQty = qOld.plus(qNew);
  if (totalQty.isZero()) {
    return { newQty: 0, newAvgCost: 0 };
  }

  const oldTotalValue = qOld.times(cOld);
  const newTotalValue = qNew.times(cNew);
  const combinedValue = oldTotalValue.plus(newTotalValue);

  const avgCost = combinedValue.dividedBy(totalQty).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    newQty: totalQty.toNumber(),
    newAvgCost: avgCost.toNumber(),
  };
};

export interface IncomeStatementReport {
  startDate?: string;
  endDate?: string;
  revenues: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  totalRevenue: number;
  cogs: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  totalCogs: number;
  grossProfit: number;
  operatingExpenses: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  totalOperatingExpenses: number;
  netIncome: number;
}

export const generateIncomeStatement = (
  accounts: Account[],
  journalEntries: JournalEntry[],
  startDate?: string,
  endDate?: string
): IncomeStatementReport => {
  const accountTotals = new Map<string, Decimal>();

  accounts.forEach((acc) => {
    accountTotals.set(acc.id, new Decimal(0));
  });

  journalEntries.forEach((entry) => {
    if (entry.sourceType === 'closing_entry' || entry.isVoided) return;
    if (startDate && entry.date < startDate) return;
    if (endDate && entry.date > endDate) return;

    entry.lines.forEach((line) => {
      const acc = accounts.find((a) => a.id === line.accountId);
      if (!acc) return;
      const current = accountTotals.get(line.accountId) || new Decimal(0);

      const debit = new Decimal(line.debit || 0);
      const kredit = new Decimal(line.kredit || 0);

      if (acc.type === 'pendapatan') {
        accountTotals.set(line.accountId, current.plus(kredit).minus(debit));
      } else if (acc.type === 'beban') {
        accountTotals.set(line.accountId, current.plus(debit).minus(kredit));
      }
    });
  });

  const revenues: IncomeStatementReport['revenues'] = [];
  let totalRevenue = new Decimal(0);

  const cogs: IncomeStatementReport['cogs'] = [];
  let totalCogs = new Decimal(0);

  const operatingExpenses: IncomeStatementReport['operatingExpenses'] = [];
  let totalOperatingExpenses = new Decimal(0);

  accounts.forEach((acc) => {
    const val = accountTotals.get(acc.id) || new Decimal(0);
    const amount = val.toDecimalPlaces(2).toNumber();

    if (acc.type === 'pendapatan') {
      revenues.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
      totalRevenue = totalRevenue.plus(val);
    } else if (acc.type === 'beban') {
      if (acc.subType === 'hpp' || acc.code.startsWith('5')) {
        cogs.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
        totalCogs = totalCogs.plus(val);
      } else {
        operatingExpenses.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
        totalOperatingExpenses = totalOperatingExpenses.plus(val);
      }
    }
  });

  const grossProfit = totalRevenue.minus(totalCogs);
  const netIncome = grossProfit.minus(totalOperatingExpenses);

  return {
    startDate,
    endDate,
    revenues,
    totalRevenue: totalRevenue.toDecimalPlaces(2).toNumber(),
    cogs,
    totalCogs: totalCogs.toDecimalPlaces(2).toNumber(),
    grossProfit: grossProfit.toDecimalPlaces(2).toNumber(),
    operatingExpenses,
    totalOperatingExpenses: totalOperatingExpenses.toDecimalPlaces(2).toNumber(),
    netIncome: netIncome.toDecimalPlaces(2).toNumber(),
  };
};

export interface BalanceSheetReport {
  asOfDate: string;
  currentAssets: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  totalCurrentAssets: number;
  nonCurrentAssets: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  totalNonCurrentAssets: number;
  totalAssets: number;
  currentLiabilities: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  totalCurrentLiabilities: number;
  nonCurrentLiabilities: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  equityItems: { accountId: string; accountCode: string; accountName: string; amount: number }[];
  currentPeriodNetIncome: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  discrepancy: number;
}

export const generateBalanceSheet = (
  accounts: Account[],
  journalEntries: JournalEntry[],
  asOfDate: string = new Date().toISOString().split('T')[0]
): BalanceSheetReport => {
  const balanceMap = new Map<string, Decimal>();

  accounts.forEach((acc) => {
    balanceMap.set(acc.id, new Decimal(0));
  });

  let cumulativeRevenue = new Decimal(0);
  let cumulativeExpenses = new Decimal(0);

  journalEntries.forEach((entry) => {
    if (entry.date > asOfDate) return;

    entry.lines.forEach((line) => {
      const acc = accounts.find((a) => a.id === line.accountId);
      if (!acc) return;

      const current = balanceMap.get(line.accountId) || new Decimal(0);
      const debit = new Decimal(line.debit || 0);
      const kredit = new Decimal(line.kredit || 0);

      if (acc.normalBalance === 'debit') {
        balanceMap.set(line.accountId, current.plus(debit).minus(kredit));
      } else {
        balanceMap.set(line.accountId, current.plus(kredit).minus(debit));
      }

      if (acc.type === 'pendapatan') {
        cumulativeRevenue = cumulativeRevenue.plus(kredit).minus(debit);
      } else if (acc.type === 'beban') {
        cumulativeExpenses = cumulativeExpenses.plus(debit).minus(kredit);
      }
    });
  });

  const currentPeriodNetIncomeDec = cumulativeRevenue.minus(cumulativeExpenses);

  const currentAssets: BalanceSheetReport['currentAssets'] = [];
  let totalCurrentAssets = new Decimal(0);

  const nonCurrentAssets: BalanceSheetReport['nonCurrentAssets'] = [];
  let totalNonCurrentAssets = new Decimal(0);

  const currentLiabilities: BalanceSheetReport['currentLiabilities'] = [];
  let totalCurrentLiabilities = new Decimal(0);

  const nonCurrentLiabilities: BalanceSheetReport['nonCurrentLiabilities'] = [];
  let totalNonCurrentLiabilities = new Decimal(0);

  const equityItems: BalanceSheetReport['equityItems'] = [];
  let totalBaseEquity = new Decimal(0);

  accounts.forEach((acc) => {
    const val = balanceMap.get(acc.id) || new Decimal(0);
    const amount = val.toDecimalPlaces(2).toNumber();

    if (acc.type === 'aset') {
      if (acc.subType === 'aset_tetap' || acc.code.startsWith('12')) {
        nonCurrentAssets.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
        totalNonCurrentAssets = totalNonCurrentAssets.plus(val);
      } else {
        currentAssets.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
        totalCurrentAssets = totalCurrentAssets.plus(val);
      }
    } else if (acc.type === 'liabilitas') {
      if (acc.subType === 'liabilitas_jangka_panjang' || acc.code.startsWith('22')) {
        nonCurrentLiabilities.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
        totalNonCurrentLiabilities = totalNonCurrentLiabilities.plus(val);
      } else {
        currentLiabilities.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
        totalCurrentLiabilities = totalCurrentLiabilities.plus(val);
      }
    } else if (acc.type === 'ekuitas') {
      equityItems.push({ accountId: acc.id, accountCode: acc.code, accountName: acc.name, amount });
      totalBaseEquity = totalBaseEquity.plus(val);
    }
  });

  const totalAssetsDec = totalCurrentAssets.plus(totalNonCurrentAssets);
  const totalLiabilitiesDec = totalCurrentLiabilities.plus(totalNonCurrentLiabilities);
  const totalEquityDec = totalBaseEquity.plus(currentPeriodNetIncomeDec);
  const totalLiabilitiesAndEquityDec = totalLiabilitiesDec.plus(totalEquityDec);

  const discrepancyDec = totalAssetsDec.minus(totalLiabilitiesAndEquityDec).abs();
  const isBalanced = discrepancyDec.lessThan(0.01);

  return {
    asOfDate,
    currentAssets,
    totalCurrentAssets: totalCurrentAssets.toDecimalPlaces(2).toNumber(),
    nonCurrentAssets,
    totalNonCurrentAssets: totalNonCurrentAssets.toDecimalPlaces(2).toNumber(),
    totalAssets: totalAssetsDec.toDecimalPlaces(2).toNumber(),
    currentLiabilities,
    totalCurrentLiabilities: totalCurrentLiabilities.toDecimalPlaces(2).toNumber(),
    nonCurrentLiabilities,
    totalNonCurrentLiabilities: totalNonCurrentLiabilities.toDecimalPlaces(2).toNumber(),
    totalLiabilities: totalLiabilitiesDec.toDecimalPlaces(2).toNumber(),
    equityItems,
    currentPeriodNetIncome: currentPeriodNetIncomeDec.toDecimalPlaces(2).toNumber(),
    totalEquity: totalEquityDec.toDecimalPlaces(2).toNumber(),
    totalLiabilitiesAndEquity: totalLiabilitiesAndEquityDec.toDecimalPlaces(2).toNumber(),
    isBalanced,
    discrepancy: discrepancyDec.toDecimalPlaces(2).toNumber(),
  };
};

export interface CashFlowDirectReport {
  startDate?: string;
  endDate?: string;
  cashFromCustomers: number;
  cashPaidToSuppliers: number;
  cashPaidForOperatingExpenses: number;
  netCashFromOperatingActivities: number;
  cashForEquipment: number;
  netCashFromInvestingActivities: number;
  cashFromCapitalInjection: number;
  netCashFromFinancingActivities: number;
  netChangeInCash: number;
  beginningCashBalance: number;
  endingCashBalance: number;
}

export const generateCashFlowDirect = (
  accounts: Account[],
  journalEntries: JournalEntry[],
  startDate?: string,
  endDate?: string
): CashFlowDirectReport => {
  let cashFromCustomersDec = new Decimal(0);
  let cashPaidToSuppliersDec = new Decimal(0);
  let cashPaidForOperatingDec = new Decimal(0);
  let cashForEquipmentDec = new Decimal(0);
  let cashFromCapitalDec = new Decimal(0);

  journalEntries.forEach((entry) => {
    if (startDate && entry.date < startDate) return;
    if (endDate && entry.date > endDate) return;

    if (entry.sourceType === 'payment_received' || (entry.sourceType === 'cash_transaction' && entry.description.includes('Kasir'))) {
      const cashDebit = entry.lines
        .filter((l) => l.accountId === 'acc-1101' || l.accountId === 'acc-1102')
        .reduce((sum, l) => sum.plus(l.debit || 0), new Decimal(0));
      cashFromCustomersDec = cashFromCustomersDec.plus(cashDebit);
    } else if (entry.sourceType === 'bill_payment' || (entry.sourceType === 'cash_transaction' && entry.description.includes('Pemasok'))) {
      const cashKredit = entry.lines
        .filter((l) => l.accountId === 'acc-1101' || l.accountId === 'acc-1102')
        .reduce((sum, l) => sum.plus(l.kredit || 0), new Decimal(0));
      cashPaidToSuppliersDec = cashPaidToSuppliersDec.plus(cashKredit);
    } else if (entry.sourceType === 'cash_transaction') {
      if (entry.description.includes('Sewa') || entry.description.includes('Gaji') || entry.description.includes('Listrik') || entry.description.includes('Administrasi')) {
        const cashKredit = entry.lines
          .filter((l) => l.accountId === 'acc-1101' || l.accountId === 'acc-1102')
          .reduce((sum, l) => sum.plus(l.kredit || 0), new Decimal(0));
        cashPaidForOperatingDec = cashPaidForOperatingDec.plus(cashKredit);
      } else if (entry.description.includes('Peralatan') || entry.description.includes('Rak Display')) {
        const cashKredit = entry.lines
          .filter((l) => l.accountId === 'acc-1101' || l.accountId === 'acc-1102')
          .reduce((sum, l) => sum.plus(l.kredit || 0), new Decimal(0));
        cashForEquipmentDec = cashForEquipmentDec.plus(cashKredit);
      } else if (entry.description.includes('Modal') || entry.sourceId === 'init-capital') {
        const cashDebit = entry.lines
          .filter((l) => l.accountId === 'acc-1101' || l.accountId === 'acc-1102')
          .reduce((sum, l) => sum.plus(l.debit || 0), new Decimal(0));
        cashFromCapitalDec = cashFromCapitalDec.plus(cashDebit);
      }
    }
  });

  const netOperating = cashFromCustomersDec.minus(cashPaidToSuppliersDec).minus(cashPaidForOperatingDec);
  const netInvesting = cashForEquipmentDec.negated();
  const netFinancing = cashFromCapitalDec;

  const netChange = netOperating.plus(netInvesting).plus(netFinancing);

  let endingCash = new Decimal(0);
  journalEntries.forEach((entry) => {
    if (endDate && entry.date > endDate) return;
    entry.lines.forEach((line) => {
      if (line.accountId === 'acc-1101' || line.accountId === 'acc-1102') {
        endingCash = endingCash.plus(line.debit || 0).minus(line.kredit || 0);
      }
    });
  });

  return {
    startDate,
    endDate,
    cashFromCustomers: cashFromCustomersDec.toNumber(),
    cashPaidToSuppliers: cashPaidToSuppliersDec.toNumber(),
    cashPaidForOperatingExpenses: cashPaidForOperatingDec.toNumber(),
    netCashFromOperatingActivities: netOperating.toNumber(),
    cashForEquipment: cashForEquipmentDec.toNumber(),
    netCashFromInvestingActivities: netInvesting.toNumber(),
    cashFromCapitalInjection: cashFromCapitalDec.toNumber(),
    netCashFromFinancingActivities: netFinancing.toNumber(),
    netChangeInCash: netChange.toNumber(),
    beginningCashBalance: endingCash.minus(netChange).toNumber(),
    endingCashBalance: endingCash.toNumber(),
  };
};

export interface FinancialRatios {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  grossProfitMargin: number;
  netProfitMargin: number;
  debtToEquityRatio: number;
  returnOnEquity: number;
  evaluation?: {
    currentRatioStatus: 'healthy' | 'warning' | 'danger';
    npmStatus: 'healthy' | 'warning' | 'danger';
    derStatus: 'healthy' | 'warning' | 'danger';
  };
}

export const calculateFinancialRatios = (
  accounts: Account[],
  journalEntries: JournalEntry[],
  asOfDate?: string
): FinancialRatios => {
  const bs = generateBalanceSheet(accounts, journalEntries, asOfDate);
  const pnl = generateIncomeStatement(accounts, journalEntries, undefined, asOfDate);

  const invAccount = bs.currentAssets.find((a) => a.accountName.toLowerCase().includes('persediaan'));
  const inventoryAmount = invAccount ? invAccount.amount : 0;

  const cashAccounts = bs.currentAssets.filter((a) => a.accountName.toLowerCase().includes('kas') || a.accountName.toLowerCase().includes('bank'));
  const cashAmount = cashAccounts.reduce((sum, a) => sum + a.amount, 0);

  const currentLiabilities = bs.totalCurrentLiabilities || 1;
  const totalEquity = bs.totalEquity || 1;
  const revenue = pnl.totalRevenue || 1;

  const currentRatio = new Decimal(bs.totalCurrentAssets).dividedBy(currentLiabilities).toDecimalPlaces(2).toNumber();
  const quickRatio = new Decimal(bs.totalCurrentAssets).minus(inventoryAmount).dividedBy(currentLiabilities).toDecimalPlaces(2).toNumber();
  const cashRatio = new Decimal(cashAmount).dividedBy(currentLiabilities).toDecimalPlaces(2).toNumber();
  const gpm = new Decimal(pnl.grossProfit).dividedBy(revenue).times(100).toDecimalPlaces(2).toNumber();
  const npm = new Decimal(pnl.netIncome).dividedBy(revenue).times(100).toDecimalPlaces(2).toNumber();
  const der = new Decimal(bs.totalLiabilities).dividedBy(totalEquity).toDecimalPlaces(2).toNumber();
  const roe = new Decimal(pnl.netIncome).dividedBy(totalEquity).times(100).toDecimalPlaces(2).toNumber();

  const currentRatioStatus = currentRatio >= 1.5 ? 'healthy' : currentRatio >= 1.0 ? 'warning' : 'danger';
  const npmStatus = npm >= 10 ? 'healthy' : npm >= 0 ? 'warning' : 'danger';
  const derStatus = der <= 1.5 ? 'healthy' : der <= 2.5 ? 'warning' : 'danger';

  return {
    currentRatio,
    quickRatio,
    cashRatio,
    grossProfitMargin: gpm,
    netProfitMargin: npm,
    debtToEquityRatio: der,
    returnOnEquity: roe,
    evaluation: {
      currentRatioStatus,
      npmStatus,
      derStatus,
    },
  };
};

export interface AgingBucketItem {
  id: string;
  refNumber: string;
  contactName: string;
  date: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  daysOverdue: number;
}

export interface AgingBucket {
  bucketName: 'current' | '1-30' | '31-60' | '61-90' | '90+';
  label: string;
  amount: number;
  count: number;
  items: AgingBucketItem[];
}

export const calculateAgingBuckets = (
  items: {
    id: string;
    refNumber: string;
    contactName: string;
    date: string;
    dueDate: string;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  }[],
  asOfDate: string = new Date().toISOString().split('T')[0]
): AgingBucket[] => {
  const buckets: Record<string, AgingBucket> = {
    current: { bucketName: 'current', label: 'Belum Jatuh Tempo', amount: 0, count: 0, items: [] },
    '1-30': { bucketName: '1-30', label: '1 - 30 Hari', amount: 0, count: 0, items: [] },
    '31-60': { bucketName: '31-60', label: '31 - 60 Hari', amount: 0, count: 0, items: [] },
    '61-90': { bucketName: '61-90', label: '61 - 90 Hari', amount: 0, count: 0, items: [] },
    '90+': { bucketName: '90+', label: '> 90 Hari', amount: 0, count: 0, items: [] },
  };

  const asOf = new Date(asOfDate).getTime();

  items.forEach((item) => {
    if (item.status === 'lunas' || item.status === 'void' || item.remainingAmount <= 0) return;

    const due = new Date(item.dueDate).getTime();
    const diffDays = Math.floor((asOf - due) / (1000 * 60 * 60 * 24));

    const bucketItem: AgingBucketItem = {
      ...item,
      daysOverdue: Math.max(0, diffDays),
    };

    if (diffDays <= 0) {
      buckets.current.amount += item.remainingAmount;
      buckets.current.count += 1;
      buckets.current.items.push(bucketItem);
    } else if (diffDays <= 30) {
      buckets['1-30'].amount += item.remainingAmount;
      buckets['1-30'].count += 1;
      buckets['1-30'].items.push(bucketItem);
    } else if (diffDays <= 60) {
      buckets['31-60'].amount += item.remainingAmount;
      buckets['31-60'].count += 1;
      buckets['31-60'].items.push(bucketItem);
    } else if (diffDays <= 90) {
      buckets['61-90'].amount += item.remainingAmount;
      buckets['61-90'].count += 1;
      buckets['61-90'].items.push(bucketItem);
    } else {
      buckets['90+'].amount += item.remainingAmount;
      buckets['90+'].count += 1;
      buckets['90+'].items.push(bucketItem);
    }
  });

  return Object.values(buckets);
};


// ==========================================
// 90-DAY ROLLING CASH FLOW FORECAST ENGINE
// ==========================================

export interface DailyCashFlowForecastPoint {
  dayOffset: number;
  date: string;
  label: string;
  startingCash: number;
  projectedInflow: number;
  projectedOutflow: number;
  netFlow: number;
  endingCash: number;
  isLowestPoint?: boolean;
  isBelowSafetyThreshold?: boolean;
}

export interface RollingCashFlowForecastResult {
  currentCashBalance: number;
  safetyThreshold: number;
  lowestCashPoint: { date: string; amount: number; dayOffset: number; label: string };
  daysUntilLowest: number;
  runwayDays: number;
  dataPoints: DailyCashFlowForecastPoint[];
  summary: {
    totalProjectedInflows: number;
    totalProjectedOutflows: number;
    netCashChange90Days: number;
  };
}

export const calculateRollingCashFlowForecast = (
  accounts: Account[],
  journalEntries: JournalEntry[],
  invoices: SalesInvoice[],
  purchaseBills: PurchaseBill[],
  options?: {
    forecastDays?: number;
    salesGrowthPct?: number; // e.g. 15 for +15%
    cogsInflationPct?: number; // e.g. 5 for +5%
    opexReductionPct?: number; // e.g. -10 for -10%
    safetyThreshold?: number; // default Rp 10.000.000
    startDate?: string;
  }
): RollingCashFlowForecastResult => {
  const forecastDays = options?.forecastDays || 90;
  const salesGrowth = (options?.salesGrowthPct || 0) / 100;
  const cogsInflation = (options?.cogsInflationPct || 0) / 100;
  const opexReduction = (options?.opexReductionPct || 0) / 100;
  const safetyThreshold = options?.safetyThreshold || 10000000;
  const baseDate = options?.startDate ? new Date(options.startDate) : new Date();

  // 1. Calculate live current cash balance (Accounts 1101 + 1102)
  let currentCashBalance = 0;
  journalEntries.forEach((je) => {
    je.lines.forEach((l) => {
      const acc = accounts.find((a) => a.id === l.accountId);
      if (acc && (acc.code === '1101' || acc.code === '1102')) {
        currentCashBalance += (l.debit || 0) - (l.kredit || 0);
      }
    });
  });

  // 2. Derive average baseline daily operational burn & daily cash revenue from P&L
  const pnl = generateIncomeStatement(accounts, journalEntries);
  const totalRev = pnl.totalRevenue || 0;
  const totalOpex = pnl.totalOperatingExpenses || 0;
  const totalCogs = pnl.cogs.reduce((sum, c) => sum + c.amount, 0);

  // Baseline 30-day normalized figures
  const baseDailySales = ((totalRev * (1 + salesGrowth)) / 30) * 0.4; // 40% immediate cash sales
  const baseDailyOpex = (totalOpex * (1 + opexReduction)) / 30; // normalized OpEx
  const baseDailyCogs = (totalCogs * (1 + cogsInflation)) / 30 * 0.3; // 30% immediate cash procurement

  // 3. Map scheduled AR collections by due date
  const arByDate: Record<string, number> = {};
  invoices.forEach((inv) => {
    if (inv.status !== 'lunas' && inv.status !== 'void' && inv.remainingAmount > 0) {
      const d = inv.dueDate || inv.date;
      arByDate[d] = (arByDate[d] || 0) + inv.remainingAmount;
    }
  });

  // 4. Map scheduled AP payments by due date
  const apByDate: Record<string, number> = {};
  purchaseBills.forEach((bill) => {
    if (bill.status !== 'lunas' && bill.status !== 'void' && bill.remainingAmount > 0) {
      const d = bill.dueDate || bill.date;
      apByDate[d] = (apByDate[d] || 0) + bill.remainingAmount;
    }
  });

  // 5. Generate daily/weekly projection points
  const dataPoints: DailyCashFlowForecastPoint[] = [];
  let runningCash = currentCashBalance;
  let lowestCashAmount = runningCash;
  let lowestCashPoint = {
    date: baseDate.toISOString().split('T')[0],
    amount: runningCash,
    dayOffset: 0,
    label: 'Hari Ini',
  };

  let totalProjectedInflows = 0;
  let totalProjectedOutflows = 0;
  let runwayDays = forecastDays;
  let hasHitZero = false;

  for (let day = 0; day <= forecastDays; day++) {
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + day);
    const dateStr = targetDate.toISOString().split('T')[0];
    const monthShort = targetDate.toLocaleDateString('id-ID', { month: 'short' });
    const dayNum = targetDate.getDate();
    const label = day === 0 ? 'Hari Ini' : `H+${day} (${dayNum} ${monthShort})`;

    const startCashForDay = runningCash;

    // Scheduled flows on this date
    const scheduledAr = arByDate[dateStr] || 0;
    const scheduledAp = apByDate[dateStr] || 0;

    // Daily operational flows (weekdays vs weekends)
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    const dailyInflow = (isWeekend ? baseDailySales * 1.3 : baseDailySales) + scheduledAr;
    const dailyOutflow = (isWeekend ? baseDailyOpex * 0.5 : baseDailyOpex) + baseDailyCogs + scheduledAp;

    if (day > 0) {
      runningCash = runningCash + dailyInflow - dailyOutflow;
      totalProjectedInflows += dailyInflow;
      totalProjectedOutflows += dailyOutflow;
    }

    if (runningCash < lowestCashAmount) {
      lowestCashAmount = runningCash;
      lowestCashPoint = {
        date: dateStr,
        amount: runningCash,
        dayOffset: day,
        label,
      };
    }

    if (runningCash <= 0 && !hasHitZero) {
      runwayDays = day;
      hasHitZero = true;
    }

    // Capture every 3 days + milestone days (day 0, 7, 14, 30, 60, 90) to maintain crisp charting
    if (day === 0 || day % 3 === 0 || day === 7 || day === 14 || day === 30 || day === 60 || day === 90) {
      dataPoints.push({
        dayOffset: day,
        date: dateStr,
        label,
        startingCash: Math.round(startCashForDay),
        projectedInflow: Math.round(dailyInflow),
        projectedOutflow: Math.round(dailyOutflow),
        netFlow: Math.round(dailyInflow - dailyOutflow),
        endingCash: Math.round(runningCash),
        isBelowSafetyThreshold: runningCash < safetyThreshold,
      });
    }
  }

  // Mark the lowest point on the data point closest to lowest offset
  dataPoints.forEach((pt) => {
    if (Math.abs(pt.dayOffset - lowestCashPoint.dayOffset) <= 2 && pt.endingCash <= lowestCashPoint.amount + 1000000) {
      pt.isLowestPoint = true;
    }
  });

  return {
    currentCashBalance: Math.round(currentCashBalance),
    safetyThreshold,
    lowestCashPoint,
    daysUntilLowest: lowestCashPoint.dayOffset,
    runwayDays: hasHitZero ? runwayDays : forecastDays,
    dataPoints,
    summary: {
      totalProjectedInflows: Math.round(totalProjectedInflows),
      totalProjectedOutflows: Math.round(totalProjectedOutflows),
      netCashChange90Days: Math.round(runningCash - currentCashBalance),
    },
  };
};

// ==========================================
// PRODUCT PROFITABILITY & SKU MATRIX ENGINE
// ==========================================

export interface ProductProfitabilityItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  qtySold: number;
  avgCost: number;
  salePrice: number;
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
  contributionSharePct: number;
  status: 'top_performer' | 'healthy' | 'thin_margin' | 'loss_making';
}

export interface ProductProfitabilitySummary {
  totalRevenue: number;
  totalCogs: number;
  totalGrossProfit: number;
  overallGrossMarginPct: number;
  topContributor: ProductProfitabilityItem | null;
  lowestMarginProduct: ProductProfitabilityItem | null;
  items: ProductProfitabilityItem[];
}

export const calculateProductProfitability = (
  products: Product[],
  stockMovements: StockMovement[],
  invoices?: SalesInvoice[]
): ProductProfitabilitySummary => {
  // Aggregate sales volume per product from stock movements and invoices
  const salesByProduct: Record<string, { qty: number; revenue: number; cogs: number }> = {};

  // Initialize all products
  products.forEach((p) => {
    salesByProduct[p.id] = { qty: 0, revenue: 0, cogs: 0 };
  });

  // Track stock movements of type 'out' or 'keluar'
  stockMovements.forEach((m) => {
    const isOut = m.type === 'out' || m.type === 'keluar' || m.referenceType === 'out' || m.referenceType === 'keluar';
    if (isOut && m.productId && salesByProduct[m.productId]) {
      const q = Math.abs(m.qtyChange || m.qty || 0);
      const prod = products.find((p) => p.id === m.productId);
      const unitPrice = m.unitPrice || (prod ? prod.salePrice : 0);
      const unitCost = m.unitCost || (prod ? prod.avgCost : 0);

      salesByProduct[m.productId].qty += q;
      salesByProduct[m.productId].revenue += q * unitPrice;
      salesByProduct[m.productId].cogs += q * unitCost;
    }
  });

  // If stock movements are sparse in demo, pull from sales invoices items
  if (invoices && invoices.length > 0) {
    invoices.forEach((inv) => {
      if (inv.status !== 'void') {
        inv.items.forEach((it) => {
          if (it.productId && salesByProduct[it.productId]) {
            // Avoid double counting if already counted in stock movements
            if (salesByProduct[it.productId].qty === 0) {
              const prod = products.find((p) => p.id === it.productId);
              const cost = prod ? prod.avgCost : (it.unitPrice * 0.7);
              salesByProduct[it.productId].qty += it.qty;
              salesByProduct[it.productId].revenue += it.qty * it.unitPrice;
              salesByProduct[it.productId].cogs += it.qty * cost;
            }
          }
        });
      }
    });
  }

  // Calculate profitability metrics for each product
  let totalRevenue = 0;
  let totalCogs = 0;
  let totalGrossProfit = 0;

  const rawItems: Omit<ProductProfitabilityItem, 'contributionSharePct'>[] = products.map((prod) => {
    const stat = salesByProduct[prod.id] || { qty: 0, revenue: 0, cogs: 0 };
    // If no transactions yet, compute hypothetical unit profitability based on 1 unit benchmark
    const qtySold = stat.qty > 0 ? stat.qty : 10; // Baseline demo volume
    const rev = stat.revenue > 0 ? stat.revenue : qtySold * prod.salePrice;
    const cogs = stat.cogs > 0 ? stat.cogs : qtySold * prod.avgCost;
    const grossProfit = rev - cogs;
    const grossMarginPct = rev > 0 ? Math.round((grossProfit / rev) * 100) : 0;

    totalRevenue += rev;
    totalCogs += cogs;
    totalGrossProfit += grossProfit;

    let status: ProductProfitabilityItem['status'] = 'healthy';
    if (grossMarginPct >= 35) status = 'top_performer';
    else if (grossMarginPct >= 20) status = 'healthy';
    else if (grossMarginPct > 0) status = 'thin_margin';
    else status = 'loss_making';

    return {
      productId: prod.id,
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      unit: prod.unit,
      qtySold,
      avgCost: prod.avgCost,
      salePrice: prod.salePrice,
      totalRevenue: Math.round(rev),
      totalCogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      grossMarginPct,
      status,
    };
  });

  // Calculate contribution share percentage
  const items: ProductProfitabilityItem[] = rawItems
    .map((it) => ({
      ...it,
      contributionSharePct: totalGrossProfit > 0 ? Math.round((it.grossProfit / totalGrossProfit) * 100) : 0,
    }))
    .sort((a, b) => b.grossProfit - a.grossProfit);

  const overallGrossMarginPct = totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 100) : 0;

  return {
    totalRevenue: Math.round(totalRevenue),
    totalCogs: Math.round(totalCogs),
    totalGrossProfit: Math.round(totalGrossProfit),
    overallGrossMarginPct,
    topContributor: items.length > 0 ? items[0] : null,
    lowestMarginProduct: items.length > 0 ? items[items.length - 1] : null,
    items,
  };
};
