"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export function AnalyticsContent({
  stats,
}: {
  stats: {
    total: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    successRate: number;
    statusBreakdown: { name: string; value: number }[];
  };
}) {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnalyticCard label="Total Applications" value={stats.total} />
        <AnalyticCard label="Response Rate" value={`${stats.responseRate}%`} />
        <AnalyticCard label="Interview Rate" value={`${stats.interviewRate}%`} />
        <AnalyticCard label="Offer Rate" value={`${stats.offerRate}%`} />
      </div>

      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.statusBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.statusBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Funnel Summary</h3>
        {stats.statusBreakdown.some((s) => s.value > 0) ? (
          <div className="space-y-2">
            {stats.statusBreakdown.map((s, i) => {
              const pct = stats.total > 0 ? (s.value / stats.total) * 100 : 0;
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-zinc-600 dark:text-zinc-400 font-medium">{s.name}</div>
                  <div className="flex-1 bg-zinc-100 rounded-full h-6 relative overflow-hidden dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <div className="w-16 text-sm text-zinc-700 dark:text-zinc-300 text-right font-medium">{s.value}</div>
                  <div className="w-12 text-xs text-zinc-400 dark:text-zinc-500 text-right">{Math.round(pct)}%</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">No data yet</div>
        )}
      </div>
    </div>
  );
}

function AnalyticCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{value}</div>
    </div>
  );
}
