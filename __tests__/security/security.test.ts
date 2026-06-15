/**
 * @jest-environment node
 */

import { GET as getBoards } from "@/app/api/boards/route";
import { PATCH as reorderBoards } from "@/app/api/boards/reorder/route";
import { DELETE as deleteAccount } from "@/app/api/delete-account/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import type { SessionUser } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: jest.fn(),
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockPrisma = prisma as unknown as {
  board: {
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  user: {
    delete: jest.Mock;
  };
  $transaction: jest.Mock;
};
const mockAdminAuth = adminAuth as jest.Mock;

const session: SessionUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "student@example.com",
  name: "Student",
  image: null,
};

const mockAdminGetUser = jest.fn();
const mockAdminDeleteUser = jest.fn();

describe("security tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma.board.findMany.mockResolvedValue([]);
    mockPrisma.$transaction.mockImplementation(async (ops: unknown[]) =>
      Promise.all(ops as Promise<unknown>[]),
    );

    mockAdminAuth.mockReturnValue({
      getUser: mockAdminGetUser,
      deleteUser: mockAdminDeleteUser,
    });
  });

  it("blocks unauthenticated access to protected routes", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await getBoards();

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: "Unauthorized",
    });
  });

  it("rejects duplicate board IDs during reorder", async () => {
    mockGetSession.mockResolvedValue(session);

    const req = new Request("http://localhost/api/boards/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardIds: ["1", "1"],
      }),
    });

    const res = await reorderBoards(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Board order must include unique board IDs",
    });
  });

  it("forbids account deletion until email is verified", async () => {
    mockGetSession.mockResolvedValue(session);
    mockAdminGetUser.mockResolvedValue({
      emailVerified: false,
    });

    const res = await deleteAccount();

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Please verify your email first.",
    });

    expect(mockAdminDeleteUser).not.toHaveBeenCalled();
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });
});