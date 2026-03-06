"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface Inputs {
  startingMrr: number;
  growthRate: number;
  cac: number;
  ltv: number;
  burn: number;
  cash: number;
}

const DEFAULTS: Inputs = {
  startingMrr: 10000,
  growthRate: 10,
  cac: 500,
  ltv: 3000,
  burn: 40000,
  cash: 200000,
};

function buildProjections(inputs: Inputs) {
  const months = 12;
  const data = [];
  let mrr = inputs.startingMrr;
  let cumulativeCash = inputs.cash;

  for (let i = 0; i <= months; i++) {
    const revenue = mrr;
    const profit = revenue - inputs.burn;
    cumulativeCash += profit;

    data.push({
      month: i === 0 ? "Now" : `M${i}`,
      revenue: Math.round(revenue),
      burn: inputs.burn,
      profit: Math.round(profit),
      cash: Math.max(0, Math.round(cumulativeCash)),
    });

    mrr = mrr * (1 + inputs.growthRate / 100);
  }
  return data;
}

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val}`;
}

function InputField({
  label, value, onChange, prefix, suffix, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs text-field-500">{label}</label>
      <div className="flex items-center rounded-lg border border-field-700 bg-field-900 overflow-hidden focus-within:border-field-600 transition-colors">
        {prefix && <span className="px-3 text-sm text-field-600 border-r border-field-700 py-2.5 bg-field-900">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-field-200 focus:outline-none min-w-0"
        />
        {suffix && <span className="px-3 text-sm text-field-600 border-l border-field-700 py-2.5 bg-field-900">{suffix}</span>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-field-700 bg-field-900 px-4 py-3 text-xs shadow-xl">
      <p className="font-medium text-field-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-field-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-field-200">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ModelPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);

  function set(key: keyof Inputs, val: number) {
    setInputs((p) => ({ ...p, [key]: val }));
  }

  const data = useMemo(() => buildProjections(inputs), [inputs]);

  const finalMrr = data[data.length - 1].revenue;
  const runway = inputs.burn > inputs.startingMrr
    ? Math.round(inputs.cash / (inputs.burn - inputs.startingMrr))
    : null;
  const ltvCacRatio = inputs.cac > 0 ? (inputs.ltv / inputs.cac).toFixed(1) : "N/A";
  const breakEvenMonth = data.findIndex((d) => d.revenue >= inputs.burn);

  const summaryCards = [
    { label: "12-mo MRR",  value: formatCurrency(finalMrr),                               sub: `from ${formatCurrency(inputs.startingMrr)}` },
    { label: "Runway",     value: runway != null ? `${runway} mo` : "Profitable",          sub: runway != null ? "at current burn" : "Revenue > burn" },
    { label: "LTV:CAC",   value: ltvCacRatio,                                              sub: ltvCacRatio !== "N/A" && Number(ltvCacRatio) >= 3 ? "Healthy" : "Needs work" },
    { label: "Break-even", value: breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : "Now", sub: "Revenue = burn" },
  ];

  return (
    <div className="min-h-screen bg-field-950 text-field-200">
      <header className="flex items-center gap-4 border-b border-field-800 px-5 py-3.5">
        <Link href="/" className="text-field-600 hover:text-field-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="font-serif text-sm font-semibold text-field-300">Folio</span>
        <span className="text-field-700">/</span>
        <span className="text-sm text-field-500">Financial Model</span>
      </header>

      <main className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="font-serif text-2xl font-semibold text-field-100 mb-1">Financial model</h1>
            <p className="text-sm text-field-500">Adjust assumptions, see projections update in real time.</p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Inputs */}
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-field-600">Revenue</p>
                <InputField label="Starting MRR" value={inputs.startingMrr} onChange={(v) => set("startingMrr", v)} prefix="$" />
                <InputField label="Monthly growth rate" value={inputs.growthRate} onChange={(v) => set("growthRate", v)} suffix="%" step={0.5} />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-field-600">Unit Economics</p>
                <InputField label="Customer acquisition cost" value={inputs.cac} onChange={(v) => set("cac", v)} prefix="$" />
                <InputField label="Lifetime value (LTV)" value={inputs.ltv} onChange={(v) => set("ltv", v)} prefix="$" />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-field-600">Cash & Burn</p>
                <InputField label="Monthly burn" value={inputs.burn} onChange={(v) => set("burn", v)} prefix="$" />
                <InputField label="Cash on hand" value={inputs.cash} onChange={(v) => set("cash", v)} prefix="$" />
              </div>
            </div>

            {/* Output */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {summaryCards.map((c) => (
                  <div key={c.label} className="rounded-xl border border-field-800 bg-field-900 p-4">
                    <p className="text-xs text-field-600 mb-1">{c.label}</p>
                    <p className="font-serif text-xl font-semibold text-field-100">{c.value}</p>
                    <p className="text-xs text-field-600 mt-0.5">{c.sub}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-field-800 bg-field-900 p-5">
                <p className="text-sm text-field-400 mb-5">Revenue vs. Burn</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#96a470" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#96a470" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#484840" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#484840" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#222220" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "#484840", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#484840", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#606050" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#96a470" strokeWidth={1.5} fill="url(#revenueGrad)" name="revenue" dot={false} />
                    <Area type="monotone" dataKey="burn"    stroke="#484840" strokeWidth={1.5} fill="url(#burnGrad)"    name="burn"    dot={false} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-field-800 bg-field-900 p-5">
                <p className="text-sm text-field-400 mb-5">Cash runway</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#222220" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "#484840", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#484840", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="cash" stroke="#8c8a74" strokeWidth={1.5} dot={false} name="cash" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-field-800 bg-field-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-field-800">
                        {["Month", "MRR", "Burn", "Profit/Loss", "Cash"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs text-field-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, i) => (
                        <tr key={i} className="border-b border-field-800/50 last:border-0">
                          <td className="px-4 py-2.5 text-field-500 font-mono text-xs">{row.month}</td>
                          <td className="px-4 py-2.5 text-field-300">{formatCurrency(row.revenue)}</td>
                          <td className="px-4 py-2.5 text-field-500">{formatCurrency(row.burn)}</td>
                          <td className={cn("px-4 py-2.5", row.profit >= 0 ? "text-sage-400" : "text-field-500")}>
                            {row.profit >= 0 ? "+" : ""}{formatCurrency(row.profit)}
                          </td>
                          <td className="px-4 py-2.5 text-field-300">{formatCurrency(row.cash)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
