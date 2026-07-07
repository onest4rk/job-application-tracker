"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { tagSchema } from "@/lib/validations";

export async function createTag(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = tagSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const existing = await prisma.tag.findFirst({
    where: { userId: session.user.id, name: data.name },
  });
  if (existing) return { error: "Tag already exists" };

  await prisma.tag.create({
    data: {
      userId: session.user.id,
      name: data.name,
      color: data.color || "#6366f1",
    },
  });

  revalidatePath("/applications");
  return { success: true };
}

export async function addTagToApplication(applicationId: string, tagName: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let tag = await prisma.tag.findFirst({
    where: { userId: session.user.id, name: tagName },
  });

  if (!tag) {
    tag = await prisma.tag.create({
      data: { userId: session.user.id, name: tagName },
    });
  }

  const existing = await prisma.applicationTag.findUnique({
    where: { applicationId_tagId: { applicationId, tagId: tag.id } },
  });

  if (!existing) {
    await prisma.applicationTag.create({
      data: { applicationId, tagId: tag.id },
    });
  }

  revalidatePath("/applications");
  return { success: true };
}

export async function removeTagFromApplication(applicationId: string, tagId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.applicationTag.deleteMany({
    where: { applicationId, tagId, tag: { userId: session.user.id } },
  });

  revalidatePath("/applications");
  return { success: true };
}

export async function getTags() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.tag.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { name: "asc" },
  });
}
