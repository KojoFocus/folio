export interface FinancialAssumptions {
  companyName:      string;
  startingMrr:      number;
  monthlyGrowthRate: number; // percentage, e.g. 10 = 10%
  cac:              number;
  ltv:              number;
  monthlyBurn:      number;
  cashOnHand:       number;
  churnRate:        number;  // percentage, e.g. 2 = 2%
}

export interface QuarterRow {
  period:  string;
  revenue: number;
  burn:    number;
  profit:  number;
  cash:    number;
}

export interface FinancialProjections {
  quarters:      QuarterRow[];
  runway:        number | null; // months, null = profitable
  ltvCacRatio:   number;
  breakEvenMonth: number | null; // null = already profitable
  finalMrr:      number;
}

/** Build 12 quarters (3 years) of projections from monthly assumptions. */
export function buildProjections(a: FinancialAssumptions): FinancialProjections {
  const quarterCount = 12; // 3 years
  const quarters: QuarterRow[] = [];

  let mrr  = a.startingMrr;
  let cash = a.cashOnHand;

  // Track monthly data to find break-even month
  let breakEvenMonth: number | null = null;
  let tempMrr = a.startingMrr;
  for (let m = 1; m <= 36; m++) {
    if (tempMrr >= a.monthlyBurn && breakEvenMonth === null) {
      breakEvenMonth = m;
    }
    tempMrr *= (1 + a.monthlyGrowthRate / 100) * (1 - a.churnRate / 100);
  }

  // Build quarterly rows (each quarter = 3 months aggregated)
  let tempMrr2 = a.startingMrr;
  let tempCash = a.cashOnHand;

  for (let q = 0; q < quarterCount; q++) {
    const year    = Math.floor(q / 4) + 1;
    const quarter = (q % 4) + 1;
    const label   = `Y${year} Q${quarter}`;

    let qRevenue = 0;
    let qProfit  = 0;

    for (let m = 0; m < 3; m++) {
      const rev     = tempMrr2;
      const profit  = rev - a.monthlyBurn;
      qRevenue     += rev;
      qProfit      += profit;
      tempCash     += profit;
      tempMrr2      = tempMrr2 * (1 + a.monthlyGrowthRate / 100) * (1 - a.churnRate / 100);
    }

    quarters.push({
      period:  label,
      revenue: Math.round(qRevenue),
      burn:    a.monthlyBurn * 3,
      profit:  Math.round(qProfit),
      cash:    Math.max(0, Math.round(tempCash)),
    });
  }

  const runway =
    a.monthlyBurn > a.startingMrr
      ? Math.round(a.cashOnHand / (a.monthlyBurn - a.startingMrr))
      : null;

  const ltvCacRatio = a.cac > 0 ? a.ltv / a.cac : 0;
  const finalMrr    = quarters[quarters.length - 1].revenue / 3;

  return { quarters, runway, ltvCacRatio, breakEvenMonth, finalMrr };
}

export function fmt(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}k`;
  return `$${Math.round(val)}`;
}
