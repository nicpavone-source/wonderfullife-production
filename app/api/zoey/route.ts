import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { reply: "Please ask me a question." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing.");

      return NextResponse.json(
        {
          reply:
            "I'm not connected to my AI service right now. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",

          input: [
            {
              role: "system",
              content:
                "You are Zoey, the warm, friendly AI wellness guide for WonderfulLife.ca. Help visitors with general wellness, nutrition, healthy living, sleep, stress management, healthy aging, recipes, movement, motivation, and everyday lifestyle questions. Keep answers conversational, encouraging, practical, and easy to understand. Usually answer in 2 to 4 short paragraphs. Do not diagnose medical conditions or replace professional medical advice. When appropriate, encourage the visitor to speak with a qualified healthcare professional.",
            },

            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Zoey OpenAI error:", data);

      return NextResponse.json(
        {
          reply:
            "I'm having a little trouble connecting right now. Please try asking me again in a moment.",
        },
        { status: response.status }
      );
    }

    const reply =
      data.output
        ?.flatMap((item: any) => item.content ?? [])
        ?.filter((part: any) => part.type === "output_text")
        ?.map((part: any) => part.text)
        ?.join("")
        ?.trim() || "";

    if (!reply) {
      console.error("Zoey received no output text:", data);

      return NextResponse.json({
        reply:
          "I'm here. Tell me a little more about what you'd like to improve.",
      });
    }

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error("Zoey route error:", error);

    return NextResponse.json(
      {
        reply:
          "I had trouble connecting, but I'm still here. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}