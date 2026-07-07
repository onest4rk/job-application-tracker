"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, ActivityLog, ApplicationNote } from "@/generated/prisma/client";
import { createApplication, getApplicationById, updateApplication, archiveApplication, deleteApplication } from "@/actions/applications";
import { createNote } from "@/actions/notes";
import { addTagToApplication, removeTagFromApplication } from "@/actions/tags";
import { formatDate, toDateInput } from "@/lib/utils";

interface AppData {
  id: string;
  companyName: string;
  role: string;
  location: string;
  status: string;
  priority: string;
  source: string;
  applicationDate: Date;
  jobUrl: string | null;
  salaryRange: string | null;
  notes: string | null;
  nextFollowUp: Date | null;
  lastContactDate: Date | null;
  contactName: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags: { tag: Tag }[];
  appNotes: ApplicationNote[];
  activityLogs: ActivityLog[];
}

const statuses = ["Applied", "Interview", "Offer", "Rejected"] as const;
const priorities = ["low", "medium", "high"] as const;
const sources = ["LinkedIn", "Indeed", "Company Site", "Referral", "Recruiter", "Other"] as const;

export function ApplicationModal({
  applicationId,
  onClose,
  tags,
}: {
  applicationId?: string;
  onClose: () => void;
  tags: Tag[];
}) {
  const router = useRouter();
  const isEditing = !!applicationId;
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState("");

  useEffect(() => {
    if (applicationId) {
      getApplicationById(applicationId).then(setAppData);
    }
  }, [applicationId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = isEditing
      ? await updateApplication(applicationId!, formData)
      : await createApplication(formData);

    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      onClose();
      router.refresh();
    }
  }

  async function handleArchive() {
    if (!applicationId) return;
    if (!confirm("Archive this application?")) return;
    await archiveApplication(applicationId);
    onClose();
    router.refresh();
  }

  async function handleDelete() {
    if (!applicationId) return;
    if (!confirm("Delete this application?")) return;
    await deleteApplication(applicationId);
    onClose();
    router.refresh();
  }

  async function handleAddNote() {
    if (!applicationId || !noteText.trim()) return;
    setAddingNote(true);
    const formData = new FormData();
    formData.set("content", noteText);
    formData.set("applicationId", applicationId);
    await createNote(formData);
    setNoteText("");
    setAddingNote(false);
    const updated = await getApplicationById(applicationId);
    setAppData(updated);
  }

  async function handleAddTag(tagId: string) {
    if (!applicationId || !tagId) return;
    const tag = tags.find((t) => t.id === tagId);
    if (!tag) return;
    await addTagToApplication(applicationId, tag.name);
    setSelectedTagId("");
    const updated = await getApplicationById(applicationId);
    setAppData(updated);
    router.refresh();
  }

  async function handleRemoveTag(tagId: string) {
    if (!applicationId) return;
    await removeTagFromApplication(applicationId, tagId);
    const updated = await getApplicationById(applicationId);
    setAppData(updated);
    router.refresh();
  }

  const appTagIds = new Set(
    (appData?.tags || []).map((t) => t.tag.id)
  );
  const availableTags = tags.filter((t) => !appTagIds.has(t.id));

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[85vh] overflow-y-auto dark:bg-zinc-950 dark:shadow-zinc-900/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {isEditing ? "Edit Application" : "New Application"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Company *</label>
              <input name="companyName" defaultValue={appData?.companyName} required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role *</label>
              <input name="role" defaultValue={appData?.role} required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Location *</label>
            <input name="location" defaultValue={appData?.location} required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
              <select name="status" defaultValue={appData?.status || "Applied"} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Priority</label>
              <select name="priority" defaultValue={appData?.priority || "medium"} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400">
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Source</label>
              <select name="source" defaultValue={appData?.source || "Company Site"} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400">
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Application Date</label>
              <input name="applicationDate" type="date" defaultValue={toDateInput(appData?.applicationDate)} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Job URL</label>
              <input name="jobUrl" type="url" defaultValue={appData?.jobUrl || ""} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Salary Range</label>
              <input name="salaryRange" defaultValue={appData?.salaryRange || ""} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" placeholder="e.g. $80k-$100k" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Next Follow-up</label>
              <input name="nextFollowUp" type="date" defaultValue={toDateInput(appData?.nextFollowUp)} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contact Name</label>
              <input name="contactName" defaultValue={appData?.contactName || ""} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Last Contact Date</label>
              <input name="lastContactDate" type="date" defaultValue={toDateInput(appData?.lastContactDate)} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Notes</label>
            <textarea name="notes" rows={3} defaultValue={appData?.notes || ""} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400" />
          </div>

          {appData && (
            <>
              {appData.tags?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {appData.tags.map((t) => {
                      const tag = t.tag;
                      return (
                        <span key={tag.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: tag.color + "20", color: tag.color }}>
                          {tag.name}
                          <button type="button" onClick={() => handleRemoveTag(tag.id)} className="hover:opacity-60">&times;</button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableTags.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={selectedTagId}
                    onChange={(e) => setSelectedTagId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400"
                  >
                    <option value="">Add a tag...</option>
                    {availableTags.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddTag(selectedTagId)}
                    disabled={!selectedTagId}
                    className="px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              )}

              <div className="bg-zinc-50 rounded-lg p-3 text-xs text-zinc-500 space-y-2 dark:bg-zinc-900 dark:text-zinc-400">
                {appData.activityLogs?.slice(0, 3).map((log) => (
                  <div key={log.id}>{formatDate(log.createdAt)} - {log.description || log.action}</div>
                ))}
                {appData.appNotes?.map((note) => (
                  <div key={note.id} className="italic">&ldquo;{note.content}&rdquo;</div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-2 py-1 border border-zinc-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addingNote}
                    className="px-2 py-1 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {addingNote ? "..." : "Add"}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {isEditing && (
                <>
                  <button type="button" onClick={handleArchive} className="px-3 py-1.5 text-xs font-medium text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800">Archive</button>
                  <button type="button" onClick={handleDelete} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950">Delete</button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50">
                {loading ? "Saving..." : isEditing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
