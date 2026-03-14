import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, ChevronLeft, ChevronRight, Send, 
  AlertCircle, CheckCircle2, Trophy, BarChart3, RotateCcw 
} from "lucide-react";
import { Question } from "../types";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip 
} from "recharts";
import { cn } from "../lib/utils";

const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];

export default function MockTest() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/mock-questions")
      .then(res => res.json())
      .then(data => setQuestions(data));

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinish = () => {
    clearInterval(timerRef.current!);
    setIsFinished(true);
  };

  if (isFinished) {
    const score = questions.reduce((acc, q) => (answers[q.id] === q.correct_answer ? acc + 1 : acc), 0);
    const accuracy = Math.round((score / questions.length) * 100);
    
    const resultData = [
      { name: "Correct", value: score },
      { name: "Incorrect", value: questions.length - score },
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto space-y-8 pb-20"
      >
        <div className="bg-white rounded-[3rem] border border-black/5 shadow-xl p-12 text-center space-y-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <Trophy size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Test Completed!</h1>
            <p className="text-gray-500">Great effort! Here's your performance breakdown.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Score</p>
              <h2 className="text-5xl font-bold">{score} / {questions.length}</h2>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Accuracy</p>
              <h2 className="text-5xl font-bold text-emerald-500">{accuracy}%</h2>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Time Spent</p>
              <h2 className="text-5xl font-bold">{formatTime(600 - timeLeft)}</h2>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resultData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold flex items-center gap-2 transition-all"
            >
              <RotateCcw size={20} /> Retake Test
            </button>
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="px-8 py-4 bg-[#151619] text-white hover:bg-emerald-500 hover:text-black rounded-2xl font-bold flex items-center gap-2 transition-all"
            >
              View Dashboard <BarChart3 size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) return null;

  const current = questions[currentIdx];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 pb-20">
      {/* Left: Question Area */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-xl p-8 md:p-12 space-y-8">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <div className={cn(
              "flex items-center gap-2 font-mono font-bold px-4 py-2 rounded-xl border",
              timeLeft < 60 ? "bg-red-50 border-red-100 text-red-500 animate-pulse" : "bg-gray-50 border-gray-100 text-gray-700"
            )}>
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold leading-tight">{current.question_text}</h2>

          <div className="grid grid-cols-1 gap-4">
            {current.options.map((option) => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, [current.id]: option })}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between group",
                  answers[current.id] === option ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-black/5 hover:border-emerald-200 hover:bg-gray-50"
                )}
              >
                {option}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  answers[current.id] === option ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-200"
                )}>
                  {answers[current.id] === option && <CheckCircle2 size={14} />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-black/5">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 font-bold text-gray-500 disabled:opacity-30"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <div className="flex gap-4">
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="px-8 py-4 bg-[#151619] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-500 hover:text-black transition-all"
                >
                  Next Question <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-8 py-4 bg-emerald-500 text-black rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-all"
                >
                  Finish Test <Send size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Navigation Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-lg">Question Panel</h3>
          <div className="grid grid-cols-4 gap-3">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={cn(
                  "w-full aspect-square rounded-xl text-sm font-bold transition-all border-2",
                  currentIdx === idx ? "border-emerald-500 bg-emerald-50 text-emerald-600" : 
                  answers[q.id] ? "border-gray-200 bg-gray-100 text-gray-700" : "border-black/5 text-gray-400"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="pt-6 border-t border-black/5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-emerald-500" /> Current
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-gray-200" /> Answered
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded border border-black/5" /> Not Visited
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex gap-4">
          <AlertCircle className="text-amber-600 shrink-0" size={20} />
          <p className="text-xs text-amber-700 leading-relaxed">
            Once you submit, you cannot change your answers. Make sure to review all questions.
          </p>
        </div>
      </div>
    </div>
  );
}
