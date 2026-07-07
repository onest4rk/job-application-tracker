import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@jobtrackr.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@jobtrackr.com",
      password,
      settings: {
        create: { emailNotifications: true },
      },
    },
  });

  await Promise.all([
    prisma.tag.upsert({ where: { userId_name: { userId: user.id, name: "remote" } }, update: {}, create: { userId: user.id, name: "remote", color: "#6366f1" } }),
    prisma.tag.upsert({ where: { userId_name: { userId: user.id, name: "onsite" } }, update: {}, create: { userId: user.id, name: "onsite", color: "#f59e0b" } }),
    prisma.tag.upsert({ where: { userId_name: { userId: user.id, name: "dream job" } }, update: {}, create: { userId: user.id, name: "dream job", color: "#10b981" } }),
    prisma.tag.upsert({ where: { userId_name: { userId: user.id, name: "urgent" } }, update: {}, create: { userId: user.id, name: "urgent", color: "#ef4444" } }),
  ]);

  const apps = [
    { companyName: "Stripe", role: "Software Engineer", location: "San Francisco, CA", status: "Applied", priority: "high", source: "Company Site", applicationDate: new Date("2026-06-15") },
    { companyName: "Vercel", role: "Frontend Engineer", location: "Remote", status: "Interview", priority: "high", source: "Referral", applicationDate: new Date("2026-06-10"), nextFollowUp: new Date("2026-07-10") },
    { companyName: "Linear", role: "Product Engineer", location: "Remote", status: "Interview", priority: "medium", source: "LinkedIn", applicationDate: new Date("2026-06-08") },
    { companyName: "Notion", role: "Full Stack Developer", location: "New York, NY", status: "Applied", priority: "medium", source: "Company Site", applicationDate: new Date("2026-06-20") },
    { companyName: "Figma", role: "Design Engineer", location: "San Francisco, CA", status: "Offer", priority: "high", source: "Recruiter", applicationDate: new Date("2026-05-20") },
    { companyName: "GitHub", role: "Developer Advocate", location: "Remote", status: "Rejected", priority: "low", source: "LinkedIn", applicationDate: new Date("2026-05-25") },
    { companyName: "Railway", role: "Software Engineer", location: "Remote", status: "Applied", priority: "medium", source: "Indeed", applicationDate: new Date("2026-06-22") },
    { companyName: "Supabase", role: "Backend Engineer", location: "Remote", status: "Interview", priority: "high", source: "Company Site", applicationDate: new Date("2026-06-05"), nextFollowUp: new Date("2026-07-08") },
    { companyName: "Cal.com", role: "Open Source Engineer", location: "Remote", status: "Applied", priority: "low", source: "LinkedIn", applicationDate: new Date("2026-06-18") },
    { companyName: "Raycast", role: "Extension Developer", location: "Remote", status: "Applied", priority: "medium", source: "Company Site", applicationDate: new Date("2026-06-25") },
  ];

  for (const appData of apps) {
    const app = await prisma.application.create({
      data: { userId: user.id, ...appData },
    });

    await prisma.activityLog.create({
      data: {
        action: "created",
        description: `Applied to ${appData.companyName} for ${appData.role}`,
        userId: user.id,
        applicationId: app.id,
      },
    });
  }

  const vercelApp = await prisma.application.findFirst({ where: { companyName: "Vercel", userId: user.id } });
  if (vercelApp) {
    await prisma.reminder.create({
      data: {
        userId: user.id,
        applicationId: vercelApp.id,
        followUpDate: new Date("2026-07-10"),
        note: "Follow up on interview status",
      },
    });
  }

  const figmaApp = await prisma.application.findFirst({ where: { companyName: "Figma", userId: user.id } });
  if (figmaApp) {
    await prisma.applicationNote.create({
      data: { userId: user.id, applicationId: figmaApp.id, content: "Had a great final round. The team seems amazing." },
    });
    await prisma.reminder.create({
      data: { userId: user.id, applicationId: figmaApp.id, followUpDate: new Date("2026-07-05"), note: "Review offer details" },
    });
  }

  console.log("Seed data created successfully!");
  console.log("Demo account: demo@jobtrackr.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
