import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalApplications,
    appliedThisWeek,
    interviewsScheduled,
    offers,
    followUpsDueToday,
  ] = await Promise.all([
    prisma.application.count({ where: { userId, deletedAt: null } }),
    prisma.application.count({ where: { userId, deletedAt: null, applicationDate: { gte: weekAgo } } }),
    prisma.application.count({ where: { userId, deletedAt: null, status: "Interview" } }),
    prisma.application.count({ where: { userId, deletedAt: null, status: "Offer" } }),
    prisma.reminder.count({ where: { userId, completed: false, dismissed: false, followUpDate: { gte: today, lt: tomorrow } } }),
  ]);

  const statusData = await prisma.application.groupBy({
    by: ["status"],
    where: { userId, deletedAt: null },
    _count: true,
  });

  const statusBreakdown = statusData.map((s) => ({
    name: s.status,
    value: s._count,
  }));

  const weeklyApps = await prisma.application.findMany({
    where: { userId, deletedAt: null },
    select: { applicationDate: true },
    orderBy: { applicationDate: "asc" },
  });

  const weeks: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const weekKey = `${d.getFullYear()}-W${String(Math.ceil((d.getDate() + 6 - d.getDay()) / 7)).padStart(2, "0")}`;
    weeks[weekKey] = 0;
  }
  weeklyApps.forEach((a) => {
    const d = new Date(a.applicationDate);
    const weekKey = `${d.getFullYear()}-W${String(Math.ceil((d.getDate() + 6 - d.getDay()) / 7)).padStart(2, "0")}`;
    if (weeks[weekKey] !== undefined) weeks[weekKey]++;
  });
  const weeklyTrend = Object.entries(weeks).map(([week, count]) => ({ week, count }));

  const totalWithResponse = totalApplications > 0
    ? ((interviewsScheduled + offers) / totalApplications) * 100
    : 0;

  const remindersDue = await prisma.reminder.findMany({
    where: { userId, completed: false, dismissed: false, followUpDate: { gte: today, lt: tomorrow } },
    include: { application: { select: { id: true, companyName: true, role: true } } },
    orderBy: { followUpDate: "asc" },
  });

  return (
    <DashboardContent
      stats={{
        totalApplications,
        appliedThisWeek,
        interviewsScheduled,
        offers,
        followUpsDueToday,
        statusBreakdown,
        weeklyTrend,
        responseRate: Math.round(totalWithResponse * 10) / 10,
      }}
      remindersDue={remindersDue}
      userName={session.user?.name}
    />
  );
}
