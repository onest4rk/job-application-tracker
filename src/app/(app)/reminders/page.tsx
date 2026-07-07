import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RemindersClient } from "@/components/reminders/reminders-client";

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id, completed: false, dismissed: false },
    include: {
      application: { select: { id: true, companyName: true, role: true, status: true } },
    },
    orderBy: { followUpDate: "asc" },
  });

  const completed = await prisma.reminder.findMany({
    where: { userId: session.user.id, completed: true },
    include: {
      application: { select: { id: true, companyName: true, role: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true, companyName: true, role: true },
    orderBy: { companyName: "asc" },
  });

  return (
    <RemindersClient
      reminders={reminders}
      completed={completed}
      applications={applications}
    />
  );
}
