/**
 * @jest-environment node
 */

import { PATCH } from "@/app/api/boards/reorder/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardsOwnership } from "@/lib/dashboard-queries";
import type { SessionUser } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/dashboard-queries", () => ({
  getBoardsOwnership: jest.fn(),
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockBoardsOwnership = getBoardsOwnership as jest.Mock;
const mockPrisma = prisma as unknown as {
  board: {
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};

const session: SessionUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "student@example.com",
  name: "Student",
  image: null,
};

describe("boards reorder API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue(session);

    mockBoardsOwnership.mockResolvedValue([{ id: "1" }, { id: "2" }]);

    mockPrisma.board.update.mockImplementation(
      async ({ where, data }: any) => ({
        id: where.id,
        position: data.position,
      }),
    );

    mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations as Promise<unknown>[]),
    );
  });

  it("reorders boards in the requested order", async () => {
    const req = new Request("http://localhost/api/boards/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardIds: ["2", "1"],
      }),
    });

    const res = await PATCH(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.board.update).toHaveBeenNthCalledWith(1, {
      where: { id: "2" },
      data: { position: 0 },
    });
    expect(mockPrisma.board.update).toHaveBeenNthCalledWith(2, {
      where: { id: "1" },
      data: { position: 1 },
    });
    expect(await res.json()).toEqual({ ok: true });
  });

  it("rejects duplicate board IDs", async () => {
    const req = new Request("http://localhost/api/boards/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardIds: ["2", "2"],
      }),
    });

    const res = await PATCH(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Board order must include unique board IDs",
    });
  });
});
