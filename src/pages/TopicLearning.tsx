import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, ChevronRight, Lightbulb, Info, BrainCircuit, Sparkles, X, Maximize2, Minimize2 } from "lucide-react";
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
  const [isVisualMode, setIsVisualMode] = useState(false);
  const vizRef = useRef<SVGSVGElement>(null);
  const fullVizRef = useRef<SVGSVGElement>(null);

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
      .duration(1000)
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
      const duration = step === 1 ? 4000 : 2000; // Step 1 is slow, Step 2 is fast
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
      .duration(2000)
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

  // D3 Animation for Ratios
  useEffect(() => {
    if (!vizRef.current || !topic || topic.name !== "Ratios") return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;

    const ratioA = step === 0 ? 1 : step === 1 ? 2 : 3;
    const ratioB = step === 0 ? 1 : step === 1 ? 3 : 5;

    const total = ratioA + ratioB;
    const boxSize = 30;
    const gap = 5;

    // Group A
    const gA = svg.append("g").attr("transform", `translate(${centerX - 100}, ${centerY - 50})`);
    gA.append("text").attr("x", 0).attr("y", -20).attr("font-weight", "bold").text(`Quantity A (${ratioA})`);
    
    for (let i = 0; i < ratioA; i++) {
      gA.append("rect")
        .attr("x", 0)
        .attr("y", i * (boxSize + gap))
        .attr("width", boxSize)
        .attr("height", boxSize)
        .attr("rx", 4)
        .attr("fill", "#10B981")
        .attr("opacity", 0)
        .transition()
        .delay(i * 100)
        .attr("opacity", 1);
    }

    // Group B
    const gB = svg.append("g").attr("transform", `translate(${centerX + 40}, ${centerY - 50})`);
    gB.append("text").attr("x", 0).attr("y", -20).attr("font-weight", "bold").text(`Quantity B (${ratioB})`);

    for (let i = 0; i < ratioB; i++) {
      gB.append("rect")
        .attr("x", 0)
        .attr("y", i * (boxSize + gap))
        .attr("width", boxSize)
        .attr("height", boxSize)
        .attr("rx", 4)
        .attr("fill", "#3B82F6")
        .attr("opacity", 0)
        .transition()
        .delay(i * 100)
        .attr("opacity", 1);
    }

    // Comparison Text
    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY + 120)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", "#666")
      .text(`Ratio A : B = ${ratioA} : ${ratioB}`);

  }, [topic, step]);

  // D3 Animation for Profit and Loss
  useEffect(() => {
    if (!vizRef.current || !topic || topic.name !== "Profit and Loss") return;

    const svg = d3.select(vizRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;

    const cp = 100;
    const sp = step === 0 ? 100 : step === 1 ? 150 : 75;
    const isProfit = sp >= cp;
    const diff = Math.abs(sp - cp);

    // CP Bar
    svg.append("rect")
      .attr("x", centerX - 80)
      .attr("y", centerY + 50 - cp)
      .attr("width", 60)
      .attr("height", cp)
      .attr("fill", "#E5E7EB")
      .attr("rx", 8);
    
    svg.append("text")
      .attr("x", centerX - 50)
      .attr("y", centerY + 70)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Cost Price");

    // SP Bar
    const spBar = svg.append("rect")
      .attr("x", centerX + 20)
      .attr("y", centerY + 50)
      .attr("width", 60)
      .attr("height", 0)
      .attr("fill", isProfit ? "#10B981" : "#EF4444")
      .attr("rx", 8);

    spBar.transition()
      .duration(1000)
      .attr("y", centerY + 50 - sp)
      .attr("height", sp);

    svg.append("text")
      .attr("x", centerX + 50)
      .attr("y", centerY + 70)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Selling Price");

    // Indicator
    if (step > 0) {
      const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY - 80})`);
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", isProfit ? "#10B981" : "#EF4444")
        .text(isProfit ? `Profit: ₹${diff}` : `Loss: ₹${diff}`)
        .attr("opacity", 0)
        .transition()
        .delay(1000)
        .attr("opacity", 1);

      const arrow = g.append("path")
        .attr("d", isProfit ? "M-10 10 L0 0 L10 10" : "M-10 0 L0 10 L10 0")
        .attr("stroke", isProfit ? "#10B981" : "#EF4444")
        .attr("stroke-width", 4)
        .attr("fill", "none")
        .attr("transform", "translate(0, -40)")
        .attr("opacity", 0);

      arrow.transition()
        .delay(1200)
        .duration(500)
        .attr("opacity", 1)
        .attr("transform", isProfit ? "translate(0, -50)" : "translate(0, -30)");
    }

  }, [topic, step]);

  // D3 Animation for Syllogisms
  useEffect(() => {
    const renderViz = (ref: React.RefObject<SVGSVGElement | null>, w: number, h: number) => {
      if (!ref.current || !topic) return;

      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const width = w;
      const height = h;
      const centerX = width / 2;
      const centerY = height / 2;

      // PERCENTAGES
      if (topic.name === "Percentages") {
        const radius = Math.min(width, height) / 2 - 40;
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const data = [
          { label: "Part", value: step === 0 ? 0 : 25 },
          { label: "Whole", value: step === 0 ? 100 : 75 }
        ];
        const pie = d3.pie<any>().value(d => d.value).sort(null);
        const arc = d3.arc<any>().innerRadius(radius * 0.6).outerRadius(radius).cornerRadius(8);
        const path = g.selectAll("path").data(pie(data)).enter().append("path")
          .attr("fill", (d, i) => i === 0 ? "#10B981" : "#F3F4F6")
          .attr("d", arc)
          .each(function(d) { (this as any)._current = d; });
        path.data(pie(data)).transition().duration(1000).attrTween("d", function(d) {
          const interpolate = d3.interpolate((this as any)._current, d);
          (this as any)._current = interpolate(0);
          return (t) => arc(interpolate(t)) as string;
        });
        g.append("text").attr("text-anchor", "middle").attr("dy", ".35em").attr("font-size", "24px").attr("font-weight", "bold").text(step === 0 ? "0%" : "25%");
      }

      // SPEED AND DISTANCE
      if (topic.name === "Speed and Distance") {
        const roadY = centerY + 50;
        const roadStart = 50;
        const roadEnd = width - 50;
        const roadWidth = roadEnd - roadStart;
        svg.append("rect").attr("x", roadStart).attr("y", roadY).attr("width", roadWidth).attr("height", 8).attr("fill", "#333").attr("rx", 4);
        const car = svg.append("g").attr("transform", `translate(${roadStart}, ${roadY - 30})`);
        car.append("rect").attr("width", 50).attr("height", 25).attr("rx", 6).attr("fill", "#10B981");
        car.append("circle").attr("cx", 12).attr("cy", 25).attr("r", 6).attr("fill", "#000");
        car.append("circle").attr("cx", 38).attr("cy", 25).attr("r", 6).attr("fill", "#000");
        if (step > 0) {
          const duration = step === 1 ? 4000 : 2000;
          car.transition().duration(duration).ease(d3.easeLinear).attr("transform", `translate(${roadEnd - 50}, ${roadY - 30})`);
        }
      }

      // RATIOS
      if (topic.name === "Ratios") {
        const ratioA = step === 0 ? 1 : step === 1 ? 2 : 3;
        const ratioB = step === 0 ? 1 : step === 1 ? 3 : 5;
        const boxSize = 40;
        const gap = 10;
        const gA = svg.append("g").attr("transform", `translate(${centerX - 120}, ${centerY - 60})`);
        for (let i = 0; i < ratioA; i++) {
          gA.append("rect").attr("x", 0).attr("y", i * (boxSize + gap)).attr("width", boxSize).attr("height", boxSize).attr("rx", 8).attr("fill", "#10B981").attr("opacity", 0).transition().delay(i * 100).attr("opacity", 1);
        }
        const gB = svg.append("g").attr("transform", `translate(${centerX + 40}, ${centerY - 60})`);
        for (let i = 0; i < ratioB; i++) {
          gB.append("rect").attr("x", 0).attr("y", i * (boxSize + gap)).attr("width", boxSize).attr("height", boxSize).attr("rx", 8).attr("fill", "#3B82F6").attr("opacity", 0).transition().delay(i * 100).attr("opacity", 1);
        }
        svg.append("text").attr("x", centerX).attr("y", centerY + 140).attr("text-anchor", "middle").attr("font-size", "24px").attr("font-weight", "bold").attr("fill", "#333").text(`${ratioA} : ${ratioB}`);
      }

      // PROFIT AND LOSS
      if (topic.name === "Profit and Loss") {
        const cp = 120;
        const sp = step === 0 ? 120 : step === 1 ? 180 : 80;
        const isProfit = sp >= cp;
        svg.append("rect").attr("x", centerX - 100).attr("y", centerY + 80 - cp).attr("width", 80).attr("height", cp).attr("fill", "#E5E7EB").attr("rx", 12);
        const spBar = svg.append("rect").attr("x", centerX + 20).attr("y", centerY + 80).attr("width", 80).attr("height", 0).attr("fill", isProfit ? "#10B981" : "#EF4444").attr("rx", 12);
        spBar.transition().duration(1000).attr("y", centerY + 80 - sp).attr("height", sp);
        if (step > 0) {
          svg.append("text").attr("x", centerX).attr("y", centerY - 100).attr("text-anchor", "middle").attr("font-size", "28px").attr("font-weight", "bold").attr("fill", isProfit ? "#10B981" : "#EF4444").text(isProfit ? "PROFIT" : "LOSS").attr("opacity", 0).transition().delay(1000).attr("opacity", 1);
        }
      }

      // TIME AND WORK
      if (topic.name === "Time and Work") {
        const workRate = 10;
        const data = Array.from({ length: 11 }, (_, i) => ({ day: i, work: Math.min(100, i * workRate * (step + 1)) }));
        const x = d3.scaleLinear().domain([0, 10]).range([50, width - 50]);
        const y = d3.scaleLinear().domain([0, 100]).range([height - 50, 50]);
        const line = d3.line<any>().x(d => x(d.day)).y(d => y(d.work)).curve(d3.curveMonotoneX);
        const path = svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#10B981").attr("stroke-width", 4).attr("d", line);
        const totalLength = (path.node() as any).getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().duration(2000).attr("stroke-dashoffset", 0);
      }

      // SYLLOGISMS
      if (topic.name === "Syllogisms") {
        if (step === 0) {
          svg.append("circle").attr("cx", centerX - 70).attr("cy", centerY).attr("r", 60).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981").attr("stroke-width", 3);
          svg.append("circle").attr("cx", centerX + 70).attr("cy", centerY).attr("r", 60).attr("fill", "#3B82F6").attr("fill-opacity", 0.2).attr("stroke", "#3B82F6").attr("stroke-width", 3);
        } else if (step === 1) {
          svg.append("circle").attr("cx", centerX).attr("cy", centerY).attr("r", 100).attr("fill", "#3B82F6").attr("fill-opacity", 0.1).attr("stroke", "#3B82F6").attr("stroke-width", 3);
          svg.append("circle").attr("cx", centerX).attr("cy", centerY).attr("r", 0).attr("fill", "#10B981").attr("fill-opacity", 0.3).attr("stroke", "#10B981").attr("stroke-width", 3).transition().duration(1000).attr("r", 50);
        }
      }

      // PERMUTATION AND COMBINATION
      if (topic.name === "Permutation and Combination") {
        const items = ["A", "B", "C"];
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        if (step === 0) {
          // Arrangements
          items.forEach((item, i) => {
            g.append("text").attr("x", (i - 1) * 60).attr("y", 0).attr("text-anchor", "middle").attr("font-size", "40px").attr("font-weight", "bold").attr("fill", "#10B981").text(item)
              .transition().duration(1000).delay(i * 200).attr("x", (1 - i) * 60);
          });
        } else {
          // Selections
          items.forEach((item, i) => {
            const circle = g.append("circle").attr("cx", (i - 1) * 80).attr("cy", 0).attr("r", 30).attr("fill", "#E5E7EB").attr("stroke", "#D1D5DB");
            g.append("text").attr("x", (i - 1) * 80).attr("y", 10).attr("text-anchor", "middle").attr("font-size", "24px").text(item);
            if (i < 2) circle.transition().duration(1000).attr("fill", "#10B981").attr("stroke", "#059669");
          });
        }
      }

      // PROBABILITY
      if (topic.name === "Probability") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const coin = g.append("circle").attr("r", 60).attr("fill", "#F59E0B").attr("stroke", "#D97706").attr("stroke-width", 4);
        const text = g.append("text").attr("text-anchor", "middle").attr("dy", ".35em").attr("font-size", "40px").attr("font-weight", "bold").attr("fill", "white").text("H");
        if (step > 0) {
          coin.transition().duration(500).attr("transform", "scale(1, 0.1)").transition().duration(500).attr("transform", "scale(1, 1)")
            .on("start", () => {
              setTimeout(() => text.text(Math.random() > 0.5 ? "H" : "T"), 500);
            });
        }
      }

      // LOGARITHM
      if (topic.name === "Logarithm") {
        const x = d3.scaleLinear().domain([0.1, 10]).range([50, width - 50]);
        const y = d3.scaleLinear().domain([-2, 3]).range([height - 50, 50]);
        const line = d3.line<any>().x(d => x(d)).y(d => y(Math.log10(d)));
        const data = d3.range(0.1, 10.1, 0.1);
        svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#10B981").attr("stroke-width", 4).attr("d", line);
        svg.append("line").attr("x1", 50).attr("y1", y(0)).attr("x2", width - 50).attr("y2", y(0)).attr("stroke", "#000").attr("opacity", 0.2);
        svg.append("line").attr("x1", x(1)).attr("y1", 50).attr("x2", x(1)).attr("y2", height - 50).attr("stroke", "#000").attr("opacity", 0.2);
      }

      // CLOCK
      if (topic.name === "Clock") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("circle").attr("r", 100).attr("fill", "none").attr("stroke", "#333").attr("stroke-width", 4);
        for (let i = 0; i < 12; i++) {
          const angle = (i * 30) * Math.PI / 180;
          g.append("line").attr("x1", Math.sin(angle) * 85).attr("y1", -Math.cos(angle) * 85).attr("x2", Math.sin(angle) * 95).attr("y2", -Math.cos(angle) * 95).attr("stroke", "#333").attr("stroke-width", 2);
        }
        const hourHand = g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", -50).attr("stroke", "#333").attr("stroke-width", 6).attr("stroke-linecap", "round");
        const minuteHand = g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", -80).attr("stroke", "#10B981").attr("stroke-width", 4).attr("stroke-linecap", "round");
        if (step === 1) {
          hourHand.attr("transform", "rotate(150)"); // 5 o'clock
          minuteHand.attr("transform", "rotate(90)"); // 15 mins
        }
      }

      // CALENDAR
      if (topic.name === "Calendar") {
        const g = svg.append("g").attr("transform", `translate(${centerX - 100}, ${centerY - 100})`);
        g.append("rect").attr("width", 200).attr("height", 200).attr("fill", "white").attr("stroke", "#E5E7EB").attr("rx", 12);
        g.append("rect").attr("width", 200).attr("height", 40).attr("fill", "#EF4444").attr("rx", 12);
        g.append("text").attr("x", 100).attr("y", 28).attr("text-anchor", "middle").attr("fill", "white").attr("font-weight", "bold").text("AUGUST 1947");
        g.append("text").attr("x", 100).attr("y", 130).attr("text-anchor", "middle").attr("font-size", "60px").attr("font-weight", "bold").text("15");
        g.append("text").attr("x", 100).attr("y", 170).attr("text-anchor", "middle").attr("fill", "#666").text("FRIDAY");
      }

      // AREA
      if (topic.name === "Area") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        if (step === 0) {
          g.append("rect").attr("x", -80).attr("y", -50).attr("width", 160).attr("height", 100).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981").attr("stroke-width", 3);
          g.append("text").attr("x", 0).attr("y", 5).attr("text-anchor", "middle").text("Area = L × B");
        } else {
          g.append("circle").attr("r", 80).attr("fill", "#3B82F6").attr("fill-opacity", 0.2).attr("stroke", "#3B82F6").attr("stroke-width", 3);
          g.append("text").attr("x", 0).attr("y", 5).attr("text-anchor", "middle").text("Area = πr²");
        }
      }

      // VOLUME AND SURFACE AREA
      if (topic.name === "Volume and Surface Area") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        // Simple 3D cube representation
        g.append("rect").attr("x", -40).attr("y", -40).attr("width", 80).attr("height", 80).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981");
        g.append("path").attr("d", "M-40 -40 L-10 -70 L70 -70 L40 -40").attr("fill", "#10B981").attr("fill-opacity", 0.1).attr("stroke", "#10B981");
        g.append("path").attr("d", "M40 -40 L70 -70 L70 10 L40 40").attr("fill", "#10B981").attr("fill-opacity", 0.1).attr("stroke", "#10B981");
        g.append("text").attr("x", 0).attr("y", 100).attr("text-anchor", "middle").text("Volume = a³");
      }

      // RACES AND GAMES
      if (topic.name === "Races and Games") {
        const g = svg.append("g").attr("transform", `translate(50, ${centerY})`);
        const track = svg.append("line").attr("x1", 50).attr("y1", centerY + 20).attr("x2", width - 50).attr("y2", centerY + 20).attr("stroke", "#333").attr("stroke-width", 2);
        
        const runnerA = g.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 15).attr("fill", "#10B981");
        const runnerB = g.append("circle").attr("cx", 0).attr("cy", -40).attr("r", 15).attr("fill", "#3B82F6");
        
        if (step > 0) {
          runnerA.transition().duration(2000).attr("cx", width - 100);
          runnerB.transition().duration(2000).attr("cx", (width - 100) * 0.75);
        }
      }

      // STOCKS AND SHARES
      if (topic.name === "Stocks and Shares") {
        const x = d3.scaleLinear().domain([0, 10]).range([50, width - 50]);
        const y = d3.scaleLinear().domain([0, 100]).range([height - 50, 50]);
        const data = [10, 25, 20, 45, 40, 60, 55, 80, 75, 95, 90];
        const line = d3.line<any>().x((d, i) => x(i)).y(d => y(d));
        
        const path = svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#10B981").attr("stroke-width", 3).attr("d", line);
        const totalLength = (path.node() as any).getTotalLength();
        
        path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().duration(2000).attr("stroke-dashoffset", 0);
      }

      // SURDS AND INDICES
      if (topic.name === "Surds and Indices") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").attr("font-size", "40px").attr("font-weight", "bold").attr("fill", "#10B981").text("xᵃ × xᵇ = xᵃ⁺ᵇ");
        if (step > 0) {
          g.select("text").transition().duration(1000).attr("opacity", 0).transition().duration(1000).attr("opacity", 1).text("2³ × 2² = 2⁵ = 32");
        }
      }

      // HEIGHT AND DISTANCE
      if (topic.name === "Height and Distance") {
        const g = svg.append("g").attr("transform", `translate(50, ${height - 50})`);
        g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 300).attr("y2", 0).attr("stroke", "#333").attr("stroke-width", 2); // Ground
        g.append("line").attr("x1", 250).attr("y1", 0).attr("x2", 250).attr("y2", -150).attr("stroke", "#333").attr("stroke-width", 4); // Tower
        g.append("line").attr("x1", 50).attr("y1", 0).attr("x2", 250).attr("y2", -150).attr("stroke", "#10B981").attr("stroke-width", 2).attr("stroke-dasharray", "4,4"); // Line of sight
        g.append("path").attr("d", "M 80 0 A 30 30 0 0 0 70 -15").attr("fill", "none").attr("stroke", "#F59E0B").attr("stroke-width", 2);
        g.append("text").attr("x", 90).attr("y", -10).attr("font-size", "12px").text("θ");
      }

      // NUMBERS
      if (topic.name === "Numbers") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const numbers = [2, 3, 5, 7, 11, 13, 17];
        g.selectAll("text")
          .data(numbers)
          .enter()
          .append("text")
          .attr("x", (d, i) => (i - 3) * 50)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .attr("font-size", "24px")
          .attr("font-weight", "bold")
          .attr("fill", "#10B981")
          .text(d => d)
          .attr("opacity", 0)
          .transition()
          .delay((d, i) => i * 200)
          .attr("opacity", 1);
      }

      // TRUE DISCOUNT & BANKER'S DISCOUNT
      if (topic.name === "True Discount" || topic.name === "Banker’s Discount") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("rect").attr("x", -150).attr("y", -20).attr("width", 300).attr("height", 40).attr("fill", "#E5E7EB").attr("rx", 8);
        g.append("rect").attr("x", -150).attr("y", -20).attr("width", 0).attr("height", 40).attr("fill", "#10B981").attr("rx", 8)
          .transition().duration(2000).attr("width", 240);
        g.append("text").attr("x", 0).attr("y", 50).attr("text-anchor", "middle").text(topic.name === "True Discount" ? "Present Worth + Discount = Amount" : "Banker's Discount = SI on Face Value");
      }

      // ODD MAN OUT AND SERIES
      if (topic.name === "Odd Man Out and Series") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const series = [2, 4, 8, 16, 32, 65];
        g.selectAll("text")
          .data(series)
          .enter()
          .append("text")
          .attr("x", (d, i) => (i - 2.5) * 60)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .attr("font-size", "24px")
          .attr("font-weight", "bold")
          .attr("fill", (d, i) => i === 5 ? "#EF4444" : "#10B981")
          .text(d => d)
          .attr("opacity", 0)
          .transition()
          .delay((d, i) => i * 300)
          .attr("opacity", 1);
        
        if (step > 0) {
          g.append("text").attr("x", 150).attr("y", 50).attr("text-anchor", "middle").attr("fill", "#EF4444").attr("font-weight", "bold").text("Odd one!").attr("opacity", 0).transition().delay(2000).attr("opacity", 1);
        }
      }
    };

    renderViz(vizRef, 400, 300);
    if (isVisualMode) {
      renderViz(fullVizRef, 800, 600);
    }
  }, [topic, step, isVisualMode]);

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
      case "Ratios":
        return [
          {
            title: "Understanding Ratios",
            content: "A ratio is a way to compare two or more quantities of the same kind. It shows how many times one value contains another.",
            tip: "Ratios can be written as a:b or a/b."
          },
          {
            title: "Proportionality",
            content: "When two ratios are equal, they are said to be in proportion. For example, 2:3 is proportional to 4:6.",
            tip: "Think of ratios as 'parts' of a whole."
          },
          {
            title: "Scaling Quantities",
            content: "Ratios help us scale quantities up or down while maintaining the same relationship between parts.",
            tip: "Multiplying both sides by the same number keeps the ratio same."
          }
        ];
      case "Profit and Loss":
        return [
          {
            title: "Basic Terminology",
            content: "Cost Price (CP) is the price at which an article is purchased. Selling Price (SP) is the price at which it is sold.",
            tip: "Profit = SP - CP (if SP > CP)"
          },
          {
            title: "Calculating Profit",
            content: "When SP is greater than CP, there is a profit. The visual shows how the SP bar exceeds the CP bar.",
            tip: "Profit% = (Profit / CP) * 100"
          },
          {
            title: "Calculating Loss",
            content: "When CP is greater than SP, there is a loss. The visual shows the SP bar falling below the CP level.",
            tip: "Loss% = (Loss / CP) * 100"
          }
        ];
      case "Permutation and Combination":
        return [
          {
            title: "Permutations",
            content: "Permutation is an arrangement of objects in a specific order. The order matters here.",
            tip: "nPr = n! / (n-r)!"
          },
          {
            title: "Combinations",
            content: "Combination is a selection of objects where the order does not matter.",
            tip: "nCr = n! / [r!(n-r)!]"
          }
        ];
      case "Probability":
        return [
          {
            title: "Basic Probability",
            content: "Probability is the measure of the likelihood that an event will occur.",
            tip: "P(E) = Fav outcomes / Total outcomes"
          },
          {
            title: "Coin Flip",
            content: "A fair coin has two outcomes: Head or Tail. The probability of each is 1/2.",
            tip: "Total outcomes for n coins = 2^n"
          }
        ];
      case "Clock":
        return [
          {
            title: "Clock Angles",
            content: "The hour hand moves 30° per hour and 0.5° per minute. The minute hand moves 6° per minute.",
            tip: "Angle = |30h - 5.5m|"
          },
          {
            title: "Hands Coinciding",
            content: "The hands of a clock coincide 22 times in a day (24 hours).",
            tip: "They coincide once every 65 5/11 minutes."
          }
        ];
      case "Calendar":
        return [
          {
            title: "Odd Days",
            content: "Odd days are the number of days more than a complete week. A normal year has 1 odd day, a leap year has 2.",
            tip: "Odd days = Total days mod 7"
          },
          {
            title: "Leap Year",
            content: "A year divisible by 4 is a leap year, but century years must be divisible by 400.",
            tip: "2000 was a leap year, 1900 was not."
          }
        ];
      case "Logarithm":
        return [
          {
            title: "Definition",
            content: "Logarithm is the inverse of exponentiation. If aˣ = b, then logₐ b = x.",
            tip: "log₁₀ 100 = 2 because 10² = 100."
          },
          {
            title: "Rules of Log",
            content: "Key rules include: log(mn) = log m + log n, log(m/n) = log m - log n, and log(mⁿ) = n log m.",
            tip: "Log of 1 to any base is always 0."
          }
        ];
      case "Surds and Indices":
        return [
          {
            title: "Indices",
            content: "Indices (or powers) represent repeated multiplication. For example, 2³ = 2 × 2 × 2 = 8.",
            tip: "Any number to the power of 0 is 1."
          },
          {
            title: "Surds",
            content: "Surds are irrational numbers that are roots of rational numbers, like √2 or ∛5.",
            tip: "√a × √b = √(ab)"
          }
        ];
      case "Area":
        return [
          {
            title: "2D Shapes",
            content: "Area measures the size of a surface. For a rectangle, it's length × breadth.",
            tip: "Area is always measured in square units (cm², m²)."
          },
          {
            title: "Circles",
            content: "The area of a circle is calculated using the formula πr², where r is the radius.",
            tip: "π is approximately 22/7 or 3.14."
          }
        ];
      case "Volume and Surface Area":
        return [
          {
            title: "3D Space",
            content: "Volume measures the space occupied by a 3D object. For a cube, it's side³.",
            tip: "Volume is measured in cubic units (cm³, m³)."
          },
          {
            title: "Surface Area",
            content: "Surface area is the total area of all the faces of a 3D object.",
            tip: "For a cube, it's 6 × side²."
          }
        ];
      case "Height and Distance":
        return [
          {
            title: "Trigonometry",
            content: "Height and distance problems use trigonometric ratios like sin, cos, and tan to find unknown lengths.",
            tip: "tan θ = Opposite / Adjacent"
          },
          {
            title: "Elevation & Depression",
            content: "Angle of elevation is looking up, and angle of depression is looking down from a height.",
            tip: "The two angles are equal if the lines are parallel."
          }
        ];
      case "Numbers":
        return [
          {
            title: "Types of Numbers",
            content: "Numbers can be classified into Natural, Whole, Integers, Rational, and Irrational numbers.",
            tip: "Prime numbers have exactly two factors: 1 and itself."
          },
          {
            title: "Divisibility Rules",
            content: "Knowing divisibility rules (like for 2, 3, 5, 9) helps in quick calculations.",
            tip: "A number is divisible by 3 if the sum of its digits is divisible by 3."
          }
        ];
      case "Races and Games":
        return [
          {
            title: "Race Concepts",
            content: "In races, we compare the distance covered by different participants in the same time.",
            tip: "'A beats B by 10m' means when A finishes, B is 10m behind."
          },
          {
            title: "Dead Heat",
            content: "A dead heat occurs when two or more participants reach the finish line at the exact same time.",
            tip: "Relative speed is key in race problems."
          }
        ];
      case "Stocks and Shares":
        return [
          {
            title: "Market Value",
            content: "Face Value (FV) is the original value, and Market Value (MV) is the current trading price.",
            tip: "If MV > FV, the stock is at a premium."
          },
          {
            title: "Dividend",
            content: "Dividend is the profit shared by the company with its shareholders, usually expressed as a % of Face Value.",
            tip: "Dividend is always calculated on the Face Value."
          }
        ];
      case "True Discount":
        return [
          {
            title: "Present Worth",
            content: "Present Worth (PW) is the current value of a sum of money due at a future date.",
            tip: "True Discount = Amount - Present Worth"
          },
          {
            title: "Calculation",
            content: "True Discount is the simple interest on the Present Worth for the given time.",
            tip: "TD = (PW × R × T) / 100"
          }
        ];
      case "Banker’s Discount":
        return [
          {
            title: "Banker's View",
            content: "Banker's Discount (BD) is the simple interest on the Face Value of the bill for the unexpired time.",
            tip: "BD is always greater than True Discount."
          },
          {
            title: "Banker's Gain",
            content: "Banker's Gain (BG) is the difference between Banker's Discount and True Discount.",
            tip: "BG = BD - TD = SI on TD"
          }
        ];
      case "Odd Man Out and Series":
        return [
          {
            title: "Pattern Recognition",
            content: "Series problems require finding the logical rule that connects the numbers.",
            tip: "Check for differences, squares, cubes, or prime numbers."
          },
          {
            title: "Odd Man Out",
            content: "In these problems, one element in a group does not follow the rule followed by others.",
            tip: "Look for properties like even/odd, prime/composite, or multiples."
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
      default:
        return [
          {
            title: "Introduction",
            content: `Welcome to the ${topic.name} module. Let's explore the fundamental concepts.`,
            tip: "Take your time to understand the basics."
          },
          {
            title: "Key Formula",
            content: "Every aptitude topic has core formulas that simplify complex problems.",
            tip: "Memorize the basics to solve faster."
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
          <div className="aspect-square bg-white rounded-[3rem] border border-black/5 shadow-xl flex items-center justify-center overflow-hidden relative group">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
              <Play size={12} fill="currentColor" /> Live Simulation
            </div>
            
            <button 
              onClick={() => setIsVisualMode(true)}
              className="absolute top-8 right-8 p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <Maximize2 size={18} />
            </button>

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
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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

      {/* Full Screen Visual Mode */}
      <AnimatePresence>
        {isVisualMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="p-8 flex items-center justify-between border-b border-black/5">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{topic.name} Simulation</h2>
                <p className="text-sm text-gray-500">{steps[step].title}</p>
              </div>
              <button 
                onClick={() => setIsVisualMode(false)}
                className="p-4 bg-gray-100 rounded-2xl text-gray-900 hover:bg-gray-200 transition-all"
              >
                <Minimize2 size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-gray-50/50">
              <svg ref={fullVizRef} width="800" height="600" className="overflow-visible" />
            </div>

            <div className="p-12 bg-white border-t border-black/5">
              <div className="max-w-3xl mx-auto flex items-center gap-12">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                    Step {step + 1}
                  </div>
                  <h3 className="text-3xl font-bold">{steps[step].title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{steps[step].content}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="h-16 px-8 rounded-2xl border border-black/5 bg-white font-bold disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (step < steps.length - 1) setStep(step + 1);
                      else setIsVisualMode(false);
                    }}
                    className="h-16 px-8 rounded-2xl bg-emerald-500 text-black font-bold"
                  >
                    {step < steps.length - 1 ? "Next Step" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
