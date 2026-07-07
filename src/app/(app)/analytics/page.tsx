import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsContent } from "@/components/analytics/analytics-content";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const applications = await prisma.application.findMany({
    where: { userId, deletedAt: null },
    select: { status: true, applicationDate: true, createdAt: true },
    orderBy: { applicationDate: "asc" },
  });

  const total = applications.length;
  const statusBreakdown = [
    { name: "Applied", value: applications.filter((a) => a.status === "Applied").length },
    { name: "Interview", value: applications.filter((a) => a.status === "Interview").length },
    { name: "Offer", value: applications.filter((a) => a.status === "Offer").length },
    { name: "Rejected", value: applications.filter((a) => a.status === "Rejected").length },
  ];

  const interviews = statusBreakdown.find((s) => s.name === "Interview")?.value || 0;
  const offers = statusBreakdown.find((s) => s.name === "Offer")?.value || 0;
  const rejected = statusBreakdown.find((s) => s.name === "Rejected")?.value || 0;

  const responseRate = total > 0 ? ((interviews + offers + rejected) / total) * 100 : 0;
  const interviewRate = total > 0 ? (interviews / total) * 100 : 0;
  const offerRate = total > 0 ? (offers / total) * 100 : 0;
  const successRate = interviews > 0 ? (offers / interviews) * 100 : 0;

  return (
    <AnalyticsContent
      stats={{
        total,
        responseRate: Math.round(responseRate * 10) / 10,
        interviewRate: Math.round(interviewRate * 10) / 10,
        offerRate: Math.round(offerRate * 10) / 10,
        successRate: Math.round(successRate * 10) / 10,
        statusBreakdown,
      }}
    />
  );
}
