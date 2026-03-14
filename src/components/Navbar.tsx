import { Link, useLocation } from "react-router-dom";
import { User as UserIcon, BookOpen, LayoutDashboard, Trophy, Zap } from "lucide-react";
import { User } from "../types";
import { cn } from "../lib/utils";

export default function Navbar({ user }: { user: User | null }) {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: BookOpen },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Mock Test", path: "/mock-test", icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">VisualAptitude</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {/* Navigation moved to bottom right */}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 bg-gray-100 rounded-full pl-2 pr-4 py-1">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <UserIcon size={16} className="text-gray-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">Lvl {user.level}</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{user.xp} XP</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
