import OpenAI from "openai";

export type CardAIResult = {
  subtasks: string[];
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestion: string;
};

type CardAIInput = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
  boardTitle?: string | null;
  columnTitle?: string | null;
};

const CARD_PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    subtasks: {
      type: "array",
      items: { type: "string" },
      minItems: 0,
      maxItems: 8,
    },
    priority: {
      type: "string",
      enum: ["HIGH", "MEDIUM", "LOW"],
    },
    suggestion: {
      type: "string",
    },
  },
  required: ["subtasks", "priority", "suggestion"],
} as const;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function clampText(value: string, max = 500): string {
  const clean = normalizeText(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function clampSubtasks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => clampText(item, 120))
    .filter(Boolean)
    .slice(0, 8);
}

function formatDateForPrompt(value?: string | null): string {
  if (!value) return "(none)";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getDaysUntilDue(dueDate?: string | null): number | null {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = date.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function inferTaskType(
  text: string,
): "essay" | "project" | "exam" | "presentation" | "reading" | "general" {
  if (/(essay|paper|report|research|thesis|writing)/i.test(text)) {
    return "essay";
  }

  if (
    /(project|group work|assignment|build|design|develop|prototype)/i.test(text)
  ) {
    return "project";
  }

  if (/(exam|test|quiz|midterm|final|assessment)/i.test(text)) {
    return "exam";
  }

  if (/(presentation|slides|speech|seminar|demo|present)/i.test(text)) {
    return "presentation";
  }

  if (/(reading|read|chapter|article|book|summary|notes)/i.test(text)) {
    return "reading";
  }

  return "general";
}

function simulatedAI(input: CardAIInput): CardAIResult {
  const combined =
    `${input.title} ${input.description ?? ""} ${input.boardTitle ?? ""} ${input.columnTitle ?? ""}`.toLowerCase();

  const taskType = inferTaskType(combined);
  const daysUntilDue = getDaysUntilDue(input.dueDate);

  let priority: CardAIResult["priority"] = "MEDIUM";

  if (daysUntilDue !== null) {
    if (daysUntilDue <= 3) {
      priority = "HIGH";
    } else if (daysUntilDue <= 10) {
      priority = "MEDIUM";
    } else {
      priority = "LOW";
    }
  }

  const variants: Record<
    "essay" | "project" | "exam" | "presentation" | "reading" | "general",
    string[][]
  > = {
    essay: [
      [
        "Understand the prompt",
        "Gather sources",
        "Draft outline",
        "Write first draft",
        "Revise and polish",
      ],
      [
        "Break down the question",
        "Research key points",
        "Write body paragraphs",
        "Check references",
        "Final edit",
      ],
    ],
    project: [
      [
        "Define the scope",
        "List deliverables",
        "Work on the core feature",
        "Test the result",
        "Prepare submission",
      ],
      [
        "Plan the tasks",
        "Build the most important part first",
        "Review the output",
        "Fix issues",
        "Finalize",
      ],
    ],
    exam: [
      [
        "List topics",
        "Review notes",
        "Practice questions",
        "Focus on weak areas",
        "Do a final review",
      ],
      [
        "Summarize the material",
        "Memorize key ideas",
        "Self-test",
        "Review mistakes",
      ],
    ],
    presentation: [
      [
        "Define the main message",
        "Outline the slides",
        "Create visuals",
        "Practice speaking",
        "Prepare answers",
      ],
    ],
    reading: [
      [
        "Read the material",
        "Highlight key ideas",
        "Summarize the chapter",
        "Write quick notes",
      ],
    ],
    general: [
      [
        "Understand the task",
        "Break it into smaller steps",
        "Start with the easiest part",
        "Review progress",
      ],
    ],
  };

  const options = variants[taskType];
  const subtasks =
    options[Math.floor(Math.random() * options.length)] ?? variants.general[0];

  const suggestion =
    daysUntilDue !== null && daysUntilDue <= 3
      ? "This looks urgent, so focus on the most important part first and finish the rest after."
      : daysUntilDue !== null && daysUntilDue <= 10
        ? "You still have some time, but it is best to split this into small daily goals."
        : "Work through the subtasks step by step and keep the plan simple.";

  return {
    subtasks,
    priority,
    suggestion,
  };
}

function extractJsonText(response: OpenAI.Responses.Response): string | null {
  const outputText = response.output
    ?.flatMap((item: any) => item.content ?? [])
    .find((content: any) => content?.type === "output_text")?.text;

  if (typeof outputText !== "string") {
    return null;
  }

  const trimmed = outputText.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function generateCardAI(
  input: CardAIInput,
): Promise<CardAIResult> {
  const useLocal = process.env.USE_LOCAL_AI === "true";

  console.log("[AI] USE_LOCAL_AI =", process.env.USE_LOCAL_AI);

  if (useLocal) {
    console.log("[AI] Using simulated AI (USE_LOCAL_AI=true)");
    return simulatedAI(input);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  console.log("[AI] OPENAI_API_KEY exists =", !!apiKey);

  if (!apiKey) {
    console.log("[AI] Using simulated AI (missing OPENAI_API_KEY)");
    return simulatedAI(input);
  }

  console.log("[AI] Using OpenAI");

  const client = new OpenAI({ apiKey });

  const prompt = `
You are a study planner assistant.

Create a focused study plan based on this task.

Title: ${normalizeText(input.title)}
Description: ${normalizeText(input.description)}
Board: ${normalizeText(input.boardTitle)}
Column: ${normalizeText(input.columnTitle)}
Due date: ${formatDateForPrompt(input.dueDate)}

Rules:
- Return only JSON.
- Keep subtasks short and practical.
- Use 3 to 6 subtasks when possible.
- Make the suggestion clear, helpful, and student-friendly.
- Choose priority based on urgency and task difficulty.

Return this exact JSON shape:
{
  "subtasks": ["string"],
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "suggestion": "string"
}
`;

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "card_plan",
          strict: true,
          schema: CARD_PLAN_SCHEMA,
        },
      },
    });

    const raw = extractJsonText(response);

    if (!raw) {
      console.log("[AI] OpenAI returned empty response, using fallback");
      return simulatedAI(input);
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      console.log("[AI] Failed to parse OpenAI JSON, using fallback");
      return simulatedAI(input);
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("priority" in parsed) ||
      !("suggestion" in parsed) ||
      !("subtasks" in parsed)
    ) {
      console.log("[AI] OpenAI response shape invalid, using fallback");
      return simulatedAI(input);
    }

    const result = parsed as {
      subtasks: unknown;
      priority: unknown;
      suggestion: unknown;
    };

    return {
      subtasks: clampSubtasks(result.subtasks),
      priority:
        result.priority === "HIGH" ||
        result.priority === "MEDIUM" ||
        result.priority === "LOW"
          ? result.priority
          : "MEDIUM",
      suggestion: clampText(String(result.suggestion ?? "")),
    };
  } catch (error) {
    console.error("[AI] OpenAI request failed:", error);
    return simulatedAI(input);
  }
}
