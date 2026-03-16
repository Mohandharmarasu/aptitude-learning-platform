import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, ChevronRight, Lightbulb, Info, BrainCircuit, Sparkles, X } from "lucide-react";
import * as d3 from "d3";
import { Topic } from "../types";
import { cn } from "../lib/utils";
import SyllogismSolver from "../components/SyllogismSolver";

export default function TopicLearning() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [step, setStep] = useState(0);
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);
  const vizRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch("/api/topics")
      .then(res => res.json())
      .then(data => {
        const t = data.find((x: any) => x.id === Number(topicId));
        setTopic(t);
      });
  }, [topicId]);

  // D3 Animation for Percentages (Example)
  useEffect(() => {
    if (!vizRef.current || !topic || topic.name !== "Percentages") return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const data = [
      { label: "Part", value: step === 0 ? 0 : 25 },
      { label: "Whole", value: step === 0 ? 100 : 75 }
    ];

    const pie = d3.pie<any>().value(d => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(0).outerRadius(radius);

    const path = g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", (d, i) => i === 0 ? "#10B981" : "#E5E7EB")
      .attr("d", arc)
      .each(function(d) { (this as any)._current = d; });

    // Transition
    path.data(pie(data))
      .transition()
      .duration(500)
      .attrTween("d", function(d) {
        const interpolate = d3.interpolate((this as any)._current, d);
        (this as any)._current = interpolate(0);
        return (t) => arc(interpolate(t)) as string;
      });

  }, [topic, step]);

  // D3 Animation for Speed and Distance
  useEffect(() => {
    if (!vizRef.current || !topic || topic.name !== "Speed and Distance") return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const roadY = 200;
    const roadStart = 50;
    const roadEnd = 350;
    const roadWidth = roadEnd - roadStart;

    // Road
    svg.append("rect")
      .attr("x", roadStart)
      .attr("y", roadY)
      .attr("width", roadWidth)
      .attr("height", 6)
      .attr("fill", "#333")
      .attr("rx", 3);

    // Distance Markers
    for (let i = 0; i <= 5; i++) {
      const x = roadStart + (i * roadWidth) / 5;
      svg.append("line")
        .attr("x1", x)
        .attr("y1", roadY + 10)
        .attr("x2", x)
        .attr("y2", roadY + 20)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);
      
      svg.append("text")
        .attr("x", x)
        .attr("y", roadY + 35)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#999")
        .text(`${i * 20}m`);
    }

    // Car Group
    const car = svg.append("g")
      .attr("transform", `translate(${roadStart}, ${roadY - 25})`);

    car.append("rect")
      .attr("width", 40)
      .attr("height", 20)
      .attr("rx", 4)
      .attr("fill", "#10B981");

    car.append("rect")
      .attr("x", 25)
      .attr("y", 2)
      .attr("width", 12)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", "#fff")
      .attr("opacity", 0.5);

    car.append("circle").attr("cx", 10).attr("cy", 20).attr("r", 5).attr("fill", "#000");
    car.append("circle").attr("cx", 30).attr("cy", 20).attr("r", 5).attr("fill", "#000");

    // Info Panel
    const info = svg.append("g").attr("transform", "translate(50, 50)");
    
    const timeText = info.append("text").attr("y", 20).attr("font-weight", "bold").attr("fill", "#666").text("Time: 0.0s");
    const distText = info.append("text").attr("y", 45).attr("font-weight", "bold").attr("fill", "#666").text("Distance: 0m");
    const speedText = info.append("text").attr("y", 70).attr("font-weight", "bold").attr("fill", "#10B981").text("Speed: 0 m/s");

    if (step > 0) {
      const duration = step === 1 ? 2000 : 1000; // Faster durations
      const speed = step === 1 ? 25 : 50; // m/s equivalent for demo
      
      speedText.text(`Speed: ${speed} m/s`);

      car.transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr("transform", `translate(${roadEnd - 40}, ${roadY - 25})`)
        .on("start", function() {
          const t = d3.timer((elapsed) => {
            const progress = Math.min(1, elapsed / duration);
            const currentTime = (progress * (duration / 1000)).toFixed(1);
            const currentDist = (progress * 100).toFixed(0);
            
            timeText.text(`Time: ${currentTime}s`);
            distText.text(`Distance: ${currentDist}m`);
            
            if (progress >= 1) t.stop();
          });
        });
    }
  }, [topic, step]);

  // D3 Animation for Time and Work
  useEffect(() => {
    if (!vizRef.current || !topic || topic.name !== "Time and Work") return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Data: Work done over time (10 days)
    const workRate = 10; // 10% per day
    const data = Array.from({ length: 11 }, (_, i) => ({
      day: i,
      work: Math.min(100, i * workRate * (step + 1)) // Increase speed with steps for demo
    }));

    const x = d3.scaleLinear().domain([0, 10]).range([0, chartWidth]);
    const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 40)
      .attr("fill", "#999")
      .attr("text-anchor", "middle")
      .text("Time (Days)");

    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -chartHeight / 2)
      .attr("fill", "#999")
      .attr("text-anchor", "middle")
      .text("Work Done (%)");

    // Line
    const line = d3.line<any>()
      .x(d => x(d.day))
      .y(d => y(d.work))
      .curve(d3.curveMonotoneX);

    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10B981")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animation
    const totalLength = (path.node() as any).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(800)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Points
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.day))
      .attr("cy", d => y(d.work))
      .attr("r", 4)
      .attr("fill", "#10B981")
      .attr("opacity", 0)
      .transition()
      .delay((d, i) => i * 200)
      .attr("opacity", 1);

  }, [topic, step]);

  // D3 Animation for Syllogisms
  useEffect(() => {
    if (!vizRef.current || !topic || topic.name !== "Syllogisms") return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;

    if (step === 0) {
      // Show two separate circles
      svg.append("circle")
        .attr("cx", centerX - 60)
        .attr("cy", centerY)
        .attr("r", 50)
        .attr("fill", "#10B981")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "#10B981")
        .attr("stroke-width", 2);

      svg.append("circle")
        .attr("cx", centerX + 60)
        .attr("cy", centerY)
        .attr("r", 50)
        .attr("fill", "#3B82F6")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", 2);

      svg.append("text").attr("x", centerX - 60).attr("y", centerY + 70).attr("text-anchor", "middle").text("Set A");
      svg.append("text").attr("x", centerX + 60).attr("y", centerY + 70).attr("text-anchor", "middle").text("Set B");
    } else if (step === 1) {
      // Show "All A are B" (A inside B)
      const b = svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 80)
        .attr("fill", "#3B82F6")
        .attr("fill-opacity", 0.1)
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", 2);

      const a = svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 0)
        .attr("fill", "#10B981")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "#10B981")
        .attr("stroke-width", 2);

      a.transition()
        .duration(500)
        .attr("r", 40);

      svg.append("text").attr("x", centerX).attr("y", centerY + 100).attr("text-anchor", "middle").text("All A are B");
    } else {
      // Step 2: Interactive Solver is shown below, so just show a placeholder or summary
      svg.append("text")
        .attr("x", centerX)
        .attr("y", centerY)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#999")
        .text("Interactive Solver Active Below ↓");
    }
  }, [topic, step]);

  // D3 Animation for Average
  useEffect(() => {
    if (!vizRef.current || !topic || topic.name !== "Average") return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const bars = [10, 30, 50, 20, 40];
    const avg = bars.reduce((a, b) => a + b, 0) / bars.length;

    const x = d3.scaleBand().domain(bars.map((_, i) => i.toString())).range([50, 350]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 60]).range([250, 50]);

    svg.selectAll("rect")
      .data(bars)
      .enter()
      .append("rect")
      .attr("x", (_, i) => x(i.toString())!)
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => 250 - y(d))
      .attr("fill", "#E5E7EB")
      .attr("rx", 4);

    if (step > 0) {
      svg.append("line")
        .attr("x1", 40)
        .attr("y1", y(avg))
        .attr("x2", 360)
        .attr("y2", y(avg))
        .attr("stroke", "#10B981")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

      svg.append("text")
        .attr("x", 365)
        .attr("y", y(avg))
        .attr("dominant-baseline", "middle")
        .attr("fill", "#10B981")
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text(`Avg: ${avg}`);
    }
  }, [topic, step]);

  // D3 Animation for Interest
  useEffect(() => {
    if (!vizRef.current || !topic || !["Simple Interest", "Compound Interest"].includes(topic.name)) return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const isCompound = topic.name === "Compound Interest";
    
    const data = Array.from({ length: 11 }, (_, i) => {
      const p = 100;
      const r = 0.1;
      const t = i;
      return {
        year: t,
        value: isCompound ? p * Math.pow(1 + r, t) : p + (p * r * t)
      };
    });

    const x = d3.scaleLinear().domain([0, 10]).range([60, 340]);
    const y = d3.scaleLinear().domain([0, 300]).range([240, 60]);

    const g = svg.append("g");

    // Axes
    g.append("g").attr("transform", "translate(0, 240)").call(d3.axisBottom(x).ticks(5));
    g.append("g").attr("transform", "translate(60, 0)").call(d3.axisLeft(y).ticks(5));

    const line = d3.line<any>()
      .x(d => x(d.year))
      .y(d => y(d.value))
      .curve(isCompound ? d3.curveBasis : d3.curveLinear);

    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10B981")
      .attr("stroke-width", 3)
      .attr("d", line);

    const totalLength = (path.node() as any).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0);

  }, [topic, step]);

  const getSteps = () => {
    if (!topic) return [];
    
    switch(topic.name) {
      case "Percentages":
        return [
          {
            title: "The Core Concept",
            content: "A percentage is a number or ratio expressed as a fraction of 100. It is often denoted using the percent sign, '%'.",
            tip: "Think of it as 'per cent' - for every hundred."
          },
          {
            title: "Visualizing 25%",
            content: "When we say 25%, we mean 25 parts out of 100 equal parts. Look at the chart to see how much of the whole it takes up.",
            tip: "25% is the same as 1/4th of the whole."
          },
          {
            title: "Practical Application",
            content: "If a shirt costs $100 and has a 25% discount, you save $25. The new price is $75.",
            tip: "Always identify the 'Whole' (100%) first."
          }
        ];
      case "Time and Work":
        return [
          {
            title: "Work Rate",
            content: "Work rate is the amount of work done in a unit of time. If a person can finish a job in 10 days, their rate is 1/10 of the job per day.",
            tip: "Rate = Total Work / Total Time"
          },
          {
            title: "Linear Progress",
            content: "With a constant number of workers, the work done increases linearly over time. See how the line goes up steadily.",
            tip: "Work Done = Rate × Time"
          },
          {
            title: "Efficiency",
            content: "Higher efficiency means more work done in less time. If we double the workers, the slope of the line becomes steeper.",
            tip: "More workers = Higher Rate = Less Time"
          }
        ];
      case "Speed and Distance":
        return [
          {
            title: "Speed Concept",
            content: "Speed is the rate at which an object covers distance. It is the ratio of distance to time.",
            tip: "Speed = Distance / Time"
          },
          {
            title: "Relative Motion",
            content: "When two objects move, their relative speed depends on their directions. This simulation shows a single object moving at constant speed.",
            tip: "Distance = Speed × Time"
          },
          {
            title: "Units of Speed",
            content: "Common units are km/h or m/s. Always ensure units are consistent before calculating.",
            tip: "1 km/h = 5/18 m/s"
          }
        ];
      case "Syllogisms":
        return [
          {
            title: "Logical Foundations",
            content: "Syllogisms are logical arguments that apply deductive reasoning to arrive at a conclusion based on two or more propositions that are asserted or assumed to be true.",
            tip: "Focus on the relationship between sets."
          },
          {
            title: "Types of Statements",
            content: "There are four standard types: Universal Affirmative (All A are B), Universal Negative (No A are B), Particular Affirmative (Some A are B), and Particular Negative (Some A are not B).",
            tip: "Venn diagrams are the best way to visualize these."
          },
          {
            title: "Interactive Solver",
            content: "Use the tool below to input your own premises and see how they interact visually. This helps in identifying valid conclusions.",
            tip: "Try combining 'All' and 'Some' statements."
          }
        ];
      case "Average":
        return [
          {
            title: "Central Tendency",
            content: "An average is a single value that represents the middle or center of a set of data. It is calculated by dividing the sum of all values by the number of values.",
            tip: "Average = Sum / Count"
          },
          {
            title: "Equal Distribution",
            content: "Think of an average as distributing the total sum equally among all members of the group.",
            tip: "If the average of 5 numbers is 10, their sum is 50."
          }
        ];
      case "Simple Interest":
        return [
          {
            title: "Basic Interest",
            content: "Simple Interest is calculated only on the principal amount of a loan or investment.",
            tip: "SI = (P × R × T) / 100"
          },
          {
            title: "Linear Growth",
            content: "Simple interest grows linearly over time because the interest earned each period is constant.",
            tip: "Interest is the same every year."
          }
        ];
      case "Compound Interest":
        return [
          {
            title: "Interest on Interest",
            content: "Compound Interest is calculated on the principal amount and also on the accumulated interest of previous periods.",
            tip: "A = P(1 + R/100)^T"
          },
          {
            title: "Exponential Growth",
            content: "Compound interest grows exponentially, making it much more powerful than simple interest over long periods.",
            tip: "The 'Magic' of compounding!"
          }
        ];
      default:
        return [
          {
            title: "Introduction",
            content: `Welcome to the ${topic.name} module. Let's explore the fundamental concepts.`,
            tip: "Take your time to understand the basics."
          }
        ];
    }
  };

  const steps = getSteps();

  if (!topic || steps.length === 0) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft size={16} /> Back to Topics
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Visualization */}
        <div className="space-y-6">
          <div className="aspect-square bg-white rounded-[3rem] border border-black/5 shadow-xl flex items-center justify-center overflow-hidden relative">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
              <Play size={12} fill="currentColor" /> Live Simulation
            </div>
            <svg ref={vizRef} width="400" height="300" className="overflow-visible" />
            
            <div className="absolute bottom-8 left-8 right-8 flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === step ? "w-8 bg-emerald-500" : "w-2 bg-gray-200"
                  )} 
                />
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
              <Lightbulb size={20} />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900">Pro Tip</h4>
              <p className="text-sm text-emerald-700">{steps[step].tip}</p>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="space-y-8 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Step {step + 1} of {steps.length}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{steps[step].title}</h1>
            <AnimatePresence>
              <motion.p
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-lg text-gray-600 leading-relaxed"
              >
                {steps[step].content}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="h-14 px-6 rounded-2xl border border-black/5 bg-white font-bold disabled:opacity-30 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (step < steps.length - 1) setStep(step + 1);
                else setShowQuizPrompt(true);
              }}
              className="h-14 flex-1 rounded-2xl bg-[#151619] text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-black transition-all"
            >
              {step < steps.length - 1 ? "Next Step" : "Complete Module"} <ChevronRight size={20} />
            </button>
          </div>

          <div className="pt-8 border-t border-black/5">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <BrainCircuit size={18} className="text-emerald-500" />
              <span>AI is tracking your understanding of this concept.</span>
            </div>
          </div>
        </div>
      </div>

      {topic.name === "Syllogisms" && step === steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12"
        >
          <SyllogismSolver />
        </motion.div>
      )}

      {/* Quiz Prompt Modal */}
      <AnimatePresence>
        {showQuizPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden relative"
            >
              <button 
                onClick={() => setShowQuizPrompt(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X size={20} />
              </button>

              <div className="p-10 text-center space-y-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
                  <Sparkles size={40} />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">Module Complete!</h2>
                  <p className="text-gray-500 leading-relaxed">
                    You've mastered the core concepts of <span className="font-bold text-gray-900">{topic.name}</span>. 
                    Ready to test your knowledge?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => navigate(`/practice/${topicId}`)}
                    className="h-16 rounded-2xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200"
                  >
                    Take a Quick Quiz <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => setShowQuizPrompt(false)}
                    className="h-16 rounded-2xl border border-black/5 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-all"
                  >
                    Review Concepts
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  Completing the quiz will earn you <span className="text-emerald-500 font-bold">+50 XP</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
