import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { buildProjections, type FinancialAssumptions, type FinancialProjections } from "@/lib/financial";

export async function POST(req: NextRequest) {
  const { assumptions, projections: _proj }: {
    assumptions:  FinancialAssumptions;
    projections?: FinancialProjections;
  } = await req.json();

  // Always recompute server-side — don't trust client projections
  const proj = buildProjections(assumptions);

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Assumptions ──────────────────────────────────────────────────
  const assumptionRows = [
    ["Assumption", "Value"],
    ["Company Name",        assumptions.companyName],
    ["Starting MRR ($)",    assumptions.startingMrr],
    ["Monthly Growth Rate (%)", assumptions.monthlyGrowthRate],
    ["CAC ($)",             assumptions.cac],
    ["LTV ($)",             assumptions.ltv],
    ["Monthly Burn ($)",    assumptions.monthlyBurn],
    ["Cash on Hand ($)",    assumptions.cashOnHand],
    ["Churn Rate (%)",      assumptions.churnRate],
    [],
    ["Key Metrics", ""],
    ["LTV:CAC Ratio",       assumptions.cac > 0 ? (assumptions.ltv / assumptions.cac).toFixed(2) : "N/A"],
    ["Runway (months)",     proj.runway ?? "Profitable"],
    ["Break-even Month",    proj.breakEvenMonth ?? "Already profitable"],
    ["Final MRR ($)",       Math.round(proj.finalMrr)],
  ];
  const wsAssumptions = XLSX.utils.aoa_to_sheet(assumptionRows);
  wsAssumptions["!cols"] = [{ wch: 26 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsAssumptions, "Assumptions");

  // ── Sheet 2: Quarterly Projections ────────────────────────────────────────
  const header = ["Period", "Revenue ($)", "Burn ($)", "Profit / Loss ($)", "Cash ($)"];
  const rows   = proj.quarters.map((r) => [r.period, r.revenue, r.burn, r.profit, r.cash]);
  const wsProj = XLSX.utils.aoa_to_sheet([header, ...rows]);
  wsProj["!cols"] = [{ wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsProj, "Projections");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${assumptions.companyName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-financial-model.xlsx"`,
    },
  });
}
