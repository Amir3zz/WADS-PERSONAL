import OpenAI from "openai";

export type WorkloadRisk = "LOW" | "MEDIUM" | "HIGH";

export type WorkloadTask = {
  title: string;
  boardTitle: string;
  columnTitle: string;
  dueDate: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  completed: boolean;
};

export type WorkloadAIInput = {
  totalBoards: number;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  tasks: WorkloadTask[];
};

export type WorkloadAIResult = {
  riskLevel: WorkloadRisk;
  summary: string;
  recommendation: string;
  focusTasks: string[];
};

const WORKLOAD_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    riskLevel: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
    summary: {
      type: "string",
    },
    recommendation: {
      type: "string",
    },
    focusTasks: {
      type: "array",
      items: { type: "string" },
      minItems: 0,
      maxItems: 5,
    },
  },
  required: ["riskLevel", "summary", "recommendation", "focusTasks"],
} as const;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function clampText(value: string, max = 500): string {
  const clean = normalizeText(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function clampList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((item) => clampText(item, 120))
    .filter(Boolean)
    .slice(0, 5);
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateForPrompt(value: string | null): string {
  const date = parseDate(value);
  if (!date) return "(none)";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function priorityWeight(priority: WorkloadTask["priority"]): number {
  if (priority === "HIGH") return 3;
  if (priority === "MEDIUM") return 2;
  if (priority === "LOW") return 1;
  return 0;
}

function isWithinDays(date: Date, days: number): boolean {
  const now = Date.now();
  const diff = date.getTime() - now;
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function sortTasks(tasks: WorkloadTask[]): WorkloadTask[] {
  return [...tasks].sort((a, b) => {
    const aDate = parseDate(a.dueDate);
    const bDate = parseDate(b.dueDate);

    if (aDate && bDate) {
      const diff = aDate.getTime() - bDate.getTime();
      if (diff !== 0) return diff;
    } else if (aDate && !bDate) {
      return -1;
    } else if (!aDate && bDate) {
      return 1;
    }

    const priorityDiff =
      priorityWeight(b.priority) - priorityWeight(a.priority);
    if (priorityDiff !== 0) return priorityDiff;

    return a.title.localeCompare(b.title);
  });
}

function buildTaskLabel(task: WorkloadTask): string {
  const due = task.dueDate ? ` · due ${formatDateForPrompt(task.dueDate)}` : "";
  const board = task.boardTitle ? ` · ${task.boardTitle}` : "";
  const column = task.columnTitle ? ` / ${task.columnTitle}` : "";
  return `${task.title}${board}${column}${due}`;
}

function simulatedWorkloadAI(input: WorkloadAIInput): WorkloadAIResult {
  const urgentTasks = sortTasks(
    input.tasks.filter((task) => !task.completed),
  ).slice(0, 5);

  let riskLevel: WorkloadRisk = "LOW";

  if (
    input.overdueTasks >= 2 ||
    input.dueSoonTasks >= 4 ||
    input.openTasks >= 10
  ) {
    riskLevel = "HIGH";
  } else if (
    input.overdueTasks >= 1 ||
    input.dueSoonTasks >= 2 ||
    input.openTasks >= 5
  ) {
    riskLevel = "MEDIUM";
  }

  const overduePhrase =
    input.overdueTasks > 0
      ? `${input.overdueTasks} overdue task${input.overdueTasks > 1 ? "s" : ""}`
      : "no overdue tasks";

  const dueSoonPhrase =
    input.dueSoonTasks > 0
      ? `${input.dueSoonTasks} task${input.dueSoonTasks > 1 ? "s" : ""} due soon`
      : "no urgent deadlines";

  const summary =
    riskLevel === "HIGH"
      ? `Your workload is high-risk with ${overduePhrase} and ${dueSoonPhrase}.`
      : riskLevel === "MEDIUM"
        ? `Your workload is moderate with ${overduePhrase} and ${dueSoonPhrase}.`
        : `Your workload looks manageable with ${overduePhrase} and a balanced task load.`;

  const recommendation =
    riskLevel === "HIGH"
      ? "Focus on the most urgent deadline first, then split the rest into smaller study sessions today."
      : riskLevel === "MEDIUM"
        ? "Keep working through the top-priority tasks and reserve time blocks for the tasks due soon."
        : "Keep your current pace and continue finishing tasks before they pile up.";

  return {
    riskLevel,
    summary,
    recommendation,
    focusTasks: urgentTasks.map(buildTaskLabel),
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

export async function generateWorkloadAI(
  input: WorkloadAIInput,
): Promise<WorkloadAIResult> {
  const useLocal = process.env.USE_LOCAL_AI === "true";
  const apiKey = process.env.OPENAI_API_KEY;

  if (useLocal || !apiKey) {
    return simulatedWorkloadAI(input);
  }

  const client = new OpenAI({ apiKey });

  const tasksForPrompt = sortTasks(input.tasks)
    .slice(0, 20)
    .map((task, index) => {
      const due = task.dueDate
        ? formatDateForPrompt(task.dueDate)
        : "(no due date)";
      return `${index + 1}. ${task.title} | board: ${task.boardTitle} | column: ${task.columnTitle} | due: ${due} | priority: ${task.priority ?? "UNKNOWN"} | completed: ${task.completed}`;
    })
    .join("\n");

  const prompt = `
You are a study planner assistant that detects burnout and overload risk.

Analyze the student's current workload and return a practical assessment.

Workload summary:
- Total boards: ${input.totalBoards}
- Total tasks: ${input.totalTasks}
- Open tasks: ${input.openTasks}
- Completed tasks: ${input.completedTasks}
- Overdue tasks: ${input.overdueTasks}
- Due soon tasks (within 3 days): ${input.dueSoonTasks}

Open tasks:
${tasksForPrompt || "(none)"}

Rules:
- Return only JSON.
- Be concise but helpful.
- Focus on the student's workload risk.
- Suggest the most urgent or important tasks to handle first.
- Mention overload or burnout risk only if justified by the workload.

Return this exact JSON shape:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "string",
  "recommendation": "string",
  "focusTasks": ["string"]
}
`;

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "workload_analysis",
          strict: true,
          schema: WORKLOAD_SCHEMA,
        },
      },
    });

    const raw = extractJsonText(response);
    if (!raw) {
      return simulatedWorkloadAI(input);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return simulatedWorkloadAI(input);
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("riskLevel" in parsed) ||
      !("summary" in parsed) ||
      !("recommendation" in parsed) ||
      !("focusTasks" in parsed)
    ) {
      return simulatedWorkloadAI(input);
    }

    const result = parsed as {
      riskLevel: unknown;
      summary: unknown;
      recommendation: unknown;
      focusTasks: unknown;
    };

    return {
      riskLevel:
        result.riskLevel === "HIGH" ||
        result.riskLevel === "MEDIUM" ||
        result.riskLevel === "LOW"
          ? result.riskLevel
          : "MEDIUM",
      summary: clampText(String(result.summary ?? "")),
      recommendation: clampText(String(result.recommendation ?? "")),
      focusTasks: clampList(result.focusTasks),
    };
  } catch {
    return simulatedWorkloadAI(input);
  }
}
