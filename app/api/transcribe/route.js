import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const touchLevel = formData.get('touchLevel') || 'light';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert audio to buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save temp file for Whisper
    const tempPath = path.join('/tmp', `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempPath, buffer);

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-1',
    });

    fs.unlinkSync(tempPath);

    const rawTranscript = transcription.text;

    // Format with Claude based on touch level
    const systemPrompt = touchLevel === 'minimal'
      ? `You are a text formatter. Only add punctuation and paragraph breaks to the transcript. Do not change any words. Do not add or remove content. Return only the formatted text.`
      : `You are a text formatter. Remove filler words (um, uh, you know, like when used as filler). Add proper punctuation and paragraph breaks. Do not change the person's actual words, tone, or meaning. Do not add introductions or conclusions they didn't say. Return only the formatted text.`;

    const formatted = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: rawTranscript }],
    });

    const formattedText = formatted.content[0].text;

    // Generate title and excerpt with Claude
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

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);

    const date = new Date().toISOString().split('T')[0];

    // Create markdown file
    const markdown = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
---

${formattedText}`;

    const filePath = path.join(process.cwd(), 'posts', `${slug}.md`);
    fs.writeFileSync(filePath, markdown);

    return NextResponse.json({
      success: true,
      slug,
      title,
      excerpt,
      transcript: rawTranscript,
      formatted: formattedText,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}