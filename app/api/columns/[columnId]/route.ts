import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getColumnOwnership, getColumnTree } from "@/lib/dashboard-queries";
import {
  jsonError,
  nonNegativeInteger,
  readJsonBody,
  text,
} from "@/lib/api-utils";

type RouteContext = {
  params: Promise<{
    columnId: string;
  }>;
};

const MAX_TITLE_LENGTH = 60;

export async function GET(_req: Request, context: RouteContext) {
  const { columnId } = await context.params;
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const column = await getColumnTree(columnId, session.id);

  if (!column) {
    return jsonError("Column not found", 404);
  }

  return NextResponse.json(column);
}

export async function PATCH(req: Request, context: RouteContext) {
  const { columnId } = await context.params;
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const column = await getColumnOwnership(columnId, session.id);

  if (!column) {
    return jsonError("Column not found", 404);
  }

  const body = await readJsonBody(req);

  const data: {
    title?: string;
    position?: number;
  } = {};

  if (body?.title !== undefined) {
    const title = text(body.title);
    if (!title) {
      return jsonError("Title is required", 400);
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return jsonError(`Title must be ${MAX_TITLE_LENGTH} characters or less`, 400);
    }
    data.title = title;
  }

  if (body?.position !== undefined) {
    const position = nonNegativeInteger(body.position);
    if (position === null) {
      return jsonError("Position must be a non-negative integer", 400);
    }
    data.position = position;
  }

  if (Object.keys(data).length === 0) {
    return jsonError("No changes provided", 400);
  }

  const updated = await prisma.column.update({
    where: { id: columnId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { columnId } = await context.params;
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const column = await getColumnOwnership(columnId, session.id);

  if (!column) {
    return jsonError("Column not found", 404);
  }

  await prisma.column.delete({
    where: { id: columnId },
  });

  return NextResponse.json({ ok: true });
}