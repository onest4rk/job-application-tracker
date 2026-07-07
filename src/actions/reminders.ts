"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reminderSchema } from "@/lib/validations";

export async function createReminder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = reminderSchema.safeParse({
    followUpDate: formData.get("followUpDate"),
    note: formData.get("note"),
    applicationId: formData.get("applicationId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await prisma.reminder.create({
    data: {
      userId: session.user.id,
      applicationId: data.applicationId,
      followUpDate: new Date(data.followUpDate),
      note: data.note || null,
    },
  });

  await prisma.application.update({
    where: { id: data.applicationId },
    data: { nextFollowUp: new Date(data.followUpDate) },
  });

  revalidatePath("/reminders");
  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeReminder(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.reminder.updateMany({
    where: { id, userId: session.user.id },
    data: { completed: true },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function dismissReminder(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.reminder.updateMany({
    where: { id, userId: session.user.id },
    data: { dismissed: true },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteReminder(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.reminder.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/reminders");
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getReminders() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.reminder.findMany({
    where: { userId: session.user.id, completed: false, dismissed: false },
    include: {
      application: {
        select: { id: true, companyName: true, role: true, status: true },
      },
    },
    orderBy: { followUpDate: "asc" },
  });
}

export async function getRemindersDueToday() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.reminder.findMany({
    where: {
      userId: session.user.id,
      completed: false,
      dismissed: false,
      followUpDate: { gte: today, lt: tomorrow },
    },
    include: {
      application: {
        select: { id: true, companyName: true, role: true },
      },
    },
    orderBy: { followUpDate: "asc" },
  });
}
