import { useState } from "react";
import Layout from "@/components/Layout";
import { TrendingUp, TrendingDown, Minus, Eye, Search, Zap, Globe, Users, BarChart3, RefreshCw } from "lucide-react";

const KPIS = [
  { label:"Organic Traffic", value:"12,847", change:"+23%", up:true, icon:Users },
  { label:"Keyword Rankings", value:"342", change:"+47", up:true, icon:Search },
  { label:"AI Citations", value:"89", change:"+156%", up:true, icon:Globe },
  { label:"Page Authority", value:"58 / 100", change:"+3 pts", up:true, icon:BarChart3 },
  { label:"Avg. Position", value:"4.2", change:"-1.8", up:true, icon:TrendingUp },
  { label:"Bounce Rate", value:"38%", change:"-12%", up:true, icon:Zap },
];

const AI_ENGINES = [
  { name:"Google SGE", score:72, color:"#4285F4", change:"+8" },
  { name:"Perplexity AI", score:58, color:"#6C5CE7", change:"+15" },
  { name:"ChatGPT Browse", score:43, color:"#10A37F", change:"+6" },
  { name:"Google Gemini", score:61, color:"#FBBC04", change:"+4" },
  { name:"Claude AI", score:55, color:"#CC9B7A", change:"+11" },
  { name:"Bing Copilot", score:49, color:"#0078D4", change:"+3" },
  { name:"You.com", score:34, color:"#FF6B6B", change:"+7" },
  { name:"Brave Leo", score:28, color:"#FB542B", change:"+2" },
];

const TOP_PAGES = [
  { url:"/blog/seo-guide-2025", traffic:3241, position:1.2, aeo:88 },
  { url:"/blog/aeo-vs-seo", traffic:2108, position:2.4, aeo:91 },
  { url:"/product/webscan-pro", traffic:1892, position:3.1, aeo:72 },
  { url:"/blog/geo-optimization", traffic:1654, position:4.2, aeo:84 },
  { url:"/case-studies/startup", traffic:1203, position:5.8, aeo:67 },
];

const MONTHLY = [30,42,38,55,61,58,72,68,81,77,89,94];
const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];

export default function Analytics() {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1400));
    setRefreshing(false);
  };

  const maxVal = Math.max(...MONTHLY);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold glow-purple mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Monitor performance across search, answer & generative engines</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              <option>Last 30 days</option><option>Last 90 days</option><option>Last year</option>
            </select>
            <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/10 transition-colors">
              <RefreshCw className={`w-4 h-4 ${refreshing?"animate-spin":""}`} />Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {KPIS.map(kpi => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="card-glow p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-cyan-400/60" />
                  <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${kpi.up ? "text-green-400" : "text-red-400"}`}>
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
              {AI_ENGINES.map(eng => (
                <div key={eng.name} className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-36 shrink-0">{eng.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${eng.score}%`, background:eng.color, boxShadow:`0 0 8px ${eng.color}60` }} />
                  </div>
                  <span className="text-sm font-mono font-bold text-white w-8 text-right">{eng.score}</span>
                  <span className="text-xs font-mono text-green-400 w-10 text-right">{eng.change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini chart */}
          <div className="card-glow p-6 rounded-xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400"/>AI Citations / Month</h2>
            <p className="text-gray-500 text-sm mb-6">Times cited by AI search engines</p>
            <div className="flex items-end gap-1.5 h-32">
              {MONTHLY.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm transition-all duration-700"
                    style={{ height:`${(v/maxVal)*100}%`, background:`linear-gradient(to top, #7c3aed, #22d3ee)`, minHeight:4, opacity: i===MONTHLY.length-1?1:0.6+i*0.03 }} />
                  <span className="text-[9px] text-gray-600 font-mono">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages table */}
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
                {TOP_PAGES.map((page, i) => (
                  <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-cyan-400 text-xs">{page.url}</td>
                    <td className="px-6 py-4 text-right font-mono text-white font-bold">{page.traffic.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono text-purple-400">{page.position}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500" style={{width:`${page.aeo}%`}}/>
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
      </div>
    </Layout>
  );
}
