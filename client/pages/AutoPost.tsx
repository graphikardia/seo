import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import {
  RefreshCw, CheckCircle, AlertCircle, Bot, Square,
  RotateCcw, Sparkles, Send, Copy, Hash
} from "lucide-react";
import { agentStore, type PostRecord } from "@/lib/agentStore";
import { runSocialAgent, AGENT_STEPS, type PlatformPost, type Platform } from "@/lib/socialAgent";

const PLATFORMS = [
  { id:"twitter"  as Platform, label:"Twitter / X", icon:"𝕏",  limit:280,  color:"text-sky-400",    border:"border-sky-500/40",    bg:"bg-sky-500/10",    hex:"#38bdf8" },
  { id:"linkedin" as Platform, label:"LinkedIn",    icon:"in", limit:3000, color:"text-blue-400",   border:"border-blue-500/40",   bg:"bg-blue-500/10",   hex:"#60a5fa" },
  { id:"facebook" as Platform, label:"Facebook",    icon:"f",  limit:500,  color:"text-indigo-400", border:"border-indigo-500/40", bg:"bg-indigo-500/10", hex:"#818cf8" },
  { id:"instagram"as Platform, label:"Instagram",   icon:"◎",  limit:2200, color:"text-pink-400",   border:"border-pink-500/40",   bg:"bg-pink-500/10",   hex:"#f472b6" },
];

const TONES = ["professional","casual","enthusiastic","educational","witty","inspirational","urgent","storytelling"];

const STATUS_CFG: Record<string,{label:string;cls:string}> = {
  queued:    { label:"Queued",     cls:"text-gray-400 bg-slate-800 border-slate-600" },
  posting:   { label:"Posting…",  cls:"text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  posted:    { label:"Posted ✓",  cls:"text-green-400 bg-green-500/10 border-green-500/30" },
  failed:    { label:"Failed",    cls:"text-red-400 bg-red-500/10 border-red-500/30" },
  scheduled: { label:"Scheduled", cls:"text-purple-400 bg-purple-500/10 border-purple-500/30" },
};

interface LogEntry { time:string; msg:string; level:"info"|"success"|"warn"|"error"; }
const LOG_COLOR: Record<string,string> = { info:"#94a3b8", success:"#4ade80", warn:"#fbbf24", error:"#f87171" };

// ── Preview card ──────────────────────────────────────────────────────────────
function PreviewCard({ post, platform, onEdit, onPost, isPosting }: {
  post: PlatformPost;
  platform: typeof PLATFORMS[0];
  onEdit: (p: Platform, c: string) => void;
  onPost: (p: Platform) => void;
  isPosting: boolean;
}) {
  const [draft, setDraft] = useState(post.content);
  const [editing, setEditing] = useState(false);
  const over = draft.length > platform.limit;

  return (
    <div className={"rounded-2xl border " + platform.border + " bg-slate-900/60 overflow-hidden flex flex-col"}>
      {/* Header */}
      <div className={"px-4 py-3 flex items-center justify-between border-b " + platform.border}>
        <div className="flex items-center gap-2.5">
          <div className={"w-8 h-8 rounded-lg " + platform.bg + " border " + platform.border + " flex items-center justify-center"}>
            <span className={"font-black text-sm " + platform.color}>{platform.icon}</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">{platform.label}</p>
            <span className={"text-[10px] font-mono " + (over ? "text-red-400 font-bold" : "text-gray-500")}>
              {draft.length}/{platform.limit}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { navigator.clipboard.writeText(draft); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Copy">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditing(!editing)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-600 text-gray-400 hover:text-white transition-colors">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {editing ? (
          <div className="space-y-2">
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={6}
              className={"w-full bg-slate-950 border rounded-lg p-3 text-sm text-white font-mono resize-none focus:outline-none " + (over ? "border-red-500/50" : "border-slate-700 focus:border-cyan-500/50")} />
            <button onClick={() => { onEdit(post.platform, draft); setEditing(false); }}
              className="px-3 py-1.5 bg-cyan-500 text-white text-xs rounded-lg font-bold hover:bg-cyan-400 transition-colors">Save</button>
          </div>
        ) : (
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{draft}</p>
        )}
      </div>

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {post.hashtags.map(h => (
            <span key={h} className={"px-2 py-0.5 rounded-md text-[10px] font-mono " + platform.bg + " " + platform.color + " border " + platform.border}>{h}</span>
          ))}
        </div>
      )}

      {/* Post button */}
      <div className="px-4 pb-4">
        <button onClick={() => onPost(post.platform)} disabled={isPosting || over}
          className={"w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all " +
            (isPosting ? "bg-slate-700 text-gray-500 cursor-not-allowed" :
             over ? "bg-red-500/10 text-red-400 border border-red-500/30 cursor-not-allowed" :
             "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20")}>
          {isPosting ? <><RefreshCw className="w-4 h-4 animate-spin" />Posting…</> : <><Send className="w-4 h-4" />Post to {platform.label}</>}
        </button>
      </div>
    </div>
  );
}

// ── History card ──────────────────────────────────────────────────────────────
function HistoryCard({ post, onRetry }: { post: PostRecord; onRetry: (id: string) => void }) {
  const pl = PLATFORMS.find(p => p.id === post.platform);
  const cfg = STATUS_CFG[post.status] || STATUS_CFG.queued;
  if (!pl) return null;
  return (
    <div className={"p-4 rounded-xl border " + pl.border + " bg-slate-900/40"}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={"text-sm font-black " + pl.color}>{pl.icon}</span>
          <span className="text-white text-sm font-semibold">{pl.label}</span>
          <span className={"text-[10px] font-mono px-2 py-0.5 rounded-full border " + cfg.cls}>{cfg.label}</span>
        </div>
        <span className="text-[10px] text-gray-600 font-mono shrink-0">
          {post.postedAt ? new Date(post.postedAt).toLocaleString() : post.scheduledFor || new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{post.content}</p>
      {post.error && (
        <p className="text-red-400 text-xs mt-2 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />{post.error}
        </p>
      )}
      {post.status === "failed" && (
        <button onClick={() => onRetry(post.id)} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
          <RotateCcw className="w-3 h-3" />Retry
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AutoPost() {
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [tone, setTone] = useState("professional");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(["twitter","linkedin"]));
  const [scheduleMode, setScheduleMode] = useState<"now"|"scheduled">("now");
  const [customTime, setCustomTime] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [readyPosts, setReadyPosts] = useState<PlatformPost[]>([]);
  const [postHistory, setPostHistory] = useState<PostRecord[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [error, setError] = useState("");
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [manualPosting, setManualPosting] = useState<Set<Platform>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = agentStore.subscribe(() => {
      setPostHistory(agentStore.getPosts());
      setApiKeyMissing(!agentStore.getApiKey());
    });
    setPostHistory(agentStore.getPosts());
    setApiKeyMissing(!agentStore.getApiKey());
    return unsub;
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = useCallback((msg: string, level: LogEntry["level"] = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLog(prev => [...prev.slice(-99), { time, msg, level }]);
  }, []);

  const togglePlatform = (id: Platform) => setSelectedPlatforms(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  const handleEditPost = (platform: Platform, content: string) =>
    setReadyPosts(prev => prev.map(p => p.platform === platform ? { ...p, content, charCount: content.length } : p));

  const handlePost = async (platform: Platform) => {
    const post = readyPosts.find(p => p.platform === platform);
    if (!post) return;
    const settings = agentStore.getSettings();
    const tokenMap: Record<Platform, string> = {
      twitter: settings.twitterToken,
      linkedin: settings.linkedinToken,
      facebook: settings.facebookToken,
      instagram: settings.instagramToken,
    };
    const token = tokenMap[platform];
    if (!token) {
      agentStore.addPost({ id: Date.now().toString(36), platform, content: post.content, topic, tone,
        status: "failed", createdAt: new Date().toISOString(),
        error: "No " + platform + " token — add it in Settings → Social Publishing Keys." });
      return;
    }

    setManualPosting(prev => new Set([...prev, platform]));
    try {
      let endpoint = "";
      if (platform === "twitter") endpoint = "/api/post-twitter";
      else if (platform === "linkedin") endpoint = "/api/post-linkedin";
      else if (platform === "facebook") endpoint = "/api/post-facebook";
      else {
        agentStore.addPost({ id: Date.now().toString(36), platform, content: post.content, topic, tone,
          status: "failed", createdAt: new Date().toISOString(),
          error: "Instagram requires Meta Business Suite — copy the text and post manually." });
        setManualPosting(prev => { const s = new Set(prev); s.delete(platform); return s; });
        return;
      }

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: post.content, token }),
      });
      const result = await resp.json();

      agentStore.addPost({ id: Date.now().toString(36), platform, content: post.content, topic, tone,
        status: resp.ok && result.success ? "posted" : "failed",
        createdAt: new Date().toISOString(),
        postedAt: resp.ok && result.success ? new Date().toISOString() : undefined,
        error: resp.ok && result.success ? null : (result.error || "Post failed") });

      if (resp.ok && result.success)
        setReadyPosts(prev => prev.filter(p => p.platform !== platform));

    } catch (e: any) {
      agentStore.addPost({ id: Date.now().toString(36), platform, content: post.content, topic, tone,
        status: "failed", createdAt: new Date().toISOString(), error: e.message });
    }
    setManualPosting(prev => { const s = new Set(prev); s.delete(platform); return s; });
  };

  const runAgent = async () => {
    if (!topic.trim() || selectedPlatforms.size === 0) return;
    if (!agentStore.getApiKey()) { setApiKeyMissing(true); return; }
    abortRef.current = new AbortController();
    setAgentRunning(true); setError(""); setLog([]); setReadyPosts([]); setCurrentStep(0); setProgress(0);
    try {
      await runSocialAgent({
        topic, url, tone, platforms: Array.from(selectedPlatforms),
        scheduleMode, customTime: customTime || undefined, signal: abortRef.current.signal,
        onLog: (msg, level = "info") => addLog(msg, level),
        onStepChange: step => { setCurrentStep(step); setProgress(Math.round(((step + 1) / AGENT_STEPS.length) * 100)); },
        onPostReady: post => setReadyPosts(prev => [...prev.filter(p => p.platform !== post.platform), post]),
      });
    } catch (e: any) {
      if (e.name !== "AbortError") { setError(e.message); addLog("Fatal: " + e.message, "error"); }
      else addLog("Agent stopped.", "warn");
    }
    setAgentRunning(false); setCurrentStep(-1);
  };

  const stopAgent = () => abortRef.current?.abort();
  const retryPost = (id: string) => agentStore.updatePost(id, { status: "queued", error: null });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold glow-purple mb-2">Auto-Post Engine</h1>
          <p className="text-gray-400">AI generates platform-optimised posts and publishes them directly</p>
        </div>

        {apiKeyMissing && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-300">Add your API key in <a href="/settings" className="underline hover:text-orange-200">Settings</a> to activate the agent.</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — Controls */}
          <div className="space-y-5">
            <div className="card-glow p-5 rounded-xl space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">TOPIC / URL</label>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What to post about…"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 mb-2" />
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Website URL (optional)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">TONE</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      className={"px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all " +
                        (tone === t ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-slate-800 text-gray-500 border border-slate-700 hover:text-gray-300")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">PLATFORMS</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                      className={"p-3 rounded-xl border text-center transition-all relative " +
                        (selectedPlatforms.has(p.id) ? p.border + " " + p.bg : "border-slate-700/40 bg-slate-900/30 hover:border-slate-600")}>
                      {selectedPlatforms.has(p.id) && <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: p.hex }} />}
                      <div className={"text-lg font-black mb-1 " + (selectedPlatforms.has(p.id) ? p.color : "text-gray-600")}>{p.icon}</div>
                      <div className={"text-xs font-semibold " + (selectedPlatforms.has(p.id) ? "text-white" : "text-gray-600")}>{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">SCHEDULE</label>
                <div className="flex gap-2 mb-2">
                  {(["now","scheduled"] as const).map(m => (
                    <button key={m} onClick={() => setScheduleMode(m)}
                      className={"flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all " +
                        (scheduleMode === m ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-slate-800 text-gray-500 border border-slate-700 hover:text-gray-300")}>
                      {m === "now" ? "Post Now" : "Schedule"}
                    </button>
                  ))}
                </div>
                {scheduleMode === "scheduled" && (
                  <input type="datetime-local" value={customTime} onChange={e => setCustomTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                )}
              </div>

              <button onClick={agentRunning ? stopAgent : runAgent}
                disabled={!agentRunning && (!topic.trim() || selectedPlatforms.size === 0)}
                className={"w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all " +
                  (agentRunning ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" :
                   "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed")}>
                {agentRunning
                  ? <><Square className="w-4 h-4" />Stop Agent</>
                  : <><Sparkles className="w-4 h-4" />Launch Social Agent</>}
              </button>
            </div>

            {/* Agent progress */}
            {agentRunning && (
              <div className="card-glow p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono font-bold text-gray-400 tracking-widest">PROGRESS</p>
                  <span className="text-xs font-mono text-cyan-400">{progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: progress + "%" }} />
                </div>
                <div className="space-y-2">
                  {AGENT_STEPS.map((step, i) => (
                    <div key={i} className={"flex items-center gap-2 text-xs " +
                      (i < currentStep ? "text-green-400" : i === currentStep ? "text-cyan-400" : "text-gray-600")}>
                      {i < currentStep ? <CheckCircle className="w-3 h-3 shrink-0" /> :
                       i === currentStep ? <RefreshCw className="w-3 h-3 shrink-0 animate-spin" /> :
                       <div className="w-3 h-3 rounded-full border border-current shrink-0" />}
                      {step.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Middle — Posts */}
          <div className="xl:col-span-2 space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Live log */}
            {(agentRunning || log.length > 0) && (
              <div className="card-glow rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-cyan-500/20 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-gray-400 tracking-widest">AGENT LOG</span>
                </div>
                <div ref={logRef} className="p-4 h-40 overflow-y-auto font-mono text-xs space-y-1 bg-slate-950/50">
                  {log.map((entry, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-gray-600 shrink-0">{entry.time}</span>
                      <span style={{ color: LOG_COLOR[entry.level] }}>{entry.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ready posts */}
            {readyPosts.length > 0 && (
              <div>
                <h2 className="text-sm font-mono font-bold text-gray-400 tracking-widest mb-3">READY TO POST</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {readyPosts.map(post => {
                    const pl = PLATFORMS.find(p => p.id === post.platform)!;
                    return (
                      <PreviewCard key={post.platform} post={post} platform={pl}
                        onEdit={handleEditPost} onPost={handlePost}
                        isPosting={manualPosting.has(post.platform)} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* History */}
            {postHistory.length > 0 && (
              <div>
                <h2 className="text-sm font-mono font-bold text-gray-400 tracking-widest mb-3">POST HISTORY</h2>
                <div className="space-y-3">
                  {postHistory.slice(0, 20).map(post => (
                    <HistoryCard key={post.id} post={post} onRetry={retryPost} />
                  ))}
                </div>
              </div>
            )}

            {!agentRunning && readyPosts.length === 0 && postHistory.length === 0 && (
              <div className="card-glow rounded-xl p-12 text-center">
                <Bot className="w-10 h-10 text-cyan-500/30 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Enter a topic, select platforms, and click <span className="text-cyan-400">Launch Social Agent</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
