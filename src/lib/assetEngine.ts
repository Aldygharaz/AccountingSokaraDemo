import Decimal from 'decimal.js';

export interface FixedAsset {
  id: string;
  code: string;
  name: string;
  category: 'peralatan' | 'kendaraan' | 'bangunan' | 'elektronik';
  acquisitionDate: string;
  acquisitionCost: number;
  salvageValue: number;
  usefulLifeMonths: number; // e.g. 48 months (4 years)
  assetAccountId: string; // e.g. 1201 Peralatan Toko
  accumulatedDeprAccountId: string; // e.g. 1202 Akumulasi Penyusutan
  deprExpenseAccountId: string; // e.g. 6103 Beban Penyusutan
  accumulatedDepreciation: number;
  netBookValue: number;
  lastDepreciationDate?: string;
}

/**
 * Calculates monthly straight line depreciation
 * (Acquisition Cost - Salvage Value) / Useful Life in Months
 */
export function calculateMonthlyDepreciation(asset: {
  acquisitionCost: number;
  salvageValue: number;
  usefulLifeMonths: number;
}): number {
  if (asset.usefulLifeMonths <= 0) return 0;
  const cost = new Decimal(asset.acquisitionCost);
  const salvage = new Decimal(asset.salvageValue);
  const depreciableBase = cost.minus(salvage);
  if (depreciableBase.lessThanOrEqualTo(0)) return 0;

  return depreciableBase.dividedBy(asset.usefulLifeMonths).toDecimalPlaces(0).toNumber();
}

/**
 * Generates an asset depreciation schedule across its useful life
 */
export function generateDepreciationSchedule(
  asset: FixedAsset,
  monthsToProject: number = 12
): {
  monthIndex: number;
  date: string;
  monthlyExpense: number;
  accumulated: number;
  netBookValue: number;
}[] {
  const monthly = calculateMonthlyDepreciation(asset);
  const schedule = [];
  let currentAccum = new Decimal(asset.accumulatedDepreciation);
  const cost = new Decimal(asset.acquisitionCost);

  const startDate = new Date(asset.acquisitionDate);

  for (let i = 1; i <= monthsToProject; i++) {
    const periodDate = new Date(startDate);
    periodDate.setMonth(periodDate.getMonth() + i);

    currentAccum = currentAccum.plus(monthly);
    const maxDepr = cost.minus(asset.salvageValue);
    if (currentAccum.greaterThan(maxDepr)) {
      currentAccum = maxDepr;
    }

    const nbv = cost.minus(currentAccum);

    schedule.push({
      monthIndex: i,
      date: periodDate.toISOString().split('T')[0],
      monthlyExpense: monthly,
      accumulated: currentAccum.toNumber(),
      netBookValue: nbv.toNumber(),
    });
  }

  return schedule;
}
