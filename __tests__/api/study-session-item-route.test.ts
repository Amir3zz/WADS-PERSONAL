/**
 * @jest-environment node
 */

import { DELETE, PUT } from "@/app/api/study-sessions/[sessionId]/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    studySession: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

type Context = {
  params: Promise<{ sessionId: string }>;
};

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockPrisma = prisma as unknown as {
  studySession: {
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

const session: SessionUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "student@example.com",
  name: "Student",
  image: null,
};

describe("study session item API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue(session);
    mockPrisma.studySession.findFirst.mockResolvedValue({ id: "session-1" });
  });

  it("updates a study session", async () => {
    mockPrisma.studySession.update.mockResolvedValue({
      id: "session-1",
      title: "Updated title",
      subject: "Programming",
      notes: null,
      startedAt: new Date("2026-06-15T10:00:00.000Z"),
      endedAt: new Date("2026-06-15T10:45:00.000Z"),
      durationMinutes: 45,
      createdAt: new Date("2026-06-15T10:45:00.000Z"),
      updatedAt: new Date("2026-06-15T10:45:00.000Z"),
      userId: session.id,
    });

    const req = new Request("http://localhost/api/study-sessions/session-1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Updated title",
        subject: "Programming",
        durationMinutes: 45,
      }),
    });

    const res = await PUT(req, {
      params: Promise.resolve({ sessionId: "session-1" }),
    } as Context);

    expect(res.status).toBe(200);
    expect(mockPrisma.studySession.update).toHaveBeenCalledWith({
      where: { id: "session-1" },
      data: {
        title: "Updated title",
        subject: "Programming",
        durationMinutes: 45,
      },
    });
  });

  it("deletes a study session", async () => {
    const req = new Request("http://localhost/api/study-sessions/session-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, {
      params: Promise.resolve({ sessionId: "session-1" }),
    } as Context);

    expect(res.status).toBe(200);
    expect(mockPrisma.studySession.delete).toHaveBeenCalledWith({
      where: { id: "session-1" },
    });
  });

  it("rejects missing sessions", async () => {
    mockPrisma.studySession.findFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/study-sessions/session-x", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Anything" }),
    });

    const res = await PUT(req, {
      params: Promise.resolve({ sessionId: "session-x" }),
    } as Context);

    expect(res.status).toBe(404);
  });
});
