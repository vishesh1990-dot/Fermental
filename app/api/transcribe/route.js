import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function commitToGitHub(filename, content) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const filePath = `posts/${filename}`;
  const encoded = Buffer.from(content).toString('base64');

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add post: ${filename}`,
      content: encoded,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub API error: ${err.message}`);
  }

  return await res.json();
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const touchLevel = formData.get('touchLevel') || 'light';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Step 1 — Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], 'recording.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
    });

    const rawTranscript = transcription.text;

    // Step 2 — Turn into a real blog post with Claude
    const blogSystemPrompt = touchLevel === 'minimal'
      ? `You are a blog post formatter. The user has recorded a voice note. Your job:
- Keep every word they said intact
- Only fix punctuation, capitalisation, and paragraph breaks
- Add a clear title that reflects what they spoke about
- Do NOT add, remove, or rephrase any content
- Structure it with natural paragraph breaks only

Return your response as JSON with these exact keys:
{
  "title": "Post title here",
  "excerpt": "One sentence summary under 25 words",
  "body": "Full formatted post body here"
}
Return only valid JSON. No markdown code blocks. No explanation.`
      : `You are a blog post editor who preserves authentic voice. The user has recorded a voice note. Your job:
- Remove filler words only (um, uh, you know, like when used as filler, basically, literally)
- Fix punctuation and capitalisation
- Break into natural paragraphs
- Add a compelling title that reflects the content
- Add natural section breaks if the content covers multiple ideas
- Keep their exact words, tone, personality, and examples
- Do NOT write a formal introduction or conclusion they didn't say
- Do NOT add information they didn't mention
- The post should read exactly like they speak, just cleaned up

Return your response as JSON with these exact keys:
{
  "title": "Post title here",
  "excerpt": "One sentence summary under 25 words",
  "body": "Full formatted post body here with markdown paragraph breaks"
}
Return only valid JSON. No markdown code blocks. No explanation.`;

    const blogResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: blogSystemPrompt,
      messages: [{ role: 'user', content: `Here is the voice transcript to turn into a blog post:\n\n${rawTranscript}` }],
    });

    let title, excerpt, body;
    try {
      const responseText = blogResponse.content[0].text.trim();
      const parsed = JSON.parse(responseText);
      title = parsed.title;
      excerpt = parsed.excerpt;
      body = parsed.body;
    } catch {
      // Fallback if JSON parse fails
      title = 'New Post';
      excerpt = rawTranscript.slice(0, 120);
      body = rawTranscript;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60)
      + '-' + Date.now().toString().slice(-4);

    const date = new Date().toISOString().split('T')[0];

    const markdown = `---
title: "${title.replace(/"/g, "'")}"
date: "${date}"
excerpt: "${excerpt.replace(/"/g, "'")}"
---

${body}`;

    // Step 3 — Commit to GitHub → Vercel auto-deploys
    await commitToGitHub(`${slug}.md`, markdown);

    return NextResponse.json({
      success: true,
      slug,
      title,
      excerpt,
      transcript: rawTranscript,
      formatted: body,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}