/**
 * Single shared LLM caller used by all pages.
 * Reads the active provider + key from agentStore — no page needs to know which API is in use.
 */
import { agentStore } from "./agentStore";

export async function callLLM(prompt: string, maxTokens = 1000): Promise<string> {
  const settings = agentStore.getSettings();
  const provider = settings.llmProvider;
  const model = settings.llmModel;
  const apiKey = agentStore.getApiKey();

  if (!apiKey) throw new Error(`No API key set. Go to Settings and add your ${agentStore.getProviderConfig().name} key.`);

  if (provider === "anthropic") {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
    });
    if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error((e as any)?.error?.message || `Anthropic error ${resp.status}`); }
    const d = await resp.json();
    return (d.content || []).map((b: any) => b.text || "").join("").trim();
  }

  if (provider === "google") {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
      }
    );
    if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error((e as any)?.error?.message || `Google error ${resp.status}`); }
    const d = await resp.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  }

  // Groq, Cerebras, OpenRouter, Mistral — all OpenAI-compatible
  const baseUrl: Record<string, string> = {
    groq: "https://api.groq.com/openai/v1",
    cerebras: "https://api.cerebras.ai/v1",
    openrouter: "https://openrouter.ai/api/v1",
    mistral: "https://api.mistral.ai/v1",
  };

  const resp = await fetch(`${baseUrl[provider]}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error((e as any)?.error?.message || `${provider} error ${resp.status}`); }
  const d = await resp.json();
  return d.choices?.[0]?.message?.content?.trim() ?? "";
}
