"use client";

import { useState } from "react";
import { Download, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildProjections, fmt, type FinancialAssumptions } from "@/lib/financial";

interface Props {
  data: FinancialAssumptions;
}

export function FinancialCard({ data }: Props) {
  const [exporting, setExporting] = useState(false);
  const proj = buildProjections(data);

  const summaryCards = [
    {
      label: "3-yr MRR",
      value: fmt(proj.finalMrr),
      sub:   `from ${fmt(data.startingMrr)}`,
    },
    {
      label: "Runway",
      value: proj.runway != null ? `${proj.runway} mo` : "Profitable",
      sub:   proj.runway != null ? "at current burn" : "Revenue > burn",
    },
    {
      label: "LTV:CAC",
      value: data.cac > 0 ? proj.ltvCacRatio.toFixed(1) : "N/A",
      sub:   data.cac > 0 && proj.ltvCacRatio >= 3 ? "Healthy" : "Needs work",
      good:  data.cac > 0 && proj.ltvCacRatio >= 3,
    },
    {
      label: "Break-even",
      value: proj.breakEvenMonth != null ? `Month ${proj.breakEvenMonth}` : "Now",
      sub:   "MRR = burn",
    },
  ];

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export-financial", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ assumptions: data, projections: proj }),
      });
      if (!res.ok) throw new Error("Export failed");

      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const filename = `${data.companyName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-financial-model.xlsx`;

      const a = document.createElement("a");
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-field-800 bg-field-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-field-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-sage-400" />
          <span className="text-sm font-medium text-field-200">{data.companyName} — Financial Model</span>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-lg bg-sage-400 px-3 py-1.5 text-xs font-medium text-field-950 transition-colors hover:bg-sage-300 disabled:opacity-50"
        >
          {exporting
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Download className="h-3.5 w-3.5" />
          }
          Export to Excel
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-px bg-field-800 sm:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-field-900 px-4 py-3">
            <p className="text-xs text-field-600">{c.label}</p>
            <p className={cn("mt-0.5 font-serif text-lg font-semibold", "good" in c && c.good ? "text-sage-400" : "text-field-100")}>
              {c.value}
            </p>
            <p className="text-xs text-field-600">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Quarterly table */}
      <div className="overflow-x-auto border-t border-field-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-field-800">
              {["Period", "Revenue", "Burn", "Profit / Loss", "Cash"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-field-600 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proj.quarters.map((row, i) => (
              <tr key={i} className="border-b border-field-800/50 last:border-0">
                <td className="px-3 py-2 font-mono text-field-500">{row.period}</td>
                <td className="px-3 py-2 text-field-300">{fmt(row.revenue)}</td>
                <td className="px-3 py-2 text-field-500">{fmt(row.burn)}</td>
                <td className={cn("px-3 py-2", row.profit >= 0 ? "text-sage-400" : "text-field-500")}>
                  {row.profit >= 0 ? "+" : ""}{fmt(row.profit)}
                </td>
                <td className="px-3 py-2 text-field-300">{fmt(row.cash)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
