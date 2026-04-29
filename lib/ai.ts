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

// ------------------ helpers ------------------

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

function inferTaskType(text: string): "essay" | "project" | "exam" | "presentation" | "reading" | "general" {
  if (/(essay|paper|report|research|thesis|write up|writing)/i.test(text)) return "essay";
  if (/(project|group work|assignment|build|design|develop|prototype)/i.test(text)) return "project";
  if (/(exam|test|quiz|midterm|final|assessment)/i.test(text)) return "exam";
  if (/(presentation|slides|speech|seminar|demo|present)/i.test(text)) return "presentation";
  if (/(reading|read|chapter|article|book|summary|notes)/i.test(text)) return "reading";
  return "general";
}

// ------------------ LOCAL AI SIMULATION ------------------

function simulatedAI(input: CardAIInput): CardAIResult {
  const combined = `${input.title} ${input.description} ${input.boardTitle} ${input.columnTitle}`.toLowerCase();

  const taskType = inferTaskType(combined);
  const daysUntilDue = getDaysUntilDue(input.dueDate);

  let priority: CardAIResult["priority"] = "MEDIUM";

  if (daysUntilDue !== null) {
    if (daysUntilDue <= 2) priority = "HIGH";
    else if (daysUntilDue <= 5) priority = "HIGH";
    else if (daysUntilDue <= 10) priority = "MEDIUM";
    else priority = "LOW";
  }

  const variants = {
    essay: [
      ["Understand the essay question", "Create thesis", "Outline structure", "Write draft", "Edit final"],
      ["Analyze requirements", "Research sources", "Draft content", "Refine arguments", "Add citations"],
    ],
    project: [
      ["Define scope", "Break into tasks", "Build core", "Test features", "Finalize"],
      ["List deliverables", "Setup tools", "Develop main parts", "Fix issues", "Submit"],
    ],
    exam: [
      ["List topics", "Review notes", "Practice questions", "Fix weak areas", "Final review"],
      ["Summarize topics", "Memorize key ideas", "Self-test", "Review mistakes"],
    ],
    presentation: [
      ["Define message", "Outline slides", "Design slides", "Practice"],
    ],
    reading: [
      ["Read material", "Highlight points", "Summarize"],
    ],
    general: [
      ["Understand task", "Break into steps", "Start small", "Review progress"],
    ],
  };

  const options = variants[taskType] || variants.general;
  const subtasks = options[Math.floor(Math.random() * options.length)];

  const suggestion =
    daysUntilDue !== null && daysUntilDue <= 3
      ? "Deadline is very close — focus on completing the core requirements first."
      : "Work through the subtasks step by step and adjust as needed.";

  return {
    subtasks,
    priority,
    suggestion,
  };
}

// ------------------ MAIN FUNCTION ------------------

export async function generateCardAI(input: CardAIInput): Promise<CardAIResult> {
  const useLocal =
    process.env.USE_LOCAL_AI === "true" ||
    process.env.NODE_ENV === "development";

  if (useLocal) {
    console.log("Using LOCAL AI simulation");
    return simulatedAI(input);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("No API key, using simulated AI");
    return simulatedAI(input);
  }

  const client = new OpenAI({ apiKey });

  const prompt = `
You are a study planner assistant.

Create a plan based on:

Title: ${normalizeText(input.title)}
Description: ${normalizeText(input.description)}
Board: ${normalizeText(input.boardTitle)}
Column: ${normalizeText(input.columnTitle)}
Due: ${formatDateForPrompt(input.dueDate)}

Return ONLY JSON:
{subtasks: string[], priority: "HIGH"|"MEDIUM"|"LOW", suggestion: string}
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

    console.log("FULL RESPONSE:", JSON.stringify(response, null, 2));

    const raw =
      response.output
        ?.flatMap((o: any) => o.content ?? [])
        .find((c: any) => c.type === "output_text")?.text
        ?.trim();

    console.log("RAW TEXT:", raw);

    if (!raw) {
      console.warn("Empty AI response, using simulated AI");
      return simulatedAI(input);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("JSON parse failed");
      return simulatedAI(input);
    }

    return {
      subtasks: clampSubtasks(parsed.subtasks),
      priority:
        parsed.priority === "HIGH" || parsed.priority === "MEDIUM" || parsed.priority === "LOW"
          ? parsed.priority
          : "MEDIUM",
      suggestion: clampText(parsed.suggestion ?? ""),
    };
  } catch (error: any) {
    if (error?.code === "insufficient_quota") {
      console.warn("Quota exceeded, using simulated AI");
    } else {
      console.error("OpenAI error:", error);
    }
    return simulatedAI(input);
  }
}