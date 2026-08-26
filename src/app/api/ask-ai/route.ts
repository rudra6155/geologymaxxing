import { NextRequest } from 'next/server';
import { loadChapter } from '@/lib/content-loader';
import type { Block } from '@/lib/types';

// Simple in-memory rate limiter
// In a serverless environment (like Vercel), this memory resets on cold starts.
// For an offline-first MVP or small-scale app, this is acceptable.
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30; // Max 30 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let record = rateLimits.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimits.set(ip, record);
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count += 1;
  return true;
}

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'a', 'an', 'and', 'or', 'but', 'how', 'why', 'when', 'where', 'who', 
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about', 'difference', 'between', 'are', 
  'do', 'does', 'did', 'can', 'could', 'would', 'explain', 'describe'
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function scoreBlock(block: Block, keywords: string[]): number {
  let score = 0;
  const content = (block.title + ' ' + JSON.stringify(block.body)).toLowerCase();
  
  for (const kw of keywords) {
    // Simple occurrence count or boolean match
    if (content.includes(kw)) {
      score += 1;
    }
  }
  return score;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "I'm getting a lot of questions right now. Try again in a minute." }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Parse Request
    const { question, chapterSlug } = await req.json();
    if (!question || !chapterSlug) {
      return new Response('Missing question or chapterSlug', { status: 400 });
    }

    // 3. RAG Retrieval
    const chapter = loadChapter(12, chapterSlug); // Hardcoding std 12 as per existing pattern
    if (!chapter) {
      return new Response('Chapter not found', { status: 404 });
    }

    // Flatten all blocks in the chapter
    const allBlocks: Block[] = [];
    chapter.topics.forEach(topic => {
      topic.blocks.forEach(block => allBlocks.push(block));
    });

    const keywords = extractKeywords(question);
    
    // Score and sort blocks
    const scoredBlocks = allBlocks.map(block => ({
      block,
      score: scoreBlock(block, keywords)
    })).sort((a, b) => b.score - a.score);

    // Take top 4 blocks
    const topBlocks = scoredBlocks.slice(0, 4).map(sb => sb.block);
    
    // Format blocks as text context
    const contextText = topBlocks.map(b => `[Topic/Block: ${b.title}]\n${JSON.stringify(b.body)}`).join('\n\n');

    // 4. Construct System Prompt
    const systemPrompt = `You are an AI tutor for Maharashtra State Board Geology (Std 11/12). A student has asked a question about geology.

Here is the relevant course material:
${contextText}

Answer the student's question based ONLY on the provided material above.

If the material does not cover the question, say clearly: "This isn't covered in the material I have access to. Ask your teacher or check a textbook."

Do not add information from your training data, even if you know the answer. Stay grounded in what's provided.

Be concise. Geology answers should typically be 2–4 sentences for a quick clarification, or 1 short paragraph for a concept explanation.`;

    // 5. Call Groq API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: true,
        temperature: 0.1, // Low temperature for factual RAG
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API Error:', errorText);
      return new Response(JSON.stringify({ error: "Failed to communicate with the AI model." }), { status: 500 });
    }

    // 6. Stream back to client
    // We can just proxy the Groq stream directly! It uses standard SSE format.
    return new Response(groqResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: "Request timed out, try again." }), { 
        status: 504,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.error('Ask AI Error:', error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), { status: 500 });
  }
}
