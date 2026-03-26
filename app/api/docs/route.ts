export async function GET() {
  return Response.json({
    openapi: "3.0.0",
    info: {
      title: "Study Planner API",
      version: "1.0.0",
      description: "API documentation"
    },
    paths: {}
  });
}