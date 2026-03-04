import { useState } from "react";
import Layout from "@/components/Layout";
import { Search, RefreshCw, TrendingUp, Target, Copy, CheckCircle, Download } from "lucide-react";
import { agentStore } from "@/lib/agentStore";

interface KeywordData {
  seedKeyword: string;
  intent: string;
  relatedKeywords: { keyword: string; difficulty: string; volume: string; opportunity: string; cpc: string }[];
  longTailKeywords: { keyword: string; type: string; intent: string; suggestedContent: string }[];
  topicClusters: { pillar: string; clusters: string[] }[];
  negativeKeywords: string[];
  competitorKeywords: { competitor: string; topKeywords: string[] }[];
  priorityMatrix: { quadrant: string; keywords: string[]; action: string }[];
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-green-400 bg-green-500/10 border-green-500/30",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Hard: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  "Very Hard": "text-red-400 bg-red-500/10 border-red-500/30",
};
const OPP_COLOR: Record<string, string> = {
  High: "text-green-400", Medium: "text-yellow-400", Low: "text-gray-500",
};

export default function KeywordResearch() {
  const [seed, setSeed] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("related");

  const research = async () => {
    if (!seed.trim()) return;
    setLoading(true); setError(""); setData(null);
    try {
      const apiKey = agentStore.getApiKey();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["x-api-key"] = apiKey;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a keyword research expert. Perform comprehensive keyword research for seed keyword: "${seed}" in the ${industry || "general"} industry.
Provide realistic keyword difficulty, search volume tiers, and actionable insights.
Return ONLY valid JSON, no markdown:
{
  "seedKeyword": "${seed}",
  "intent": "informational|commercial|transactional|navigational",
  "relatedKeywords": [
    {"keyword": "...", "difficulty": "Easy|Medium|Hard|Very Hard", "volume": "100-1K|1K-10K|10K-100K|100K+", "opportunity": "High|Medium|Low", "cpc": "$0.00"},
    {"keyword": "...", "difficulty": "Medium", "volume": "1K-10K", "opportunity": "High", "cpc": "$2.50"},
    {"keyword": "...", "difficulty": "Easy", "volume": "100-1K", "opportunity": "High", "cpc": "$1.20"},
    {"keyword": "...", "difficulty": "Hard", "volume": "10K-100K", "opportunity": "Medium", "cpc": "$5.00"},
    {"keyword": "...", "difficulty": "Medium", "volume": "1K-10K", "opportunity": "Medium", "cpc": "$3.10"},
    {"keyword": "...", "difficulty": "Easy", "volume": "100-1K", "opportunity": "High", "cpc": "$0.80"}
  ],
  "longTailKeywords": [
    {"keyword": "how to ...", "type": "how-to", "intent": "informational", "suggestedContent": "Step-by-step guide"},
    {"keyword": "best ... for ...", "type": "comparison", "intent": "commercial", "suggestedContent": "Comparison listicle"},
    {"keyword": "... vs ...", "type": "vs", "intent": "commercial", "suggestedContent": "Comparison article"},
    {"keyword": "... price", "type": "pricing", "intent": "transactional", "suggestedContent": "Pricing page"},
    {"keyword": "... review", "type": "review", "intent": "commercial", "suggestedContent": "In-depth review post"},
    {"keyword": "what is ...", "type": "definition", "intent": "informational", "suggestedContent": "Definition + guide"}
  ],
  "topicClusters": [
    {"pillar": "Complete Guide to ${seed}", "clusters": ["subtopic 1", "subtopic 2", "subtopic 3", "subtopic 4"]},
    {"pillar": "Best ${seed} for Beginners", "clusters": ["subtopic 1", "subtopic 2", "subtopic 3"]}
  ],
  "negativeKeywords": ["free", "download", "torrent", "crack", "cheap"],
  "competitorKeywords": [
    {"competitor": "competitor1.com", "topKeywords": ["kw1","kw2","kw3"]},
    {"competitor": "competitor2.com", "topKeywords": ["kw4","kw5","kw6"]}
  ],
  "priorityMatrix": [
    {"quadrant": "Quick Wins (Easy + High Volume)", "keywords": ["kw1","kw2"], "action": "Create content immediately"},
    {"quadrant": "Long-term (Hard + High Volume)", "keywords": ["kw3","kw4"], "action": "Build authority first"},
    {"quadrant": "Low Hanging Fruit (Easy + Low Volume)", "keywords": ["kw5","kw6"], "action": "Target for early ranking wins"},
    {"quadrant": "Skip for Now (Hard + Low Volume)", "keywords": ["kw7"], "action": "Revisit after DA increase"}
  ]
}`
          }]
        })
      });
      const res = await resp.json();
      const text = (res.content || []).map((b: any) => b.text || "").join("").replace(/```json|```/g, "").trim();
      setData(JSON.parse(text));
    } catch (e: any) {
      setError("Research failed — check your API key in Settings.");
    }
    setLoading(false);
  };

  const exportCsv = () => {
    if (!data) return;
    const rows = [["Keyword","Difficulty","Volume","Opportunity","CPC"],
      ...data.relatedKeywords.map(k => [k.keyword,k.difficulty,k.volume,k.opportunity,k.cpc])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `keywords-${seed.replace(/\s+/g,"-")}.csv`;
    a.click();
  };

  const TABS = [
    { id:"related", label:"Related Keywords" },
    { id:"longtail", label:"Long-Tail" },
    { id:"clusters", label:"Topic Clusters" },
    { id:"matrix", label:"Priority Matrix" },
    { id:"competitors", label:"Competitor Keywords" },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold glow-cyan mb-2">Keyword Research</h1>
          <p className="text-gray-400 text-lg">AI-powered keyword intelligence — related terms, long-tail, topic clusters, and priority matrix</p>
        </div>

        <div className="card-glow p-6 mb-8 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">SEED KEYWORD *</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
                <input
                  value={seed} onChange={e => setSeed(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && research()}
                  placeholder="e.g. content marketing, SaaS SEO, react hooks..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">INDUSTRY</label>
              <input
                value={industry} onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. SaaS, e-commerce, finance..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>
          <button onClick={research} disabled={loading || !seed.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><RefreshCw className="w-5 h-5 animate-spin" />Researching…</> : <><Search className="w-5 h-5" />Research Keywords</>}
          </button>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>

        {data && (
          <>
            {/* Overview chips */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-300 font-mono">
                Seed: <strong>{data.seedKeyword}</strong>
              </span>
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-300 font-mono">
                Intent: <strong>{data.intent}</strong>
              </span>
              <span className="px-4 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-gray-400 font-mono">
                {data.relatedKeywords.length} related · {data.longTailKeywords.length} long-tail
              </span>
              <button onClick={exportCsv} className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors">
                <Download className="w-4 h-4" />Export CSV
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-slate-900/80 border border-slate-700/50 rounded-xl w-full mb-6 overflow-x-auto">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wide whitespace-nowrap transition-all ${activeTab === t.id ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-gray-500 hover:text-gray-300"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "related" && (
              <div className="card-glow rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left px-5 py-3 text-xs font-mono text-gray-500 tracking-widest">KEYWORD</th>
                      <th className="text-center px-4 py-3 text-xs font-mono text-gray-500 tracking-widest">DIFFICULTY</th>
                      <th className="text-center px-4 py-3 text-xs font-mono text-gray-500 tracking-widest">VOLUME</th>
                      <th className="text-center px-4 py-3 text-xs font-mono text-gray-500 tracking-widest">OPPORTUNITY</th>
                      <th className="text-center px-4 py-3 text-xs font-mono text-gray-500 tracking-widest">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.relatedKeywords.map((kw, i) => (
                      <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-900/40 transition-colors">
                        <td className="px-5 py-4 text-white font-medium">{kw.keyword}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${DIFFICULTY_COLOR[kw.difficulty] || "text-gray-400 bg-slate-800 border-slate-700"}`}>{kw.difficulty}</span>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-400 font-mono text-xs">{kw.volume}</td>
                        <td className={`px-4 py-4 text-center font-bold text-sm ${OPP_COLOR[kw.opportunity] || "text-gray-500"}`}>{kw.opportunity}</td>
                        <td className="px-4 py-4 text-center text-gray-400 font-mono text-xs">{kw.cpc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "longtail" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.longTailKeywords.map((kw, i) => (
                  <div key={i} className="card-glow p-5 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{kw.keyword}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 bg-slate-800 text-gray-400 rounded font-mono">{kw.type}</span>
                          <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 font-mono">{kw.intent}</span>
                        </div>
                        <p className="text-xs text-cyan-400 mt-2">→ {kw.suggestedContent}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "clusters" && (
              <div className="space-y-4">
                {data.topicClusters.map((cluster, i) => (
                  <div key={i} className="card-glow p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-sm">{i+1}</div>
                      <h3 className="text-white font-bold">{cluster.pillar}</h3>
                      <span className="text-xs text-gray-500 font-mono ml-auto">PILLAR PAGE</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-11">
                      {cluster.clusters.map((c, j) => (
                        <span key={j} className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700/50 text-gray-400 rounded-lg hover:border-cyan-500/30 hover:text-cyan-400 transition-colors cursor-default">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "matrix" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {data.priorityMatrix.map((quad, i) => {
                  const colors = ["border-green-500/30 bg-green-500/5","border-blue-500/30 bg-blue-500/5","border-yellow-500/30 bg-yellow-500/5","border-slate-600/30 bg-slate-800/30"];
                  const labels = ["text-green-400","text-blue-400","text-yellow-400","text-gray-500"];
                  return (
                    <div key={i} className={`rounded-xl border p-5 ${colors[i]}`}>
                      <h3 className={`font-bold text-sm mb-3 ${labels[i]}`}>{quad.quadrant}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {quad.keywords.map((kw, j) => <span key={j} className="text-xs text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700/40">{kw}</span>)}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5"/>Action: {quad.action}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "competitors" && (
              <div className="space-y-4">
                {data.competitorKeywords.map((comp, i) => (
                  <div key={i} className="card-glow p-5 rounded-xl">
                    <h3 className="text-white font-bold text-sm mb-3 font-mono text-cyan-400">{comp.competitor}</h3>
                    <div className="flex flex-wrap gap-2">
                      {comp.topKeywords.map((kw, j) => <span key={j} className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700/50 text-gray-400 rounded-lg">{kw}</span>)}
                    </div>
                  </div>
                ))}
                {data.negativeKeywords.length > 0 && (
                  <div className="card-glow p-5 rounded-xl border-red-500/20 bg-red-500/5">
                    <h3 className="text-red-400 font-bold text-sm mb-3">Negative Keywords (Exclude from campaigns)</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.negativeKeywords.map((kw, i) => <span key={i} className="text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-mono">{kw}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
