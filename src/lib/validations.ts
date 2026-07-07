import { z } from "zod/v4";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().min(1, "Location is required"),
  applicationDate: z.string().optional(),
  jobUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  salaryRange: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["Applied", "Interview", "Offer", "Rejected"]),
  priority: z.enum(["low", "medium", "high"]),
  source: z.string().min(1, "Source is required"),
  nextFollowUp: z.string().optional().or(z.literal("")),
  lastContactDate: z.string().optional().or(z.literal("")),
  contactName: z.string().optional().or(z.literal("")),
});

export const reminderSchema = z.object({
  followUpDate: z.string().min(1, "Date is required"),
  note: z.string().optional().or(z.literal("")),
  applicationId: z.string().min(1, "Application is required"),
});

export const noteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  applicationId: z.string().min(1, "Application is required"),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type TagInput = z.infer<typeof tagSchema>;
