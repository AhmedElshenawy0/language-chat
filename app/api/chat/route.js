import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 120, // 👈 controls length hard

        messages: [
          {
            role: "system",
            content: `You are Lexie, a high-converting AI sales assistant for language courses.

Rules:
- Be helpful, structured, and persuasive
- Keep answers clean and UI-friendly
- Use bullet points when useful
- Keep responses VERY concise (max 2-4 lines)
- Avoid long explanations
- Focus only on what the user needs`,
          },
          ...(history || []),
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();

    return NextResponse.json({
      text: data.choices?.[0]?.message?.content || "No response",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { text: "⚠️ Server error, try again." },
      { status: 500 },
    );
  }
}
