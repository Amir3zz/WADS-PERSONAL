import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await prisma.board.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: "desc" },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            select: {
              id: true,
              completed: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const icon = String(body?.icon ?? "").trim();
  const color = String(body?.color ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const board = await prisma.board.create({
    data: {
      title,
      description: description || null,
      icon: icon || null,       
      color: color || null,     
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