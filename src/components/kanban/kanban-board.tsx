"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Application, Reminder, Tag } from "@/generated/prisma/client";
import { updateApplicationStatus } from "@/actions/applications";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { ApplicationModal } from "@/components/applications/application-modal";

const columns = [
  { id: "Applied", title: "Applied", color: "blue" },
  { id: "Interview", title: "Interview", color: "amber" },
  { id: "Offer", title: "Offer", color: "green" },
  { id: "Rejected", title: "Rejected", color: "red" },
];

export function KanbanBoard({
  applications,
  tags,
}: {
  applications: (Application & { reminders: Reminder[]; tags: { tag: Tag }[] })[];
  tags: Tag[];
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getColumnApps = (status: string) =>
    applications.filter((a) => a.status === status);

  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const appId = active.id as string;
    const newStatus = over.id as string;

    if (!["Applied", "Interview", "Offer", "Rejected"].includes(newStatus)) return;

    await updateApplicationStatus(appId, newStatus);
    router.refresh();
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Kanban Board</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-[calc(100%-4rem)] overflow-x-auto pb-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              count={getColumnApps(col.id).length}
            >
              {getColumnApps(col.id).map((app) => (
                <KanbanCard
                  key={app.id}
                  application={app}
                  onClick={() => setSelectedApp(app.id)}
                />
              ))}
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeApp ? (
            <div className="bg-white rounded-lg border border-indigo-300 shadow-lg p-3 w-64 dark:bg-zinc-950 dark:border-indigo-700 dark:shadow-zinc-900/50">
              <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{activeApp.companyName}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{activeApp.role}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedApp && (
        <ApplicationModal
          applicationId={selectedApp}
          onClose={() => setSelectedApp(null)}
          tags={tags}
        />
      )}
    </div>
  );
}
