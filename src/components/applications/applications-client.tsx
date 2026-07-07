"use client";

import { useState, useMemo } from "react";
import { Application, Reminder, ApplicationNote, ActivityLog, Tag } from "@/generated/prisma/client";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplicationModal } from "@/components/applications/application-modal";


export function ApplicationsClient({
  applications,
  tags,
}: {
  applications: (Application & {
    reminders: Reminder[];
    appNotes: ApplicationNote[];
    tags: { tag: Tag }[];
    activityLogs: ActivityLog[];
  })[];
  tags: Tag[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updatedAt" | "companyName" | "applicationDate">("updatedAt");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = useMemo(() => {
    let items = [...applications];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.companyName.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      items = items.filter((a) => a.status === statusFilter);
    }

    items.sort((a, b) => {
      if (sortBy === "companyName") return a.companyName.localeCompare(b.companyName);
      if (sortBy === "applicationDate") return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return items;
  }, [applications, search, statusFilter, sortBy]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Applications</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
        >
          + New Application
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400"
        >
          <option value="all">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400"
        >
          <option value="updatedAt">Last updated</option>
          <option value="companyName">Company name</option>
          <option value="applicationDate">Application date</option>
        </select>
      </div>

      {filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 dark:text-zinc-500">
          <p className="text-lg">No applications found</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Add your first application
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onClick={() => setSelectedApp(app.id === selectedApp ? null : app.id)}
              isSelected={app.id === selectedApp}
            />
          ))}
        </div>
      )}

      {showNewModal && (
        <ApplicationModal
          onClose={() => setShowNewModal(false)}
          tags={tags}
        />
      )}

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
