import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, CheckCircle2, XCircle, HelpCircle, 
  Sparkles, ChevronRight, Info, BrainCircuit, MessageSquare 
} from "lucide-react";
import { Question } from "../types";
import { getAIExplanation } from "../services/gemini";
import Markdown from "react-markdown";
import { cn } from "../lib/utils";

export default function Practice() {
  const { topicId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, { selected: string, isCorrect: boolean }>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/questions/${topicId}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topicId]);

  const handleCheck = () => {
    if (!selected) return;
    const correct = selected === questions[currentIdx].correct_answer;
    setIsCorrect(correct);
    setShowExplanation(true);
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentIdx].id]: { selected, isCorrect: correct }
    }));
  };

  const jumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    const saved = userAnswers[questions[idx].id];
    if (saved) {
      setSelected(saved.selected);
      setIsCorrect(saved.isCorrect);
      setShowExplanation(true);
    } else {
      setSelected(null);
      setIsCorrect(null);
      setShowExplanation(false);
    }
    setAiExplanation(null);
  };

  const handleAiExplain = async () => {
    if (!questions[currentIdx] || !selected) return;
    setLoadingAi(true);
    const explanation = await getAIExplanation(
      "Aptitude", 
      questions[currentIdx].question_text, 
      selected
    );
    setAiExplanation(explanation);
    setLoadingAi(false);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowExplanation(false);
      setAiExplanation(null);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading questions...</div>;
  if (questions.length === 0) return (
    <div className="p-20 text-center space-y-6">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto text-gray-400">
        <HelpCircle size={40} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">No Questions Found</h2>
        <p className="text-gray-500">We're still adding questions for this topic. Check back soon!</p>
      </div>
      <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
        <ArrowLeft size={16} /> Back to Topics
      </Link>
    </div>
  );

  const current = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={16} /> Exit Practice
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => jumpToQuestion(idx)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all border-2",
                  currentIdx === idx ? "border-emerald-500 bg-emerald-50 text-emerald-600" : 
                  userAnswers[questions[idx].id] ? (
                    userAnswers[questions[idx].id].isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"
                  ) : "border-black/5 text-gray-400 hover:border-gray-200"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-400">{currentIdx + 1} / {questions.length}</span>
          </div>
        </div>
      </div>

      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-black/5 shadow-xl p-8 md:p-12 space-y-8"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              current.difficulty === 'Easy' ? "bg-emerald-100 text-emerald-700" :
              current.difficulty === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            )}>
              {current.difficulty}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">{current.question_text}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {current.options.map((option) => (
            <button
              key={option}
              onClick={() => !showExplanation && setSelected(option)}
              className={cn(
                "p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between group",
                selected === option ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-black/5 hover:border-emerald-200 hover:bg-gray-50",
                showExplanation && option === current.correct_answer && "border-emerald-500 bg-emerald-50",
                showExplanation && selected === option && option !== current.correct_answer && "border-red-500 bg-red-50"
              )}
            >
              {option}
              {showExplanation && option === current.correct_answer && <CheckCircle2 className="text-emerald-500" size={20} />}
              {showExplanation && selected === option && option !== current.correct_answer && <XCircle className="text-red-500" size={20} />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {!showExplanation ? (
            <button
              onClick={handleCheck}
              disabled={!selected}
              className="h-14 flex-1 rounded-2xl bg-[#151619] text-white font-bold disabled:opacity-30 hover:bg-emerald-500 hover:text-black transition-all"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="h-14 flex-1 rounded-2xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all"
            >
              {currentIdx < questions.length - 1 ? "Next Question" : "Finish Practice"} <ChevronRight size={20} />
            </button>
          )}
          <button className="h-14 w-14 rounded-2xl border border-black/5 flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors">
            <HelpCircle size={24} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2rem] border border-black/5 p-8 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <Info size={18} />
                Visual Explanation
              </div>
              <p className="text-gray-600 leading-relaxed">{current.explanation}</p>
            </div>

            <div className="bg-[#151619] text-white rounded-[2rem] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Animated Problem Solver</h3>
                    <p className="text-xs text-gray-400">Gemini is ready to break this down visually.</p>
                  </div>
                </div>
                {!aiExplanation && (
                  <button
                    onClick={handleAiExplain}
                    disabled={loadingAi}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    {loadingAi ? "Thinking..." : "Explain with AI"} <Sparkles size={14} />
                  </button>
                )}
              </div>

              {aiExplanation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert max-w-none text-gray-300"
                >
                  <div className="markdown-body">
                    <Markdown>{aiExplanation}</Markdown>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
