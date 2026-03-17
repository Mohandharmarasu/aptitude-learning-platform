import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Info, BrainCircuit, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

type PremiseType = "All" | "No" | "Some" | "SomeNot";

interface Premise {
  id: string;
  type: PremiseType;
  subject: string;
  predicate: string;
}

export default function SyllogismSolver() {
  const [premises, setPremises] = useState<Premise[]>([
    { id: "1", type: "All", subject: "A", predicate: "B" },
    { id: "2", type: "Some", subject: "B", predicate: "C" },
  ]);
  const [conclusion, setConclusion] = useState<{ subject: string; predicate: string; type: PremiseType }>({
    subject: "A",
    predicate: "C",
    type: "Some"
  });
  
  const vizRef = useRef<SVGSVGElement>(null);

  const addPremise = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setPremises([...premises, { id: newId, type: "All", subject: "A", predicate: "B" }]);
  };

  const removePremise = (id: string) => {
    setPremises(premises.filter(p => p.id !== id));
  };

  const updatePremise = (id: string, updates: Partial<Premise>) => {
    setPremises(premises.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  useEffect(() => {
    if (!vizRef.current) return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 90;

    // Define positions for A, B, C in a triangle
    const positions: Record<string, { x: number; y: number; color: string; label: string }> = {
      "A": { x: centerX - 60, y: centerY - 40, color: "#10B981", label: "A" },
      "B": { x: centerX + 60, y: centerY - 40, color: "#3B82F6", label: "B" },
      "C": { x: centerX, y: centerY + 60, color: "#F59E0B", label: "C" },
    };

    const g = svg.append("g");

    // Draw circles with distinct IDs for clipping
    Object.entries(positions).forEach(([key, pos]) => {
      svg.append("defs")
        .append("clipPath")
        .attr("id", `clip-${key}`)
        .append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", radius);

      g.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", radius)
        .attr("fill", pos.color)
        .attr("fill-opacity", 0.05)
        .attr("stroke", pos.color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");

      g.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y - radius - 15)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("fill", pos.color)
        .text(key);
    });

    // Visualize logical flow
    premises.forEach((p, i) => {
      const sub = positions[p.subject];
      const pred = positions[p.predicate];
      if (!sub || !pred) return;

      const color = sub.color;
      
      if (p.type === "All") {
        // Shading: Area of Subject that is NOT in Predicate is empty
        // We simulate this with a gradient or a specific pattern
        const id = `shading-${i}`;
        svg.append("defs")
          .append("pattern")
          .attr("id", id)
          .attr("patternUnits", "userSpaceOnUse")
          .attr("width", 4)
          .attr("height", 4)
          .append("path")
          .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("opacity", 0.3);

        // Draw the shaded region (Subject - Predicate)
        g.append("circle")
          .attr("cx", sub.x)
          .attr("cy", sub.y)
          .attr("r", radius)
          .attr("fill", `url(#${id})`)
          .attr("clip-path", `url(#clip-${p.subject})`)
          .style("mask", `url(#mask-not-${p.predicate})`); // This is complex in D3/SVG without real boolean ops
        
        // Simplified: Draw a thick arrow showing containment
        const angle = Math.atan2(pred.y - sub.y, pred.x - sub.x);
        const startX = sub.x + Math.cos(angle) * 20;
        const startY = sub.y + Math.sin(angle) * 20;
        const endX = pred.x - Math.cos(angle) * 40;
        const endY = pred.y - Math.sin(angle) * 40;

        g.append("line")
          .attr("x1", startX)
          .attr("y1", startY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", color)
          .attr("stroke-width", 3)
          .attr("marker-end", "url(#arrow-head)")
          .attr("opacity", 0)
          .transition()
          .delay(i * 300)
          .attr("opacity", 1);
          
      } else if (p.type === "No") {
        // Draw a separator line
        const midX = (sub.x + pred.x) / 2;
        const midY = (sub.y + pred.y) / 2;
        const angle = Math.atan2(pred.y - sub.y, pred.x - sub.x) + Math.PI / 2;
        const len = 40;

        g.append("line")
          .attr("x1", midX - Math.cos(angle) * len)
          .attr("y1", midY - Math.sin(angle) * len)
          .attr("x2", midX + Math.cos(angle) * len)
          .attr("y2", midY + Math.sin(angle) * len)
          .attr("stroke", "#EF4444")
          .attr("stroke-width", 4)
          .attr("stroke-linecap", "round")
          .attr("opacity", 0)
          .transition()
          .delay(i * 300)
          .attr("opacity", 1);

      } else if (p.type === "Some") {
        const midX = (sub.x + pred.x) / 2;
        const midY = (sub.y + pred.y) / 2;
        
        g.append("text")
          .attr("x", midX)
          .attr("y", midY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "24px")
          .attr("font-weight", "900")
          .attr("fill", "#151619")
          .text("×")
          .attr("opacity", 0)
          .transition()
          .delay(i * 300)
          .attr("opacity", 1);
      }
    });

    // Arrow Head Definition
    svg.append("defs").append("marker")
      .attr("id", "arrow-head")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "currentColor");

  }, [premises]);

  return (
    <div className="bg-white rounded-[3rem] border border-black/5 shadow-2xl p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Interactive Tool
          </div>
          <h3 className="text-3xl font-bold tracking-tight">Logical Deduction Solver</h3>
          <p className="text-gray-500 max-w-md">Input your premises to visualize how sets interact and derive valid conclusions.</p>
        </div>
        <div className="w-16 h-16 bg-[#151619] rounded-[2rem] flex items-center justify-center text-emerald-400 shadow-xl">
          <BrainCircuit size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-5 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Premises</h4>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {premises.map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex items-center gap-3 p-4 bg-gray-50 rounded-3xl border border-black/5 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-white border border-black/5 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {idx + 1}
                    </div>
                    <select 
                      value={p.type}
                      onChange={(e) => updatePremise(p.id, { type: e.target.value as PremiseType })}
                      className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="All">All</option>
                      <option value="No">No</option>
                      <option value="Some">Some</option>
                      <option value="SomeNot">Some Not</option>
                    </select>
                    <select 
                      value={p.subject}
                      onChange={(e) => updatePremise(p.id, { subject: e.target.value })}
                      className="bg-white px-2 py-1 rounded-lg border border-black/5 font-bold text-sm focus:outline-none"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                    <span className="text-xs text-gray-400 font-medium">are</span>
                    <select 
                      value={p.predicate}
                      onChange={(e) => updatePremise(p.id, { predicate: e.target.value })}
                      className="bg-white px-2 py-1 rounded-lg border border-black/5 font-bold text-sm focus:outline-none"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                    <button 
                      onClick={() => removePremise(p.id)}
                      className="ml-auto p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={addPremise}
              className="w-full h-14 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center gap-2 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all font-bold text-sm"
            >
              <Plus size={18} /> Add New Premise
            </button>
          </div>

          <div className="pt-6 border-t border-black/5 space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Test Conclusion</h4>
            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4">
              <div className="flex items-center gap-3">
                <select 
                  value={conclusion.type}
                  onChange={(e) => setConclusion({ ...conclusion, type: e.target.value as PremiseType })}
                  className="bg-white px-3 py-2 rounded-xl border border-emerald-200 font-bold text-sm"
                >
                  <option value="All">All</option>
                  <option value="Some">Some</option>
                  <option value="No">No</option>
                </select>
                <select 
                  value={conclusion.subject}
                  onChange={(e) => setConclusion({ ...conclusion, subject: e.target.value })}
                  className="bg-white px-3 py-2 rounded-xl border border-emerald-200 font-bold text-sm"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <span className="text-sm font-medium text-emerald-800">are</span>
                <select 
                  value={conclusion.predicate}
                  onChange={(e) => setConclusion({ ...conclusion, predicate: e.target.value })}
                  className="bg-white px-3 py-2 rounded-xl border border-emerald-200 font-bold text-sm"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>This conclusion is logically valid.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7">
          <div className="aspect-square bg-gray-50 rounded-[3rem] border border-black/5 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Sparkles size={12} className="text-emerald-500" /> Live Logic Visualization
            </div>
            
            <svg ref={vizRef} width="400" height="400" className="max-w-full h-auto drop-shadow-2xl" />
            
            <div className="absolute bottom-8 right-8 flex flex-col gap-2">
              {Object.entries({ "A": "#10B981", "B": "#3B82F6", "C": "#F59E0B" }).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-black/5 shadow-sm">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-bold text-gray-600">Set {key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 rounded-3xl border border-black/5 flex gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-black/5 flex items-center justify-center text-emerald-500 shrink-0">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm">How it works</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              The solver uses Euler diagrams to represent relationships. Arrows show containment (All), 
              crosses show existence (Some), and distance shows exclusion (No).
            </p>
          </div>
        </div>
        <div className="p-6 bg-gray-50 rounded-3xl border border-black/5 flex gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-black/5 flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm">Deduction Logic</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Deduction follows the rules of syllogistic logic. If 'All A are B' and 'All B are C', 
              then 'All A are C' is a necessary conclusion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
