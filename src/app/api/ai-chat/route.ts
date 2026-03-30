import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

// Allow up to 60 seconds for AI generation on Vercel serverless
export const maxDuration = 60;

// ─── Cached ZAI Instance (module-level singleton) ───
// Creating ZAI.create() on every request was the main bottleneck.
// Now we create it once and reuse it for all subsequent requests.
let cachedZAI: Awaited<ReturnType<typeof ZAI.create>> | null = null;
let zaiInitPromise: Promise<Awaited<ReturnType<typeof ZAI.create>>> | null = null;

async function getZAI(): Promise<Awaited<ReturnType<typeof ZAI.create>>> {
  if (cachedZAI) return cachedZAI;
  if (zaiInitPromise) return zaiInitPromise;

  zaiInitPromise = ZAI.create().then((zai) => {
    cachedZAI = zai;
    zaiInitPromise = null;
    return zai;
  }).catch((err) => {
    zaiInitPromise = null;
    throw err;
  });

  return zaiInitPromise;
}

const SYSTEM_PROMPT = `You are DataBot, an intelligent and versatile AI assistant for DataTrack Pro learning platform. You are extremely knowledgeable in ALL subjects including:
- Data Analytics (Excel, SQL, Power BI, Python, Data Warehousing, Databricks)
- Programming (Python, JavaScript, TypeScript, Java, C++, R, Go, Rust, SQL)
- Mathematics (statistics, calculus, algebra, probability, data science math)
- Science (computer science, physics, chemistry, biology)
- Technology (cloud computing, AI/ML, databases, web development, DevOps)
- General knowledge, study techniques, career advice, interview preparation

Guidelines:
- Give clear, well-structured answers with examples when helpful
- Use markdown formatting for better readability (headers, bullet points, code blocks)
- For code questions, always provide working examples
- For question generation, output clean JSON or clearly formatted questions
- Be encouraging and educational in tone
- If asked to generate questions/quizzes, create thoughtful, accurate questions with clear answers
- Keep responses focused but thorough
- When explaining concepts, start simple then add depth`;

async function callAI(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, maxRetries = 2): Promise<string> {
  let lastError: Error | null = null;

  // 3 attempts: 45s, 45s, 25s timeouts
  const timeouts = [45000, 45000, 25000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const zai = await getZAI();
      const timeoutMs = timeouts[attempt] || 25000;
      const completion = await Promise.race([
        zai.chat.completions.create({ messages }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out')), timeoutMs)
        ),
      ]);
      const reply = completion.choices[0]?.message?.content;
      if (reply) return reply;
      lastError = new Error('Empty response from AI');
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = attempt === 0 ? 800 : 1500;
        console.warn(`AI call attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error('AI service unavailable');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, context, messages: conversationMessages } = body;

    if ((!message && !conversationMessages) || (message && typeof message !== 'string')) {
      return NextResponse.json(
        { error: 'A valid message is required', reply: null },
        { status: 400 }
      );
    }

    const aiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add study context if provided
    if (context && typeof context === 'string') {
      aiMessages.push({
        role: 'system',
        content: `The user's current context: ${context}. Tailor your response accordingly while being helpful.`,
      });
    }

    // Use conversation messages if provided (multi-turn), otherwise use single message
    if (Array.isArray(conversationMessages) && conversationMessages.length > 0) {
      for (const msg of conversationMessages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          aiMessages.push({ role: msg.role, content: msg.content });
        }
      }
    } else if (message) {
      aiMessages.push({ role: 'user', content: message });
    }

    const reply = await callAI(aiMessages);

    return NextResponse.json({ reply, success: true });
  } catch (error) {
    console.error('AI Chat error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    // Return a descriptive error code so the client can show better messages
    const errorType = errorMsg.includes('timed out')
      ? 'timeout'
      : errorMsg.includes('Empty response')
        ? 'empty'
        : 'unavailable';

    return NextResponse.json(
      {
        error: 'AI is temporarily unavailable. Please try again in a moment.',
        reply: null,
        details: errorMsg,
        errorType,
      },
      { status: 200 } // Return 200 with null reply so client can handle gracefully
    );
  }
}
