import { useState } from "react";
import Layout from "@/components/Layout";
import { agentStore } from "@/lib/agentStore";

import { BookOpen, Sparkles, RefreshCw, Copy, CheckCircle, ChevronRight, Hash, Clock, FileText } from "lucide-react";

const TEMPLATES = [
  { id:"howto", name:"How-To Guide", icon:"📋", seoScore:95, tags:["Tutorial","Long-form","High-intent"] },
  { id:"listicle", name:"Listicle", icon:"📝", seoScore:88, tags:["Quick-read","Shareable","Social"] },
  { id:"comparison", name:"Comparison Post", icon:"⚖️", seoScore:92, tags:["Bottom-funnel","High-conversion"] },
  { id:"pillar", name:"Pillar Page", icon:"🏛️", seoScore:98, tags:["Authority","Link-bait","Evergreen"] },
  { id:"news", name:"News / Trend", icon:"📡", seoScore:82, tags:["Timely","Viral","Traffic-spike"] },
  { id:"casestudy", name:"Case Study", icon:"🔬", seoScore:90, tags:["Trust","Conversion","E-E-A-T"] },
];

interface GeneratedContent {
  title: string;
  metaDescription: string;
  excerpt: string;
  outline: string[];
  faqs: { q: string; a: string }[];
  keywords: string[];
  estimatedWordCount: number;
  readingTime: string;
  schemaMarkup: string;
}

export default function ContentHub() {
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true); setError(""); setContent(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers: (() => { const k = agentStore.getApiKey(); const h: Record<string,string> = {"Content-Type":"application/json"}; if(k) h["x-api-key"]=k; return h; })(),
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:`Create a ${template.name} blog post plan about: "${topic}".
Target keyword: "${keyword || topic}". Audience: "${audience || "general readers"}".
Optimize simultaneously for SEO (keyword placement, headers), AEO (direct answers, FAQ format for AI engines), and GEO (structured for LLM citation).
Respond ONLY with valid JSON, no markdown:
{"title":"...","metaDescription":"...","excerpt":"2-3 sentence hook","outline":["H2 section 1","H2 section 2","H2 section 3","H2 section 4","H2 section 5"],"faqs":[{"q":"...","a":"..."},{"q":"...","a":"..."},{"q":"...","a":"..."}],"keywords":["kw1","kw2","kw3","kw4","kw5","kw6"],"estimatedWordCount":1800,"readingTime":"7 min","schemaMarkup":"Article"}`
          }]
        })
      });
      const data = await resp.json();
      const text = (data.content || []).map((b: any) => b.text || "").join("").replace(/```json|```/g,"").trim();
      setContent(JSON.parse(text));
    } catch(e) {
      setError("Generation failed — check your API key in Settings.");
    }
    setGenerating(false);
  };

  const copyAll = () => {
    if (!content) return;
    const text = `TITLE: ${content.title}\n\nMETA: ${content.metaDescription}\n\nEXCERPT: ${content.excerpt}\n\nOUTLINE:\n${content.outline.map((s,i)=>`${i+1}. ${s}`).join("\n")}\n\nFAQs:\n${content.faqs.map(f=>`Q: ${f.q}\nA: ${f.a}`).join("\n\n")}\n\nKEYWORDS: ${content.keywords.join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold glow-cyan mb-2">Content Hub</h1>
          <p className="text-gray-400 text-lg">AI-generated content optimized for SEO + AEO + GEO simultaneously</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Config */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="text-xs font-bold font-mono text-gray-400 tracking-widest block mb-3">SELECT TEMPLATE</label>
              <div className="grid grid-cols-2 gap-2.5">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${template.id===t.id ? "border-cyan-500/60 bg-cyan-500/10" : "border-slate-700/50 bg-slate-900/50 hover:border-slate-600"}`}>
                    <span className="text-2xl block mb-1.5">{t.icon}</span>
                    <span className="text-sm font-semibold text-white block">{t.name}</span>
                    <span className={`text-xs font-mono font-bold ${template.id===t.id?"text-cyan-400":"text-gray-600"}`}>SEO {t.seoScore}</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {t.tags.slice(0,2).map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-gray-500 rounded">{tag}</span>)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold font-mono text-gray-400 tracking-widest block">CONTENT DETAILS</label>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Topic / Title *</label>
                <textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={2}
                  placeholder="e.g. How to rank #1 on Google in 2025"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Primary Keyword</label>
                <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="e.g. rank google 2025"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Target Audience</label>
                <input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. small business owners"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
              </div>
              <button onClick={generate} disabled={generating || !topic.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {generating ? <><RefreshCw className="w-5 h-5 animate-spin" />Generating…</> : <><Sparkles className="w-5 h-5" />Generate Content</>}
              </button>
            </div>
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-3">
            {!content && !generating && (
              <div className="h-full flex items-center justify-center card-glow rounded-2xl p-12">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-cyan-500/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-base">Select a template, enter your topic,<br/>and click Generate to create your content brief.</p>
                </div>
              </div>
            )}
            {generating && (
              <div className="h-full flex items-center justify-center card-glow rounded-2xl p-12">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <p className="text-cyan-400 font-mono text-sm">Claude is generating SEO + AEO + GEO content…</p>
                  <p className="text-gray-600 text-xs mt-2">Optimizing for search, answer & generative engines</p>
                </div>
              </div>
            )}
            {error && <div className="card-glow rounded-2xl p-6 border-red-500/30 text-red-400 text-sm">{error}</div>}
            {content && (
              <div className="card-glow rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
                  <h2 className="font-bold text-white">Content Brief</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{content.readingTime}</span>
                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5"/>~{content.estimatedWordCount} words</span>
                    <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs transition-colors">
                      {copied ? <><CheckCircle className="w-3.5 h-3.5 text-green-400"/>Copied!</> : <><Copy className="w-3.5 h-3.5"/>Copy All</>}
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                  {/* Title & Meta */}
                  <div>
                    <label className="text-xs font-mono font-bold text-cyan-400 tracking-widest block mb-2">TITLE</label>
                    <p className="text-white font-bold text-lg leading-tight">{content.title}</p>
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-purple-400 tracking-widest block mb-2">META DESCRIPTION</label>
                    <p className="text-gray-300 text-sm leading-relaxed">{content.metaDescription}</p>
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-400 tracking-widest block mb-2">EXCERPT / HOOK</label>
                    <p className="text-gray-400 text-sm italic leading-relaxed border-l-2 border-cyan-500/40 pl-3">{content.excerpt}</p>
                  </div>
                  {/* Outline */}
                  <div>
                    <label className="text-xs font-mono font-bold text-cyan-400 tracking-widest block mb-3">ARTICLE OUTLINE</label>
                    <div className="space-y-2">
                      {content.outline.map((sec, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-700/40">
                          <span className="text-xs font-mono font-bold text-cyan-500/60 w-8 shrink-0">H2</span>
                          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                          <span className="text-sm text-gray-200">{sec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* FAQs — AEO */}
                  <div>
                    <label className="text-xs font-mono font-bold text-pink-400 tracking-widest block mb-3">AEO FAQ SCHEMA</label>
                    <div className="space-y-3">
                      {content.faqs.map((faq, i) => (
                        <div key={i} className="p-3 bg-pink-500/5 border border-pink-500/20 rounded-lg">
                          <p className="text-sm font-semibold text-white mb-1.5">Q: {faq.q}</p>
                          <p className="text-sm text-gray-400 leading-relaxed">A: {faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Keywords */}
                  <div>
                    <label className="text-xs font-mono font-bold text-green-400 tracking-widest block mb-3 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5"/>TARGET KEYWORDS</label>
                    <div className="flex flex-wrap gap-2">
                      {content.keywords.map(kw => (
                        <span key={kw} className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-mono rounded-lg">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
