/**
 * @jest-environment node
 */

import { GET, POST } from "@/app/api/study-sessions/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    studySession: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockPrisma = prisma as unknown as {
  studySession: {
    findMany: jest.Mock;
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

describe("study sessions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue(session);
  });

  it("returns recent study sessions", async () => {
    mockPrisma.studySession.findMany.mockResolvedValue([
      {
        id: "session-1",
        title: "Study session",
        subject: "Math",
        notes: null,
        startedAt: new Date("2026-06-15T10:00:00.000Z"),
        endedAt: new Date("2026-06-15T11:00:00.000Z"),
        durationMinutes: 60,
        createdAt: new Date("2026-06-15T11:00:00.000Z"),
        updatedAt: new Date("2026-06-15T11:00:00.000Z"),
        userId: session.id,
      },
    ]);

    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(mockPrisma.studySession.findMany).toHaveBeenCalledWith({
      where: { userId: session.id },
      orderBy: { startedAt: "desc" },
      take: 20,
    });
  });

  it("creates a study session", async () => {
    mockPrisma.studySession.create.mockResolvedValue({
      id: "session-2",
      title: "Deep work",
      subject: "Programming",
      notes: "Solved board tests",
      startedAt: new Date("2026-06-15T10:00:00.000Z"),
      endedAt: new Date("2026-06-15T10:45:00.000Z"),
      durationMinutes: 45,
      createdAt: new Date("2026-06-15T10:45:00.000Z"),
      updatedAt: new Date("2026-06-15T10:45:00.000Z"),
      userId: session.id,
    });

    const req = new Request("http://localhost/api/study-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "  Deep work  ",
        subject: "  Programming  ",
        notes: "  Solved board tests  ",
        startedAt: "2026-06-15T10:00:00.000Z",
        endedAt: "2026-06-15T10:45:00.000Z",
        durationMinutes: 45,
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockPrisma.studySession.create).toHaveBeenCalledWith({
      data: {
        title: "Deep work",
        subject: "Programming",
        notes: "Solved board tests",
        startedAt: new Date("2026-06-15T10:00:00.000Z"),
        endedAt: new Date("2026-06-15T10:45:00.000Z"),
        durationMinutes: 45,
        userId: session.id,
      },
    });
  });

  it("rejects missing title", async () => {
    const req = new Request("http://localhost/api/study-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startedAt: "2026-06-15T10:00:00.000Z",
        endedAt: "2026-06-15T10:45:00.000Z",
        durationMinutes: 45,
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Title is required" });
  });
});
