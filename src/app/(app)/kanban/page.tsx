import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export default async function KanbanPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id, deletedAt: null, archived: false },
    include: {
      reminders: true,
      tags: { include: { tag: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return <KanbanBoard applications={applications} tags={tags} />;
}
