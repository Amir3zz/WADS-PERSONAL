/**
 * @jest-environment node
 */

import { GET, PATCH } from "@/app/api/cards/[cardId]/route";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCardContext, getCardOwnership } from "@/lib/dashboard-queries";
import { generateCardAI } from "@/lib/ai";
import type { SessionUser } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    card: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/dashboard-queries", () => ({
  getCardContext: jest.fn(),
  getCardOwnership: jest.fn(),
}));

jest.mock("@/lib/ai", () => ({
  generateCardAI: jest.fn(),
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockGetCardContext = getCardContext as jest.Mock;
const mockGetCardOwnership = getCardOwnership as jest.Mock;
const mockGenerateCardAI = generateCardAI as jest.Mock;
const mockPrisma = prisma as unknown as {
  card: {
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

describe("cards API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue(session);
  });

  it("returns a card when it exists", async () => {
    mockPrisma.card.findFirst.mockResolvedValue({
      id: "card-1",
      title: "Read chapter 1",
      description: "Start early",
      completed: false,
      position: 0,
      dueDate: null,
      priority: null,
      aiSubtasks: null,
      aiSuggestion: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      columnId: "column-1",
    });

    const res = await GET(new Request("http://localhost/api/cards/card-1"), {
      params: Promise.resolve({ cardId: "card-1" }),
    } as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("card-1");
  });

  it("rejects an invalid due date", async () => {
    mockGetCardContext.mockResolvedValue({
      id: "card-1",
      title: "Old title",
      description: "Old description",
      completed: false,
      dueDate: null,
      column: {
        title: "To do",
        board: {
          title: "Board A",
        },
      },
    });

    const req = new Request("http://localhost/api/cards/card-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dueDate: "not-a-real-date",
      }),
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ cardId: "card-1" }),
    } as any);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Due date must be a valid date/time",
    });
  });

  it("regenerates AI output after a title change", async () => {
    mockGetCardContext.mockResolvedValue({
      id: "card-1",
      title: "Old title",
      description: "Old description",
      completed: false,
      dueDate: null,
      column: {
        title: "To do",
        board: {
          title: "Board A",
        },
      },
    });

    mockGenerateCardAI.mockResolvedValue({
      priority: "HIGH",
      subtasks: ["Break it down", "Finish step 1"],
      suggestion: "Focus on the main task first.",
    });

    mockPrisma.card.update.mockResolvedValue({
      id: "card-1",
      title: "Updated title",
      description: "Old description",
      completed: false,
      position: 0,
      dueDate: null,
      priority: "HIGH",
      aiSubtasks: JSON.stringify(["Break it down", "Finish step 1"]),
      aiSuggestion: "Focus on the main task first.",
    });

    const req = new Request("http://localhost/api/cards/card-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Updated title",
      }),
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ cardId: "card-1" }),
    } as any);

    expect(res.status).toBe(200);
    expect(mockGenerateCardAI).toHaveBeenCalledWith({
      title: "Updated title",
      description: "Old description",
      dueDate: null,
      boardTitle: "Board A",
      columnTitle: "To do",
    });
    expect(mockPrisma.card.update).toHaveBeenCalledWith({
      where: { id: "card-1" },
      data: expect.objectContaining({
        title: "Updated title",
        priority: "HIGH",
        aiSubtasks: JSON.stringify(["Break it down", "Finish step 1"]),
        aiSuggestion: "Focus on the main task first.",
      }),
    });
  });
});
