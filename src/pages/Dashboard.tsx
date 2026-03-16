import { motion } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { Trophy, Target, Zap, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { User, WeakArea } from "../types";
import { useEffect, useState } from "react";
import { getPersonalizedFeedback } from "../services/gemini";
import { cn } from "../lib/utils";

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

export default function Dashboard({ user }: { user: User | null }) {
  const [feedback, setFeedback] = useState<{ weakAreas: WeakArea[] }>({ weakAreas: [] });
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [lbType, setLbType] = useState("mock");

  const stats = [
    { label: "Total XP", value: user?.xp || 0, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Accuracy", value: "84%", icon: Target, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Time/Ques", value: "42s", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Rank", value: "#12", icon: Trophy, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const performanceData = [
    { name: "Mon", score: 65 },
    { name: "Tue", score: 78 },
    { name: "Wed", score: 72 },
    { name: "Thu", score: 85 },
    { name: "Fri", score: 82 },
    { name: "Sat", score: 90 },
    { name: "Sun", score: 88 },
  ];

  useEffect(() => {
    // Simulate fetching user progress and getting AI feedback
    const mockProgress = {
      completedTopics: ["Percentages", "Syllogisms"],
      scores: { Percentages: 90, Syllogisms: 60, "Time and Work": 40 }
    };
    
    getPersonalizedFeedback(mockProgress).then(data => {
      setFeedback(data);
      setLoading(false);
    });

    // Fetch challenges
    fetch("/api/challenges")
      .then(res => res.json())
      .then(data => setChallenges(data));

    // Fetch leaderboard
    fetch(`/api/leaderboard/${lbType}`)
      .then(res => res.json())
      .then(data => setLeaderboard(data));
  }, [lbType]);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500">Here's how you're performing this week.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-black/5 shadow-sm">
          <TrendingUp size={18} className="text-emerald-500" />
          <span className="text-sm font-bold">+12% improvement</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Learning Progress</h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="bg-[#151619] text-white p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Active Challenges</h3>
            <Zap size={20} className="text-amber-400" />
          </div>
          <div className="space-y-4">
            {challenges.map((challenge, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    challenge.type === "daily" ? "bg-amber-500/20 text-amber-400" : "bg-purple-500/20 text-purple-400"
                  )}>
                    {challenge.type}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {challenge.timeLeft}
                  </span>
                </div>
                <h4 className="font-bold text-sm">{challenge.title}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <Zap size={12} /> +{challenge.xp} XP
                  </div>
                  <button className="text-xs font-bold hover:text-emerald-400 transition-colors">
                    Start Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Insights */}
        <section className="lg:col-span-2 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Weak Area Analysis</h3>
              <p className="text-sm text-emerald-700">Personalized recommendations based on your performance.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-4 animate-pulse">
              <div className="h-24 bg-emerald-200/50 rounded-2xl flex-1" />
              <div className="h-24 bg-emerald-200/50 rounded-2xl flex-1" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedback.weakAreas.map((area, idx) => (
                <motion.div
                  key={area.topic}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Needs Focus</span>
                  </div>
                  <h4 className="font-bold text-lg">{area.topic}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{area.reason}</p>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                      {area.suggestion}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Leaderboard Section */}
        <section className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Trophy size={20} />
              </div>
              <h3 className="text-xl font-bold">Leaderboard</h3>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {["mock", "daily", "weekly"].map((type) => (
                <button
                  key={type}
                  onClick={() => setLbType(type)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    lbType === type ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {leaderboard.map((entry, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  entry.user_name === "You" ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-black/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    idx === 0 ? "bg-amber-100 text-amber-600" : 
                    idx === 1 ? "bg-slate-100 text-slate-600" :
                    idx === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-600"
                  )}>
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm">{entry.user_name}</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 text-sm">{entry.score}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
