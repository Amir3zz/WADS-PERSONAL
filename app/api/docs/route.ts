export async function GET() {
  return Response.json({
    openapi: "3.0.0",
    info: {
      title: "Study Planner API",
      version: "1.0.0",
      description: "API documentation for the study planner project.",
    },
    paths: {
      "/api/auth/firebase": {
        post: {
          summary: "Create or update the signed-in Firebase user",
          responses: {
            "200": {
              description: "User session created successfully",
            },
            "401": {
              description: "Unauthorized",
            },
          },
        },
      },
      "/api/logout": {
        post: {
          summary: "Clear the session cookie",
          responses: {
            "200": {
              description: "Logged out successfully",
            },
          },
        },
      },
      "/api/boards": {
        get: {
          summary: "Get boards for the current user",
          responses: {
            "200": {
              description: "List of boards",
            },
          },
        },
        post: {
          summary: "Create a new board",
          responses: {
            "200": {
              description: "Board created",
            },
          },
        },
      },
      "/api/boards/{boardId}": {
        get: {
          summary: "Get a board by ID",
          responses: {
            "200": {
              description: "Board details",
            },
            "404": {
              description: "Board not found",
            },
          },
        },
        put: {
          summary: "Update a board",
          responses: {
            "200": {
              description: "Board updated",
            },
          },
        },
        delete: {
          summary: "Delete a board",
          responses: {
            "200": {
              description: "Board deleted",
            },
          },
        },
      },
      "/api/boards/{boardId}/columns": {
        post: {
          summary: "Create a column inside a board",
          responses: {
            "200": {
              description: "Column created",
            },
          },
        },
      },
      "/api/columns/{columnId}": {
        get: {
          summary: "Get a column by ID",
          responses: {
            "200": {
              description: "Column details",
            },
          },
        },
        put: {
          summary: "Update a column",
          responses: {
            "200": {
              description: "Column updated",
            },
          },
        },
        delete: {
          summary: "Delete a column",
          responses: {
            "200": {
              description: "Column deleted",
            },
          },
        },
      },
      "/api/columns/{columnId}/cards": {
        post: {
          summary: "Create a card inside a column",
          responses: {
            "200": {
              description: "Card created",
            },
          },
        },
      },
      "/api/cards/{cardId}": {
        get: {
          summary: "Get a card by ID",
          responses: {
            "200": {
              description: "Card details",
            },
          },
        },
        put: {
          summary: "Update a card",
          responses: {
            "200": {
              description: "Card updated",
            },
          },
        },
        delete: {
          summary: "Delete a card",
          responses: {
            "200": {
              description: "Card deleted",
            },
          },
        },
      },
    },
  });
}
