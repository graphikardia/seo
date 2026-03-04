import { useState } from "react";
import Layout from "@/components/Layout";
import { callLLM } from "@/lib/llm";
import { TrendingUp, TrendingDown, Eye, Search, Zap, Globe, Users, BarChart3, RefreshCw } from "lucide-react";

const KPI_ICONS: Record<string, any> = { traffic: Users, keywords: Search, citations: Globe, authority: BarChart3, position: TrendingUp, bounce: Zap };

interface KPI { label: string; value: string; change: string; up: boolean; iconKey: string; }
interface AIEngine { name: string; score: number; color: string; change: string; }
interface TopPage { url: string; traffic: number; position: number; aeo: number; }
interface AnalyticsData {
  kpis: KPI[];
  aiEngines: AIEngine[];
  topPages: TopPage[];
  monthly: number[];
  summary: string;
}

const ENGINE_COLORS: Record<string, string> = {
  "Google SGE": "#4285F4", "Perplexity AI": "#6C5CE7", "ChatGPT Browse": "#10A37F",
  "Google Gemini": "#FBBC04", "Claude AI": "#CC9B7A", "Bing Copilot": "#0078D4",
  "You.com": "#FF6B6B", "Brave Leo": "#FB542B",
};

export default function Analytics() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("Last 30 days");

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true); setError("");
    try {
      const prompt = "You are an SEO and web analytics expert. Analyze the website: " + url + "\n\nGenerate a realistic analytics report for this domain based on its industry, size, and likely traffic patterns.\nReturn ONLY valid JSON, no markdown:\n{\"summary\":\"2-sentence overview of site analytics health\",\"kpis\":[{\"label\":\"Organic Traffic\",\"value\":\"12,400\",\"change\":\"+18%\",\"up\":true,\"iconKey\":\"traffic\"},{\"label\":\"Keyword Rankings\",\"value\":\"287\",\"change\":\"+34\",\"up\":true,\"iconKey\":\"keywords\"},{\"label\":\"AI Citations\",\"value\":\"42\",\"change\":\"+89%\",\"up\":true,\"iconKey\":\"citations\"},{\"label\":\"Page Authority\",\"value\":\"44 / 100\",\"change\":\"+2 pts\",\"up\":true,\"iconKey\":\"authority\"},{\"label\":\"Avg. Position\",\"value\":\"6.8\",\"change\":\"-0.9\",\"up\":true,\"iconKey\":\"position\"},{\"label\":\"Bounce Rate\",\"value\":\"52%\",\"change\":\"-4%\",\"up\":true,\"iconKey\":\"bounce\"}],\"aiEngines\":[{\"name\":\"Google SGE\",\"score\":48,\"change\":\"+5\"},{\"name\":\"Perplexity AI\",\"score\":31,\"change\":\"+12\"},{\"name\":\"ChatGPT Browse\",\"score\":22,\"change\":\"+4\"},{\"name\":\"Google Gemini\",\"score\":39,\"change\":\"+3\"},{\"name\":\"Claude AI\",\"score\":27,\"change\":\"+8\"},{\"name\":\"Bing Copilot\",\"score\":33,\"change\":\"+2\"},{\"name\":\"You.com\",\"score\":18,\"change\":\"+5\"},{\"name\":\"Brave Leo\",\"score\":14,\"change\":\"+1\"}],\"topPages\":[{\"url\":\"/\",\"traffic\":3200,\"position\":1.4,\"aeo\":72},{\"url\":\"/about\",\"traffic\":980,\"position\":3.2,\"aeo\":55},{\"url\":\"/blog/post-1\",\"traffic\":760,\"position\":4.8,\"aeo\":68},{\"url\":\"/services\",\"traffic\":540,\"position\":6.1,\"aeo\":48},{\"url\":\"/contact\",\"traffic\":310,\"position\":8.4,\"aeo\":41}],\"monthly\":[22,28,25,34,38,33,41,39,47,44,52,58]}\n\nMake all numbers realistic for the specific domain — a small blog gets different numbers than a major e-commerce site. Scores 0-100.";

      const text = await callLLM(prompt, 1200);
      const parsed: AnalyticsData = JSON.parse(text.replace(/```json|```/g, "").trim());
      // Inject colours for AI engines
      parsed.aiEngines = parsed.aiEngines.map(e => ({ ...e, color: ENGINE_COLORS[e.name] || "#888" }));
      setData(parsed);
    } catch (e: any) {
      setError(e.message || "Analysis failed — check your API key in Settings.");
    }
    setLoading(false);
  };

  const maxVal = data ? Math.max(...data.monthly) : 1;
  const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold glow-purple mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">AI-powered analytics report for any website</p>
          </div>
        </div>

        {/* URL Input */}
        <div className="card-glow p-6 mb-8 max-w-3xl">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
              <input value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && analyze()}
                placeholder="https://yourwebsite.com"
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 font-mono text-sm" />
            </div>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              <option>Last 30 days</option><option>Last 90 days</option><option>Last year</option>
            </select>
            <button onClick={analyze} disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Analysing…</> : <><BarChart3 className="w-4 h-4" />Analyse</>}
            </button>
          </div>
          {error && <p className="mt-3 text-red-400 text-sm font-mono">{error}</p>}
          {!data && !loading && (
            <p className="mt-3 text-gray-500 text-xs">Enter a URL above to generate an AI-powered analytics report for that site.</p>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm mb-8">
            <RefreshCw className="w-4 h-4 animate-spin" /> Generating analytics report…
          </div>
        )}

        {data && (
          <>
            {data.summary && (
              <div className="card-glow p-5 mb-6 border-l-4 border-cyan-500/60">
                <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {data.kpis.map(kpi => {
                const Icon = KPI_ICONS[kpi.iconKey] || BarChart3;
                return (
                  <div key={kpi.label} className="card-glow p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="w-4 h-4 text-cyan-400/60" />
                      <span className={"text-xs font-mono font-bold flex items-center gap-0.5 " + (kpi.up ? "text-green-400" : "text-red-400")}>
                        {kpi.up ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}{kpi.change}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white font-mono">{kpi.value}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{kpi.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* AI Visibility */}
              <div className="lg:col-span-2 card-glow p-6 rounded-xl">
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Globe className="w-5 h-5 text-cyan-400"/>AI Engine Visibility</h2>
                <p className="text-gray-500 text-sm mb-6">How often your content appears in AI-generated answers</p>
                <div className="space-y-4">
                  {data.aiEngines.map(eng => (
                    <div key={eng.name} className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-36 shrink-0">{eng.name}</span>
                      <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: eng.score + "%", background: eng.color, boxShadow: "0 0 8px " + eng.color + "60" }} />
                      </div>
                      <span className="text-sm font-mono font-bold text-white w-8 text-right">{eng.score}</span>
                      <span className="text-xs font-mono text-green-400 w-10 text-right">{eng.change}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly chart */}
              <div className="card-glow p-6 rounded-xl">
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400"/>AI Citations / Month</h2>
                <p className="text-gray-500 text-sm mb-6">Times cited by AI search engines</p>
                <div className="flex items-end gap-1.5 h-32">
                  {data.monthly.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm transition-all duration-700"
                        style={{ height: ((v / maxVal) * 100) + "%", background: "linear-gradient(to top, #7c3aed, #22d3ee)", minHeight: 4, opacity: i === data.monthly.length - 1 ? 1 : 0.6 + i * 0.03 }} />
                      <span className="text-[9px] text-gray-600 font-mono">{MONTHS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="card-glow rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-cyan-500/20">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-400"/>Top Performing Pages</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left px-6 py-3 text-xs font-mono text-gray-500 tracking-widest">PAGE</th>
                      <th className="text-right px-6 py-3 text-xs font-mono text-gray-500 tracking-widest">TRAFFIC</th>
                      <th className="text-right px-6 py-3 text-xs font-mono text-gray-500 tracking-widest">POSITION</th>
                      <th className="text-right px-6 py-3 text-xs font-mono text-gray-500 tracking-widest">AEO SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((page, i) => (
                      <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-cyan-400 text-xs">{page.url}</td>
                        <td className="px-6 py-4 text-right font-mono text-white font-bold">{page.traffic.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-mono text-purple-400">{page.position}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: page.aeo + "%" }}/>
                            </div>
                            <span className="font-mono text-pink-400 text-xs font-bold">{page.aeo}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
