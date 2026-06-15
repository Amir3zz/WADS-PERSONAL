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

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

type StudySessionUpdateBody = {
  title?: unknown;
  subject?: unknown;
  notes?: unknown;
  startedAt?: unknown;
  endedAt?: unknown;
  durationMinutes?: unknown;
};

const MAX_TITLE_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 80;
const MAX_NOTES_LENGTH = 500;

export const PUT = withAuth(
  async (session, req: Request, context: RouteContext) => {
    const { sessionId } = await context.params;

    const existing = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: session.id,
      },
    });

    if (!existing) {
      return jsonError("Study session not found", 404);
    }

    const body = (await readJsonBody<StudySessionUpdateBody>(req)) ?? {};

    const data: {
      title?: string;
      subject?: string | null;
      notes?: string | null;
      startedAt?: Date;
      endedAt?: Date | null;
      durationMinutes?: number | null;
    } = {};

    if (body.title !== undefined) {
      const title = text(body.title);
      if (!title) return jsonError("Title is required", 400);
      if (title.length > MAX_TITLE_LENGTH) {
        return jsonError(
          `Title must be ${MAX_TITLE_LENGTH} characters or less`,
          400,
        );
      }
      data.title = title;
    }

    if (body.subject !== undefined) {
      const subject = optionalText(body.subject);
      if ((subject?.length ?? 0) > MAX_SUBJECT_LENGTH) {
        return jsonError(
          `Subject must be ${MAX_SUBJECT_LENGTH} characters or less`,
          400,
        );
      }
      data.subject = subject;
    }

    if (body.notes !== undefined) {
      const notes = optionalText(body.notes);
      if ((notes?.length ?? 0) > MAX_NOTES_LENGTH) {
        return jsonError(
          `Notes must be ${MAX_NOTES_LENGTH} characters or less`,
          400,
        );
      }
      data.notes = notes;
    }

    if (body.startedAt !== undefined) {
      const startedAt = parseDateTime(body.startedAt);
      if (!startedAt)
        return jsonError("Started at must be a valid date/time", 400);
      data.startedAt = startedAt;
    }

    if (body.endedAt !== undefined) {
      if (body.endedAt === null || String(body.endedAt).trim() === "") {
        data.endedAt = null;
      } else {
        const endedAt = parseDateTime(body.endedAt);
        if (!endedAt)
          return jsonError("Ended at must be a valid date/time", 400);
        data.endedAt = endedAt;
      }
    }

    if (body.durationMinutes !== undefined) {
      const value = Number(String(body.durationMinutes).trim());
      if (!Number.isInteger(value) || value < 1) {
        return jsonError("Duration must be a positive integer", 400);
      }
      data.durationMinutes = value;
    }

    if (Object.keys(data).length === 0) {
      return jsonError("No changes provided", 400);
    }

    if (
      data.startedAt &&
      data.endedAt &&
      data.endedAt.getTime() < data.startedAt.getTime()
    ) {
      return jsonError("Ended at must be after started at", 400);
    }

    const updated = await prisma.studySession.update({
      where: { id: sessionId },
      data,
    });

    return NextResponse.json(updated);
  },
);

export const DELETE = withAuth(
  async (session, _req: Request, context: RouteContext) => {
    const { sessionId } = await context.params;

    const existing = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: session.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return jsonError("Study session not found", 404);
    }

    await prisma.studySession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ ok: true });
  },
);
