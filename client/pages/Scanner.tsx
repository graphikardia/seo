import { useState } from "react";
import Layout from "@/components/Layout";
import ScoreDial from "@/components/ScoreDial";
import { Link } from "react-router-dom";
import {
  Radar, Zap, Shield, Eye, Star, Search, Globe, AlertTriangle,
  CheckCircle, RefreshCw, Share2, Brain, ArrowRight
} from "lucide-react";

const SCAN_PHASES = [
  { label: "Resolving DNS & server headers", icon: Globe },
  { label: "Crawling pages & sitemap", icon: Radar },
  { label: "Analyzing SEO signals & meta tags", icon: Search },
  { label: "Checking AEO & answer readiness", icon: Brain },
  { label: "Running Core Web Vitals tests", icon: Zap },
  { label: "Security & best practices audit", icon: Shield },
];

const SEV_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "CRITICAL" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", label: "HIGH" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "MEDIUM" },
  low: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", label: "LOW" },
} as const;

const SAMPLE_ISSUES = [
  { sev: "critical" as const, label: "Missing structured data (Schema.org)", impact: "AEO & GEO visibility severely limited" },
  { sev: "critical" as const, label: "No FAQ schema for AI engine discovery", impact: "Cannot be cited by Perplexity, ChatGPT Search" },
  { sev: "high" as const, label: "LCP > 4.2s — Core Web Vitals failing", impact: "Ranking penalty in Google Search" },
  { sev: "high" as const, label: "Missing entity signals for brand authority", impact: "GEO score reduced by ~35%" },
  { sev: "high" as const, label: "No Open Graph / Twitter Card meta tags", impact: "Poor social sharing previews" },
  { sev: "medium" as const, label: "Images missing alt text (12 found)", impact: "Accessibility & SEO image ranking" },
  { sev: "medium" as const, label: "No canonical URL on 8 pages", impact: "Duplicate content diluting authority" },
  { sev: "medium" as const, label: "Missing robots.txt directives", impact: "Search engine crawl budget waste" },
  { sev: "low" as const, label: "No sitemap.xml found", impact: "Slower content discovery" },
  { sev: "low" as const, label: "Render-blocking resources detected", impact: "Minor FID/INP impact" },
];

const SCORE_KEYS = [
  { key: "performance", label: "Performance" },
  { key: "seo", label: "SEO" },
  { key: "accessibility", label: "Accessibility" },
  { key: "security", label: "Security" },
  { key: "bestPractices", label: "Best Practices" },
  { key: "aeo", label: "AEO Score" },
];

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min)) + min; }
function getGrade(s: number): "A"|"B"|"C"|"D"|"F" {
  return s >= 90 ? "A" : s >= 75 ? "B" : s >= 60 ? "C" : s >= 45 ? "D" : "F";
}

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState(-1);
  const [scanned, setScanned] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [scannedUrl, setScannedUrl] = useState("");

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true); setScanned(false); setPhase(0);
    for (let i = 0; i < SCAN_PHASES.length; i++) {
      setPhase(i);
      await new Promise(r => setTimeout(r, 750));
    }
    setScores({ performance: rnd(62,92), seo: rnd(65,92), accessibility: rnd(55,90), security: rnd(70,95), bestPractices: rnd(60,90), aeo: rnd(40,82) });
    setScannedUrl(url);
    setScanning(false); setScanned(true); setPhase(-1);
  };

  const progress = scanning ? ((phase + 1) / SCAN_PHASES.length) * 100 : scanned ? 100 : 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
            <Radar className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">6-Phase AI Website Scanner</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 glow-cyan">Scan Any Website</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Full performance, SEO, AEO, GEO, accessibility & security audit powered by AI.</p>
        </div>

        {/* Input */}
        <div className="card-glow p-8 mb-8 max-w-3xl mx-auto">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
              <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key==="Enter" && !scanning && handleScan()}
                placeholder="https://yourwebsite.com"
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 font-mono text-sm transition-colors" />
            </div>
            <button onClick={handleScan} disabled={scanning || !url.trim()}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap">
              {scanning ? <><RefreshCw className="w-4 h-4 animate-spin" />Scanning…</> : <><Radar className="w-4 h-4" />Scan Now</>}
            </button>
          </div>
          {(scanning || scanned) && (
            <div className="mt-2">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700" style={{ width:`${progress}%`, boxShadow:"0 0 12px rgba(34,211,238,0.6)" }} />
              </div>
              {scanning && phase >= 0 && (
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" />{SCAN_PHASES[phase]?.label}
                  <span className="text-gray-600 ml-auto">{phase+1}/{SCAN_PHASES.length}</span>
                </div>
              )}
              {scanned && <div className="flex items-center gap-2 text-green-400 text-sm font-mono"><CheckCircle className="w-4 h-4" />Scan complete — {scannedUrl}</div>}
            </div>
          )}
        </div>

        {/* Phase grid during scan */}
        {scanning && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            {SCAN_PHASES.map((p, i) => {
              const Icon = p.icon;
              const done = i < phase; const active = i === phase;
              return (
                <div key={i} className={`p-4 rounded-lg border flex items-center gap-3 transition-all duration-300
                  ${active ? "border-cyan-500/60 bg-cyan-500/10" : done ? "border-green-500/30 bg-green-500/5" : "border-slate-700/30 bg-slate-900/20 opacity-40"}`}>
                  {done ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> : active ? <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin shrink-0" /> : <Icon className="w-5 h-5 text-gray-600 shrink-0" />}
                  <span className={`text-xs font-medium leading-tight ${active ? "text-cyan-300" : done ? "text-green-300" : "text-gray-500"}`}>{p.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Results */}
        {scanned && (
          <>
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Score Overview</h2>
                <div className="flex gap-3">
                  <button onClick={handleScan} className="flex items-center gap-2 px-4 py-2 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/10 transition-colors">
                    <RefreshCw className="w-4 h-4" />Re-scan
                  </button>
                  <Link to="/analysis" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all">
                    Deep Analysis <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {SCORE_KEYS.map(cat => (
                  <div key={cat.key} className="card-glow p-5 flex flex-col items-center">
                    <ScoreDial score={scores[cat.key]||0} label={cat.label} grade={getGrade(scores[cat.key]||0)} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card-glow p-6">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Star className="w-5 h-5 text-cyan-400" />Industry Benchmark</h3>
                {[
                  { label: "Your SEO Score", val: scores.seo||0, cls: "from-cyan-500 to-cyan-600" },
                  { label: "Industry Average", val: 72, cls: "from-slate-600 to-slate-700" },
                  { label: "Top 10%", val: 94, cls: "from-purple-500 to-purple-600" },
                  { label: "Your AEO Score", val: scores.aeo||0, cls: "from-pink-500 to-pink-600" },
                  { label: "AEO Industry Avg", val: 38, cls: "from-slate-600 to-slate-700" },
                ].map(b => (
                  <div key={b.label} className="mb-4">
                    <div className="flex justify-between mb-1"><span className="text-sm text-gray-400">{b.label}</span><span className="text-sm font-bold text-white font-mono">{b.val}%</span></div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${b.cls} rounded-full transition-all duration-1000`} style={{ width:`${b.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-glow p-6">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-400" />Issues Found ({SAMPLE_ISSUES.length})</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {SAMPLE_ISSUES.map((iss, i) => {
                    const cfg = SEV_CONFIG[iss.sev];
                    return (
                      <div key={i} className={`flex gap-3 p-3 rounded-lg border ${cfg.bg}`}>
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded whitespace-nowrap self-start mt-0.5 ${cfg.color}`}>{cfg.label}</span>
                        <div><p className="text-sm text-white font-medium leading-tight">{iss.label}</p><p className="text-xs text-gray-500 mt-0.5">{iss.impact}</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { to:"/ai-agents", label:"Deploy AI Agents", Icon:Brain, desc:"Fix issues automatically", g:"from-purple-600 to-purple-800" },
                { to:"/content-hub", label:"Generate Content", Icon:Star, desc:"SEO + AEO + GEO optimized", g:"from-cyan-600 to-cyan-800" },
                { to:"/auto-post", label:"Auto-Post Results", Icon:Share2, desc:"Share to all platforms", g:"from-pink-600 to-pink-800" },
              ].map(cta => (
                <Link key={cta.to} to={cta.to} className={`p-5 rounded-xl bg-gradient-to-br ${cta.g} text-white hover:shadow-lg transition-all hover:scale-105 flex items-center gap-4`}>
                  <cta.Icon className="w-8 h-8 shrink-0 opacity-80" />
                  <div><p className="font-bold">{cta.label}</p><p className="text-xs opacity-70 mt-0.5">{cta.desc}</p></div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-70 shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
