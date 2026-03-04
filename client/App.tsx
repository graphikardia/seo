import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Scanner from "./pages/Scanner";
import AIAgents from "./pages/AIAgents";
import ContentHub from "./pages/ContentHub";
import Analysis from "./pages/Analysis";
import AutoPost from "./pages/AutoPost";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import KeywordResearch from "./pages/KeywordResearch";
import AgentScheduler from "./pages/AgentScheduler";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/content-hub" element={<ContentHub />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/auto-post" element={<AutoPost />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/keywords" element={<KeywordResearch />} />
          <Route path="/scheduler" element={<AgentScheduler />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
