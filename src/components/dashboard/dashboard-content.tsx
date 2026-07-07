"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import Link from "next/link";
import type { Reminder } from "@/generated/prisma/client";

interface Stats {
  totalApplications: number;
  appliedThisWeek: number;
  interviewsScheduled: number;
  offers: number;
  followUpsDueToday: number;
  statusBreakdown: { name: string; value: number }[];
  weeklyTrend: { week: string; count: number }[];
  responseRate: number;
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export function DashboardContent({
  stats,
  remindersDue,
  userName,
}: {
  stats: Stats;
  remindersDue: (Reminder & { application: { id: string; companyName: string; role: string } })[];
  userName?: string | null;
}) {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {userName ? `Welcome, ${userName}` : "Dashboard"}
        </h1>
        <Link
          href="/applications?new=true"
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
        >
          + Add Application
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.totalApplications} />
        <StatCard label="This Week" value={stats.appliedThisWeek} />
        <StatCard label="Interviews" value={stats.interviewsScheduled} />
        <StatCard label="Offers" value={stats.offers} />
        <StatCard label="Due Today" value={stats.followUpsDueToday} highlight />
      </div>

      {remindersDue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 dark:bg-amber-950 dark:border-amber-800">
          <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Due today</h2>
          <div className="space-y-1">
            {remindersDue.map((r) => (
              <div key={r.id} className="text-sm text-amber-700 dark:text-amber-300">
                <Link href={`/applications?id=${r.application.id}`} className="hover:underline font-medium">
                  {r.application.companyName}
                </Link>{" "}
                - {r.application.role}{r.note ? `: ${r.note}` : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Status Breakdown</h3>
          {stats.statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {stats.statusBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Weekly Trend</h3>
          {stats.weeklyTrend.some((w) => w.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MiniStat label="Response Rate" value={`${stats.responseRate}%`} />
        <MiniStat label="Interview Rate" value={stats.totalApplications > 0 ? `${Math.round((stats.interviewsScheduled / stats.totalApplications) * 100)}%` : "0%"} />
        <MiniStat label="Offer Rate" value={stats.totalApplications > 0 ? `${Math.round((stats.offers / stats.totalApplications) * 100)}%` : "0%"} />
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-white p-3 rounded-xl border ${highlight ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50" : "border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950"}`}>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</div>
      <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{value}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[200px] text-sm text-zinc-400 dark:text-zinc-500">
      No data yet
    </div>
  );
}
