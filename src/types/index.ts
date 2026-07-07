import type { Application, Reminder, ApplicationNote, Tag, ActivityLog } from "@/generated/prisma/client";

export type ApplicationWithRelations = Application & {
  reminders: Reminder[];
  appNotes: ApplicationNote[];
  tags: (Tag & { applicationTag?: { tagId: string } })[];
  activityLogs: ActivityLog[];
};

export type Status = "Applied" | "Interview" | "Offer" | "Rejected";
export type Priority = "low" | "medium" | "high";

export interface DashboardStats {
  totalApplications: number;
  appliedThisWeek: number;
  interviewsScheduled: number;
  offers: number;
  followUpsDueToday: number;
  statusBreakdown: { name: string; value: number }[];
  weeklyTrend: { week: string; count: number }[];
  responseRate: number;
  avgTimeToInterview: number | null;
  avgTimeToOffer: number | null;
}
