import Decimal from 'decimal.js';

export interface TaxCalculationResult {
  dpp: number; // Dasar Pengenaan Pajak
  ppnRate: number; // e.g. 0.11 or 0.12
  ppnAmount: number;
  pph23Rate: number; // e.g. 0.02 (2% jasa)
  pph23Amount: number;
  pphFinalRate: number; // e.g. 0.005 (0.5% UMKM)
  pphFinalAmount: number;
  totalWithTax: number;
}

/**
 * Calculates Indonesian VAT (PPN 11% / 12%), PPh 23 (2%), and PPh UMKM 0.5%
 */
export function calculateIndonesianTaxes(
  subtotal: number,
  options: {
    applyPPN?: boolean;
    ppnRate?: number; // default 0.11
    applyPPh23?: boolean;
    applyPPhFinal?: boolean;
  } = {}
): TaxCalculationResult {
  const dppDec = new Decimal(subtotal);
  const ppnRate = options.ppnRate ?? 0.11;

  // PPN 11% or 12%
  const ppnAmountDec = options.applyPPN ? dppDec.times(ppnRate).toDecimalPlaces(0) : new Decimal(0);

  // PPh 23 (2% for services)
  const pph23AmountDec = options.applyPPh23 ? dppDec.times(0.02).toDecimalPlaces(0) : new Decimal(0);

  // PPh Final PP 23/2018 (0.5% of gross revenue for UMKM)
  const pphFinalAmountDec = options.applyPPhFinal ? dppDec.times(0.005).toDecimalPlaces(0) : new Decimal(0);

  const totalWithTaxDec = dppDec.plus(ppnAmountDec);

  return {
    dpp: dppDec.toNumber(),
    ppnRate,
    ppnAmount: ppnAmountDec.toNumber(),
    pph23Rate: 0.02,
    pph23Amount: pph23AmountDec.toNumber(),
    pphFinalRate: 0.005,
    pphFinalAmount: pphFinalAmountDec.toNumber(),
    totalWithTax: totalWithTaxDec.toNumber(),
  };
}

/**
 * Calculates UMKM monthly gross revenue tax (PP 23/2018: 0.5% of monthly gross revenue)
 */
export function calculateMonthlyUmkmTax(monthlyRevenue: number): number {
  return new Decimal(monthlyRevenue).times(0.005).toDecimalPlaces(0).toNumber();
}
