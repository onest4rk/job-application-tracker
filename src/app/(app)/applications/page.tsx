import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationsClient } from "@/components/applications/applications-client";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: {
      reminders: true,
      appNotes: { orderBy: { createdAt: "desc" }, take: 3 },
      tags: { include: { tag: true } },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return <ApplicationsClient applications={applications} tags={tags} />;
}
