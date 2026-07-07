"use client";

import { useDroppable } from "@dnd-kit/core";

const columnColors: Record<string, { bg: string; border: string; dot: string; header: string }> = {
  blue: { bg: "bg-blue-50/50 dark:bg-blue-950/50", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500", header: "text-blue-700 dark:text-blue-300" },
  amber: { bg: "bg-amber-50/50 dark:bg-amber-950/50", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500", header: "text-amber-700 dark:text-amber-300" },
  green: { bg: "bg-green-50/50 dark:bg-green-950/50", border: "border-green-200 dark:border-green-800", dot: "bg-green-500", header: "text-green-700 dark:text-green-300" },
  red: { bg: "bg-red-50/50 dark:bg-red-950/50", border: "border-red-200 dark:border-red-800", dot: "bg-red-500", header: "text-red-700 dark:text-red-300" },
};

export function KanbanColumn({
  id,
  title,
  color,
  count,
  children,
}: {
  id: string;
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = columnColors[color] || columnColors.blue;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 shrink-0 rounded-xl border ${colors.border} ${colors.bg} ${
        isOver ? "ring-2 ring-indigo-400 dark:ring-indigo-600" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-3 border-b border-inherit">
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <h3 className={`text-sm font-semibold ${colors.header}`}>{title}</h3>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">{count}</span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        {children}
        {count === 0 && (
          <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-8">Drop applications here</div>
        )}
      </div>
    </div>
  );
}
