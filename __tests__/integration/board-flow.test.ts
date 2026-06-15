/**
 * @jest-environment node
 */

import { GET as getBoards, POST as createBoard } from "@/app/api/boards/route";
import { PATCH as reorderBoards } from "@/app/api/boards/reorder/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockPrisma = prisma as unknown as {
  board: {
    count: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  $transaction: jest.Mock;
};

type BoardRecord = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  columns: unknown[];
};

const session: SessionUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "student@example.com",
  name: "Student",
  image: null,
};

const store = {
  boards: [] as BoardRecord[],
};

const now = () => new Date().toISOString();

function matchesWhere(board: BoardRecord, where: any) {
  if (!where) return true;

  if (where.userId && board.userId !== where.userId) return false;

  if (where.id?.in && !where.id.in.includes(board.id)) return false;

  if (where.id && typeof where.id === "string" && board.id !== where.id) {
    return false;
  }

  return true;
}

function makeCreateBoardRequest(title: string) {
  return new Request("http://localhost/api/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
}

function makeReorderRequest(boardIds: string[]) {
  return new Request("http://localhost/api/boards/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardIds }),
  });
}

describe("board flow integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.boards = [];
    mockGetSession.mockResolvedValue(session);

    mockPrisma.board.count.mockImplementation(async ({ where }: any) => {
      return store.boards.filter((board) => matchesWhere(board, where)).length;
    });

    mockPrisma.board.create.mockImplementation(async ({ data }: any) => {
      const board: BoardRecord = {
        id: String(store.boards.length + 1),
        title: data.title,
        description: data.description ?? null,
        icon: data.icon ?? null,
        color: data.color ?? null,
        position: data.position,
        createdAt: now(),
        updatedAt: now(),
        userId: data.userId,
        columns: [],
      };

      store.boards.push(board);
      return board;
    });

    mockPrisma.board.findMany.mockImplementation(async (args: any) => {
      const filtered = store.boards
        .filter((board) => matchesWhere(board, args?.where))
        .sort(
          (a, b) =>
            a.position - b.position ||
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

      if (args?.select?.id) {
        return filtered.map((board) => ({ id: board.id }));
      }

      if (args?.include?.columns) {
        return filtered.map((board) => ({
          ...board,
          columns: board.columns,
        }));
      }

      return filtered;
    });

    mockPrisma.board.findFirst.mockImplementation(async (args: any) => {
      return (
        store.boards.find((board) => matchesWhere(board, args?.where)) ?? null
      );
    });

    mockPrisma.board.update.mockImplementation(async ({ where, data }: any) => {
      const board = store.boards.find((item) => item.id === where.id);

      if (!board) {
        throw new Error("Board not found in test store");
      }

      Object.assign(board, data, {
        updatedAt: now(),
      });

      return board;
    });

    mockPrisma.board.delete.mockImplementation(async ({ where }: any) => {
      store.boards = store.boards.filter((board) => board.id !== where.id);
      return { ok: true };
    });

    mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations as Promise<unknown>[]),
    );
  });

  it("creates boards, reorders them, and returns the new order", async () => {
    await createBoard(makeCreateBoardRequest("Board 1"));
    await createBoard(makeCreateBoardRequest("Board 2"));

    let res = await getBoards();
    let boards = await res.json();

    expect(boards.map((board: any) => board.id)).toEqual(["1", "2"]);

    res = await reorderBoards(makeReorderRequest(["2", "1"]));
    expect(res.status).toBe(200);

    res = await getBoards();
    boards = await res.json();

    expect(boards.map((board: any) => board.id)).toEqual(["2", "1"]);
    expect(boards.map((board: any) => board.position)).toEqual([0, 1]);
  });
});
