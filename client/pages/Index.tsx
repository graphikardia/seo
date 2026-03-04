import Layout from "@/components/Layout";
import FeatureCard from "@/components/FeatureCard";
import ScoreDial from "@/components/ScoreDial";
import {
  Radar,
  Bot,
  BookOpen,
  BarChart3,
  Share2,
  TrendingUp,
  Settings,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const features = [
    {
      icon: <Radar className="w-8 h-8" />,
      title: "Website Scanner",
      description:
        "6-phase AI-powered scan with animated progress, key metrics, and detailed score cards",
      href: "/scanner",
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Agents",
      description:
        "Deploy 6 autonomous agents with live terminal logs and one-click Deploy All",
      href: "/ai-agents",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Content Hub",
      description:
        "Claude-powered blog generator with 6 templates and complete content metadata",
      href: "/content-hub",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analysis",
      description:
        "Deep SEO, AEO, and GEO analysis with scores, grades, and quick wins",
      href: "/analysis",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Auto-Post Engine",
      description:
        "Generate platform-native posts with live preview and character-aware formatting",
      href: "/auto-post",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analytics",
      description:
        "Track 6 KPIs and monitor AI engine visibility across Google, ChatGPT, and more",
      href: "/analytics",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-cyan-500/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-8">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">
                AI-Powered Website Growth Intelligence
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                WebScan Intelligence
              </span>
              <br />
              <span className="text-white">Pro Suite</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Complete AI-powered website growth platform. Scan, analyze, generate
              content, and optimize across SEO, AEO, and GEO with autonomous agents
              and Claude-powered intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/scanner"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:from-cyan-400 hover:to-cyan-500"
              >
                Start Scanning <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 border border-cyan-500/40 text-cyan-300 font-bold rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Demo Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">6</div>
              <p className="text-gray-400">Autonomous AI Agents</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">7</div>
              <p className="text-gray-400">Analysis & Tools</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">∞</div>
              <p className="text-gray-400">Growth Potential</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 glow-cyan">
              Platform Capabilities
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to grow your online presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

          {/* Additional Feature: Settings */}
          <div className="mt-12 text-center">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-6 py-3 border border-cyan-500/40 text-cyan-300 font-medium rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
              Manage API Keys & Settings
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-center glow-cyan">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Input & Scan",
                description:
                  "Enter a URL and watch our 6-phase scanner analyze every aspect of your website in real-time",
              },
              {
                step: "2",
                title: "AI Analysis",
                description:
                  "Claude-powered agents perform deep analysis across SEO, AEO, GEO with detailed insights",
              },
              {
                step: "3",
                title: "Generate & Optimize",
                description:
                  "Auto-generate blog content, social posts, and implementation strategies with one click",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative p-8 rounded-lg border border-cyan-500/20 bg-slate-900/50"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 mt-4">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 sm:p-12 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                Ready to Transform Your Website?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start with a complete website scan and discover growth opportunities
                in minutes.
              </p>
              <Link
                to="/scanner"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:from-cyan-400 hover:to-cyan-500"
              >
                Begin Scan Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Score Example Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-center glow-cyan">
            Understanding Your Scores
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            <ScoreDial score={92} label="SEO Score" grade="A" size="md" />
            <ScoreDial score={87} label="AEO Score" grade="B" size="md" />
            <ScoreDial score={78} label="GEO Score" grade="B" size="md" />
            <ScoreDial score={95} label="Performance" grade="A" size="md" />
            <ScoreDial score={85} label="Accessibility" grade="B" size="md" />
            <ScoreDial score={73} label="Best Practices" grade="C" size="md" />
          </div>
        </div>
      </section>
    </Layout>
  );
}
