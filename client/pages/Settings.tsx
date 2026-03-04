import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Settings as SettingsIcon, Eye, EyeOff, CheckCircle, AlertCircle,
  ExternalLink, Key, Bell, Sliders, Save, Cpu, ChevronDown,
} from "lucide-react";
import { agentStore, PROVIDERS, type AppSettings, type LLMProvider } from "@/lib/agentStore";

// ── Social & other API key fields ──────────────────────────────────────────────
const SOCIAL_FIELDS: {
  key: keyof AppSettings; label: string; placeholder: string;
  desc: string; link: string; linkLabel: string; isId?: boolean;
}[] = [
  {
    key: "twitterToken",
    label: "Twitter / X Bearer Token",
    placeholder: "AAAAAAAAAAAAAAAAAAAAAA...",
    desc: "Bearer token for Twitter API v2 — used by Social Publisher agent to post tweets.",
    link: "https://developer.twitter.com/en/portal/dashboard",
    linkLabel: "Developer portal →",
  },
  {
    key: "linkedinToken",
    label: "LinkedIn Access Token",
    placeholder: "AQV8AAAAA...",
    desc: "OAuth access token for LinkedIn API v2. Used by Social Publisher to post to your page.",
    link: "https://developer.linkedin.com",
    linkLabel: "Developer docs →",
  },
  {
    key: "facebookToken",
    label: "Facebook Page Access Token",
    placeholder: "EAABwzLixnjYBO...",
    desc: "Page access token from Graph API Explorer — used to post to your Facebook Page.",
    link: "https://developers.facebook.com/tools/explorer",
    linkLabel: "Graph API Explorer →",
  },
  {
    key: "instagramToken",
    label: "Instagram Graph API Token",
    placeholder: "EAABwzLixnjYBO...",
    desc: "Instagram Business account token via Meta Graph API. Must link Instagram to a Facebook Page first.",
    link: "https://developers.facebook.com",
    linkLabel: "Meta for Developers →",
  },
];

const SCAN_OPTIONS: { key: keyof AppSettings; label: string; options: string[] }[] = [
  { key: "crawlDepth", label: "Crawl Depth", options: ["Shallow (1 level)", "Standard (3 levels)", "Deep (5 levels)"] },
  { key: "scanSpeed", label: "Scan Speed", options: ["Slow", "Standard", "Fast"] },
  { key: "autoScanFreq", label: "Auto-Scan Frequency", options: ["Daily", "Weekly", "Monthly", "Off"] },
];

const NOTIF_OPTIONS: { key: keyof AppSettings; label: string; desc: string }[] = [
  { key: "emailAlerts", label: "Email Alerts", desc: "Get notified of completed scans and agent runs" },
  { key: "scoreDropAlerts", label: "Score Drop Alerts", desc: "Alert when SEO/AEO score drops more than 5 points" },
  { key: "competitorAlerts", label: "Competitor Alerts", desc: "Notify when tracked competitors make significant changes" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function KeyInput({ fieldKey, label, placeholder, desc, link, linkLabel, isId, settings, update, visible, setVisible }: {
  fieldKey: keyof AppSettings; label: string; placeholder: string; desc: string;
  link: string; linkLabel: string; isId?: boolean;
  settings: AppSettings; update: (k: keyof AppSettings, v: string) => void;
  visible: Record<string, boolean>; setVisible: (fn: (p: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  const val = String(settings[fieldKey] ?? "");
  const hasVal = val.length > 4;
  return (
    <div className="card-glow p-5 rounded-xl">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm font-semibold text-white">{label}</label>
            {hasVal && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" />SET
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap transition-colors shrink-0">
          {linkLabel} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="relative">
        <input
          type={isId ? "text" : visible[String(fieldKey)] ? "text" : "password"}
          value={val}
          onChange={e => update(fieldKey, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-white text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        {!isId && (
          <button
            onClick={() => setVisible(p => ({ ...p, [String(fieldKey)]: !p[String(fieldKey)] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {visible[String(fieldKey)] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(() => agentStore.getSettings());
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const unsub = agentStore.subscribe(() => setSettings(agentStore.getSettings()));
    return unsub;
  }, []);

  const update = (key: keyof AppSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const selectProvider = (id: LLMProvider) => {
    const p = PROVIDERS.find(p => p.id === id)!;
    setSettings(prev => ({ ...prev, llmProvider: id, llmModel: p.models[0].id }));
    setTestResult(null);
  };

  const save = async () => {
    setSaving(true);
    agentStore.saveSettings(settings);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const testKey = async () => {
    const provider = PROVIDERS.find(p => p.id === settings.llmProvider)!;
    const keyMap: Record<LLMProvider, string> = {
      anthropic: settings.anthropicKey, groq: settings.groqKey,
      cerebras: settings.cerebrasKey, openrouter: settings.openrouterKey,
      mistral: settings.mistralKey, google: settings.googleKey,
    };
    const key = keyMap[settings.llmProvider];
    if (!key) { setTestResult({ ok: false, msg: "No API key entered for this provider." }); return; }

    setTesting(true);
    setTestResult(null);
    try {
      let resp: Response;
      if (settings.llmProvider === "anthropic") {
        resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({ model: settings.llmModel, max_tokens: 10, messages: [{ role: "user", content: "Hi" }] }),
        });
      } else if (settings.llmProvider === "google") {
        resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.llmModel}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }], generationConfig: { maxOutputTokens: 10 } }),
        });
      } else {
        resp = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
          body: JSON.stringify({ model: settings.llmModel, max_tokens: 10, messages: [{ role: "user", content: "Hi" }] }),
        });
      }
      setTestResult(resp.ok
        ? { ok: true, msg: `✓ Connected to ${provider.name} — key is valid!` }
        : { ok: false, msg: `✗ Request failed (${resp.status}) — check your key` });
    } catch (e: any) {
      setTestResult({ ok: false, msg: `✗ ${e.message}` });
    }
    setTesting(false);
  };

  const activeProvider = PROVIDERS.find(p => p.id === settings.llmProvider)!;
  const activeKeyMap: Record<LLMProvider, keyof AppSettings> = {
    anthropic: "anthropicKey", groq: "groqKey", cerebras: "cerebrasKey",
    openrouter: "openrouterKey", mistral: "mistralKey", google: "googleKey",
  };
  const activeKeyField = activeKeyMap[settings.llmProvider];
  const activeKeyVal = String(settings[activeKeyField] ?? "");
  const activeKeySet = activeKeyVal.length > 4;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-cyan-400" />
            Settings
          </h1>
          <p className="text-gray-400">Configure your AI provider, API keys, and scan preferences.</p>
        </div>

        {/* ── LLM Provider Selection ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full" />
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">AI Provider</h2>
            <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">All free options available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {PROVIDERS.map(p => {
              const isActive = settings.llmProvider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectProvider(p.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900/60 border-slate-700/40 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${isActive ? "text-cyan-300" : "text-white"}`}>{p.name}</span>
                    {isActive && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-xs text-gray-400">{p.freeDesc}</p>
                </button>
              );
            })}
          </div>

          {/* Active provider model + key */}
          <div className="card-glow p-5 rounded-xl space-y-4">
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Model</label>
              <div className="relative">
                <select
                  value={settings.llmModel}
                  onChange={e => update("llmModel", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  {activeProvider.models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  {activeProvider.name} API Key
                  {activeKeySet && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" />SET
                    </span>
                  )}
                </label>
                <a href={activeProvider.signupUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Get free key → <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={visible["activeKey"] ? "text" : "password"}
                  value={activeKeyVal}
                  onChange={e => update(activeKeyField, e.target.value)}
                  placeholder={`Paste your ${activeProvider.name} API key here…`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-20 py-3 text-white text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {activeKeySet && (
                    <button
                      onClick={testKey}
                      disabled={testing}
                      className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-gray-400 rounded transition-colors"
                    >
                      {testing ? "Testing…" : "Test"}
                    </button>
                  )}
                  <button
                    onClick={() => setVisible(p => ({ ...p, activeKey: !p.activeKey }))}
                    className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {visible["activeKey"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {testResult && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${testResult.ok ? "text-green-400" : "text-red-400"}`}>
                  {testResult.ok
                    ? <CheckCircle className="w-3.5 h-3.5" />
                    : <AlertCircle className="w-3.5 h-3.5" />}
                  {testResult.msg}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Social API Keys ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full" />
            <Key className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Social Publishing Keys</h2>
            <span className="text-xs text-gray-500 font-mono">optional</span>
          </div>
          <div className="space-y-4">
            {SOCIAL_FIELDS.map(f => (
              <KeyInput
                key={String(f.key)}
                fieldKey={f.key}
                label={f.label}
                placeholder={f.placeholder}
                desc={f.desc}
                link={f.link}
                linkLabel={f.linkLabel}
                isId={f.isId}
                settings={settings}
                update={update}
                visible={visible}
                setVisible={setVisible}
              />
            ))}
          </div>
        </section>

        {/* ── Scan Preferences ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-cyan-500 rounded-full" />
            <Sliders className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Scan Preferences</h2>
          </div>
          <div className="card-glow p-6 rounded-xl space-y-5">
            {SCAN_OPTIONS.map(opt => {
              const val = String(settings[opt.key] ?? opt.options[1]);
              return (
                <div key={String(opt.key)} className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-300 font-medium">{opt.label}</label>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {opt.options.map(o => (
                      <button key={o} onClick={() => update(opt.key, o)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          val === o
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            : "bg-slate-800 text-gray-500 border border-slate-700/40 hover:border-slate-600"
                        }`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
            <Bell className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="card-glow p-6 rounded-xl space-y-4">
            {NOTIF_OPTIONS.map(opt => {
              const val = Boolean(settings[opt.key]);
              return (
                <div key={String(opt.key)} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white font-medium">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                  <button onClick={() => update(opt.key, !val)}
                    className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${val ? "bg-cyan-500" : "bg-slate-700"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Privacy note ── */}
        <section className="mb-10">
          <div className="card-glow p-5 rounded-xl bg-blue-500/5 border-blue-500/20">
            <h3 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />Data & Privacy
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              All API keys are stored in browser session storage only — they are never sent to any server other than
              the selected AI provider directly. Agent results are kept in memory for this session only.
              No data is persisted to any database or third-party service.
            </p>
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
            saved
              ? "bg-green-600/60 border border-green-500/40 text-white"
              : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/30"
          } disabled:opacity-60`}
        >
          {saving ? (
            <><SpinIcon />Saving…</>
          ) : saved ? (
            <><CheckCircle className="w-5 h-5" />Settings Saved!</>
          ) : (
            <><Save className="w-5 h-5" />Save All Settings</>
          )}
        </button>
      </div>
    </Layout>
  );
}

function SpinIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
