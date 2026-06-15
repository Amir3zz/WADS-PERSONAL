import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  jsonError,
  optionalText,
  parseDateTime,
  readJsonBody,
  text,
} from "@/lib/api-utils";

const MAX_TITLE_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 80;
const MAX_NOTES_LENGTH = 500;

type StudySessionCreateBody = {
  title?: unknown;
  subject?: unknown;
  notes?: unknown;
  startedAt?: unknown;
  endedAt?: unknown;
  durationMinutes?: unknown;
};

function toDurationMinutes(startedAt: Date, endedAt: Date, provided?: unknown) {
  if (
    provided !== undefined &&
    provided !== null &&
    String(provided).trim() !== ""
  ) {
    const value = Number(String(provided).trim());
    if (Number.isInteger(value) && value > 0) {
      return value;
    }
    return null;
  }

  const diffMinutes = Math.max(
    1,
    Math.round((endedAt.getTime() - startedAt.getTime()) / 60000),
  );
  return diffMinutes;
}

export const GET = withAuth(async (session) => {
  const sessions = await prisma.studySession.findMany({
    where: { userId: session.id },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(sessions);
});

export const POST = withAuth(async (session, req: Request) => {
  const body = (await readJsonBody<StudySessionCreateBody>(req)) ?? {};

  const title = text(body.title);
  const subject = optionalText(body.subject);
  const notes = optionalText(body.notes);
  const startedAt = parseDateTime(body.startedAt);
  const endedAt = parseDateTime(body.endedAt);
  const durationMinutes = toDurationMinutes(
    startedAt ?? new Date(),
    endedAt ?? new Date(),
    body.durationMinutes,
  );

  if (!title) {
    return jsonError("Title is required", 400);
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return jsonError(
      `Title must be ${MAX_TITLE_LENGTH} characters or less`,
      400,
    );
  }

  if ((subject?.length ?? 0) > MAX_SUBJECT_LENGTH) {
    return jsonError(
      `Subject must be ${MAX_SUBJECT_LENGTH} characters or less`,
      400,
    );
  }

  if ((notes?.length ?? 0) > MAX_NOTES_LENGTH) {
    return jsonError(
      `Notes must be ${MAX_NOTES_LENGTH} characters or less`,
      400,
    );
  }

  if (!startedAt) {
    return jsonError("Started at must be a valid date/time", 400);
  }

  if (!endedAt) {
    return jsonError("Ended at must be a valid date/time", 400);
  }

  if (endedAt.getTime() < startedAt.getTime()) {
    return jsonError("Ended at must be after started at", 400);
  }

  if (!durationMinutes) {
    return jsonError("Duration must be a positive integer", 400);
  }

  const created = await prisma.studySession.create({
    data: {
      title,
      subject,
      notes,
      startedAt,
      endedAt,
      durationMinutes,
      userId: session.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
});
