"use client";

import { useDraggable } from "@dnd-kit/core";
import { Application, Reminder, Tag } from "@/generated/prisma/client";
import { formatDateShort, isPast, isToday, priorityColors } from "@/lib/utils";

export function KanbanCard({
  application,
  onClick,
}: {
  application: Application & { reminders: Reminder[]; tags: { tag: Tag }[] };
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const hasOverdue = application.reminders.some(
    (r) => !r.completed && !r.dismissed && isPast(r.followUpDate) && !isToday(r.followUpDate)
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm dark:bg-zinc-950 dark:border-zinc-800 dark:hover:shadow-zinc-900/30 ${
        isDragging ? "shadow-lg opacity-80 border-indigo-300 dark:shadow-zinc-900/50 dark:border-indigo-700" : "border-zinc-200 dark:border-zinc-800"
      } ${hasOverdue ? "border-l-2 border-l-red-400" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{application.companyName}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{application.role}</div>
        </div>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityColors[application.priority] || ""}`}>
          {application.priority}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mt-1.5">
        {application.tags.slice(0, 3).map((t) => (
          <span key={t.tag.id} className="text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: t.tag.color + "20", color: t.tag.color }}>
            {t.tag.name}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
        <span>{formatDateShort(application.applicationDate)}</span>
        {application.nextFollowUp && (
          <span className={isPast(application.nextFollowUp) ? "text-red-500 dark:text-red-400 font-medium" : ""}>
            • {formatDateShort(application.nextFollowUp)}
          </span>
        )}
      </div>
    </div>
  );
}
