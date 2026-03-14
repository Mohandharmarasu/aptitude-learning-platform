import { NavLink } from "react-router-dom";
import { Calculator, Brain, Languages, LayoutGrid } from "lucide-react";
import { cn } from "../lib/utils";

export default function Sidebar() {
  const modules = [
    { name: "All Modules", path: "/", icon: LayoutGrid },
    { name: "Quantitative", path: "/category/Quantitative", icon: Calculator },
    { name: "Logical", path: "/category/Logical", icon: Brain },
    { name: "Verbal", path: "/category/Verbal", icon: Languages },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-black/5 bg-white/50 backdrop-blur-sm p-6 space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2">
          Learning Modules
        </p>
        <nav className="space-y-1">
          {modules.map((module) => (
            <NavLink
              key={module.path}
              to={module.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold transition-all group",
                  isActive
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <module.icon size={20} className="shrink-0" />
              {module.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
        <h4 className="text-xs font-bold text-emerald-900 mb-1">Daily Goal</h4>
        <div className="h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-2/3" />
        </div>
        <p className="text-[10px] text-emerald-700 mt-2 font-medium">2/3 modules completed</p>
      </div>
    </aside>
  );
}
