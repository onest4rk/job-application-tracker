"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { noteSchema } from "@/lib/validations";

export async function createNote(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = noteSchema.safeParse({
    content: formData.get("content"),
    applicationId: formData.get("applicationId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await prisma.applicationNote.create({
    data: {
      userId: session.user.id,
      applicationId: data.applicationId,
      content: data.content,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "note_added",
      description: "Added a note",
      userId: session.user.id,
      applicationId: data.applicationId,
    },
  });

  revalidatePath("/applications");
  return { success: true };
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.applicationNote.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/applications");
  return { success: true };
}
