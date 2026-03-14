import { Link, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, Trophy } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export default function FloatingNav() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: BookOpen },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Mock Test", path: "/mock-test", icon: Trophy },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      <div className="flex flex-col gap-3 bg-white/80 backdrop-blur-xl p-3 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-emerald-500/10">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-emerald-500 text-black" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-black" : "group-hover:scale-110 transition-transform")} />
                <span className="whitespace-nowrap">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-emerald-400 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
