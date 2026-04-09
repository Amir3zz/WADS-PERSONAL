import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function createRequest(url: string, cookie?: string) {
  const req = new NextRequest(url, {
    headers: cookie ? { cookie } : {},
  });
  return req;
}

describe("Middleware Security Tests", () => {
  test("should allow public route", () => {
    const req = createRequest("http://localhost/");
    const res = middleware(req);

    expect(res?.status).not.toBe(401);
  });

  test("should block protected API without session", () => {
    const req = createRequest("http://localhost/api/boards");
    const res = middleware(req);

    expect(res?.status).toBe(401);
  });

  test("should redirect protected page without session", () => {
    const req = createRequest("http://localhost/dashboard");
    const res = middleware(req);

    expect(res?.status).toBe(307); // redirect
  });

  test("should allow access with session cookie", () => {
    const req = createRequest(
      "http://localhost/dashboard",
      "session=valid-token"
    );

    const res = middleware(req);

    expect(res?.status).not.toBe(307);
  });
});