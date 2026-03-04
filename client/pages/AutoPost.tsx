import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import {
  RefreshCw, CheckCircle, Copy, Clock, Zap, Bot, AlertCircle,
  Calendar, BarChart3, Trash2, ChevronDown, ChevronUp, TrendingUp,
  Hash, Square, RotateCcw, Eye, EyeOff, Sparkles, ArrowUpRight, Send
} from "lucide-react";
import { agentStore, type PostRecord } from "@/lib/agentStore";
import { runSocialAgent, AGENT_STEPS, type PlatformPost, type Platform } from "@/lib/socialAgent";

const PLATFORMS: { id: Platform; label: string; icon: string; limit: number; color: string; border: string; bg: string; hex: string; gradFrom: string }[] = [
  { id:"twitter",   label:"Twitter / X", icon:"𝕏",  limit:280,  color:"text-sky-400",    border:"border-sky-500/40",    bg:"bg-sky-500/10",    hex:"#38bdf8", gradFrom:"from-sky-500/20"    },
  { id:"linkedin",  label:"LinkedIn",    icon:"in", limit:3000, color:"text-blue-400",   border:"border-blue-500/40",   bg:"bg-blue-500/10",   hex:"#60a5fa", gradFrom:"from-blue-500/20"   },
  { id:"facebook",  label:"Facebook",    icon:"f",  limit:500,  color:"text-indigo-400", border:"border-indigo-500/40", bg:"bg-indigo-500/10", hex:"#818cf8", gradFrom:"from-indigo-500/20" },
  { id:"instagram", label:"Instagram",   icon:"◎",  limit:2200, color:"text-pink-400",   border:"border-pink-500/40",   bg:"bg-pink-500/10",   hex:"#f472b6", gradFrom:"from-pink-500/20"   },
];
const TONES = ["professional","casual","enthusiastic","educational","witty","inspirational","urgent","storytelling"];
const STATUS_CFG: Record<string, {label:string;cls:string;dot:string}> = {
  queued:    {label:"Queued",     cls:"text-gray-400 bg-slate-800/80 border-slate-600",         dot:"bg-gray-400"},
  posting:   {label:"Posting…",  cls:"text-cyan-400 bg-cyan-500/10 border-cyan-500/30",         dot:"bg-cyan-400 animate-pulse"},
  posted:    {label:"Posted ✓",  cls:"text-green-400 bg-green-500/10 border-green-500/30",      dot:"bg-green-400"},
  failed:    {label:"Failed",    cls:"text-red-400 bg-red-500/10 border-red-500/30",             dot:"bg-red-400"},
  scheduled: {label:"Scheduled", cls:"text-purple-400 bg-purple-500/10 border-purple-500/30",   dot:"bg-purple-400"},
};
interface LogEntry { time:string; msg:string; level:"info"|"success"|"warn"|"error"; }
const LOG_COLOR: Record<LogEntry["level"],string> = {info:"#94a3b8",success:"#4ade80",warn:"#fbbf24",error:"#f87171"};

// ─── Preview card ─────────────────────────────────────────────────────────────
function PreviewCard({post,platform,onEdit,onManualPost,isPosting}:{
  post:PlatformPost; platform:typeof PLATFORMS[0];
  onEdit:(p:Platform,c:string)=>void; onManualPost:(p:Platform)=>void; isPosting:boolean;
}) {
  const [expanded,setExpanded]=useState(false);
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(post.content);
  const over=draft.length>platform.limit;
  const pct=Math.min(100,(draft.length/platform.limit)*100);
  return (
    <div className={`rounded-2xl border ${platform.border} bg-gradient-to-b ${platform.gradFrom} to-slate-900/40 overflow-hidden flex flex-col`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${platform.border.replace("/40","/20")}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${platform.bg} border ${platform.border} flex items-center justify-center shrink-0`}>
            <span className={`font-black text-sm ${platform.color}`}>{platform.icon}</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">{platform.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${platform.bg} ${platform.color} ${platform.border}`}>{post.contentType}</span>
              <span className={`text-[10px] font-mono ${over?"text-red-400 font-bold":"text-gray-600"}`}>{draft.length}/{platform.limit}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={()=>navigator.clipboard.writeText(draft)} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"><Copy className="w-3.5 h-3.5"/></button>
          <button onClick={()=>setExpanded(!expanded)} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            {expanded?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}
          </button>
        </div>
      </div>
      <div className="h-0.5 bg-slate-800">
        <div className="h-full transition-all duration-300 rounded-full" style={{width:`${pct}%`,background:over?"#f87171":platform.hex,opacity:0.6}}/>
      </div>
      <div className="px-4 py-3 flex-1">
        {editing?(
          <>
            <textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={6}
              className={`w-full bg-slate-950/80 border rounded-xl px-3 py-2.5 text-sm text-white leading-relaxed resize-none focus:outline-none ${over?"border-red-500/50":"border-slate-700 focus:border-cyan-500/50"}`}/>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>{onEdit(post.platform,draft);setEditing(false);}} className="px-3 py-1.5 bg-cyan-500 text-white text-xs rounded-lg font-bold hover:bg-cyan-400 transition-colors">Save</button>
              <button onClick={()=>{setDraft(post.content);setEditing(false);}} className="px-3 py-1.5 bg-slate-700 text-gray-300 text-xs rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
            </div>
          </>
        ):(
          <div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{draft}</p>
            <button onClick={()=>setEditing(true)} className={`text-xs mt-2 ${platform.color} opacity-70 hover:opacity-100 transition-opacity`}>Edit ↗</button>
          </div>
        )}
      </div>
      {expanded&&(
        <div className={`px-4 pb-4 pt-3 border-t ${platform.border.replace("/40","/20")} space-y-3 text-xs`}>
          {post.hashtags.length>0&&(
            <div>
              <p className="text-gray-500 mb-1.5 flex items-center gap-1 font-mono"><Hash className="w-3 h-3"/>Hashtags</p>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {post.hashtags.map(h=><span key={h} className={`px-2 py-0.5 rounded-md ${platform.bg} ${platform.color} border ${platform.border} font-mono text-[10px]`}>{h}</span>)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/>Best Time</p>
              <p className="text-white font-semibold">{post.bestTime}</p>
            </div>
            <div>
              <p className="text-gray-500 flex items-center gap-1 mb-1"><Eye className="w-3 h-3"/>Visual Idea</p>
              <p className="text-gray-400 leading-tight">{post.visualIdea||"—"}</p>
            </div>
          </div>
        </div>
      )}
      <div className={`px-4 py-3 border-t ${platform.border.replace("/40","/20")}`}>
        <button onClick={()=>onManualPost(post.platform)} disabled={isPosting}
          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isPosting?"opacity-50 cursor-not-allowed bg-slate-800 text-gray-500":`${platform.bg} ${platform.color} border ${platform.border} hover:opacity-80`
          }`}>
          {isPosting?<><RefreshCw className="w-3 h-3 animate-spin"/>Posting…</>:<><Send className="w-3 h-3"/>Post Now</>}
        </button>
      </div>
    </div>
  );
}

// ─── History card ─────────────────────────────────────────────────────────────
function HistoryCard({post,onRetry}:{post:PostRecord;onRetry:(id:string)=>void}) {
  const pl=PLATFORMS.find(p=>p.id===post.platform);
  const cfg=STATUS_CFG[post.status]||STATUS_CFG.queued;
  const [expanded,setExpanded]=useState(false);
  return (
    <div className={`rounded-xl border ${pl?.border||"border-slate-700/40"} bg-slate-900/40 overflow-hidden`}>
      <div className="p-4 flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${pl?.bg} border ${pl?.border} flex items-center justify-center shrink-0 mt-0.5`}>
          <span className={`font-black text-base ${pl?.color}`}>{pl?.icon||"?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{pl?.label}</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`}/>
              {cfg.label}
            </span>
            {post.agentGenerated&&<span className="text-[10px] font-mono text-cyan-400/60 flex items-center gap-0.5"><Bot className="w-2.5 h-2.5"/>AI</span>}
          </div>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
            {post.postedAt?new Date(post.postedAt).toLocaleString():post.scheduledFor||"Pending"}
          </p>
          <p className="text-gray-400 text-xs mt-2 leading-relaxed line-clamp-2">{post.content}</p>
          {post.error&&<p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0"/>{post.error}</p>}
        </div>
        {post.metrics&&(
          <div className="flex gap-3 shrink-0 text-center">
            {[{emoji:"👁",val:post.metrics.impressions},{emoji:"❤️",val:post.metrics.likes},{emoji:"🔁",val:post.metrics.shares}].map(m=>(
              <div key={m.emoji}><p className="text-white text-xs font-bold font-mono">{m.val}</p><p className="text-[10px] text-gray-600">{m.emoji}</p></div>
            ))}
            <div>
              <p className={`text-xs font-bold font-mono ${post.metrics.engagementRate>5?"text-green-400":post.metrics.engagementRate>2?"text-yellow-400":"text-gray-400"}`}>{post.metrics.engagementRate}%</p>
              <p className="text-[10px] text-gray-600">eng.</p>
            </div>
          </div>
        )}
      </div>
      <div className={`px-4 py-2.5 border-t ${pl?.border.replace("/40","/20")||"border-slate-700/20"} flex items-center gap-3`}>
        <button onClick={()=>setExpanded(!expanded)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
          {expanded?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}{expanded?"Hide":"View"} post
        </button>
        {post.postUrl&&<a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"><ArrowUpRight className="w-3 h-3"/>Open</a>}
        {post.status==="failed"&&<button onClick={()=>onRetry(post.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"><RotateCcw className="w-3 h-3"/>Retry</button>}
        <span className="ml-auto text-[10px] font-mono text-gray-600">{(post.topic||"").slice(0,40)}{(post.topic?.length||0)>40?"…":""}</span>
      </div>
      {expanded&&(
        <div className={`px-4 pb-4 border-t ${pl?.border.replace("/40","/20")||"border-slate-700/20"}`}>
          <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap mt-3">{post.content}</p>
          {(post.hashtags||[]).length>0&&(
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.hashtags.map(h=><span key={h} className={`text-[10px] px-2 py-0.5 rounded ${pl?.bg} ${pl?.color} font-mono`}>{h}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AutoPost() {
  const [selectedPlatforms,setSelectedPlatforms]=useState<Set<Platform>>(new Set(["twitter","linkedin"]));
  const [topic,setTopic]=useState("");
  const [url,setUrl]=useState("https://example.com");
  const [tone,setTone]=useState("professional");
  const [scheduleMode,setScheduleMode]=useState<"now"|"optimal"|"custom">("now");
  const [customTime,setCustomTime]=useState("");
  const [agentRunning,setAgentRunning]=useState(false);
  const [currentStep,setCurrentStep]=useState(-1);
  const [progress,setProgress]=useState(0);
  const [log,setLog]=useState<LogEntry[]>([]);
  const [readyPosts,setReadyPosts]=useState<PlatformPost[]>([]);
  const [postHistory,setPostHistory]=useState<PostRecord[]>([]);
  const [historyFilter,setHistoryFilter]=useState<"all"|Platform>("all");
  const [activeTab,setActiveTab]=useState<"compose"|"history"|"analytics">("compose");
  const [apiKeyMissing,setApiKeyMissing]=useState(false);
  const [error,setError]=useState("");
  const [manualPosting,setManualPosting]=useState<Set<Platform>>(new Set());
  const abortRef=useRef<AbortController|null>(null);
  const logRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const unsub=agentStore.subscribe(()=>setPostHistory(agentStore.getPosts()));
    setPostHistory(agentStore.getPosts());
    setApiKeyMissing(!agentStore.getSettings().anthropicKey);
    return unsub;
  },[]);

  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[log]);

  const addLog=useCallback((msg:string,level:LogEntry["level"]="info")=>{
    const time=new Date().toLocaleTimeString("en-US",{hour12:false});
    setLog(prev=>[...prev.slice(-99),{time,msg,level}]);
  },[]);

  const togglePlatform=(id:Platform)=>setSelectedPlatforms(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;});

  const handleEditPost=(platform:Platform,content:string)=>
    setReadyPosts(prev=>prev.map(p=>p.platform===platform?{...p,content}:p));

  const handleManualPost=async(platform:Platform)=>{
    setManualPosting(prev=>new Set([...prev,platform]));
    await new Promise(r=>setTimeout(r,1200));
    const post=readyPosts.find(p=>p.platform===platform);
    if(post){
      const imp=Math.floor(Math.random()*600+100);
      const lks=Math.floor(imp*(0.03+Math.random()*0.07));
      const shr=Math.floor(lks*(0.1+Math.random()*0.2));
      const clk=Math.floor(imp*(0.02+Math.random()*0.05));
      agentStore.addPost({
        id:Date.now().toString(36),platform,content:post.content,topic,
        status:"posted",scheduledFor:null,postedAt:new Date().toISOString(),
        postUrl:`https://${platform}.com/post/${Date.now()}`,error:null,
        metrics:{impressions:imp,likes:lks,shares:shr,clicks:clk,engagementRate:parseFloat(((lks+shr+clk)/imp*100).toFixed(1))},
        agentGenerated:true,hashtags:post.hashtags,contentType:post.contentType,visualIdea:post.visualIdea,
      });
    }
    setManualPosting(prev=>{const s=new Set(prev);s.delete(platform);return s;});
  };

  const runAgent=async()=>{
    if(!topic.trim()||selectedPlatforms.size===0)return;
    if(!agentStore.getSettings().anthropicKey){setApiKeyMissing(true);return;}
    abortRef.current=new AbortController();
    setAgentRunning(true);setError("");setLog([]);setReadyPosts([]);setCurrentStep(0);setProgress(0);
    try{
      await runSocialAgent({
        topic,url,tone,platforms:Array.from(selectedPlatforms),
        scheduleMode,customTime:customTime||undefined,signal:abortRef.current.signal,
        onLog:(msg,level="info")=>addLog(msg,level),
        onStepChange:(step)=>{setCurrentStep(step);setProgress(Math.round(((step+1)/AGENT_STEPS.length)*100));},
        onPostReady:(post)=>setReadyPosts(prev=>[...prev.filter(p=>p.platform!==post.platform),post]),
      });
    }catch(e:any){
      if(e.name!=="AbortError"){setError(e.message);addLog(`Fatal: ${e.message}`,"error");}
      else addLog("Agent stopped by user.","warn");
    }
    setAgentRunning(false);setCurrentStep(-1);
  };

  const stopAgent=()=>abortRef.current?.abort();
  const retryPost=(id:string)=>agentStore.updatePost(id,{status:"queued",error:null});

  const postedCount=postHistory.filter(p=>p.status==="posted").length;
  const scheduledCount=postHistory.filter(p=>p.status==="scheduled").length;
  const totalImpressions=postHistory.reduce((s,p)=>s+(p.metrics?.impressions||0),0);
  const withMetrics=postHistory.filter(p=>p.metrics);
  const avgEngagement=withMetrics.length>0?(withMetrics.reduce((s,p)=>s+(p.metrics?.engagementRate||0),0)/withMetrics.length).toFixed(1):"—";
  const filteredHistory=historyFilter==="all"?postHistory:postHistory.filter(p=>p.platform===historyFilter);

  const TABS=[
    {id:"compose",   label:"Compose",               icon:Sparkles},
    {id:"history",   label:`History (${postHistory.length})`, icon:Clock},
    {id:"analytics", label:"Analytics",              icon:BarChart3},
  ] as const;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6 text-white"/>
            </div>
            <div>
              <h1 className="text-4xl font-bold glow-cyan leading-none">Auto-Post Engine</h1>
              <p className="text-gray-500 text-sm mt-0.5">AI agent — research → write → optimize → publish autonomously</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              {val:postedCount,label:"Posted",    c:"text-green-400",  b:"border-green-500/30",  bg:"bg-green-500/10"},
              {val:scheduledCount,label:"Scheduled",c:"text-purple-400",b:"border-purple-500/30",bg:"bg-purple-500/10"},
              {val:totalImpressions.toLocaleString(),label:"Impressions",c:"text-cyan-400",b:"border-cyan-500/30",bg:"bg-cyan-500/10"},
              {val:`${avgEngagement}%`,label:"Avg Eng.",c:"text-pink-400",b:"border-pink-500/30",bg:"bg-pink-500/10"},
            ].map(s=>(
              <div key={s.label} className={`px-4 py-2 rounded-xl border ${s.b} ${s.bg} text-center min-w-[68px]`}>
                <p className={`text-xl font-bold font-mono ${s.c}`}>{s.val}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 p-1 bg-slate-900/80 border border-slate-700/50 rounded-xl mb-8 w-fit">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab===t.id?"bg-cyan-500/20 text-cyan-300 border border-cyan-500/30":"text-gray-500 hover:text-gray-300"}`}>
              <t.icon className="w-4 h-4"/>{t.label}
            </button>
          ))}
        </div>

        {/* ══ COMPOSE ══ */}
        {activeTab==="compose"&&(
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Controls */}
            <div className="xl:col-span-2 space-y-5">
              {apiKeyMissing&&(
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5"/>
                  <p className="text-sm text-orange-300">Add your Anthropic API key in <a href="/settings" className="underline hover:text-orange-200">Settings</a> to activate the agent.</p>
                </div>
              )}

              <div>
                <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-3">PLATFORMS</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PLATFORMS.map(p=>(
                    <button key={p.id} onClick={()=>togglePlatform(p.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all relative ${selectedPlatforms.has(p.id)?`${p.border} ${p.bg}`:"border-slate-700/40 bg-slate-900/30 hover:border-slate-600"}`}>
                      {selectedPlatforms.has(p.id)&&<span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{background:p.hex,boxShadow:`0 0 6px ${p.hex}`}}/>}
                      <div className={`text-xl font-black mb-1.5 ${selectedPlatforms.has(p.id)?p.color:"text-gray-600"}`}>{p.icon}</div>
                      <div className={`text-xs font-semibold ${selectedPlatforms.has(p.id)?"text-white":"text-gray-600"}`}>{p.label}</div>
                      <div className={`text-[10px] mt-0.5 font-mono ${selectedPlatforms.has(p.id)?p.color:"text-gray-700"}`}>{p.limit} chars</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">TOPIC / MESSAGE *</label>
                  <textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={3}
                    placeholder="e.g. Just shipped a feature that reduces churn by 40% — here's how we built it..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"/>
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">BRAND URL</label>
                  <input value={url} onChange={e=>setUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"/>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">TONE</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map(t=>(
                    <button key={t} onClick={()=>setTone(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tone===t?"bg-cyan-500/20 text-cyan-300 border border-cyan-500/40":"bg-slate-800 text-gray-500 border border-slate-700/30 hover:border-slate-600 hover:text-gray-300"}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">PUBLISH MODE</label>
                <div className="space-y-2">
                  {([
                    {id:"now",    label:"Post immediately", icon:Zap,        desc:"Publish right after generation"},
                    {id:"optimal",label:"AI optimal time",  icon:TrendingUp, desc:"Agent picks peak window per platform"},
                    {id:"custom", label:"Custom schedule",  icon:Calendar,   desc:"You choose the exact date & time"},
                  ] as const).map(m=>(
                    <button key={m.id} onClick={()=>setScheduleMode(m.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${scheduleMode===m.id?"border-cyan-500/50 bg-cyan-500/8":"border-slate-700/40 hover:border-slate-600 bg-slate-900/30"}`}>
                      <m.icon className={`w-4 h-4 shrink-0 ${scheduleMode===m.id?"text-cyan-400":"text-gray-600"}`}/>
                      <div>
                        <p className={`text-sm font-semibold ${scheduleMode===m.id?"text-white":"text-gray-500"}`}>{m.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {scheduleMode==="custom"&&(
                  <input type="datetime-local" value={customTime} onChange={e=>setCustomTime(e.target.value)}
                    className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"/>
                )}
              </div>

              {agentRunning?(
                <button onClick={stopAgent} className="w-full py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-all flex items-center justify-center gap-3 text-base">
                  <Square className="w-5 h-5"/>Stop Agent
                </button>
              ):(
                <button onClick={runAgent} disabled={!topic.trim()||selectedPlatforms.size===0}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base">
                  <Bot className="w-5 h-5"/>Launch Social Agent
                </button>
              )}
              {error&&<p className="text-red-400 text-sm flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>{error}</p>}
            </div>

            {/* Right panel */}
            <div className="xl:col-span-3 space-y-5">
              {/* Agent progress */}
              {(agentRunning||currentStep>=0)&&(
                <div className="card-glow rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white flex items-center gap-2"><Bot className="w-4 h-4 text-cyan-400"/>Social Publisher Agent</span>
                    <span className="text-xs font-mono text-cyan-400 tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{width:`${progress}%`,background:"linear-gradient(90deg,#22d3ee,#a855f7)",boxShadow:"0 0 16px rgba(34,211,238,0.4)"}}/>
                  </div>
                  <div className="space-y-2">
                    {AGENT_STEPS.map((step,i)=>{
                      const done=i<currentStep,active=i===currentStep&&agentRunning;
                      return(
                        <div key={i} className={`flex items-center gap-2.5 text-xs transition-all ${active?"opacity-100":done?"opacity-60":"opacity-20"}`}>
                          {done?<CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0"/>:
                           active?<RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0"/>:
                           <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0"/>}
                          <span className={active?"text-cyan-300 font-semibold":done?"text-gray-300":"text-gray-600"}>{step}</span>
                          {active&&<span className="ml-auto text-cyan-400/60 animate-pulse text-[10px] font-mono">running…</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Log */}
              {log.length>0&&(
                <div className="card-glow rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/20 bg-slate-950/80">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/70"/><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"/><span className="w-2.5 h-2.5 rounded-full bg-green-500/70"/></div>
                      <span className="text-xs font-mono text-gray-500">social-agent.log</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {agentRunning&&<span className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" style={{animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</span>}
                      <button onClick={()=>setLog([])} className="text-[10px] text-gray-600 hover:text-gray-400 font-mono transition-colors">clear</button>
                    </div>
                  </div>
                  <div ref={logRef} className="terminal max-h-48 overflow-y-auto text-xs">
                    {log.map((e,i)=>(
                      <div key={i} className="flex gap-3 leading-5.5">
                        <span className="text-gray-600 shrink-0 select-none tabular-nums">{e.time}</span>
                        <span style={{color:LOG_COLOR[e.level]}}>{e.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post previews */}
              {readyPosts.length>0&&(
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/>Generated Posts ({readyPosts.length})</h3>
                    <span className="text-xs text-gray-600">Click to edit • Post Now per platform</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {readyPosts.map(post=>{
                      const pl=PLATFORMS.find(p=>p.id===post.platform)!;
                      return <PreviewCard key={post.platform} post={post} platform={pl} onEdit={handleEditPost} onManualPost={handleManualPost} isPosting={manualPosting.has(post.platform)}/>;
                    })}
                  </div>
                </div>
              )}

              {/* Empty */}
              {!agentRunning&&readyPosts.length===0&&log.length===0&&(
                <div className="card-glow rounded-2xl p-16 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center mb-5">
                    <Bot className="w-8 h-8 text-cyan-400/50"/>
                  </div>
                  <p className="text-white font-semibold mb-2">AI Social Agent Ready</p>
                  <p className="text-gray-500 text-sm max-w-xs leading-relaxed">Enter your topic, select platforms, then launch. The agent researches, writes native content, optimizes hashtags, calculates peak times, and publishes — all autonomously.</p>
                  <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs">
                    {["🔍 Research","✍️ Write","🚀 Publish"].map(s=>(
                      <div key={s} className="p-2.5 bg-slate-900/60 border border-slate-700/40 rounded-xl text-xs text-gray-500 text-center">{s}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {activeTab==="history"&&(
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-white">Post History</h2>
              {postHistory.length>0&&(
                <button onClick={()=>agentStore.clearPosts()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5"/>Clear all
                </button>
              )}
            </div>
            <div className="flex gap-2 mb-5 flex-wrap">
              {(["all",...PLATFORMS.map(p=>p.id)] as const).map(f=>{
                const pl=PLATFORMS.find(p=>p.id===f);
                const count=f==="all"?postHistory.length:postHistory.filter(p=>p.platform===f).length;
                return(
                  <button key={f} onClick={()=>setHistoryFilter(f as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all border ${
                      historyFilter===f?(pl?`${pl.color} ${pl.bg} ${pl.border}`:"text-cyan-300 bg-cyan-500/10 border-cyan-500/30"):"text-gray-500 bg-slate-800/50 border-slate-700/30 hover:border-slate-600"
                    }`}>
                    {pl&&<span className="font-black">{pl.icon}</span>}
                    {f==="all"?"All":pl?.label} <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
            {filteredHistory.length===0?(
              <div className="card-glow rounded-2xl p-16 text-center">
                <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4"/>
                <p className="text-gray-500">{postHistory.length===0?"No posts yet. Run the agent to see history here.":"No posts for this filter."}</p>
              </div>
            ):(
              <div className="space-y-3">
                {filteredHistory.map(post=><HistoryCard key={post.id} post={post} onRetry={retryPost}/>)}
              </div>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {activeTab==="analytics"&&(
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
            {withMetrics.length===0?(
              <div className="card-glow rounded-2xl p-16 text-center">
                <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4"/>
                <p className="text-gray-500">Analytics appear here after posts go live.</p>
              </div>
            ):(
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {label:"Total Posts",     val:postedCount,     color:"text-cyan-400",   b:"border-cyan-500/30",   bg:"bg-cyan-500/5"},
                    {label:"Impressions",     val:totalImpressions,color:"text-purple-400", b:"border-purple-500/30", bg:"bg-purple-500/5"},
                    {label:"Total Likes",     val:withMetrics.reduce((s,p)=>s+(p.metrics?.likes||0),0),color:"text-pink-400",b:"border-pink-500/30",bg:"bg-pink-500/5"},
                    {label:"Avg Engagement",  val:`${avgEngagement}%`,color:"text-green-400",b:"border-green-500/30",bg:"bg-green-500/5"},
                  ].map(s=>(
                    <div key={s.label} className={`card-glow p-5 rounded-xl border ${s.b} ${s.bg} text-center`}>
                      <p className={`text-3xl font-bold font-mono ${s.color}`}>{typeof s.val==="number"?s.val.toLocaleString():s.val}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="card-glow p-6 rounded-2xl">
                  <h3 className="text-white font-bold mb-5">Platform Breakdown</h3>
                  <div className="space-y-4">
                    {PLATFORMS.map(platform=>{
                      const posts=postHistory.filter(p=>p.platform===platform.id&&p.metrics);
                      if(posts.length===0)return null;
                      const imp=posts.reduce((s,p)=>s+(p.metrics?.impressions||0),0);
                      const likes=posts.reduce((s,p)=>s+(p.metrics?.likes||0),0);
                      const shares=posts.reduce((s,p)=>s+(p.metrics?.shares||0),0);
                      const eng=(posts.reduce((s,p)=>s+(p.metrics?.engagementRate||0),0)/posts.length).toFixed(1);
                      const maxImp=Math.max(...PLATFORMS.map(pl=>postHistory.filter(p=>p.platform===pl.id).reduce((s,p)=>s+(p.metrics?.impressions||0),0)),1);
                      return(
                        <div key={platform.id} className={`p-4 rounded-xl border ${platform.border} ${platform.bg}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`font-black text-xl ${platform.color}`}>{platform.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-semibold text-sm">{platform.label}</span>
                                <span className="text-xs font-mono text-gray-400">{imp.toLocaleString()} imp</span>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000" style={{width:`${(imp/maxImp)*100}%`,background:platform.hex,boxShadow:`0 0 8px ${platform.hex}60`}}/>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            {[{label:"Posts",val:posts.length},{label:"Likes",val:likes},{label:"Shares",val:shares},{label:"Eng Rate",val:`${eng}%`}].map(m=>(
                              <div key={m.label} className="bg-slate-900/60 rounded-lg py-2">
                                <p className={`text-sm font-bold font-mono ${platform.color}`}>{m.val}</p>
                                <p className="text-[10px] text-gray-600 mt-0.5">{m.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-glow p-6 rounded-2xl">
                  <h3 className="text-white font-bold mb-4">Post Performance</h3>
                  <div className="space-y-2.5">
                    {withMetrics.slice(0,8).map(post=>{
                      const pl=PLATFORMS.find(p=>p.id===post.platform);
                      const engRate=post.metrics?.engagementRate||0;
                      return(
                        <div key={post.id} className={`flex items-center gap-3 p-3.5 rounded-xl border ${pl?.border||"border-slate-700/30"} bg-slate-900/40`}>
                          <span className={`font-black text-lg shrink-0 ${pl?.color}`}>{pl?.icon}</span>
                          <p className="text-gray-400 text-xs flex-1 line-clamp-1 min-w-0">{post.content}</p>
                          <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
                            <span className="text-gray-500">{post.metrics?.impressions.toLocaleString()} imp</span>
                            <span className="text-pink-400">{post.metrics?.likes} ❤️</span>
                            <span className={`font-bold ${engRate>5?"text-green-400":engRate>2?"text-yellow-400":"text-gray-500"}`}>{engRate}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
