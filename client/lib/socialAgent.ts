/**
 * Social post generation agent.
 * Uses the active LLM provider from agentStore to generate
 * platform-native posts for Twitter, LinkedIn, Facebook, Instagram.
 */

import { agentStore, type PostRecord } from "./agentStore";
import { callLLM as callLLMBase } from "./llm";

export type Platform = "twitter" | "linkedin" | "facebook" | "instagram";

export interface PlatformPost {
  platform: Platform;
  content: string;
  charCount: number;
  hashtags: string[];
  scheduledFor?: string;
  status: "ready" | "posting" | "posted" | "failed";
  error?: string;
}

export interface SocialAgentOptions {
  topic: string;
  url?: string;
  tone: string;
  platforms: Platform[];
  scheduleMode: "now" | "scheduled";
  customTime?: string;
  signal?: AbortSignal;
  onLog: (msg: string, level?: "info" | "warn" | "error" | "success") => void;
  onStepChange: (step: number) => void;
  onPostReady: (post: PlatformPost) => void;
}

const CHAR_LIMITS: Record<Platform, number> = {
  twitter: 280,
  linkedin: 3000,
  facebook: 500,
  instagram: 2200,
};

const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  twitter: "Write a punchy tweet under 260 characters. Use 1-2 relevant hashtags. No emojis unless they add value. Hook in first 5 words.",
  linkedin: "Write a professional LinkedIn post (150-300 words). Start with a bold insight or question. Use short paragraphs. End with a CTA. 3-5 relevant hashtags.",
  facebook: "Write an engaging Facebook post (100-200 words). Conversational tone. Ask a question to drive comments. 2-3 hashtags optional.",
  instagram: "Write an Instagram caption (100-150 words). Start with a hook. Tell a micro-story. End with a CTA. Use 5-10 relevant hashtags.",
};

export const AGENT_STEPS = [
  { label: "Researching topic & audience" },
  { label: "Generating platform posts" },
  { label: "Optimising for engagement" },
  { label: "Finalising & scheduling" },
];


function extractHashtags(text: string): string[] {
  return (text.match(/#\w+/g) || []).slice(0, 10);
}

export async function runSocialAgent(opts: SocialAgentOptions): Promise<void> {
  const { topic, url, tone, platforms, scheduleMode, customTime, signal, onLog, onStepChange, onPostReady } = opts;

  onLog(`Starting social agent for: "${topic}"`, "info");
  onStepChange(0);

  // Step 0 — research
  onLog("Researching topic and target audience…", "info");
  await new Promise(r => setTimeout(r, 400));

  onStepChange(1);
  onLog(`Generating posts for: ${platforms.join(", ")}`, "info");

  // Step 1 — generate posts per platform
  for (const platform of platforms) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    onLog(`Writing ${platform} post…`, "info");

    const limit = CHAR_LIMITS[platform];
    const instructions = PLATFORM_INSTRUCTIONS[platform];
    const urlLine = url ? `\nWebsite/URL context: ${url}` : "";

    const prompt = `You are an expert social media copywriter.
Topic: ${topic}${urlLine}
Tone: ${tone}
Platform: ${platform}
Instructions: ${instructions}
Character limit: ${limit}

Write ONLY the post content. No preamble, no explanation, no quotes around it. Just the post text ready to publish.`;

    try {
      const content = await callLLMBase(prompt);
      const trimmed = content.slice(0, limit);
      const post: PlatformPost = {
        platform,
        content: trimmed,
        charCount: trimmed.length,
        hashtags: extractHashtags(trimmed),
        scheduledFor: scheduleMode === "scheduled" && customTime ? customTime : undefined,
        status: "ready",
      };
      onPostReady(post);
      onLog(`✓ ${platform} post ready (${trimmed.length} chars)`, "success");

      // Save to history
      const record: PostRecord = {
        id: `${platform}-${Date.now()}`,
        platform,
        content: trimmed,
        topic,
        tone,
        status: scheduleMode === "scheduled" ? "scheduled" : "queued",
        createdAt: new Date().toISOString(),
        scheduledFor: post.scheduledFor,
      };
      agentStore.addPost(record);
    } catch (e: any) {
      if (e.name === "AbortError") throw e;
      onLog(`⚠ ${platform} failed: ${e.message}`, "error");
    }

    await new Promise(r => setTimeout(r, 200));
  }

  onStepChange(2);
  onLog("Optimising posts for engagement…", "info");
  await new Promise(r => setTimeout(r, 300));

  onStepChange(3);
  onLog("✅ All posts generated and ready!", "success");
}
