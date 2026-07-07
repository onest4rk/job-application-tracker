"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reminder, Application } from "@/generated/prisma/client";
import { createReminder, completeReminder, dismissReminder, deleteReminder } from "@/actions/reminders";
import { formatDate, isPast, isToday } from "@/lib/utils";

export function RemindersClient({
  reminders,
  completed,
  applications,
}: {
  reminders: (Reminder & { application: { id: string; companyName: string; role: string; status: string } })[];
  completed: (Reminder & { application: { id: string; companyName: string; role: string } })[];
  applications: Pick<Application, "id" | "companyName" | "role">[];
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createReminder(formData);
    setShowNew(false);
    router.refresh();
  }

  async function handleComplete(id: string) {
    await completeReminder(id);
    router.refresh();
  }

  async function handleDismiss(id: string) {
    await dismissReminder(id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this reminder?")) return;
    await deleteReminder(id);
    router.refresh();
  }

  const upcoming = reminders.filter((r) => !isPast(r.followUpDate) || isToday(r.followUpDate));
  const overdue = reminders.filter((r) => isPast(r.followUpDate) && !isToday(r.followUpDate));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Reminders</h1>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
        >
          + New Reminder
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white border border-zinc-200 rounded-xl p-4 mb-6 space-y-3 dark:bg-zinc-950 dark:border-zinc-800">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Application</label>
              <select name="applicationId" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                <option value="">Select...</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>{a.companyName} - {a.role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Follow-up Date</label>
              <input name="followUpDate" type="date" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
            </div>
          </div>
          <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Note</label>
            <input name="note" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500" placeholder="Optional note..." />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800">Cancel</button>
            <button type="submit" className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Create</button>
          </div>
        </form>
      )}

      {overdue.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Overdue ({overdue.length})</h2>
          <div className="space-y-2">
            {overdue.map((r) => (
              <ReminderRow key={r.id} reminder={r} onComplete={handleComplete} onDismiss={handleDismiss} onDelete={handleDelete} overdue />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">No upcoming reminders</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((r) => (
              <ReminderRow key={r.id} reminder={r} onComplete={handleComplete} onDismiss={handleDismiss} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Completed</h2>
          <div className="space-y-1">
            {completed.map((r) => (
              <div key={r.id} className="text-sm text-zinc-400 dark:text-zinc-500 line-through py-1.5 px-3">
                {r.application.companyName} - {r.note || "Follow-up"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReminderRow({
  reminder,
  onComplete,
  onDismiss,
  onDelete,
  overdue,
}: {
  reminder: Reminder & { application: { id: string; companyName: string; role: string } };
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  overdue?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-lg p-3 flex items-center justify-between dark:bg-zinc-950 ${
      overdue ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/30" : isToday(reminder.followUpDate) ? "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/30" : "border-zinc-200 dark:border-zinc-800"
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{reminder.application.companyName}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">• {reminder.application.role}</span>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Due {formatDate(reminder.followUpDate)}
          {reminder.note && ` — ${reminder.note}`}
        </div>
      </div>
      <div className="flex gap-1.5 ml-3">
        <button onClick={() => onComplete(reminder.id)} className="px-2 py-1 text-[11px] font-medium text-green-600 border border-green-200 rounded-md hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950">Done</button>
        <button onClick={() => onDismiss(reminder.id)} className="px-2 py-1 text-[11px] font-medium text-zinc-500 border border-zinc-200 rounded-md hover:bg-zinc-50 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800">Dismiss</button>
        <button onClick={() => onDelete(reminder.id)} className="px-2 py-1 text-[11px] font-medium text-red-500 border border-red-200 rounded-md hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950">Delete</button>
      </div>
    </div>
  );
}
