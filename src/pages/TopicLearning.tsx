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

  // D3 Animation for Syllogism
  useEffect(() => {
    const renderViz = (ref: React.RefObject<SVGSVGElement | null>, w: number, h: number) => {
      if (!ref.current || !topic) return;

      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const width = w;
      const height = h;
      const centerX = width / 2;
      const centerY = height / 2;

      // PERCENTAGE
      if (topic.name === "Percentage") {
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

      // TIME AND DISTANCE
      if (topic.name === "Time and Distance") {
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

      // RATIO AND PROPORTION
      if (topic.name === "Ratio and Proportion") {
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

      // SYLLOGISM
      if (topic.name === "Syllogism") {
        if (step === 0) {
          svg.append("circle").attr("cx", centerX - 70).attr("cy", centerY).attr("r", 60).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981").attr("stroke-width", 3);
          svg.append("circle").attr("cx", centerX + 70).attr("cy", centerY).attr("r", 60).attr("fill", "#3B82F6").attr("fill-opacity", 0.2).attr("stroke", "#3B82F6").attr("stroke-width", 3);
        } else if (step === 1) {
          svg.append("circle").attr("cx", centerX).attr("cy", centerY).attr("r", 100).attr("fill", "#3B82F6").attr("fill-opacity", 0.1).attr("stroke", "#3B82F6").attr("stroke-width", 3);
          svg.append("circle").attr("cx", centerX).attr("cy", centerY).attr("r", 0).attr("fill", "#10B981").attr("fill-opacity", 0.3).attr("stroke", "#10B981").attr("stroke-width", 3).transition().duration(1000).attr("r", 50);
        }
      }

      // LOGICAL SEQUENCE OF WORDS
      if (topic.name === "Logical Sequence of Words") {
        const words = ["Seed", "Plant", "Tree", "Wood", "Table"];
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        words.forEach((word, i) => {
          g.append("text")
            .attr("x", (i - 2) * 80)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#10B981")
            .text(word)
            .attr("opacity", 0)
            .transition()
            .delay(i * 500)
            .attr("opacity", 1);
          
          if (i < words.length - 1) {
            g.append("line")
              .attr("x1", (i - 2) * 80 + 20)
              .attr("y1", -5)
              .attr("x2", (i - 1) * 80 - 20)
              .attr("y2", -5)
              .attr("stroke", "#333")
              .attr("stroke-width", 2)
              .attr("marker-end", "url(#arrowhead)")
              .attr("opacity", 0)
              .transition()
              .delay(i * 500 + 250)
              .attr("opacity", 1);
          }
        });
      }

      // BLOOD RELATION TEST
      if (topic.name === "Blood Relation Test") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        // Family Tree
        g.append("circle").attr("cx", 0).attr("cy", -60).attr("r", 25).attr("fill", "#3B82F6").attr("fill-opacity", 0.2).attr("stroke", "#3B82F6");
        g.append("text").attr("x", 0).attr("y", -55).attr("text-anchor", "middle").attr("font-size", "10px").text("Father");
        
        g.append("line").attr("x1", 0).attr("y1", -35).attr("x2", 0).attr("y2", 15).attr("stroke", "#333");
        
        g.append("circle").attr("cx", 0).attr("cy", 40).attr("r", 25).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981");
        g.append("text").attr("x", 0).attr("y", 45).attr("text-anchor", "middle").attr("font-size", "10px").text("Son");
      }

      // SERIES COMPLETION
      if (topic.name === "Series Completion") {
        const series = [2, 4, 8, 16, 32, "?"];
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        series.forEach((num, i) => {
          g.append("text")
            .attr("x", (i - 2.5) * 60)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("fill", i === 5 ? "#EF4444" : "#10B981")
            .text(num)
            .attr("opacity", 0)
            .transition()
            .delay(i * 400)
            .attr("opacity", 1);
        });
      }

      // CAUSE AND EFFECT
      if (topic.name === "Cause and Effect") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("rect").attr("x", -150).attr("y", -30).attr("width", 100).attr("height", 60).attr("rx", 8).attr("fill", "#3B82F6").attr("fill-opacity", 0.2).attr("stroke", "#3B82F6");
        g.append("text").attr("x", -100).attr("y", 5).attr("text-anchor", "middle").text("Cause");
        
        g.append("line").attr("x1", -50).attr("y1", 0).attr("x2", 50).attr("y2", 0).attr("stroke", "#333").attr("stroke-width", 3).attr("marker-end", "url(#arrowhead)");
        
        g.append("rect").attr("x", 50).attr("y", -30).attr("width", 100).attr("height", 60).attr("rx", 8).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981");
        g.append("text").attr("x", 100).attr("y", 5).attr("text-anchor", "middle").text("Effect");
      }

      // DICE
      if (topic.name === "Dice") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        // 3D-ish Cube
        g.append("rect").attr("x", -40).attr("y", -40).attr("width", 80).attr("height", 80).attr("fill", "white").attr("stroke", "#333").attr("stroke-width", 2);
        g.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 5).attr("fill", "#000"); // 1 dot
        
        const top = g.append("path").attr("d", "M -40 -40 L -10 -70 L 70 -70 L 40 -40 Z").attr("fill", "#F3F4F6").attr("stroke", "#333");
        const side = g.append("path").attr("d", "M 40 -40 L 70 -70 L 70 10 L 40 40 Z").attr("fill", "#E5E7EB").attr("stroke", "#333");
        
        if (step > 0) {
          g.transition().duration(1000).attr("transform", `translate(${centerX}, ${centerY}) rotate(90)`);
        }
      }

      // VENN DIAGRAMS
      if (topic.name === "Venn Diagrams") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("circle").attr("cx", -40).attr("cy", 0).attr("r", 60).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981");
        g.append("circle").attr("cx", 40).attr("cy", 0).attr("r", 60).attr("fill", "#3B82F6").attr("fill-opacity", 0.2).attr("stroke", "#3B82F6");
        g.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "middle").attr("font-weight", "bold").text("Intersection");
      }

      // CUBE AND CUBOID
      if (topic.name === "Cube and Cuboid") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        // Grid of cubes
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            g.append("rect")
              .attr("x", (i - 1.5) * 30)
              .attr("y", (j - 1.5) * 30)
              .attr("width", 28)
              .attr("height", 28)
              .attr("fill", "#10B981")
              .attr("fill-opacity", 0.3)
              .attr("stroke", "#059669");
          }
        }
      }

      // ANALOGY
      if (topic.name === "Analogy") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("x", -100).attr("y", 0).attr("text-anchor", "middle").attr("font-size", "24px").text("A : B");
        g.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "middle").attr("font-size", "24px").text("::");
        g.append("text").attr("x", 100).attr("y", 0).attr("text-anchor", "middle").attr("font-size", "24px").text("C : ?");
        if (step > 0) {
          g.append("text").attr("x", 100).attr("y", 40).attr("text-anchor", "middle").attr("fill", "#10B981").attr("font-weight", "bold").text("Find D");
        }
      }

      // SEATING ARRANGEMENT
      if (topic.name === "Seating Arrangement") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("circle").attr("r", 80).attr("fill", "none").attr("stroke", "#333").attr("stroke-dasharray", "4,4");
        const seats = ["A", "B", "C", "D", "E", "F"];
        seats.forEach((s, i) => {
          const angle = (i * 60) * Math.PI / 180;
          g.append("circle").attr("cx", Math.sin(angle) * 80).attr("cy", -Math.cos(angle) * 80).attr("r", 15).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981");
          g.append("text").attr("x", Math.sin(angle) * 80).attr("y", -Math.cos(angle) * 80 + 5).attr("text-anchor", "middle").attr("font-size", "12px").text(s);
        });
      }

      // CHARACTER PUZZLES
      if (topic.name === "Character Puzzles") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("rect").attr("x", -60).attr("y", -60).attr("width", 120).attr("height", 120).attr("fill", "none").attr("stroke", "#333");
        g.append("line").attr("x1", 0).attr("y1", -60).attr("x2", 0).attr("y2", 60).attr("stroke", "#333");
        g.append("line").attr("x1", -60).attr("y1", 0).attr("x2", 60).attr("y2", 0).attr("stroke", "#333");
        const nums = [4, 9, 16, "?"];
        nums.forEach((n, i) => {
          const x = (i % 2 === 0 ? -30 : 30);
          const y = (i < 2 ? -30 : 30);
          g.append("text").attr("x", x).attr("y", y + 10).attr("text-anchor", "middle").attr("font-size", "24px").attr("font-weight", "bold").attr("fill", i === 3 ? "#EF4444" : "#10B981").text(n);
        });
      }

      // DIRECTION SENSE TEST
      if (topic.name === "Direction Sense Test") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        // Compass
        g.append("line").attr("x1", -50).attr("y1", 0).attr("x2", 50).attr("y2", 0).attr("stroke", "#333");
        g.append("line").attr("x1", 0).attr("y1", -50).attr("x2", 0).attr("y2", 50).attr("stroke", "#333");
        g.append("text").attr("x", 0).attr("y", -60).attr("text-anchor", "middle").text("N");
        g.append("text").attr("x", 0).attr("y", 70).attr("text-anchor", "middle").text("S");
        g.append("text").attr("x", 65).attr("y", 5).attr("text-anchor", "middle").text("E");
        g.append("text").attr("x", -65).attr("y", 5).attr("text-anchor", "middle").text("W");
        
        if (step > 0) {
          const path = g.append("path").attr("d", "M 0 0 L 0 -40 L 40 -40").attr("fill", "none").attr("stroke", "#10B981").attr("stroke-width", 3);
          const totalLength = (path.node() as any).getTotalLength();
          path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().duration(1000).attr("stroke-dashoffset", 0);
        }
      }

      // CLASSIFICATION
      if (topic.name === "Classification") {
        const items = ["Apple", "Banana", "Orange", "Carrot"];
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        items.forEach((item, i) => {
          g.append("rect").attr("x", (i - 2) * 80).attr("y", -20).attr("width", 70).attr("height", 40).attr("rx", 8).attr("fill", i === 3 ? "#EF4444" : "#10B981").attr("fill-opacity", 0.2).attr("stroke", i === 3 ? "#EF4444" : "#10B981");
          g.append("text").attr("x", (i - 2) * 80 + 35).attr("y", 5).attr("text-anchor", "middle").attr("font-size", "12px").text(item);
        });
      }

      // DATA SUFFICIENCY
      if (topic.name === "Data Sufficiency") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("y", -40).attr("text-anchor", "middle").attr("font-weight", "bold").text("Question?");
        g.append("rect").attr("x", -120).attr("y", -10).attr("width", 100).attr("height", 40).attr("rx", 4).attr("fill", "#E5E7EB");
        g.append("text").attr("x", -70).attr("y", 15).attr("text-anchor", "middle").text("Stat 1");
        g.append("rect").attr("x", 20).attr("y", -10).attr("width", 100).attr("height", 40).attr("rx", 4).attr("fill", "#E5E7EB");
        g.append("text").attr("x", 70).attr("y", 15).attr("text-anchor", "middle").text("Stat 2");
      }

      // ARITHMETIC REASONING
      if (topic.name === "Arithmetic Reasoning") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").attr("font-size", "32px").attr("font-weight", "bold").attr("fill", "#10B981").text("Logic + Math");
        if (step > 0) {
          g.append("text").attr("y", 50).attr("text-anchor", "middle").text("Word Problems");
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

      // PROBLEMS ON NUMBERS
      if (topic.name === "Problems on Numbers") {
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

      // SIMPLE INTEREST
      if (topic.name === "Simple Interest") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const principal = 100;
        const interest = step === 0 ? 0 : step === 1 ? 20 : 40;
        
        g.append("rect").attr("x", -50).attr("y", 50 - principal).attr("width", 40).attr("height", principal).attr("fill", "#E5E7EB").attr("rx", 4);
        g.append("text").attr("x", -30).attr("y", 70).attr("text-anchor", "middle").attr("font-size", "10px").text("Principal");
        
        const intBar = g.append("rect").attr("x", 10).attr("y", 50).attr("width", 40).attr("height", 0).attr("fill", "#10B981").attr("rx", 4);
        intBar.transition().duration(1000).attr("y", 50 - interest).attr("height", interest);
        g.append("text").attr("x", 30).attr("y", 70).attr("text-anchor", "middle").attr("font-size", "10px").text("Interest");
      }

      // COMPOUND INTEREST
      if (topic.name === "Compound Interest") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const data = step === 0 ? [100] : step === 1 ? [100, 110] : [100, 110, 121];
        
        g.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", (d, i) => (i - 1) * 60)
          .attr("y", d => 50 - d)
          .attr("width", 40)
          .attr("height", d => d)
          .attr("fill", (d, i) => i === 0 ? "#E5E7EB" : "#10B981")
          .attr("rx", 4)
          .attr("opacity", 0)
          .transition()
          .delay((d, i) => i * 300)
          .attr("opacity", 1);
        
        g.selectAll(".label")
          .data(data)
          .enter()
          .append("text")
          .attr("x", (d, i) => (i - 1) * 60 + 20)
          .attr("y", 70)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .text((d, i) => `Yr ${i}`);
      }

      // PARTNERSHIP
      if (topic.name === "Partnership") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const shares = [40, 60];
        const pie = d3.pie<any>().sort(null);
        const arc = d3.arc<any>().innerRadius(0).outerRadius(80);
        
        g.selectAll("path")
          .data(pie(shares))
          .enter()
          .append("path")
          .attr("fill", (d, i) => i === 0 ? "#10B981" : "#3B82F6")
          .attr("d", arc)
          .attr("opacity", 0)
          .transition()
          .duration(1000)
          .attr("opacity", 1);
        
        g.append("text").attr("x", -100).attr("y", -100).attr("fill", "#10B981").attr("font-weight", "bold").text("Partner A");
        g.append("text").attr("x", 40).attr("y", -100).attr("fill", "#3B82F6").attr("font-weight", "bold").text("Partner B");
      }

      // AVERAGE
      if (topic.name === "Average") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const values = [30, 70, 50, 90, 10];
        const avg = d3.mean(values) || 0;
        
        g.selectAll("rect")
          .data(values)
          .enter()
          .append("rect")
          .attr("x", (d, i) => (i - 2) * 50)
          .attr("y", d => 50 - d)
          .attr("width", 30)
          .attr("height", d => d)
          .attr("fill", "#E5E7EB")
          .attr("rx", 4);
        
        if (step > 0) {
          g.append("line")
            .attr("x1", -120)
            .attr("y1", 50 - avg)
            .attr("x2", 120)
            .attr("y2", 50 - avg)
            .attr("stroke", "#10B981")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "4,4")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1);
          
          g.append("text")
            .attr("x", 0)
            .attr("y", 50 - avg - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#10B981")
            .attr("font-weight", "bold")
            .text(`Average: ${avg}`);
        }
      }

      // PROBLEMS ON AGES
      if (topic.name === "Problems on Ages") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const ageA = 20 + (step * 5);
        const ageB = 30 + (step * 5);
        
        g.append("circle").attr("cx", -60).attr("cy", 0).attr("r", ageA).attr("fill", "#10B981").attr("fill-opacity", 0.3);
        g.append("text").attr("x", -60).attr("y", 5).attr("text-anchor", "middle").text(`A: ${ageA}`);
        
        g.append("circle").attr("cx", 60).attr("cy", 0).attr("r", ageB).attr("fill", "#3B82F6").attr("fill-opacity", 0.3);
        g.append("text").attr("x", 60).attr("y", 5).attr("text-anchor", "middle").text(`B: ${ageB}`);
        
        g.append("text").attr("x", 0).attr("y", 80).attr("text-anchor", "middle").attr("font-weight", "bold").text(step === 0 ? "Present Ages" : `After ${step * 5} Years`);
      }

      // PIPES AND CISTERN
      if (topic.name === "Pipes and Cistern") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("rect").attr("x", -60).attr("y", -60).attr("width", 120).attr("height", 120).attr("fill", "none").attr("stroke", "#333").attr("stroke-width", 2);
        
        const water = g.append("rect").attr("x", -60).attr("y", 60).attr("width", 120).attr("height", 0).attr("fill", "#3B82F6").attr("fill-opacity", 0.5);
        
        if (step > 0) {
          water.transition().duration(2000).attr("y", 60 - (step * 40)).attr("height", step * 40);
          g.append("path").attr("d", "M -80 -40 L -60 -40").attr("stroke", "#3B82F6").attr("stroke-width", 8).attr("stroke-linecap", "round");
        }
      }

      // PROBLEMS ON TRAINS
      if (topic.name === "Problems on Trains") {
        const g = svg.append("g").attr("transform", `translate(0, ${centerY})`);
        g.append("line").attr("x1", 0).attr("y1", 20).attr("x2", width).attr("y2", 20).attr("stroke", "#333").attr("stroke-width", 2);
        
        const train = g.append("g").attr("transform", `translate(-100, 0)`);
        train.append("rect").attr("width", 100).attr("height", 20).attr("fill", "#10B981").attr("rx", 4);
        train.append("rect").attr("x", 80).attr("y", 5).attr("width", 15).attr("height", 10).attr("fill", "white").attr("opacity", 0.5);
        
        if (step > 0) {
          train.transition().duration(2000).ease(d3.easeLinear).attr("transform", `translate(${width}, 0)`);
        }
        
        g.append("rect").attr("x", centerX).attr("y", -20).attr("width", 10).attr("height", 40).attr("fill", "#333"); // Pole
      }

      // BOATS AND STREAMS
      if (topic.name === "Boats and Streams") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const stream = g.append("rect").attr("x", -width/2).attr("y", 0).attr("width", width).attr("height", 40).attr("fill", "#3B82F6").attr("fill-opacity", 0.2);
        
        const boat = g.append("path").attr("d", "M -20 0 L 20 0 L 15 10 L -15 10 Z").attr("fill", "#10B981").attr("transform", "translate(0, -10)");
        
        if (step === 1) { // Downstream
          boat.transition().duration(1000).attr("transform", "translate(100, -10)");
          stream.transition().duration(1000).attr("fill-opacity", 0.4);
        } else if (step === 2) { // Upstream
          boat.transition().duration(2000).attr("transform", "translate(-100, -10)");
        }
      }

      // ALLIGATION OR MIXTURE
      if (topic.name === "Alligation or Mixture") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("circle").attr("cx", -80).attr("cy", -40).attr("r", 30).attr("fill", "#10B981").attr("fill-opacity", 0.5);
        g.append("text").attr("x", -80).attr("y", -80).attr("text-anchor", "middle").text("Type A");
        
        g.append("circle").attr("cx", 80).attr("cy", -40).attr("r", 30).attr("fill", "#3B82F6").attr("fill-opacity", 0.5);
        g.append("text").attr("x", 80).attr("y", -80).attr("text-anchor", "middle").text("Type B");
        
        if (step > 0) {
          g.append("circle").attr("cx", 0).attr("cy", 60).attr("r", 40).attr("fill", "#8B5CF6").attr("fill-opacity", 0.5);
          g.append("text").attr("x", 0).attr("y", 120).attr("text-anchor", "middle").attr("font-weight", "bold").text("Mixture");
        }
      }

      // CHAIN RULE
      if (topic.name === "Chain Rule") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").attr("font-size", "24px").attr("font-weight", "bold").text("M₁D₁H₁ / W₁ = M₂D₂H₂ / W₂");
        if (step > 0) {
          g.append("text").attr("y", 50).attr("text-anchor", "middle").attr("fill", "#10B981").text("Direct & Indirect Proportions");
        }
      }

      // DECIMAL FRACTION
      if (topic.name === "Decimal Fraction") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").attr("font-size", "40px").attr("font-weight", "bold").attr("fill", "#10B981").text("0.25 = 25/100 = 1/4");
      }

      // SIMPLIFICATION
      if (topic.name === "Simplification") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").attr("font-size", "32px").attr("font-weight", "bold").text("B O D M A S");
        if (step > 0) {
          g.append("text").attr("y", 50).attr("text-anchor", "middle").attr("fill", "#10B981").text("Brackets, Orders, Division...");
        }
      }

      // SQUARE ROOT AND CUBE ROOT
      if (topic.name === "Square Root and Cube Root") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").attr("font-size", "40px").attr("font-weight", "bold").attr("fill", "#10B981").text("√64 = 8, ∛64 = 4");
      }

      // PROBLEMS ON H.C.F AND L.C.M
      if (topic.name === "Problems on H.C.F and L.C.M") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("circle").attr("cx", -40).attr("cy", 0).attr("r", 60).attr("fill", "#10B981").attr("fill-opacity", 0.2).attr("stroke", "#10B981");
        g.append("circle").attr("cx", 40).attr("cy", 0).attr("r", 60).attr("fill", "#3B82F6").attr("fill-opacity", 0.2).attr("stroke", "#3B82F6");
        g.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "middle").attr("font-weight", "bold").text("HCF");
        g.append("text").attr("x", 0).attr("y", 80).attr("text-anchor", "middle").text("LCM = Product / HCF");
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

      // SPOTTING ERRORS
      if (topic.name === "Spotting Errors") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").attr("font-size", "20px").text("He go to school every day.");
        if (step > 0) {
          g.append("line").attr("x1", -85).attr("y1", 5).attr("x2", -65).attr("y2", 5).attr("stroke", "#EF4444").attr("stroke-width", 2);
          g.append("text").attr("y", 40).attr("text-anchor", "middle").attr("fill", "#10B981").attr("font-weight", "bold").text("Correction: He goes...");
        }
      }

      // SYNONYMS / ANTONYMS
      if (topic.name === "Synonyms" || topic.name === "Antonyms") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        const isSynonym = topic.name === "Synonyms";
        g.append("text").attr("x", -80).attr("text-anchor", "middle").attr("font-size", "24px").text("Large");
        g.append("text").attr("x", 0).attr("text-anchor", "middle").attr("font-size", "24px").text(isSynonym ? "=" : "≠");
        g.append("text").attr("x", 80).attr("text-anchor", "middle").attr("font-size", "24px").text(isSynonym ? "Big" : "Small");
      }

      // SPELLINGS
      if (topic.name === "Spellings") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("y", -20).attr("text-anchor", "middle").attr("fill", "#EF4444").text("Accomodation");
        if (step > 0) {
          g.append("text").attr("y", 20).attr("text-anchor", "middle").attr("fill", "#10B981").attr("font-weight", "bold").text("Accommodation");
        }
      }

      // SENTENCE FORMATION / ORDERING OF WORDS
      if (topic.name === "Sentence Formation" || topic.name === "Ordering of Words") {
        const words = ["The", "cat", "sat", "on", "mat"];
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        words.forEach((w, i) => {
          g.append("text")
            .attr("x", (i - 2) * 60)
            .attr("y", step === 0 ? (i % 2 === 0 ? -20 : 20) : 0)
            .attr("text-anchor", "middle")
            .text(w)
            .transition().duration(1000).attr("x", (i - 2) * 60).attr("y", 0);
        });
      }

      // CLOZE TEST
      if (topic.name === "Cloze Test") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("text-anchor", "middle").text("The sun _______ in the east.");
        if (step > 0) {
          g.append("text").attr("x", -15).attr("y", 0).attr("fill", "#10B981").attr("font-weight", "bold").text("rises");
        }
      }

      // COMPREHENSION
      if (topic.name === "Comprehension") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("rect").attr("x", -60).attr("y", -40).attr("width", 120).attr("height", 80).attr("fill", "none").attr("stroke", "#333").attr("stroke-width", 2);
        g.append("line").attr("x1", -50).attr("y1", -20).attr("x2", 50).attr("y2", -20).attr("stroke", "#E5E7EB");
        g.append("line").attr("x1", -50).attr("y1", 0).attr("x2", 50).attr("y2", 0).attr("stroke", "#E5E7EB");
        g.append("line").attr("x1", -50).attr("y1", 20).attr("x2", 20).attr("y2", 20).attr("stroke", "#E5E7EB");
        g.append("circle").attr("cx", 40).attr("cy", 20).attr("r", 15).attr("fill", "none").attr("stroke", "#10B981").attr("stroke-width", 2);
        g.append("line").attr("x1", 50).attr("y1", 30).attr("x2", 65).attr("y2", 45).attr("stroke", "#10B981").attr("stroke-width", 3);
      }

      // ONE WORD SUBSTITUTES
      if (topic.name === "One Word Substitutes") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("y", -20).attr("text-anchor", "middle").attr("font-size", "14px").text("One who believes in God");
        if (step > 0) {
          g.append("text").attr("y", 20).attr("text-anchor", "middle").attr("fill", "#10B981").attr("font-weight", "bold").attr("font-size", "24px").text("Theist");
        }
      }

      // IDIOMS AND PHRASES
      if (topic.name === "Idioms and Phrases") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("y", -20).attr("text-anchor", "middle").text("Piece of cake");
        if (step > 0) {
          g.append("text").attr("y", 20).attr("text-anchor", "middle").attr("fill", "#10B981").attr("font-weight", "bold").text("Very easy task");
        }
      }

      // CHANGE OF VOICE / SPEECH
      if (topic.name === "Change of Voice" || topic.name === "Change of Speech") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("y", -40).attr("text-anchor", "middle").text(topic.name === "Change of Voice" ? "Active Voice" : "Direct Speech");
        g.append("line").attr("x1", 0).attr("y1", -20).attr("x2", 0).attr("y2", 20).attr("stroke", "#333").attr("marker-end", "url(#arrowhead)");
        g.append("text").attr("y", 50).attr("text-anchor", "middle").attr("fill", "#10B981").attr("font-weight", "bold").text(topic.name === "Change of Voice" ? "Passive Voice" : "Indirect Speech");
      }

      // VERBAL ANALOGIES
      if (topic.name === "Verbal Analogies") {
        const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
        g.append("text").attr("x", -100).attr("text-anchor", "middle").text("Bird : Fly");
        g.append("text").attr("x", 0).attr("text-anchor", "middle").text("::");
        g.append("text").attr("x", 100).attr("text-anchor", "middle").text("Fish : ?");
        if (step > 0) {
          g.append("text").attr("x", 100).attr("y", 30).attr("text-anchor", "middle").attr("fill", "#10B981").attr("font-weight", "bold").text("Swim");
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
      case "Percentage":
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
      case "Simple Interest":
        return [
          {
            title: "Principal and Rate",
            content: "Simple Interest is calculated only on the initial amount (principal) you borrowed or deposited.",
            tip: "SI = (P × R × T) / 100"
          },
          {
            title: "Linear Growth",
            content: "The interest stays the same for every time period. It grows linearly over time.",
            tip: "Total Amount = Principal + Simple Interest"
          }
        ];
      case "Compound Interest":
        return [
          {
            title: "Interest on Interest",
            content: "Compound interest is calculated on the principal amount and also on the accumulated interest of previous periods.",
            tip: "A = P(1 + R/100)ⁿ"
          },
          {
            title: "Exponential Growth",
            content: "Unlike simple interest, compound interest grows exponentially. The more frequent the compounding, the higher the interest.",
            tip: "CI = Amount - Principal"
          }
        ];
      case "Partnership":
        return [
          {
            title: "Investment Ratio",
            content: "In a partnership, profits are generally shared in the ratio of the capital invested by each partner.",
            tip: "Profit Share ∝ Investment × Time"
          }
        ];
      case "Ratio and Proportion":
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
      case "Average":
        return [
          {
            title: "The Mean",
            content: "Average is the sum of all observations divided by the total number of observations.",
            tip: "Average = Sum / Count"
          }
        ];
      case "Problems on Ages":
        return [
          {
            title: "Age Relationships",
            content: "Solving problems involving ages of people at different points in time.",
            tip: "If present age is x, age 'n' years ago was (x-n) and 'n' years later will be (x+n)."
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
      case "Pipes and Cistern":
        return [
          {
            title: "Inlet and Outlet",
            content: "Inlet pipes fill the tank (positive work), while outlet pipes empty it (negative work).",
            tip: "Net work = Inlet rate - Outlet rate"
          }
        ];
      case "Time and Distance":
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
      case "Problems on Trains":
        return [
          {
            title: "Relative Speed",
            content: "When two trains move, their relative speed depends on whether they are moving in the same or opposite directions.",
            tip: "Opposite direction: Add speeds; Same direction: Subtract speeds."
          }
        ];
      case "Boats and Streams":
        return [
          {
            title: "Upstream and Downstream",
            content: "Downstream is moving with the flow (Speed = Boat + Stream). Upstream is moving against the flow (Speed = Boat - Stream).",
            tip: "Speed in still water = (Downstream + Upstream) / 2"
          }
        ];
      case "Alligation or Mixture":
        return [
          {
            title: "Mixing Ingredients",
            content: "Alligation is a rule that enables us to find the ratio in which two or more ingredients at the given price must be mixed to produce a mixture of a specified price.",
            tip: "Cheaper : Dearer = (Dearer Price - Mean Price) : (Mean Price - Cheaper Price)"
          }
        ];
      case "Chain Rule":
        return [
          {
            title: "Proportions",
            content: "Chain rule deals with direct and indirect proportions between multiple variables.",
            tip: "Direct: x/y = k; Indirect: xy = k"
          }
        ];
      case "Decimal Fraction":
        return [
          {
            title: "Decimals",
            content: "Fractions whose denominators are powers of 10 are called decimal fractions.",
            tip: "0.1 = 1/10, 0.01 = 1/100"
          }
        ];
      case "Simplification":
        return [
          {
            title: "Order of Operations",
            content: "BODMAS rule: Brackets, Orders, Division, Multiplication, Addition, Subtraction.",
            tip: "Always solve from left to right for same precedence operations."
          }
        ];
      case "Square Root and Cube Root":
        return [
          {
            title: "Roots",
            content: "The square root of a number is a value that, when multiplied by itself, gives the original number.",
            tip: "Perfect squares end in 0, 1, 4, 5, 6, or 9."
          }
        ];
      case "Problems on Numbers":
        return [
          {
            title: "Number Systems",
            content: "Understanding different types of numbers like natural, whole, integers, rational, and irrational numbers.",
            tip: "Prime numbers only have two factors: 1 and itself."
          },
          {
            title: "Divisibility Rules",
            content: "Quick ways to check if a number is divisible by another without full division.",
            tip: "A number is divisible by 3 if the sum of its digits is divisible by 3."
          },
          {
            title: "Sum of Series",
            content: "Calculating the sum of first 'n' natural numbers, squares, or cubes using standard formulas.",
            tip: "Sum of first n natural numbers = n(n+1)/2"
          }
        ];
      case "Problems on H.C.F and L.C.M":
        return [
          {
            title: "Factors and Multiples",
            content: "HCF is the largest number that divides two or more numbers. LCM is the smallest number divisible by two or more numbers.",
            tip: "Product of two numbers = HCF × LCM"
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
      case "Syllogism":
        return [
          {
            title: "Venn Diagram Method",
            content: "Syllogism is a form of deductive reasoning where you arrive at a specific conclusion by examining two or more general premises.",
            tip: "Always use Venn diagrams to visualize the relationships between sets."
          },
          {
            title: "Universal vs Particular",
            content: "Premises can be Universal (All/None) or Particular (Some/Some Not). The overlap in the Venn diagram represents the logical connection.",
            tip: "If 'All A are B' and 'All B are C', then 'All A are C'."
          },
          {
            title: "Interactive Solver",
            content: "Use the tool below to input your own premises and see how they interact visually. This helps in identifying valid conclusions.",
            tip: "Try combining 'All' and 'Some' statements."
          }
        ];
      case "Logical Sequence of Words":
        return [
          {
            title: "Meaningful Order",
            content: "Arranging a group of words in a logical sequence based on their meaning, size, or occurrence.",
            tip: "Look for a natural progression, like a life cycle or a manufacturing process."
          }
        ];
      case "Blood Relation Test":
        return [
          {
            title: "Family Tree",
            content: "Blood relation problems involve deciphering complex family ties. Drawing a family tree is the best way to solve them.",
            tip: "Use symbols: Square for Male, Circle for Female, Horizontal line for siblings, Vertical for generations."
          }
        ];
      case "Series Completion":
        return [
          {
            title: "Pattern Recognition",
            content: "Identifying the rule that governs a series of numbers or letters and finding the next term.",
            tip: "Check for differences, squares, cubes, or alternating patterns."
          }
        ];
      case "Cause and Effect":
        return [
          {
            title: "Logical Connection",
            content: "Determining whether one event (cause) leads to another (effect), or if they are independent.",
            tip: "Ask 'Why did this happen?' to find the cause."
          }
        ];
      case "Dice":
        return [
          {
            title: "Spatial Visualization",
            content: "Visualizing the faces of a dice and identifying which numbers are opposite to each other.",
            tip: "If two faces are common in two positions, the third faces are opposite to each other."
          }
        ];
      case "Venn Diagrams":
        return [
          {
            title: "Set Relationships",
            content: "Using overlapping circles to represent the logical relationship between different groups or sets.",
            tip: "The intersection represents elements that belong to both sets."
          }
        ];
      case "Cube and Cuboid":
        return [
          {
            title: "3D Reasoning",
            content: "Solving problems related to cutting, painting, and counting small cubes within a larger cube.",
            tip: "A cube cut into n³ small cubes has (n-2)³ cubes with no faces painted."
          }
        ];
      case "Analogy":
        return [
          {
            title: "Finding Similarities",
            content: "Identifying the relationship between a given pair and applying it to find a matching pair.",
            tip: "The relationship can be synonyms, antonyms, worker-tool, cause-effect, etc."
          }
        ];
      case "Seating Arrangement":
        return [
          {
            title: "Positional Logic",
            content: "Arranging people or objects in a row or around a table based on given constraints.",
            tip: "Start with the most definite piece of information given in the problem."
          }
        ];
      case "Character Puzzles":
        return [
          {
            title: "Symbolic Logic",
            content: "Solving puzzles where numbers or letters are arranged in a specific pattern within a shape.",
            tip: "Look for mathematical operations between adjacent or opposite characters."
          }
        ];
      case "Direction Sense Test":
        return [
          {
            title: "Cardinal Directions",
            content: "Navigating through a series of turns and movements to find the final position or direction.",
            tip: "Always draw a small compass (N, S, E, W) to keep track of turns."
          }
        ];
      case "Classification":
        return [
          {
            title: "Odd One Out",
            content: "Identifying the element that does not belong to a given group based on a common property.",
            tip: "Find the property that links all but one of the items."
          }
        ];
      case "Data Sufficiency":
        return [
          {
            title: "Sufficiency Logic",
            content: "Determining if the provided statements are enough to answer the question, without necessarily solving it.",
            tip: "Check each statement individually first, then combine them if needed."
          }
        ];
      case "Arithmetic Reasoning":
        return [
          {
            title: "Math-Logic Hybrid",
            content: "Solving word problems that require both basic mathematical calculations and logical reasoning.",
            tip: "Translate the word problem into simple algebraic equations."
          }
        ];
      case "Spotting Errors":
        return [
          {
            title: "Grammar Rules",
            content: "Identifying errors in grammar, syntax, or usage within a sentence.",
            tip: "Check for subject-verb agreement and correct tense usage."
          }
        ];
      case "Synonyms":
        return [
          {
            title: "Similar Meanings",
            content: "Finding words that have the same or nearly the same meaning as a given word.",
            tip: "Use the word in a sentence to see which option fits best."
          }
        ];
      case "Antonyms":
        return [
          {
            title: "Opposite Meanings",
            content: "Finding words that have the opposite meaning of a given word.",
            tip: "Be careful not to choose a synonym by mistake."
          }
        ];
      case "Selecting Words":
        return [
          {
            title: "Contextual Fit",
            content: "Choosing the most appropriate word to fill a blank based on the context of the sentence.",
            tip: "Read the whole sentence before looking at the options."
          }
        ];
      case "Spellings":
        return [
          {
            title: "Correct Orthography",
            content: "Identifying the correctly or incorrectly spelled word from a given set.",
            tip: "Break long words into syllables to check their spelling."
          }
        ];
      case "Sentence Formation":
        return [
          {
            title: "Syntactic Structure",
            content: "Constructing a grammatically correct and meaningful sentence from given fragments.",
            tip: "Identify the subject and verb first."
          }
        ];
      case "Ordering of Words":
        return [
          {
            title: "Sentence Coherence",
            content: "Arranging a jumbled set of words into a coherent and logical sentence.",
            tip: "Look for connecting words like 'and', 'but', 'because'."
          }
        ];
      case "Sentence Correction":
        return [
          {
            title: "Error Rectification",
            content: "Identifying the incorrect part of a sentence and replacing it with the correct version.",
            tip: "Focus on common errors like pronoun usage and prepositions."
          }
        ];
      case "Sentence Improvement":
        return [
          {
            title: "Refining Expression",
            content: "Choosing a better way to express a thought or correcting a subtle grammatical error.",
            tip: "The shortest correct answer is often the best one."
          }
        ];
      case "Completing Statements":
        return [
          {
            title: "Logical Completion",
            content: "Filling in the blanks to complete a statement so that it makes logical sense.",
            tip: "Look for logical markers like 'therefore', 'however', 'consequently'."
          }
        ];
      case "Ordering of Sentences":
        return [
          {
            title: "Paragraph Logic",
            content: "Arranging a set of jumbled sentences into a logical and coherent paragraph.",
            tip: "Find the opening sentence, which is usually a general statement."
          }
        ];
      case "Paragraph Formation":
        return [
          {
            title: "Cohesive Writing",
            content: "Building a paragraph by linking sentences through logical transitions.",
            tip: "The last sentence usually concludes the thought."
          }
        ];
      case "Cloze Test":
        return [
          {
            title: "Contextual Blanks",
            content: "Filling in multiple blanks within a passage to restore its original meaning.",
            tip: "Read the entire passage once to get the overall theme."
          }
        ];
      case "Comprehension":
        return [
          {
            title: "Textual Analysis",
            content: "Reading a passage and answering questions based on the information provided.",
            tip: "Read the questions first, then scan the passage for answers."
          }
        ];
      case "One Word Substitutes":
        return [
          {
            title: "Vocabulary Precision",
            content: "Replacing a long phrase or description with a single, precise word.",
            tip: "Many substitutes are derived from Latin or Greek roots."
          }
        ];
      case "Idioms and Phrases":
        return [
          {
            title: "Figurative Language",
            content: "Understanding expressions whose meaning is not predictable from the literal definitions of its words.",
            tip: "Learn idioms in groups based on themes like 'animals' or 'colors'."
          }
        ];
      case "Change of Voice":
        return [
          {
            title: "Active vs Passive",
            content: "Converting sentences from active voice to passive voice and vice versa.",
            tip: "The object of the active sentence becomes the subject of the passive one."
          }
        ];
      case "Change of Speech":
        return [
          {
            title: "Direct vs Indirect",
            content: "Converting direct speech into indirect (reported) speech and vice versa.",
            tip: "Remember to change tenses, pronouns, and time markers."
          }
        ];
      case "Verbal Analogies":
        return [
          {
            title: "Word Relationships",
            content: "Identifying the relationship between a pair of words and finding another pair with a similar relationship.",
            tip: "Define the relationship in a simple sentence (e.g., 'A is a type of B')."
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

      {topic.name === "Syllogism" && step === steps.length - 1 && (
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
