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

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], 'recording.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
    });

    const rawTranscript = transcription.text;

    // Format with Claude
    const systemPrompt = touchLevel === 'minimal'
      ? `You are a text formatter. Only add punctuation and paragraph breaks. Do not change any words. Return only the formatted text.`
      : `You are a text formatter. Remove filler words (um, uh, you know, like when used as filler). Add proper punctuation and paragraph breaks. Do not change the person's actual words or tone. Return only the formatted text.`;

    const formatted = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: rawTranscript }],
    });

    const formattedText = formatted.content[0].text;

    // Generate title and excerpt
    const meta = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 200,
      system: 'Return only valid JSON with keys: title (string, max 10 words), excerpt (string, max 20 words). No markdown, no explanation.',
      messages: [{ role: 'user', content: formattedText }],
    });

    let title, excerpt;
    try {
      const parsed = JSON.parse(meta.content[0].text);
      title = parsed.title;
      excerpt = parsed.excerpt;
    } catch {
      title = 'New Post';
      excerpt = formattedText.slice(0, 100);
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);

    const date = new Date().toISOString().split('T')[0];

    const markdown = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
---

${formattedText}`;

    // Commit to GitHub — Vercel auto-deploys after this
    await commitToGitHub(`${slug}.md`, markdown);

    return NextResponse.json({
      success: true,
      slug,
      title,
      excerpt,
      transcript: rawTranscript,
      formatted: formattedText,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}