import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say hello" }],
  });

  return NextResponse.json(res.choices[0].message);
}