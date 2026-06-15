/**
 * @jest-environment node
 */

import { GET, POST } from "@/app/api/boards/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardBoards } from "@/lib/dashboard-queries";
import type { SessionUser } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/dashboard-queries", () => ({
  getDashboardBoards: jest.fn(),
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockDashboardBoards = getDashboardBoards as jest.Mock;
const mockPrisma = prisma as unknown as {
  board: {
    count: jest.Mock;
    create: jest.Mock;
  };
};

const session: SessionUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "student@example.com",
  name: "Student",
  image: null,
};

describe("boards API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue(session);
  });

  it("returns the user's boards", async () => {
    mockDashboardBoards.mockResolvedValue([
      {
        id: "1",
        title: "Board 1",
        description: null,
        icon: null,
        color: null,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: session.id,
        columns: [],
      },
    ]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("creates a board with trimmed inputs", async () => {
    mockPrisma.board.count.mockResolvedValue(1);
    mockPrisma.board.create.mockResolvedValue({
      id: "board-2",
      title: "New Board",
      description: "Plan for this week",
      icon: null,
      color: null,
      position: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: session.id,
    });

    const req = new Request("http://localhost/api/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "  New Board  ",
        description: "  Plan for this week  ",
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockPrisma.board.create).toHaveBeenCalledWith({
      data: {
        title: "New Board",
        description: "Plan for this week",
        icon: null,
        color: null,
        position: 1,
        userId: session.id,
      },
    });

    const json = await res.json();
    expect(json.title).toBe("New Board");
  });

  it("rejects an empty title", async () => {
    const req = new Request("http://localhost/api/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "   ",
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Title is required",
    });
  });
});
