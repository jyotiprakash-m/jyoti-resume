import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, tone, style, responsibilities, avoid, rules } = body;

    // Build the prompt for LLM to generate a system message
    let prompt = `Generate a clear and concise system message for an AI assistant based on the following persona configuration:

`;

    if (role) {
      prompt += `Role/Expertise: ${role}\n`;
    }

    if (tone) {
      prompt += `Tone/Personality: ${tone}\n`;
    }

    if (style) {
      prompt += `Communication Style: ${style}\n`;
    }

    if (responsibilities) {
      prompt += `\nPrimary Responsibilities:\n${responsibilities}\n`;
    }

    if (rules) {
      prompt += `\nBehavioral Rules:\n${rules}\n`;
    }

    if (avoid) {
      prompt += `\nConstraints/Things to Avoid:\n${avoid}\n`;
    }

    prompt += `\nGenerate a professional system message that instructs the AI on how to behave according to this persona. The system message should be clear, concise, and actionable. Output only the system message without any additional explanation or formatting.`;

    // Call OpenAI to generate the system message
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating clear and effective system prompts for AI assistants. Generate professional system messages based on persona configurations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const systemMessage = completion.choices[0]?.message?.content?.trim() || 
      "You are a helpful AI assistant. Be friendly, clear, and concise in your responses.";

    return NextResponse.json({
      systemMessage: systemMessage,
      success: true,
    });
  } catch (error: any) {
    console.error("Error generating system message:", error);
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your OpenAI configuration." },
        { status: 401 }
      );
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate system message" },
      { status: 500 }
    );
  }
}
