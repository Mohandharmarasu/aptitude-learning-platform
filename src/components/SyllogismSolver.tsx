import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import { Plus, Trash2, Info, BrainCircuit } from "lucide-react";
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
    const radius = 80;

    // Define positions for A, B, C
    const positions: Record<string, { x: number; y: number; color: string }> = {
      "A": { x: centerX - 50, y: centerY - 30, color: "#10B981" },
      "B": { x: centerX + 50, y: centerY - 30, color: "#3B82F6" },
      "C": { x: centerX, y: centerY + 50, color: "#F59E0B" },
    };

    const g = svg.append("g");

    // Draw circles
    Object.entries(positions).forEach(([key, pos]) => {
      g.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", radius)
        .attr("fill", pos.color)
        .attr("fill-opacity", 0.2)
        .attr("stroke", pos.color)
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y - radius - 10)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("fill", pos.color)
        .text(key);
    });

    // Visualize Premises
    premises.forEach((p, i) => {
      const sub = positions[p.subject];
      const pred = positions[p.predicate];
      if (!sub || !pred) return;

      const color = "#151619";
      const yOffset = 20 * i;

      if (p.type === "All") {
        // Shading area of Subject that is NOT in Predicate
        // For simplicity in this visual aid, we'll just draw an arrow or highlight the relationship
        g.append("path")
          .attr("d", d3.line()([[sub.x, sub.y], [pred.x, pred.y]]))
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4")
          .attr("marker-end", "url(#arrow)");
      } else if (p.type === "Some") {
        // Place an 'X' in the intersection
        const midX = (sub.x + pred.x) / 2;
        const midY = (sub.y + pred.y) / 2;
        g.append("text")
          .attr("x", midX)
          .attr("y", midY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "20px")
          .attr("font-weight", "bold")
          .text("X");
      }
    });

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#000");

  }, [premises]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Syllogism Visual Solver</h3>
          <p className="text-sm text-gray-400">Input premises to visualize the logical flow.</p>
        </div>
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
          <BrainCircuit size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {premises.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-black/5">
              <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
              <select 
                value={p.type}
                onChange={(e) => updatePremise(p.id, { type: e.target.value as PremiseType })}
                className="bg-white border border-black/5 rounded-lg px-2 py-1 text-sm font-bold"
              >
                <option value="All">All</option>
                <option value="No">No</option>
                <option value="Some">Some</option>
                <option value="SomeNot">Some Not</option>
              </select>
              <select 
                value={p.subject}
                onChange={(e) => updatePremise(p.id, { subject: e.target.value })}
                className="bg-white border border-black/5 rounded-lg px-2 py-1 text-sm font-bold"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <span className="text-sm text-gray-400">{p.type === "All" || p.type === "Some" ? "are" : p.type === "No" ? "is" : "are not"}</span>
              <select 
                value={p.predicate}
                onChange={(e) => updatePremise(p.id, { predicate: e.target.value })}
                className="bg-white border border-black/5 rounded-lg px-2 py-1 text-sm font-bold"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <button 
                onClick={() => removePremise(p.id)}
                className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button 
            onClick={addPremise}
            className="w-full h-12 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all font-bold text-sm"
          >
            <Plus size={16} /> Add Premise
          </button>
        </div>

        <div className="aspect-square bg-gray-50 rounded-3xl border border-black/5 flex items-center justify-center relative overflow-hidden">
          <svg ref={vizRef} width="400" height="400" className="max-w-full h-auto" />
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-black/5">
            Venn Diagram Logic
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
        <Info size={18} className="text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-700 leading-relaxed">
          <strong>How to read:</strong> Circles represent sets A, B, and C. 
          The 'X' represents existence (Some). 
          Arrows indicate containment (All). 
          Disjoint circles represent 'No' relationships.
        </p>
      </div>
    </div>
  );
}
