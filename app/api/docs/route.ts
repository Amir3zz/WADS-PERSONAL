import { openApiSpec } from "@/lib/openapi";

export async function GET() {
  return Response.json(openApiSpec, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}