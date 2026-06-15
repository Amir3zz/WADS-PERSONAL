import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardBoards } from "@/lib/dashboard-queries";
import { jsonError, optionalText, readJsonBody, text } from "@/lib/api-utils";

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_ICON_LENGTH = 40;
const MAX_COLOR_LENGTH = 40;

export async function GET() {
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const boards = await getDashboardBoards(session.id);
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const body = await readJsonBody(req);

  const title = text(body?.title);
  const description = optionalText(body?.description);
  const icon = optionalText(body?.icon);
  const color = optionalText(body?.color);

  if (!title) {
    return jsonError("Title is required", 400);
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return jsonError(
      `Title must be ${MAX_TITLE_LENGTH} characters or less`,
      400,
    );
  }

  if ((description?.length ?? 0) > MAX_DESCRIPTION_LENGTH) {
    return jsonError(
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
      400,
    );
  }

  if ((icon?.length ?? 0) > MAX_ICON_LENGTH) {
    return jsonError(`Icon must be ${MAX_ICON_LENGTH} characters or less`, 400);
  }

  if ((color?.length ?? 0) > MAX_COLOR_LENGTH) {
    return jsonError(
      `Color must be ${MAX_COLOR_LENGTH} characters or less`,
      400,
    );
  }

  const board = await prisma.board.create({
    data: {
      title,
      description,
      icon,
      color,
      userId: session.id,
      columns: {
        create: [
          { title: "To Do", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Done", position: 2 },
        ],
      },
    },
    include: {
      columns: true,
    },
  });

  return NextResponse.json(board, { status: 201 });
}
