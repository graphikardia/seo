/**
 * Shared in-memory store for agent state, API keys, results, and post history.
 */

export interface AgentResult {
  agentId: string;
  agentName: string;
  url: string;
  completedAt: string;
  data: Record<string, unknown>;
}

export interface PostRecord {
  id: string;
  platform: string;
  content: string;
  topic: string;
  tone: string;
  status: "queued" | "posting" | "posted" | "scheduled" | "failed";
  createdAt: string;
  scheduledFor?: string;
  postedAt?: string;
  error?: string | null;
  metrics?: { impressions: number; clicks: number; likes: number };
}

export type LLMProvider = "anthropic" | "groq" | "cerebras" | "openrouter" | "mistral" | "google";

export interface ProviderConfig {
  id: LLMProvider;
  name: string;
  baseUrl: string;
  signupUrl: string;
  freeDesc: string;
  models: { id: string; name: string }[];
  headerKey: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    signupUrl: "https://console.groq.com",
    freeDesc: "✅ Free — 14,400 req/day (no credit card)",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (1,000 req/day)" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (14,400 req/day)" },
      { id: "moonshotai/kimi-k2-instruct", name: "Kimi K2 (1,000 req/day)" },
    ],
    headerKey: "Authorization",
  },
  {
    id: "cerebras",
    name: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1",
    signupUrl: "https://cloud.cerebras.ai",
    freeDesc: "✅ Free — 1M tokens/day, 14,400 req/day",
    models: [
      { id: "llama-3.3-70b", name: "Llama 3.3 70B" },
      { id: "llama3.1-8b", name: "Llama 3.1 8B (fastest)" },
      { id: "qwen-3-32b", name: "Qwen 3 32B" },
    ],
    headerKey: "Authorization",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    signupUrl: "https://openrouter.ai",
    freeDesc: "✅ Free — 50 req/day, 20+ free models",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (free)" },
      { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B (free)" },
      { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small 3.1 (free)" },
    ],
    headerKey: "Authorization",
  },
  {
    id: "mistral",
    name: "Mistral (La Plateforme)",
    baseUrl: "https://api.mistral.ai/v1",
    signupUrl: "https://console.mistral.ai",
    freeDesc: "✅ Free experiment plan (data training opt-in)",
    models: [
      { id: "mistral-small-latest", name: "Mistral Small" },
      { id: "open-mistral-nemo", name: "Mistral Nemo" },
    ],
    headerKey: "Authorization",
  },
  {
    id: "google",
    name: "Google AI Studio (Gemini)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    signupUrl: "https://aistudio.google.com",
    freeDesc: "✅ Free — up to 500 req/day (Flash)",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (500 req/day)" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (20 req/day)" },
    ],
    headerKey: "x-goog-api-key",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    baseUrl: "https://api.anthropic.com",
    signupUrl: "https://console.anthropic.com",
    freeDesc: "💳 Free trial credits on sign-up",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 (cheapest)" },
    ],
    headerKey: "x-api-key",
  },
];

export interface AppSettings {
  llmProvider: LLMProvider;
  llmModel: string;
  anthropicKey: string;
  groqKey: string;
  cerebrasKey: string;
  openrouterKey: string;
  mistralKey: string;
  googleKey: string;
  twitterToken: string;
  linkedinToken: string;
  facebookToken: string;
  instagramToken: string;
  crawlDepth: string;
  scanSpeed: string;
  autoScanFreq: string;
  emailAlerts: boolean;
  scoreDropAlerts: boolean;
  competitorAlerts: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  llmProvider: "groq",
  llmModel: "llama-3.3-70b-versatile",
  anthropicKey: "",
  groqKey: "",
  cerebrasKey: "",
  openrouterKey: "",
  mistralKey: "",
  googleKey: "",
  twitterToken: "",
  linkedinToken: "",
  facebookToken: "",
  instagramToken: "",
  crawlDepth: "Standard (3 levels)",
  scanSpeed: "Standard",
  autoScanFreq: "Weekly",
  emailAlerts: true,
  scoreDropAlerts: true,
  competitorAlerts: false,
};

type Listener = () => void;

class AgentStore {
  private results: AgentResult[] = [];
  private posts: PostRecord[] = [];
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  private listeners: Set<Listener> = new Set();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  getSettings(): AppSettings {
    try {
      const stored = sessionStorage.getItem("ws_settings");
      if (stored) this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return { ...this.settings };
  }

  saveSettings(s: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...s };
    try { sessionStorage.setItem("ws_settings", JSON.stringify(this.settings)); } catch {}
    this.notify();
  }

  getApiKey(): string {
    const s = this.getSettings();
    const keyMap: Record<LLMProvider, string> = {
      anthropic: s.anthropicKey,
      groq: s.groqKey,
      cerebras: s.cerebrasKey,
      openrouter: s.openrouterKey,
      mistral: s.mistralKey,
      google: s.googleKey,
    };
    return keyMap[s.llmProvider] || "";
  }

  getProviderConfig(): ProviderConfig {
    const s = this.getSettings();
    return PROVIDERS.find(p => p.id === s.llmProvider) ?? PROVIDERS[0];
  }

  // ── Agent results ─────────────────────────────────────────────────────────

  addResult(r: AgentResult) {
    this.results = [r, ...this.results.filter(x => x.agentId !== r.agentId)];
    this.notify();
  }

  getResults(): AgentResult[] {
    return [...this.results];
  }

  getResult(agentId: string): AgentResult | undefined {
    return this.results.find(r => r.agentId === agentId);
  }

  clearResults() {
    this.results = [];
    this.notify();
  }

  // ── Post history (AutoPost) ───────────────────────────────────────────────

  getPosts(): PostRecord[] {
    return [...this.posts];
  }

  addPost(p: PostRecord) {
    this.posts.unshift(p);
    this.notify();
  }

  updatePost(id: string, patch: Partial<PostRecord>) {
    const idx = this.posts.findIndex(p => p.id === id);
    if (idx !== -1) this.posts[idx] = { ...this.posts[idx], ...patch };
    this.notify();
  }

  clearPosts() {
    this.posts = [];
    this.notify();
  }
}

export const agentStore = new AgentStore();
