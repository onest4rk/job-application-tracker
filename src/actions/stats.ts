"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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
    applications,
  ] = await Promise.all([
    prisma.application.count({
      where: { userId, deletedAt: null },
    }),
    prisma.application.count({
      where: {
        userId,
        deletedAt: null,
        applicationDate: { gte: weekAgo },
      },
    }),
    prisma.application.count({
      where: {
        userId,
        deletedAt: null,
        status: "Interview",
      },
    }),
    prisma.application.count({
      where: {
        userId,
        deletedAt: null,
        status: "Offer",
      },
    }),
    prisma.reminder.count({
      where: {
        userId,
        completed: false,
        dismissed: false,
        followUpDate: { gte: today, lt: tomorrow },
      },
    }),
    prisma.application.findMany({
      where: { userId, deletedAt: null },
      select: { status: true, applicationDate: true, createdAt: true },
      orderBy: { applicationDate: "asc" },
    }),
  ]);

  const statusBreakdown = [
    { name: "Applied", value: applications.filter((a) => a.status === "Applied").length },
    { name: "Interview", value: applications.filter((a) => a.status === "Interview").length },
    { name: "Offer", value: applications.filter((a) => a.status === "Offer").length },
    { name: "Rejected", value: applications.filter((a) => a.status === "Rejected").length },
  ];

  const weeks: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
    weeks[weekKey] = 0;
  }
  applications.forEach((a) => {
    const d = new Date(a.applicationDate);
    const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
    if (weeks[weekKey] !== undefined) weeks[weekKey]++;
  });
  const weeklyTrend = Object.entries(weeks).map(([week, count]) => ({ week, count }));

  const statusChanges = await prisma.activityLog.findMany({
    where: {
      userId,
      action: "status_change",
    },
    select: { createdAt: true, description: true },
    orderBy: { createdAt: "asc" },
  });

  const interviews = statusChanges.filter((s) => s.description?.includes("to Interview"));
  const offers2 = statusChanges.filter((s) => s.description?.includes("to Offer"));
  const totalWithInterviews = interviews.length;
  const totalWithOffers = offers2.length;

  const responseRate = totalApplications > 0
    ? ((interviewsScheduled + offers) / totalApplications) * 100
    : 0;

  let avgTimeToInterview = null;
  if (totalWithInterviews > 0 && applications.length > 0) {
    avgTimeToInterview = 0;
  }

  let avgTimeToOffer = null;
  if (totalWithOffers > 0 && applications.length > 0) {
    avgTimeToOffer = 0;
  }

  return {
    totalApplications,
    appliedThisWeek,
    interviewsScheduled,
    offers,
    followUpsDueToday,
    statusBreakdown,
    weeklyTrend,
    responseRate: Math.round(responseRate * 10) / 10,
    avgTimeToInterview,
    avgTimeToOffer,
  };
}
