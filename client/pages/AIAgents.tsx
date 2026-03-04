import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import {
  Bot, Zap, Search, Globe, FileText, Share2, Activity,
  Play, Square, CheckCircle, ChevronDown, ChevronUp,
  AlertCircle, Download, Trash2, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { runAgentSteps } from "@/lib/claudeAgent";
import { agentStore, type AgentResult } from "@/lib/agentStore";
import {
  getSeoSteps, getAeoSteps, getGeoSteps,
  getContentWriterSteps, getSocialPublisherSteps, getSiteAuditorSteps
} from "@/lib/agentPrompts";

// ─── Agent definitions ────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "seo", name: "SEO Optimizer", Icon: Search,
    color: "text-purple-400", border: "border-purple-500/30",
    bg: "bg-purple-500/10", hex: "#c084fc",
    desc: "Full keyword gap analysis, meta audit, heading structure, internal link map, schema opportunities, competitor gaps, and 90-day action plan.",
    stepCount: 5,
    getSteps: (url: string) => getSeoSteps(url),
  },
  {
    id: "aeo", name: "AEO Agent", Icon: Bot,
    color: "text-pink-400", border: "border-pink-500/30",
    bg: "bg-pink-500/10", hex: "#f472b6",
    desc: "Entity building, FAQ clusters for Perplexity & ChatGPT, featured snippet targeting, and NLP semantic optimization.",
    stepCount: 4,
    getSteps: (url: string) => getAeoSteps(url),
  },
  {
    id: "geo", name: "GEO Optimizer", Icon: Globe,
    color: "text-green-400", border: "border-green-500/30",
    bg: "bg-green-500/10", hex: "#4ade80",
    desc: "LLM prompt simulation, citation signal audit, structured data injection plan, and AI readability restructuring.",
    stepCount: 4,
    getSteps: (url: string) => getGeoSteps(url),
  },
  {
    id: "content", name: "Content Writer", Icon: FileText,
    color: "text-yellow-400", border: "border-yellow-500/30",
    bg: "bg-yellow-500/10", hex: "#facc15",
    desc: "Topic cluster mapping, pillar content generation, social content series, and content refresh audit — all SEO+AEO+GEO optimized.",
    stepCount: 4,
    getSteps: (url: string, topic?: string) => getContentWriterSteps(url, topic),
  },
  {
    id: "social", name: "Social Publisher", Icon: Share2,
    color: "text-cyan-400", border: "border-cyan-500/30",
    bg: "bg-cyan-500/10", hex: "#22d3ee",
    desc: "Brand voice analysis, 7-day Twitter calendar, LinkedIn authority series, and Instagram visual content plan.",
    stepCount: 4,
    getSteps: (url: string) => getSocialPublisherSteps(url),
  },
  {
    id: "audit", name: "Site Auditor", Icon: Activity,
    color: "text-red-400", border: "border-red-500/30",
    bg: "bg-red-500/10", hex: "#f87171",
    desc: "Core Web Vitals audit, broken link detection, redirect chains, competitor rank tracking, and full monitoring plan.",
    stepCount: 4,
    getSteps: (url: string) => getSiteAuditorSteps(url),
  },
];

// ─── Log entry type ───────────────────────────────────────────────────────────
interface LogEntry { time: string; text: string; hex: string; }

// ─── Result renderer ──────────────────────────────────────────────────────────
function ResultSection({ label, data }: { label: string; data: unknown }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;

  const renderValue = (val: unknown, depth = 0): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-gray-600">—</span>;
    if (typeof val === "string") return <span className="text-gray-300">{val}</span>;
    if (typeof val === "number" || typeof val === "boolean")
      return <span className="text-cyan-400 font-mono">{String(val)}</span>;
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-1 mt-1">
          {val.map((item, i) => (
            <li key={i} className={`flex gap-2 ${depth > 0 ? "ml-4" : ""}`}>
              <span className="text-slate-600 shrink-0 mt-0.5">·</span>
              <span>{renderValue(item, depth + 1)}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (typeof val === "object") {
      return (
        <div className={`space-y-2 ${depth > 0 ? "ml-4 mt-1" : ""}`}>
          {Object.entries(val as Record<string, unknown>).map(([k, v]) => (
            <div key={k}>
              <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">{k}: </span>
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-gray-400">{String(val)}</span>;
  };

  const isError = typeof data === "object" && data !== null && "error" in data;

  return (
    <div className={`rounded-lg border ${isError ? "border-red-500/30 bg-red-500/5" : "border-slate-700/40 bg-slate-900/40"} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/30 transition-colors"
      >
        <span className={`text-xs font-mono font-bold tracking-widest ${isError ? "text-red-400" : "text-slate-400"}`}>
          {isError ? "⚠ " : "✓ "}{label.toUpperCase().replace(/_/g, " ")}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm leading-relaxed border-t border-slate-700/30 pt-3">
          {renderValue(data)}
        </div>
      )}
    </div>
  );
}

function AgentResultPanel({ result, agent }: { result: AgentResult; agent: typeof AGENTS[0] }) {
  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${agent.id}-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/40">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-mono">
          Report generated {new Date(result.completedAt).toLocaleTimeString()} for {result.url}
        </span>
        <div className="flex gap-2">
          <button onClick={copy} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-gray-400 rounded transition-colors">
            Copy JSON
          </button>
          <button onClick={download} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-gray-400 rounded transition-colors">
            <Download className="w-3 h-3" /> Download
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {Object.entries(result.data).map(([key, val]) => (
          <ResultSection key={key} label={key} data={val} />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AIAgents() {
  const [running, setRunning] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState<Set<string>>(new Set());
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [contentTopic, setContentTopic] = useState("");
  const [results, setResults] = useState<AgentResult[]>([]);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [, forceUpdate] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = agentStore.subscribe(() => {
      setResults(agentStore.getResults());
      forceUpdate(n => n + 1);
    });
    setResults(agentStore.getResults());
    const settings = agentStore.getSettings();
    setApiKeyMissing(!settings.anthropicKey);
    return unsub;
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = useCallback((text: string, hex: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLog(prev => [...prev.slice(-99), { time, text, hex }]);
  }, []);

  const runAgent = async (agent: typeof AGENTS[0]) => {
    if (running.has(agent.id)) return;

    const settings = agentStore.getSettings();
    if (!settings.anthropicKey) {
      setErrors(prev => ({ ...prev, [agent.id]: "No API key — go to Settings to add your Anthropic key." }));
      setApiKeyMissing(true);
      return;
    }

    setErrors(prev => { const n = { ...prev }; delete n[agent.id]; return n; });
    setRunning(prev => new Set([...prev, agent.id]));
    setDone(prev => { const s = new Set(prev); s.delete(agent.id); return s; });

    try {
      const steps = agent.id === "content"
        ? agent.getSteps(targetUrl, contentTopic || undefined)
        : agent.getSteps(targetUrl);

      await runAgentSteps({
        agentId: agent.id,
        agentName: agent.name,
        url: targetUrl,
        steps,
        onLog: (text) => addLog(text, agent.hex),
      });

      setDone(prev => new Set([...prev, agent.id]));
      setShowResult(prev => new Set([...prev, agent.id]));
    } catch (e: any) {
      addLog(`[${agent.name}] ✗ Fatal: ${e.message}`, "#ef4444");
      setErrors(prev => ({ ...prev, [agent.id]: e.message }));
    }

    setRunning(prev => { const s = new Set(prev); s.delete(agent.id); return s; });
  };

  const deployAll = () => AGENTS.forEach(a => runAgent(a));
  const stopAll = () => { setRunning(new Set()); addLog("[System] All agents stopped by user.", "#ef4444"); };
  const toggleExpand = (id: string) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleResult = (id: string) => setShowResult(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const clearAll = () => { agentStore.clearResults(); setDone(new Set()); setErrors({}); setLog([]); setShowResult(new Set()); };

  const totalDone = done.size;
  const totalRunning = running.size;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-5">
          <div>
            <h1 className="text-4xl font-bold glow-purple mb-2">AI Agent Fleet</h1>
            <p className="text-gray-400">Real Claude-powered agents — each performs multi-step analysis and delivers a structured report</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex gap-2">
              <div className="relative">
                <input
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-slate-900 border border-cyan-500/20 rounded-lg pl-4 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/50 w-64"
                />
              </div>
              {totalRunning > 0
                ? <button onClick={stopAll} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg font-bold text-sm hover:bg-red-500/30 transition-colors whitespace-nowrap">
                    <Square className="w-4 h-4" /> Stop All
                  </button>
                : <button onClick={deployAll} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all whitespace-nowrap">
                    <Zap className="w-4 h-4" /> Deploy All
                  </button>
              }
            </div>
            <input
              value={contentTopic}
              onChange={e => setContentTopic(e.target.value)}
              placeholder="Content topic (for Content Writer agent)"
              className="bg-slate-900 border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-yellow-500/50 w-full"
            />
          </div>
        </div>

        {/* API key warning */}
        {apiKeyMissing && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
            <p className="text-sm text-orange-300">
              <strong>Anthropic API key required.</strong> Go to{" "}
              <a href="/settings" className="underline hover:text-orange-200">Settings</a>{" "}
              to add your key — agents use Claude AI to perform real analysis.
            </p>
          </div>
        )}

        {/* Stats bar */}
        {(totalDone > 0 || totalRunning > 0) && (
          <div className="flex items-center gap-6 mb-6 p-4 bg-slate-900/60 border border-slate-700/40 rounded-xl text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-mono font-bold">{totalDone}</span>
              <span className="text-gray-500">complete</span>
            </div>
            {totalRunning > 0 && (
              <div className="flex items-center gap-2 text-cyan-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="font-mono font-bold">{totalRunning}</span>
                <span className="text-gray-500">running</span>
              </div>
            )}
            <button onClick={clearAll} className="ml-auto flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-xs transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear all results
            </button>
          </div>
        )}

        {/* Agent cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {AGENTS.map(agent => {
            const isRunning = running.has(agent.id);
            const isDone = done.has(agent.id);
            const isExpanded = expanded.has(agent.id);
            const hasResult = showResult.has(agent.id);
            const result = agentStore.getResult(agent.id);
            const err = errors[agent.id];

            return (
              <div
                key={agent.id}
                className={`card-glow rounded-xl overflow-hidden transition-all duration-300 ${
                  isDone ? "border-green-500/30" : isRunning ? agent.border : ""
                }`}
                style={isRunning ? { boxShadow: `0 0 24px ${agent.hex}20` } : undefined}
              >
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${agent.bg} border ${agent.border} flex items-center justify-center shrink-0`}>
                        <agent.Icon className={`w-6 h-6 ${agent.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base flex items-center gap-2 flex-wrap">
                          {agent.name}
                          {isDone && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {isRunning && (
                            <span className="flex gap-1">
                              {[0,1,2].map(i => (
                                <span key={i} className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: agent.hex, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                              ))}
                            </span>
                          )}
                        </h3>
                        <p className={`text-xs font-mono font-bold ${agent.color} opacity-70`}>
                          {agent.stepCount} STEPS · AI AGENT
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 items-center shrink-0 flex-wrap justify-end">
                      {isDone && result && (
                        <button
                          onClick={() => toggleResult(agent.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors"
                        >
                          {hasResult ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {hasResult ? "Hide" : "View"} Report
                        </button>
                      )}
                      <button onClick={() => toggleExpand(agent.id)} className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => runAgent(agent)}
                        disabled={isRunning}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          isRunning
                            ? `${agent.bg} ${agent.color} cursor-not-allowed`
                            : isDone
                            ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                            : "bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-slate-600 hover:to-slate-500"
                        }`}
                      >
                        {isRunning ? (
                          <><RefreshCwSpin />Running</>
                        ) : isDone ? (
                          <><RefreshCw className="w-3 h-3" />Re-run</>
                        ) : (
                          <><Play className="w-3 h-3" />Activate</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {err && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {err}
                    </div>
                  )}

                  {/* Expanded description */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-700/40">
                      <p className="text-sm text-gray-400 mb-3 leading-relaxed">{agent.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.getSteps(targetUrl).map((step, i) => (
                          <span key={i} className={`text-xs px-2.5 py-1 rounded-md border ${agent.border} ${agent.bg} ${agent.color} font-mono`}>
                            {i + 1}. {step.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result panel */}
                  {hasResult && result && (
                    <AgentResultPanel result={result} agent={agent} />
                  )}
                </div>

                {/* Progress bar */}
                {isRunning && (
                  <div className="h-0.5 bg-slate-800">
                    <div
                      className="h-full animate-scan-progress rounded-full"
                      style={{ background: `linear-gradient(90deg, ${agent.hex}, ${agent.hex}88)`, boxShadow: `0 0 8px ${agent.hex}` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live terminal log */}
        <div className="card-glow rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-500/20 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-mono text-gray-400">agent.log — live output</span>
            </div>
            <div className="flex items-center gap-3">
              {totalRunning > 0 && (
                <span className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                      style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </span>
              )}
              <span className="text-xs font-mono text-gray-600">{log.length} entries</span>
              {log.length > 0 && (
                <button onClick={() => setLog([])} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">clear</button>
              )}
            </div>
          </div>
          <div ref={logRef} className="terminal min-h-40 max-h-72 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-gray-600 text-sm">Waiting for agent activation — logs stream here in real-time…</p>
            ) : (
              log.map((entry, i) => (
                <div key={i} className="flex gap-3 text-xs leading-6 font-mono">
                  <span className="text-gray-600 shrink-0 select-none">{entry.time}</span>
                  <span style={{ color: entry.hex }}>{entry.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function RefreshCwSpin() {
  return (
    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
