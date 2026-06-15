const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const json = (schema: Record<string, unknown>) => ({
  "application/json": {
    schema,
  },
});

const errorResponse = {
  description: "Error response",
  content: json(ref("ErrorResponse")),
};

const unauthorizedResponse = {
  description: "Unauthorized",
  content: json(ref("ErrorResponse")),
};

const forbiddenResponse = {
  description: "Forbidden",
  content: json(ref("ErrorResponse")),
};

const notFoundResponse = {
  description: "Not found",
  content: json(ref("ErrorResponse")),
};

const badRequestResponse = {
  description: "Bad request",
  content: json(ref("ErrorResponse")),
};

const okResponse = {
  description: "Success",
  content: json(ref("OkResponse")),
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Boardside API",
    version: "1.0.0",
    description:
      "REST API documentation for the Boardside study planner application.",
  },
  servers: [
    {
      url: "/",
      description: "Same-origin deployment",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Boards" },
    { name: "Columns" },
    { name: "Cards" },
    { name: "Reorder" },
    { name: "AI" },
    { name: "Account" },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "session",
      },
      firebaseBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Firebase ID token",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        additionalProperties: true,
        properties: {
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      OkResponse: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean", example: true },
        },
        required: ["ok"],
      },
      AuthFirebaseResponse: {
        type: "object",
        additionalProperties: false,
        properties: {
          success: { type: "boolean", example: true },
          userId: { type: "string" },
        },
        required: ["success", "userId"],
      },
      LogoutResponse: {
        type: "object",
        additionalProperties: false,
        properties: {
          message: { type: "string", example: "Logged out" },
        },
        required: ["message"],
      },
      DeleteAccountResponse: {
        type: "object",
        additionalProperties: false,
        properties: {
          success: { type: "boolean", example: true },
        },
        required: ["success"],
      },
      BoardBase: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          icon: { type: "string", nullable: true },
          color: { type: "string", nullable: true },
          position: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          userId: { type: "string" },
        },
        required: [
          "id",
          "title",
          "description",
          "icon",
          "color",
          "position",
          "createdAt",
          "updatedAt",
          "userId",
        ],
      },
      DashboardCard: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          completed: { type: "boolean" },
        },
        required: ["id", "completed"],
      },
      BoardDashboardColumn: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          position: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          cards: {
            type: "array",
            items: ref("DashboardCard"),
          },
        },
        required: [
          "id",
          "title",
          "position",
          "createdAt",
          "updatedAt",
          "cards",
        ],
      },
      BoardDashboard: {
        allOf: [
          ref("BoardBase"),
          {
            type: "object",
            additionalProperties: false,
            properties: {
              columns: {
                type: "array",
                items: ref("BoardDashboardColumn"),
              },
            },
            required: ["columns"],
          },
        ],
      },
      ColumnBase: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          position: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          boardId: { type: "string" },
        },
        required: [
          "id",
          "title",
          "position",
          "createdAt",
          "updatedAt",
          "boardId",
        ],
      },
      CardRecord: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          position: { type: "integer" },
          completed: { type: "boolean" },
          dueDate: { type: "string", format: "date-time", nullable: true },
          priority: {
            type: "string",
            nullable: true,
            enum: ["HIGH", "MEDIUM", "LOW", null],
          },
          aiSubtasks: { type: "string", nullable: true },
          aiSuggestion: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          columnId: { type: "string" },
        },
        required: [
          "id",
          "title",
          "description",
          "position",
          "completed",
          "dueDate",
          "priority",
          "aiSubtasks",
          "aiSuggestion",
          "createdAt",
          "updatedAt",
          "columnId",
        ],
      },
      BoardTreeColumn: {
        allOf: [
          ref("ColumnBase"),
          {
            type: "object",
            additionalProperties: false,
            properties: {
              cards: {
                type: "array",
                items: ref("CardRecord"),
              },
            },
            required: ["cards"],
          },
        ],
      },
      BoardTree: {
        allOf: [
          ref("BoardBase"),
          {
            type: "object",
            additionalProperties: false,
            properties: {
              columns: {
                type: "array",
                items: ref("BoardTreeColumn"),
              },
            },
            required: ["columns"],
          },
        ],
      },
      ColumnTree: {
        allOf: [
          ref("ColumnBase"),
          {
            type: "object",
            additionalProperties: false,
            properties: {
              cards: {
                type: "array",
                items: ref("CardRecord"),
              },
            },
            required: ["cards"],
          },
        ],
      },
      BoardCreateRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 80 },
          description: { type: "string", nullable: true, maxLength: 300 },
          icon: { type: "string", nullable: true, maxLength: 40 },
          color: { type: "string", nullable: true, maxLength: 40 },
        },
        required: ["title"],
      },
      BoardUpdateRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 80 },
          description: { type: "string", nullable: true, maxLength: 300 },
          icon: { type: "string", nullable: true, maxLength: 40 },
          color: { type: "string", nullable: true, maxLength: 40 },
        },
      },
      BoardReorderRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          boardIds: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["boardIds"],
      },
      ColumnCreateRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 60 },
        },
        required: ["title"],
      },
      ColumnUpdateRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 60 },
          position: { type: "integer", minimum: 0 },
        },
      },
      ColumnReorderRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          columnIds: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["columnIds"],
      },
      CardCreateRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 500 },
          dueDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
        required: ["title"],
      },
      CardUpdateRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 500 },
          completed: { type: "boolean" },
          position: { type: "integer", minimum: 0 },
          dueDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      CardReorderRequest: {
        type: "object",
        additionalProperties: false,
        properties: {
          columns: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                columnId: { type: "string" },
                cardIds: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["columnId", "cardIds"],
            },
          },
        },
        required: ["columns"],
      },
      WorkloadStats: {
        type: "object",
        additionalProperties: false,
        properties: {
          totalBoards: { type: "integer" },
          totalTasks: { type: "integer" },
          openTasks: { type: "integer" },
          completedTasks: { type: "integer" },
          overdueTasks: { type: "integer" },
          dueSoonTasks: { type: "integer" },
        },
        required: [
          "totalBoards",
          "totalTasks",
          "openTasks",
          "completedTasks",
          "overdueTasks",
          "dueSoonTasks",
        ],
      },
      WorkloadAnalysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          riskLevel: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH"],
          },
          summary: { type: "string" },
          recommendation: { type: "string" },
          focusTasks: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["riskLevel", "summary", "recommendation", "focusTasks"],
      },
      WorkloadResponse: {
        type: "object",
        additionalProperties: false,
        properties: {
          stats: ref("WorkloadStats"),
          analysis: ref("WorkloadAnalysis"),
        },
        required: ["stats", "analysis"],
      },
    },
  },
  paths: {
    "/api/auth/firebase": {
      post: {
        tags: ["Auth"],
        summary: "Create or update the signed-in Firebase user",
        description:
          "Accepts a Firebase ID token in the Authorization header, verifies it, creates or updates the local user record, and sets the session cookie.",
        security: [{ firebaseBearer: [] }],
        responses: {
          200: {
            description: "User authenticated successfully",
            content: json(ref("AuthFirebaseResponse")),
          },
          401: unauthorizedResponse,
        },
      },
    },
    "/api/logout": {
      post: {
        tags: ["Auth"],
        summary: "Clear the session cookie",
        responses: {
          200: {
            description: "Logged out successfully",
            content: json(ref("LogoutResponse")),
          },
        },
      },
    },
    "/api/delete-account": {
      delete: {
        tags: ["Account"],
        summary: "Delete the current account",
        description:
          "Deletes the Firebase account and the matching local database record, then clears the session cookie.",
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: "Account deleted successfully",
            content: json(ref("DeleteAccountResponse")),
          },
          401: unauthorizedResponse,
          403: forbiddenResponse,
          500: {
            description: "Failed to delete account",
            content: json(ref("ErrorResponse")),
          },
        },
      },
    },
    "/api/boards": {
      get: {
        tags: ["Boards"],
        summary: "Get all boards for the current user",
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: "Board dashboard data",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: ref("BoardDashboard"),
                },
              },
            },
          },
          401: unauthorizedResponse,
        },
      },
      post: {
        tags: ["Boards"],
        summary: "Create a new board",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: json(ref("BoardCreateRequest")),
        },
        responses: {
          201: {
            description: "Board created successfully",
            content: json(ref("BoardBase")),
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
        },
      },
    },
    "/api/boards/reorder": {
      patch: {
        tags: ["Reorder", "Boards"],
        summary: "Reorder boards",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: json(ref("BoardReorderRequest")),
        },
        responses: {
          200: okResponse,
          400: badRequestResponse,
          401: unauthorizedResponse,
        },
      },
    },
    "/api/boards/{boardId}": {
      get: {
        tags: ["Boards"],
        summary: "Get a board by ID",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "boardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Board details with columns and cards",
            content: json(ref("BoardTree")),
          },
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      patch: {
        tags: ["Boards"],
        summary: "Update a board",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "boardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: json(ref("BoardUpdateRequest")),
        },
        responses: {
          200: {
            description: "Board updated successfully",
            content: json(ref("BoardBase")),
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ["Boards"],
        summary: "Delete a board",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "boardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: okResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    "/api/boards/{boardId}/columns": {
      post: {
        tags: ["Columns", "Boards"],
        summary: "Create a new column inside a board",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "boardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: json(ref("ColumnCreateRequest")),
        },
        responses: {
          201: {
            description: "Column created successfully",
            content: json(ref("ColumnBase")),
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    "/api/boards/{boardId}/columns/reorder": {
      patch: {
        tags: ["Reorder", "Columns", "Boards"],
        summary: "Reorder columns within a board",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "boardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: json(ref("ColumnReorderRequest")),
        },
        responses: {
          200: okResponse,
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    "/api/columns/{columnId}": {
      get: {
        tags: ["Columns"],
        summary: "Get a column by ID",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "columnId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Column details with cards",
            content: json(ref("ColumnTree")),
          },
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      patch: {
        tags: ["Columns"],
        summary: "Update a column",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "columnId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: json(ref("ColumnUpdateRequest")),
        },
        responses: {
          200: {
            description: "Column updated successfully",
            content: json(ref("ColumnBase")),
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ["Columns"],
        summary: "Delete a column",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "columnId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: okResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    "/api/columns/{columnId}/cards": {
      post: {
        tags: ["Cards", "Columns"],
        summary: "Create a new card inside a column",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "columnId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: json(ref("CardCreateRequest")),
        },
        responses: {
          201: {
            description: "Card created successfully",
            content: json(ref("CardRecord")),
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    "/api/cards/{cardId}": {
      get: {
        tags: ["Cards"],
        summary: "Get a card by ID",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "cardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Card details",
            content: json(ref("CardRecord")),
          },
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      patch: {
        tags: ["Cards"],
        summary: "Update a card",
        description:
          "Updates card fields and may regenerate AI suggestions when title, description, or due date change.",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "cardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: json(ref("CardUpdateRequest")),
        },
        responses: {
          200: {
            description: "Card updated successfully",
            content: json(ref("CardRecord")),
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ["Cards"],
        summary: "Delete a card",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "cardId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: okResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    "/api/cards/reorder": {
      patch: {
        tags: ["Reorder", "Cards"],
        summary: "Reorder cards across columns in the same board",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: json(ref("CardReorderRequest")),
        },
        responses: {
          200: okResponse,
          400: badRequestResponse,
          401: unauthorizedResponse,
        },
      },
    },
    "/api/ai/workload": {
      post: {
        tags: ["AI"],
        summary: "Analyze current workload",
        description:
          "Returns a workload risk assessment and practical focus recommendations based on the user's boards and cards.",
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: "Workload analysis result",
            content: json(ref("WorkloadResponse")),
          },
          401: unauthorizedResponse,
        },
      },
    },
  },
} as const;
