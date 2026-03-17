import { motion } from "motion/react";
import { Play, Info } from "lucide-react";
import { useState } from "react";

interface VisualExplanationProps {
  title: string;
  description: string;
  animation: React.ReactNode;
}

export default function VisualExplanation({ title, description, animation }: VisualExplanationProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-xl overflow-hidden group">
      <div className="p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
            <Play size={12} fill="currentColor" /> Visual Explanation
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Info size={16} />
          </button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="aspect-video bg-gray-50 relative flex items-center justify-center overflow-hidden">
        {animation}
        
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[2px]">
            <button 
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-emerald-600 hover:scale-110 transition-all"
            >
              <Play size={24} fill="currentColor" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
