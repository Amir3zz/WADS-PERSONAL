import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getBoardsOwnership } from "@/lib/dashboard-queries";
import { jsonError, readJsonBody } from "@/lib/api-utils";

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }

  return value;
}

export const PATCH = withAuth(async (session, req: Request) => {
  const body = await readJsonBody(req);
  const boardIds = stringArray(body?.boardIds);

  if (!boardIds || new Set(boardIds).size !== boardIds.length) {
    return jsonError("Board order must include unique board IDs", 400);
  }

  const ownedBoards = await getBoardsOwnership(boardIds, session.id);

  if (ownedBoards.length !== boardIds.length) {
    return jsonError("Board order contains an invalid board", 400);
  }

  await prisma.$transaction(
    boardIds.map((id, position) =>
      prisma.board.update({
        where: { id },
        data: { position },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
});
