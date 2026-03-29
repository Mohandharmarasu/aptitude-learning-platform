import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Map, BookOpen, Target, Users, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Topic } from "../types";

export default function Introduction() {
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/topics")
      .then(res => res.json())
      .then(data => setTopics(data));
  }, []);

  const categories = ["Arithmetic", "Quantitative", "Logical", "Verbal"];
  
  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      {!showRoadmap ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-wide uppercase"
            >
              The Foundation of Success
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Why Learn <span className="text-emerald-500 italic serif">Aptitude?</span>
            </h1>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
              Aptitude is the universal language of problem-solving. It's the key that unlocks doors to top-tier careers and academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-sm space-y-6 transition-all hover:shadow-2xl hover:shadow-emerald-500/5"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Target size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Cognitive Edge</h3>
                <p className="text-gray-500 leading-relaxed">
                  It measures your mental agility, pattern recognition, and logical deduction—skills that are essential in any high-impact role.
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8 }}
              className="p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-sm space-y-6 transition-all hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <BookOpen size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Career Gateway</h3>
                <p className="text-gray-500 leading-relaxed">
                  From MNC placements (TCS, Infosys) to competitive exams (CAT, GATE, UPSC), aptitude is the first hurdle you must clear.
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8 }}
              className="p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-sm space-y-6 transition-all hover:shadow-2xl hover:shadow-purple-500/5"
            >
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <Users size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Universal Skill</h3>
                <p className="text-gray-500 leading-relaxed">
                  Whether you're a student, a job seeker, or a professional, sharpening your aptitude makes you a more effective thinker.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-6 pt-8">
            <button
              onClick={() => setShowRoadmap(true)}
              className="px-12 py-6 bg-[#151619] text-white font-bold rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-2xl hover:bg-black"
            >
              <Map size={24} />
              Explore the Full Roadmap
            </button>
            <p className="text-sm text-gray-400 font-medium">Discover 60+ topics across 4 major categories</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <button 
                onClick={() => setShowRoadmap(false)}
                className="text-sm font-bold text-emerald-600 hover:underline mb-2 block"
              >
                ← Back to Introduction
              </button>
              <h2 className="text-4xl font-bold tracking-tight">The Master Roadmap</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-black/5 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Roadmap Image Section */}
          <div className="relative group rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=2000" 
              alt="Aptitude Roadmap" 
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-12">
              <h3 className="text-white text-3xl font-bold mb-2">Visual Learning Path</h3>
              <p className="text-white/80 max-w-lg">Follow this structured path to master all aptitude concepts from basics to advanced levels.</p>
            </div>
          </div>

          {/* Dynamic Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
            {categories.map((cat) => {
              const catTopics = filteredTopics.filter(t => t.category === cat);
              if (catTopics.length === 0 && searchQuery) return null;

              return (
                <div key={cat} className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-emerald-500/20">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                      {cat[0]}
                    </div>
                    <h3 className="text-xl font-bold">{cat}</h3>
                  </div>
                  <ul className="space-y-3">
                    {catTopics.map((topic, idx) => (
                      <motion.li 
                        key={topic.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 text-gray-600 group cursor-default"
                      >
                        <span className="text-[10px] font-mono text-gray-300 mt-1 group-hover:text-emerald-500 transition-colors">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="text-sm font-medium group-hover:text-black transition-colors leading-tight">
                          {topic.name}
                        </span>
                      </motion.li>
                    ))}
                    {catTopics.length === 0 && !searchQuery && (
                      <li className="text-xs text-gray-400 italic">No topics found</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-6 pt-12 border-t border-black/5">
            <Link
              to="/"
              className="px-12 py-6 bg-emerald-500 text-black font-bold rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
            >
              Start Learning Now <ArrowRight size={24} />
            </Link>
            <p className="text-sm text-gray-400">Join 10,000+ students mastering aptitude today</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
