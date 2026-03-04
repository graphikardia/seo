import { Link, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";

interface LayoutProps { children: ReactNode; }

const navItems = [
  { label: "Scanner", path: "/scanner" },
  { label: "AI Agents", path: "/ai-agents" },
  { label: "Scheduler", path: "/scheduler" },
  { label: "Content Hub", path: "/content-hub" },
  { label: "Keywords", path: "/keywords" },
  { label: "Analysis", path: "/analysis" },
  { label: "Auto-Post", path: "/auto-post" },
  { label: "Analytics", path: "/analytics" },
  { label: "Settings", path: "/settings" },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (p: string) => location.pathname === p;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/20 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline glow-cyan">WebScan Pro</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
              {navItems.map(item => (
                <Link key={item.path} to={item.path}
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive(item.path)
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  }`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-cyan-400 hover:text-cyan-300">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileOpen && (
            <nav className="lg:hidden pb-4 border-t border-cyan-500/20">
              <div className="flex flex-col gap-1 py-3">
                {navItems.map(item => (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                    className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10"
                    }`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="pt-16">{children}</main>

      <footer className="border-t border-cyan-500/20 bg-background/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2025 WebScan Intelligence Pro · AI-powered SEO, AEO & GEO Platform</p>
            <div className="flex gap-6">
              <Link to="/settings" className="hover:text-cyan-400 transition-colors">Settings</Link>
              <Link to="/ai-agents" className="hover:text-cyan-400 transition-colors">Agents</Link>
              <Link to="/scheduler" className="hover:text-cyan-400 transition-colors">Scheduler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
