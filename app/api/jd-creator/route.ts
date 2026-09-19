import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], prompt = "", jobDetails } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    const systemInstructionText = `
You are an expert HR Specialist, Executive Talent Recruiter, and Job Description (JD/GD) Architect for "Bharat Organic Expo" (a premier organic agriculture, natural products, sustainable farming & ayush exhibition platform).

Your task is to help the Admin create world-class, professional, detailed, and engaging Job Descriptions (JDs).

When asked to generate or refine a Job Description, output structured, beautifully formatted Markdown with the following standard sections:
1. 📌 **Job Overview & Position Summary** (Role title, mission, team context, key objectives)
2. 🎯 **Key Responsibilities & Core Duties** (Bullet points outlining day-to-day work, strategic goals, and deliverables)
3. 🛠️ **Required Technical & Soft Skills** (Educational background, years of experience, technical tool mastery, communication skills)
4. 🌟 **Preferred & Bonus Qualifications** (Plus points, certifications, domain experience in organic/expo industry)
5. 💼 **Compensation & Benefits** (Salary expectation range, health perks, growth opportunities, flexible working)
6. 📍 **Job Details Summary Table** (Title, Department, Location / Remote, Employment Type, Experience Level)
7. 🚀 **How to Apply & Interview Process** (Call to action for applicants)

Maintain an encouraging, executive, and highly polished professional tone. If the admin provides minimal details, intelligently complete the relevant skills and responsibilities suited for that job role in the organic/expo industry.
Always respond in clean Markdown with clear headings and bullet points.
`;

    // Construct history for Gemini API
    const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // If chat history is passed
    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((msg: { role: string; content: string }) => {
        formattedContents.push({
          role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Add current user prompt or structured request if present
    if (prompt || jobDetails) {
      let currentInput = prompt;
      if (jobDetails) {
        currentInput = `Generate a comprehensive Job Description with the following inputs:
- **Job Title**: ${jobDetails.title || "Not specified"}
- **Department**: ${jobDetails.department || "General"}
- **Experience Level**: ${jobDetails.experience || "Not specified"}
- **Location**: ${jobDetails.location || "Hybrid / On-site"}
- **Employment Type**: ${jobDetails.type || "Full-time"}
- **Key Skills / Requirements**: ${jobDetails.skills || "Relevant industry skills"}
- **Additional Instructions**: ${prompt || "Make it professional and ready for publication"}`;
      }

      formattedContents.push({
        role: "user",
        parts: [{ text: currentInput }],
      });
    }

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: "user",
        parts: [{ text: "Hello! Please help me write a professional Job Description." }],
      });
    }

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstructionText }],
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2500,
      },
    };

    // Supported active models list
    const candidateModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-pro"];
    let response: Response | null = null;
    let lastErrorText = "";

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          response = res;
          break;
        } else {
          lastErrorText = await res.text();
          console.warn(`Model ${model} returned status ${res.status}:`, lastErrorText);
        }
      } catch (err: any) {
        lastErrorText = err.message || "Network request failed";
      }
    }

    if (!response) {
      return NextResponse.json(
        { error: `Gemini API response error: ${lastErrorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, could not generate response from Gemini AI. Please try again.";

    return NextResponse.json({
      success: true,
      text: generatedText,
      model: "Gemini 2.5 Flash AI",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("JD Creator Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate Job Description" },
      { status: 500 }
    );
  }
}
