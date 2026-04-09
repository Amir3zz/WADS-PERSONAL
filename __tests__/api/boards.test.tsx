import { GET, PATCH, DELETE } from "@/app/api/boards/[boardId]/route";
import { prisma } from "@/lib/prisma";
import * as auth from "@/lib/auth";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    board: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/auth-server", () => ({
  auth: {},
}));

jest.spyOn(auth, "getSession");

const mockContext = {
  params: Promise.resolve({ boardId: "test-board-id" }),
};

describe("Board API Security Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET should return 401 if no session", async () => {
    (auth.getSession as jest.Mock).mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), mockContext);
    expect(res.status).toBe(401);
  });

  test("GET should return 404 if board not found", async () => {
    (auth.getSession as jest.Mock).mockResolvedValue({ id: "user1" });
    (prisma.board.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), mockContext);
    expect(res.status).toBe(404);
  });

  test("PATCH should return 400 for empty title", async () => {
    (auth.getSession as jest.Mock).mockResolvedValue({ id: "user1" });
    (prisma.board.findFirst as jest.Mock).mockResolvedValue({ id: "test" });

    const req = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ title: "" }),
    });

    const res = await PATCH(req, mockContext);
    expect(res.status).toBe(400);
  });

  test("DELETE should return 401 if unauthorized", async () => {
    (auth.getSession as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(new Request("http://localhost"), mockContext);
    expect(res.status).toBe(401);
  });
});