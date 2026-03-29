import { motion } from "motion/react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Play, CheckCircle2, Star, Target, BrainCircuit, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Topic } from "../types";

export default function Home() {
  const { category } = useParams();
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch("/api/topics")
      .then(res => res.json())
      .then(data => setTopics(data));
  }, []);

  const categories = category ? [category] : ["Arithmetic", "Quantitative", "Logical", "Verbal"];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section - Only show on main home */}
      {!category && (
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#151619] text-white p-12 md:p-24">
          <div className="relative z-10 max-w-3xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
            >
              <BrainCircuit size={16} />
              AI-Powered Visual Learning
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9]"
            >
              Master Aptitude <br />
              <span className="text-emerald-400 italic serif">Visually.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 max-w-xl"
            >
              Stop memorizing formulas. Understand the logic through interactive animations, 
              real-time simulations, and step-by-step visual problem solving.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/introduction"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl flex items-center gap-2 transition-all hover:scale-105"
              >
                Start Learning <ArrowRight size={20} />
              </Link>
              <Link
                to="/mock-test"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10 transition-all"
              >
                Take Mock Test
              </Link>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path fill="#10B981" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.6,-31.3,86.9,-15.7,85.5,-0.8C84.1,14.1,78,28.2,69.2,40.4C60.4,52.6,48.9,62.9,35.8,70.1C22.7,77.3,8.1,81.4,-6.5,80.4C-21.1,79.4,-35.7,73.3,-48.8,64.1C-61.9,54.9,-73.5,42.6,-79.4,28.2C-85.3,13.8,-85.5,-2.7,-81.4,-17.7C-77.3,-32.7,-68.9,-46.2,-57.4,-54.4C-45.9,-62.6,-31.3,-65.5,-17.7,-72.7C-4.1,-79.9,8.5,-91.4,22.7,-91.4C36.9,-91.4,52.7,-79.9,44.7,-76.4Z" transform="translate(100 100)" />
             </svg>
          </div>
        </section>
      )}

      {/* Topics Grid */}
      <section className="space-y-12">
        {categories.map((cat) => {
          const catTopics = topics.filter((t) => t.category === cat);
          if (catTopics.length === 0) return null;

          return (
            <div key={cat} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-600">
                    <span className="w-8 h-[1px] bg-emerald-600/30" />
                    {cat}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {cat} Aptitude
                  </h2>
                </div>
                {catTopics.length > 6 && !category && (
                  <Link 
                    to={`/category/${cat}`}
                    className="text-sm font-bold text-gray-400 hover:text-emerald-500 transition-colors"
                  >
                    View All {catTopics.length} Topics
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(category ? catTopics : catTopics.slice(0, 6)).map((topic) => (
                  <motion.div
                    key={topic.id}
                    whileHover={{ y: -4 }}
                    className="group p-6 bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                        <Play size={20} className="text-gray-400 group-hover:text-emerald-500" />
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star key={s} size={12} className={s <= 2 ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{topic.name}</h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/learn/${topic.id}`}
                        className="text-sm font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        Learn Now <ArrowRight size={16} />
                      </Link>
                      <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">12 LESSONS</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Features Bento - Only show on main home */}
      {!category && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-emerald-500 rounded-[2rem] p-8 text-black flex flex-col justify-between">
            <Target size={40} className="mb-8" />
            <div>
              <h3 className="text-3xl font-bold mb-4 leading-tight">Mock Test Simulation</h3>
              <p className="font-medium opacity-80 mb-6">Real exam environment with timer, navigation, and detailed visual analytics.</p>
              <Link to="/mock-test" className="inline-flex h-12 items-center px-6 bg-black text-white rounded-xl font-bold">Try Now</Link>
            </div>
          </div>
          <div className="bg-white border border-black/5 rounded-[2rem] p-8 flex flex-col justify-between">
            <CheckCircle2 size={40} className="text-emerald-500 mb-8" />
            <div>
              <h3 className="text-xl font-bold mb-2">Practice Mode</h3>
              <p className="text-sm text-gray-500">Unlimited questions with hints and animated solutions.</p>
            </div>
          </div>
          <div className="bg-[#151619] text-white rounded-[2rem] p-8 flex flex-col justify-between">
            <Trophy size={40} className="text-amber-400 mb-8" />
            <div>
              <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
              <h4 className="text-4xl font-bold text-emerald-400 mb-2">#12</h4>
              <p className="text-sm text-gray-400">Global Rank</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
