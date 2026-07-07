"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { applicationSchema } from "@/lib/validations";

export async function createApplication(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = applicationSchema.safeParse({
    companyName: formData.get("companyName"),
    role: formData.get("role"),
    location: formData.get("location"),
    applicationDate: formData.get("applicationDate"),
    jobUrl: formData.get("jobUrl"),
    salaryRange: formData.get("salaryRange"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    source: formData.get("source"),
    nextFollowUp: formData.get("nextFollowUp"),
    lastContactDate: formData.get("lastContactDate"),
    contactName: formData.get("contactName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      companyName: data.companyName,
      role: data.role,
      location: data.location,
      applicationDate: data.applicationDate ? new Date(data.applicationDate) : new Date(),
      jobUrl: data.jobUrl || null,
      salaryRange: data.salaryRange || null,
      notes: data.notes || null,
      status: data.status,
      priority: data.priority,
      source: data.source,
      nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : null,
      contactName: data.contactName || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "created",
      description: `Applied to ${data.companyName} for ${data.role}`,
      userId: session.user.id,
      applicationId: application.id,
    },
  });

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  return { success: true, id: application.id };
}

export async function updateApplication(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Not found");

  const parsed = applicationSchema.safeParse({
    companyName: formData.get("companyName"),
    role: formData.get("role"),
    location: formData.get("location"),
    applicationDate: formData.get("applicationDate"),
    jobUrl: formData.get("jobUrl"),
    salaryRange: formData.get("salaryRange"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    source: formData.get("source"),
    nextFollowUp: formData.get("nextFollowUp"),
    lastContactDate: formData.get("lastContactDate"),
    contactName: formData.get("contactName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await prisma.application.update({
    where: { id },
    data: {
      companyName: data.companyName,
      role: data.role,
      location: data.location,
      applicationDate: data.applicationDate ? new Date(data.applicationDate) : undefined,
      jobUrl: data.jobUrl || null,
      salaryRange: data.salaryRange || null,
      notes: data.notes || null,
      status: data.status,
      priority: data.priority,
      source: data.source,
      nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : null,
      contactName: data.contactName || null,
    },
  });

  if (existing.status !== data.status) {
    await prisma.activityLog.create({
      data: {
        action: "status_change",
        description: `Status changed from ${existing.status} to ${data.status}`,
        userId: session.user.id,
        applicationId: id,
      },
    });
  }

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplicationStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Not found");

  await prisma.application.update({
    where: { id },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      action: "status_change",
      description: `Moved from ${existing.status} to ${status}`,
      userId: session.user.id,
      applicationId: id,
    },
  });

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function archiveApplication(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.application.updateMany({
    where: { id, userId: session.user.id },
    data: { archived: true },
  });

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteApplication(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.application.updateMany({
    where: { id, userId: session.user.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getApplications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.application.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: {
      reminders: true,
      appNotes: { orderBy: { createdAt: "desc" } },
      tags: { include: { tag: true } },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getApplicationById(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.application.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      reminders: true,
      appNotes: { orderBy: { createdAt: "desc" } },
      tags: { include: { tag: true } },
      activityLogs: { orderBy: { createdAt: "desc" } },
    },
  });
}
