"use client";

import { Application, Reminder, ApplicationNote, ActivityLog, Tag } from "@/generated/prisma/client";
import { formatDate, statusColors, priorityColors, isPast, isToday } from "@/lib/utils";

export function ApplicationCard({
  application,
  onClick,
  isSelected,
}: {
  application: Application & {
    reminders: Reminder[];
    appNotes: ApplicationNote[];
    tags: { tag: Tag }[];
    activityLogs: ActivityLog[];
  };
  onClick: () => void;
  isSelected: boolean;
}) {
  const hasDueReminder = application.reminders.some(
    (r) => !r.completed && !r.dismissed && isPast(r.followUpDate) && !isToday(r.followUpDate)
  );
  const hasDueToday = application.reminders.some(
    (r) => !r.completed && !r.dismissed && isToday(r.followUpDate)
  );

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm dark:bg-zinc-950 dark:border-zinc-800 dark:hover:shadow-zinc-900/30 ${
        isSelected ? "border-indigo-300 ring-2 ring-indigo-100 dark:border-indigo-700 dark:ring-indigo-900" : "border-zinc-200 dark:border-zinc-800"
      } ${hasDueReminder ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/30" : ""} ${hasDueToday ? "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/30" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{application.companyName}</h3>
            {application.tags.map((t) => (
              <span
                key={t.tag.id}
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: t.tag.color + "20", color: t.tag.color }}
              >
                {t.tag.name}
              </span>
            ))}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{application.role} • {application.location}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[application.status] || ""}`}>
            {application.status}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[application.priority] || ""}`}>
            {application.priority}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
        <span>Applied {formatDate(application.applicationDate)}</span>
        {application.nextFollowUp && (
          <span className={isPast(application.nextFollowUp) && !isToday(application.nextFollowUp) ? "text-red-500 dark:text-red-400 font-medium" : ""}>
            Follow-up: {formatDate(application.nextFollowUp)}
          </span>
        )}
        {application.source && <span>via {application.source}</span>}
      </div>
    </div>
  );
}
