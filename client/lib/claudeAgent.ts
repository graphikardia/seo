/**
 * Universal LLM caller — supports Anthropic, Groq, Cerebras,
 * OpenRouter, Mistral, and Google AI Studio (Gemini).
 * Provider is selected in Settings and stored in agentStore.
 */

import { agentStore, type LLMProvider } from "./agentStore";

export interface AgentStep {
  label: string;
  prompt: string;
  outputKey: string;
}

export interface AgentCallOptions {
  agentId: string;
  agentName: string;
  url: string;
  steps: AgentStep[];
  onLog: (text: string) => void;
  onStepComplete?: (key: string, data: unknown) => void;
}

// ─── Provider-specific fetch helpers ──────────────────────────────────────────

async function callOpenAICompat(
  prompt: string,
  baseUrl: string,
  model: string,
  apiKey: string,
): Promise<string> {
  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `API error ${resp.status}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callAnthropic(prompt: string, model: string, apiKey: string): Promise<string> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `API error ${resp.status}`);
  }
  const data = await resp.json();
  return (data.content || []).map((b: any) => b.text || "").join("").trim();
}

async function callGoogle(prompt: string, model: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1000 },
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `API error ${resp.status}`);
  }
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

// ─── Main dispatcher ───────────────────────────────────────────────────────────

async function callLLM(prompt: string): Promise<string> {
  const settings = agentStore.getSettings();
  const provider: LLMProvider = settings.llmProvider;
  const model = settings.llmModel;
  const apiKey = agentStore.getApiKey();

  if (!apiKey) throw new Error(`No API key set for ${provider}. Please add it in Settings.`);

  if (provider === "anthropic") {
    return callAnthropic(prompt, model, apiKey);
  }

  if (provider === "google") {
    return callGoogle(prompt, model, apiKey);
  }

  // All others are OpenAI-compatible
  const baseUrlMap: Record<string, string> = {
    groq: "https://api.groq.com/openai/v1",
    cerebras: "https://api.cerebras.ai/v1",
    openrouter: "https://openrouter.ai/api/v1",
    mistral: "https://api.mistral.ai/v1",
  };

  return callOpenAICompat(prompt, baseUrlMap[provider], model, apiKey);
}

// ─── JSON parser ───────────────────────────────────────────────────────────────

function safeParseJson(raw: string): unknown {
  try {
    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const start = clean.search(/[{[]/);
    const end = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
    if (start === -1 || end === -1) return { raw: clean };
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return { raw };
  }
}

// ─── Multi-step agent runner ───────────────────────────────────────────────────

export async function runAgentSteps(
  opts: AgentCallOptions,
): Promise<Record<string, unknown>> {
  const { agentId, agentName, url, steps, onLog, onStepComplete } = opts;
  const results: Record<string, unknown> = {};
  const settings = agentStore.getSettings();
  const providerName = agentStore.getProviderConfig().name;

  onLog(`[${agentName}] Starting — target: ${url}`);
  onLog(`[${agentName}] Provider: ${providerName} · Model: ${settings.llmModel}`);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onLog(`[${agentName}] Step ${i + 1}/${steps.length}: ${step.label}…`);

    try {
      const raw = await callLLM(step.prompt);
      const parsed = safeParseJson(raw);
      results[step.outputKey] = parsed;
      onStepComplete?.(step.outputKey, parsed);
      onLog(`[${agentName}] ✓ ${step.label} complete`);
    } catch (e: any) {
      onLog(`[${agentName}] ⚠ ${step.label} — ${e.message}`);
      results[step.outputKey] = { error: e.message };
    }

    await new Promise(r => setTimeout(r, 300));
  }

  onLog(`[${agentName}] ✅ All steps complete`);
  agentStore.addResult({
    agentId,
    agentName,
    url,
    completedAt: new Date().toISOString(),
    data: results,
  });

  return results;
}
