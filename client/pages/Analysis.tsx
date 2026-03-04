import { useState } from "react";
import Layout from "@/components/Layout";
import ScoreDial from "@/components/ScoreDial";
import { BarChart3, RefreshCw, Globe, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { callLLM } from "@/lib/llm";

const TABS = [
  { id:"seo", label:"SEO", color:"purple", desc:"Search Engine Optimization", borderCls:"border-purple-500/50", bgCls:"bg-purple-500/20", textCls:"text-purple-300" },
  { id:"aeo", label:"AEO", color:"pink", desc:"Answer Engine Optimization", borderCls:"border-pink-500/50", bgCls:"bg-pink-500/20", textCls:"text-pink-300" },
  { id:"geo", label:"GEO", color:"green", desc:"Generative Engine Optimization", borderCls:"border-green-500/50", bgCls:"bg-green-500/20", textCls:"text-green-300" },
];

interface Report {
  score: number;
  grade: "A"|"B"|"C"|"D"|"F";
  overview: string;
  wins: string[];
  gaps: { issue: string; fix: string; effort: string; impact: string }[];
  quickWins: string[];
  kpis: { metric: string; current: string; target: string }[];
}

export default function Analysis() {
  const [tab, setTab] = useState(TABS[0]);
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    if (!url.trim()) return;
    setRunning(true); setReport(null); setError("");
    try {
      const text = await callLLM(`Perform a detailed ${tab.label} (${tab.desc}) analysis for website: ${url}
Be specific and actionable. Respond ONLY with valid JSON, no markdown or extra text:
{"score":65,"grade":"C","overview":"2-sentence analysis of current state","wins":["specific win 1","specific win 2","specific win 3"],"gaps":[{"issue":"specific gap","fix":"specific fix action","effort":"Low","impact":"High"},{"issue":"specific gap 2","fix":"specific fix 2","effort":"Medium","impact":"High"},{"issue":"specific gap 3","fix":"specific fix 3","effort":"High","impact":"Medium"}],"quickWins":["quick win 1","quick win 2","quick win 3"],"kpis":[{"metric":"metric name","current":"current value","target":"target value"},{"metric":"metric 2","current":"value","target":"value"},{"metric":"metric 3","current":"value","target":"value"}]}`);
      setReport(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e) { setError("Analysis failed — check API key in Settings."); }
    setRunning(false);
  };

  const impactColor = (v: string) => v === "High" ? "text-red-400" : v === "Medium" ? "text-yellow-400" : "text-green-400";
  const effortColor = (v: string) => v === "High" ? "text-orange-400" : v === "Medium" ? "text-yellow-400" : "text-green-400";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">SEO · AEO · GEO Analysis</h1>
          <p className="text-gray-400 text-lg">Full-spectrum visibility audit across search, answer & generative engines</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-slate-900/80 border border-slate-700/50 rounded-xl w-fit mb-8">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t); setReport(null); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold font-mono tracking-wider transition-all duration-200
                ${tab.id===t.id ? `${t.bgCls} ${t.textCls} border ${t.borderCls}` : "text-gray-500 hover:text-gray-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="card-glow p-6 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
              <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!running&&run()}
                placeholder="https://yourwebsite.com"
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono text-sm transition-colors" />
            </div>
            <button onClick={run} disabled={running || !url.trim()}
              className={`px-7 py-3.5 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap
                ${tab.id==="seo" ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:shadow-lg hover:shadow-purple-500/30"
                : tab.id==="aeo" ? "bg-gradient-to-r from-pink-600 to-pink-800 hover:shadow-lg hover:shadow-pink-500/30"
                : "bg-gradient-to-r from-green-600 to-green-800 hover:shadow-lg hover:shadow-green-500/30"}`}>
              {running ? <><RefreshCw className="w-4 h-4 animate-spin"/>Analyzing…</> : <><BarChart3 className="w-4 h-4"/>Run {tab.label} Analysis</>}
            </button>
          </div>
        </div>

        {running && (
          <div className="card-glow rounded-2xl p-16 text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin" style={{color: tab.id==="seo"?"#c084fc":tab.id==="aeo"?"#f472b6":"#4ade80"}} />
            <p className="font-mono text-sm" style={{color: tab.id==="seo"?"#c084fc":tab.id==="aeo"?"#f472b6":"#4ade80"}}>
              Running {tab.label} analysis with Claude AI…
            </p>
            <p className="text-gray-600 text-xs mt-2">Analyzing {tab.desc.toLowerCase()} signals</p>
          </div>
        )}

        {error && <div className="card-glow p-5 border-red-500/30 text-red-400 text-sm rounded-2xl">{error}</div>}

        {report && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Score */}
              <div className="card-glow p-8 flex flex-col items-center justify-center gap-4">
                <ScoreDial score={report.score} label={`${tab.label} Score`} grade={report.grade} size="lg" />
                <div className={`text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full border
                  ${tab.id==="seo" ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                  : tab.id==="aeo" ? "text-pink-400 border-pink-500/30 bg-pink-500/10"
                  : "text-green-400 border-green-500/30 bg-green-500/10"}`}>
                  {tab.desc.toUpperCase()}
                </div>
              </div>

              {/* Overview + KPIs */}
              <div className="md:col-span-2 space-y-4">
                <div className="card-glow p-5 rounded-xl">
                  <label className="text-xs font-mono font-bold text-gray-500 tracking-widest block mb-2">OVERVIEW</label>
                  <p className="text-gray-300 text-sm leading-relaxed">{report.overview}</p>
                </div>
                <div className="card-glow p-5 rounded-xl">
                  <label className="text-xs font-mono font-bold text-gray-500 tracking-widest block mb-3">KEY METRICS</label>
                  <div className="grid grid-cols-3 gap-3">
                    {report.kpis.map((kpi, i) => (
                      <div key={i} className="bg-slate-900/60 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">{kpi.metric}</p>
                        <p className="text-base font-bold text-white font-mono">{kpi.current}</p>
                        <p className="text-xs text-cyan-400 mt-0.5">→ {kpi.target}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Wins */}
              <div className="card-glow p-5 rounded-xl">
                <label className="text-xs font-mono font-bold text-green-400 tracking-widest block mb-4 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/>WHAT'S WORKING</label>
                <div className="space-y-2.5">
                  {report.wins.map((w, i) => (
                    <div key={i} className="flex gap-3 items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Quick wins */}
              <div className="card-glow p-5 rounded-xl">
                <label className="text-xs font-mono font-bold text-yellow-400 tracking-widest block mb-4 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5"/>QUICK WINS</label>
                <div className="space-y-2.5">
                  {report.quickWins.map((w, i) => (
                    <div key={i} className="flex gap-3 items-start text-sm">
                      <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gaps */}
            <div className="card-glow p-5 rounded-xl">
              <label className="text-xs font-mono font-bold text-orange-400 tracking-widest block mb-4 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/>ISSUES & FIXES</label>
              <div className="space-y-3">
                {report.gaps.map((gap, i) => (
                  <div key={i} className="p-4 bg-slate-900/60 border border-slate-700/40 rounded-xl">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="text-sm font-semibold text-white">{gap.issue}</p>
                      <div className="flex gap-2 shrink-0">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${impactColor(gap.impact)} bg-slate-800`}>IMPACT: {gap.impact}</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${effortColor(gap.effort)} bg-slate-800`}>EFFORT: {gap.effort}</span>
                      </div>
                    </div>
                    <p className="text-sm text-cyan-400 flex items-start gap-1.5"><span className="shrink-0 mt-0.5">→</span>{gap.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
