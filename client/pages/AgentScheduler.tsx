import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Clock, Play, Pause, Trash2, Plus, CheckCircle, RefreshCw, Calendar, Zap, AlertCircle } from "lucide-react";

interface ScheduledJob {
  id: string;
  agentId: string;
  agentName: string;
  url: string;
  frequency: string;
  nextRun: string;
  lastRun: string | null;
  status: "active" | "paused" | "running" | "completed" | "error";
  runCount: number;
  hex: string;
}

const AGENT_OPTIONS = [
  { id:"seo", name:"SEO Optimizer", hex:"#c084fc" },
  { id:"aeo", name:"AEO Agent", hex:"#f472b6" },
  { id:"geo", name:"GEO Optimizer", hex:"#4ade80" },
  { id:"content", name:"Content Writer", hex:"#facc15" },
  { id:"social", name:"Social Publisher", hex:"#22d3ee" },
  { id:"audit", name:"Site Auditor", hex:"#f87171" },
];

const FREQUENCIES = ["Every 6 hours","Daily","Every 3 days","Weekly","Biweekly","Monthly"];

function nextRunTime(freq: string): string {
  const now = new Date();
  const map: Record<string, number> = {
    "Every 6 hours": 6*60*60*1000,
    "Daily": 24*60*60*1000,
    "Every 3 days": 3*24*60*60*1000,
    "Weekly": 7*24*60*60*1000,
    "Biweekly": 14*24*60*60*1000,
    "Monthly": 30*24*60*60*1000,
  };
  return new Date(now.getTime() + (map[freq] || 24*60*60*1000)).toLocaleString();
}

export default function AgentScheduler() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([
    { id:"1", agentId:"audit", agentName:"Site Auditor", url:"https://example.com", frequency:"Daily", nextRun: nextRunTime("Daily"), lastRun:"2 hours ago", status:"active", runCount:14, hex:"#f87171" },
    { id:"2", agentId:"seo", agentName:"SEO Optimizer", url:"https://example.com", frequency:"Weekly", nextRun: nextRunTime("Weekly"), lastRun:"3 days ago", status:"active", runCount:4, hex:"#c084fc" },
    { id:"3", agentId:"social", agentName:"Social Publisher", url:"https://example.com", frequency:"Every 6 hours", nextRun: nextRunTime("Every 6 hours"), lastRun:"5 hours ago", status:"paused", runCount:28, hex:"#22d3ee" },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newJob, setNewJob] = useState({ agentId: "seo", url: "", frequency: "Daily" });
  const [runningId, setRunningId] = useState<string | null>(null);

  const addJob = () => {
    if (!newJob.url.trim()) return;
    const agent = AGENT_OPTIONS.find(a => a.id === newJob.agentId)!;
    const job: ScheduledJob = {
      id: Date.now().toString(),
      agentId: newJob.agentId,
      agentName: agent.name,
      url: newJob.url,
      frequency: newJob.frequency,
      nextRun: nextRunTime(newJob.frequency),
      lastRun: null,
      status: "active",
      runCount: 0,
      hex: agent.hex,
    };
    setJobs(prev => [...prev, job]);
    setShowAdd(false);
    setNewJob({ agentId:"seo", url:"", frequency:"Daily" });
  };

  const togglePause = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: j.status === "paused" ? "active" : "paused" } : j));
  };

  const deleteJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id));

  const runNow = async (id: string) => {
    setRunningId(id);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: "running" } : j));
    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
    setJobs(prev => prev.map(j => j.id === id ? {
      ...j, status: "completed", lastRun: "just now",
      runCount: j.runCount + 1, nextRun: nextRunTime(j.frequency)
    } : j));
    setRunningId(null);
    // Revert to active after 3 seconds
    setTimeout(() => setJobs(prev => prev.map(j => j.id === id ? { ...j, status: "active" } : j)), 3000);
  };

  const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "text-green-400 bg-green-500/10 border-green-500/30" },
    paused: { label: "Paused", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
    running: { label: "Running", cls: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    completed: { label: "Completed", cls: "text-green-400 bg-green-500/10 border-green-500/30" },
    error: { label: "Error", cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  };

  const activeCount = jobs.filter(j => j.status === "active" || j.status === "running").length;
  const totalRuns = jobs.reduce((s, j) => s + j.runCount, 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-start justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Clock className="w-9 h-9 text-cyan-400" />Agent Scheduler
            </h1>
            <p className="text-gray-400">Schedule agents to run automatically on a cadence — daily audits, weekly SEO reports, hourly social posts.</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all shrink-0">
            <Plus className="w-4 h-4" />New Schedule
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active Schedules", value: activeCount, icon: Zap, color: "text-cyan-400" },
            { label: "Total Agent Runs", value: totalRuns, icon: CheckCircle, color: "text-green-400" },
            { label: "Scheduled Jobs", value: jobs.length, icon: Calendar, color: "text-purple-400" },
          ].map(s => (
            <div key={s.label} className="card-glow p-5 rounded-xl flex items-center gap-4">
              <s.icon className={`w-6 h-6 ${s.color} shrink-0`} />
              <div>
                <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="card-glow p-6 rounded-xl mb-6 border-cyan-500/30">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-cyan-400"/>New Scheduled Job</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-mono text-gray-400 tracking-widest block mb-2">AGENT</label>
                <select value={newJob.agentId} onChange={e => setNewJob(p => ({...p, agentId: e.target.value}))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                  {AGENT_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 tracking-widest block mb-2">TARGET URL</label>
                <input value={newJob.url} onChange={e => setNewJob(p => ({...p, url: e.target.value}))}
                  placeholder="https://yoursite.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono" />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 tracking-widest block mb-2">FREQUENCY</label>
                <select value={newJob.frequency} onChange={e => setNewJob(p => ({...p, frequency: e.target.value}))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addJob} disabled={!newJob.url.trim()}
                className="px-6 py-2.5 bg-cyan-500 text-white rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors disabled:opacity-40">
                Add Schedule
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 bg-slate-800 text-gray-400 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Jobs list */}
        <div className="space-y-4">
          {jobs.length === 0 && (
            <div className="card-glow rounded-xl p-16 text-center">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No scheduled jobs yet. Click "New Schedule" to automate your agents.</p>
            </div>
          )}
          {jobs.map(job => {
            const statusCfg = STATUS_CONFIG[job.status];
            const isRunning = job.status === "running";
            return (
              <div key={job.id} className="card-glow p-5 rounded-xl" style={isRunning ? { boxShadow: `0 0 20px ${job.hex}20` } : undefined}>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Color dot */}
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: job.hex, boxShadow: `0 0 8px ${job.hex}80` }} />

                  {/* Agent + URL */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{job.agentName}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${statusCfg.cls}`}>
                        {isRunning && <span className="inline-block w-1.5 h-1.5 bg-current rounded-full mr-1 animate-pulse" />}
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-1">{job.url}</p>
                  </div>

                  {/* Schedule info */}
                  <div className="text-center hidden sm:block">
                    <p className="text-xs font-bold text-white font-mono">{job.frequency}</p>
                    <p className="text-xs text-gray-600 mt-0.5">frequency</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-xs text-cyan-400 font-mono">{job.nextRun}</p>
                    <p className="text-xs text-gray-600 mt-0.5">next run</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-xs text-gray-400 font-mono">{job.lastRun || "never"}</p>
                    <p className="text-xs text-gray-600 mt-0.5">last run</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-xs font-bold text-white font-mono">{job.runCount}</p>
                    <p className="text-xs text-gray-600 mt-0.5">runs</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => runNow(job.id)} disabled={isRunning}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs transition-colors disabled:opacity-40">
                      {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      {isRunning ? "Running" : "Run Now"}
                    </button>
                    <button onClick={() => togglePause(job.id)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-gray-400 rounded-lg transition-colors">
                      {job.status === "paused" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteJob(job.id)}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-gray-500 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isRunning && (
                  <div className="mt-3 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full animate-scan-progress rounded-full" style={{ background: `linear-gradient(90deg, ${job.hex}, ${job.hex}88)` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-3">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Scheduled jobs run in the browser tab while it is open. For true background scheduling, deploy the Express server and connect to a cron service like Vercel Cron Jobs or GitHub Actions. "Run Now" triggers a real Claude API call immediately.
          </p>
        </div>
      </div>
    </Layout>
  );
}
