import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Info, BrainCircuit, Sparkles, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

type PremiseType = "All" | "No" | "Some" | "SomeNot";

interface Premise {
  id: string;
  type: PremiseType;
  subject: string;
  predicate: string;
}

// Region representation: 3 bits (A, B, C)
// 100 = A only, 110 = A and B, etc.
const REGIONS = [
  0b100, 0b010, 0b001, // A, B, C only
  0b110, 0b011, 0b101, // AB, BC, AC
  0b111 // ABC
];

export default function SyllogismSolver() {
  const [premises, setPremises] = useState<Premise[]>([
    { id: "1", type: "All", subject: "A", predicate: "B" },
    { id: "2", type: "All", subject: "B", predicate: "C" },
  ]);
  const [conclusion, setConclusion] = useState<{ subject: string; predicate: string; type: PremiseType }>({
    subject: "A",
    predicate: "C",
    type: "All"
  });
  
  const [isValid, setIsValid] = useState(false);
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

  // Logic Engine
  useEffect(() => {
    // 0 = unknown, 1 = empty (shaded), 2 = has element (X)
    const state: Record<number, number> = {};
    REGIONS.forEach(r => state[r] = 0);

    const getBit = (label: string) => {
      if (label === "A") return 0b100;
      if (label === "B") return 0b010;
      if (label === "C") return 0b001;
      return 0;
    };

    // Apply premises
    premises.forEach(p => {
      const sBit = getBit(p.subject);
      const pBit = getBit(p.predicate);
      if (!sBit || !pBit) return;

      if (p.type === "All") {
        // Subject AND NOT Predicate is empty
        REGIONS.forEach(r => {
          if ((r & sBit) && !(r & pBit)) state[r] = 1;
        });
      } else if (p.type === "No") {
        // Subject AND Predicate is empty
        REGIONS.forEach(r => {
          if ((r & sBit) && (r & pBit)) state[r] = 1;
        });
      } else if (p.type === "Some") {
        // Subject AND Predicate has at least one element
        const possible = REGIONS.filter(r => (r & sBit) && (r & pBit) && state[r] !== 1);
        if (possible.length === 1) {
          state[possible[0]] = 2;
        }
      } else if (p.type === "SomeNot") {
        // Subject AND NOT Predicate has at least one element
        const possible = REGIONS.filter(r => (r & sBit) && !(r & pBit) && state[r] !== 1);
        if (possible.length === 1) {
          state[possible[0]] = 2;
        }
      }
    });

    // Validate Conclusion
    const validate = () => {
      const sBit = getBit(conclusion.subject);
      const pBit = getBit(conclusion.predicate);
      if (!sBit || !pBit || sBit === pBit) return false;

      if (conclusion.type === "All") {
        // Check if all regions where Subject is true but Predicate is false are empty
        return REGIONS.every(r => !((r & sBit) && !(r & pBit)) || state[r] === 1);
      }
      if (conclusion.type === "No") {
        // Check if all regions where both are true are empty
        return REGIONS.every(r => !((r & sBit) && (r & pBit)) || state[r] === 1);
      }
      if (conclusion.type === "Some") {
        // Check if at least one region in intersection MUST have an element
        return REGIONS.some(r => (r & sBit) && (r & pBit) && state[r] === 2);
      }
      if (conclusion.type === "SomeNot") {
        return REGIONS.some(r => (r & sBit) && !(r & pBit) && state[r] === 2);
      }
      return false;
    };

    setIsValid(validate());

    // D3 Visualization
    if (!vizRef.current) return;
    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 80;

    // Circle centers
    const centers: Record<string, { x: number; y: number; color: string }> = {
      "A": { x: centerX - 45, y: centerY - 30, color: "#10B981" },
      "B": { x: centerX + 45, y: centerY - 30, color: "#3B82F6" },
      "C": { x: centerX, y: centerY + 45, color: "#F59E0B" },
    };

    // Draw circles
    Object.entries(centers).forEach(([key, pos]) => {
      svg.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", pos.color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.6);

      svg.append("text")
        .attr("x", pos.x + (key === "A" ? -radius : key === "B" ? radius : 0))
        .attr("y", pos.y + (key === "C" ? radius + 20 : -radius - 10))
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("fill", pos.color)
        .text(`Set ${key}`);
    });

    // Shading Logic
    const getRegionCenter = (b: number) => {
      if (b === 0b111) return { x: centerX, y: centerY - 5 };
      if (b === 0b110) return { x: centerX, y: centerY - 50 };
      if (b === 0b011) return { x: centerX + 40, y: centerY + 20 };
      if (b === 0b101) return { x: centerX - 40, y: centerY + 20 };
      if (b === 0b100) return { x: centerX - 90, y: centerY - 50 };
      if (b === 0b010) return { x: centerX + 90, y: centerY - 50 };
      if (b === 0b001) return { x: centerX, y: centerY + 90 };
      return { x: centerX, y: centerY };
    };

    REGIONS.forEach(r => {
      if (state[r] === 1) {
        const pos = getRegionCenter(r);
        svg.append("circle")
          .attr("cx", pos.x)
          .attr("cy", pos.y)
          .attr("r", r === 0b111 ? 15 : 25)
          .attr("fill", "#151619")
          .attr("opacity", 0.4)
          .attr("filter", "blur(8px)");
      }
      if (state[r] === 2) {
        const pos = getRegionCenter(r);
        svg.append("text")
          .attr("x", pos.x)
          .attr("y", pos.y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "24px")
          .attr("font-weight", "bold")
          .attr("fill", "#EF4444")
          .text("X");
      }
    });

    // Visualize "Some" with an X if ambiguous (on the line)
    premises.forEach(p => {
      if (p.type === "Some") {
        const sBit = getBit(p.subject);
        const pBit = getBit(p.predicate);
        const possible = REGIONS.filter(r => (r & sBit) && (r & pBit) && state[r] !== 1);
        if (possible.length > 1) {
          // Place X on the boundary between regions
          const pos1 = getRegionCenter(possible[0]);
          const pos2 = getRegionCenter(possible[1]);
          svg.append("text")
            .attr("x", (pos1.x + pos2.x) / 2)
            .attr("y", (pos1.y + pos2.y) / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("fill", "#EF4444")
            .attr("opacity", 0.7)
            .text("X");
        }
      }
    });

  }, [premises, conclusion]);

  return (
    <div className="bg-white rounded-[3rem] border border-black/5 shadow-2xl p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Interactive Tool
          </div>
          <h3 className="text-3xl font-bold tracking-tight">Syllogism Venn Diagram</h3>
          <p className="text-gray-500 max-w-md">Visualize logical premises using overlapping sets and verify valid deductions.</p>
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
            <div className={cn(
              "p-6 rounded-[2rem] border transition-all space-y-4",
              isValid ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
            )}>
              <div className="flex items-center gap-3">
                <select 
                  value={conclusion.type}
                  onChange={(e) => setConclusion({ ...conclusion, type: e.target.value as PremiseType })}
                  className="bg-white px-3 py-2 rounded-xl border border-gray-200 font-bold text-sm"
                >
                  <option value="All">All</option>
                  <option value="No">No</option>
                  <option value="Some">Some</option>
                  <option value="SomeNot">Some Not</option>
                </select>
                <select 
                  value={conclusion.subject}
                  onChange={(e) => setConclusion({ ...conclusion, subject: e.target.value })}
                  className="bg-white px-3 py-2 rounded-xl border border-gray-200 font-bold text-sm"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <span className="text-sm font-medium text-gray-500">are</span>
                <select 
                  value={conclusion.predicate}
                  onChange={(e) => setConclusion({ ...conclusion, predicate: e.target.value })}
                  className="bg-white px-3 py-2 rounded-xl border border-gray-200 font-bold text-sm"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 font-bold text-sm",
                isValid ? "text-emerald-600" : "text-red-600"
              )}>
                {isValid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>{isValid ? "This conclusion is logically valid." : "This conclusion is not necessarily true."}</span>
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
            <h5 className="font-bold text-sm">Venn Diagram Method</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              Shaded regions represent areas that are empty (contain no elements). 
              An 'X' represents a region that must contain at least one element.
            </p>
          </div>
        </div>
        <div className="p-6 bg-gray-50 rounded-3xl border border-black/5 flex gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-black/5 flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm">Deductive Reasoning</h5>
            <p className="text-xs text-gray-500 leading-relaxed">
              A conclusion is valid only if it is true in EVERY possible scenario that satisfies the premises.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
