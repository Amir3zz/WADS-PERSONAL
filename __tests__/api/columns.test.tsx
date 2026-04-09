import { POST } from "@/app/api/columns/[columnId]/cards/route";
import { prisma } from "@/lib/prisma";
import * as auth from "@/lib/auth";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    column: {
      findFirst: jest.fn(),
    },
    card: {
      count: jest.fn(),
      create: jest.fn(),
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
  params: Promise.resolve({ columnId: "col1" }),
};

describe("Column Card Creation Security Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST should return 401 if no session", async () => {
    (auth.getSession as jest.Mock).mockResolvedValue(null);

    const res = await POST(new Request("http://localhost"), mockContext);
    expect(res.status).toBe(401);
  });

  test("POST should return 400 if title is empty", async () => {
    (auth.getSession as jest.Mock).mockResolvedValue({ id: "user1" });
    (prisma.column.findFirst as jest.Mock).mockResolvedValue({ id: "col1" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ title: "" }),
    });

    const res = await POST(req, mockContext);
    expect(res.status).toBe(400);
  });

  test("POST should return 404 if column not found", async () => {
    (auth.getSession as jest.Mock).mockResolvedValue({ id: "user1" });
    (prisma.column.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await POST(new Request("http://localhost"), mockContext);
    expect(res.status).toBe(404);
  });
});