import { Zap } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center py-20">
        <div className="flex items-center justify-center mb-6">
          {icon || <Zap className="w-16 h-16 text-cyan-400" />}
        </div>
        <h1 className="text-4xl font-bold mb-4 glow-cyan">{title}</h1>
        <p className="text-xl text-gray-300 mb-8">{description}</p>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 inline-block">
          <p className="text-gray-400">
            This page is ready to be customized. Continue exploring the app or
            ask to build out this section!
          </p>
        </div>
      </div>
    </div>
  );
}
