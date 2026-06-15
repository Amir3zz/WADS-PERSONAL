import { prisma } from "@/lib/prisma";

export type StudySessionRecord = {
  id: string;
  title: string;
  subject: string | null;
  notes: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export function getStudySessions(userId: string, take = 20) {
  return prisma.studySession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take,
  });
}

export function mapStudySessions(
  sessions: Awaited<ReturnType<typeof getStudySessions>>,
): StudySessionRecord[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    subject: session.subject,
    notes: session.notes,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
    durationMinutes: session.durationMinutes,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    userId: session.userId,
  }));
}
