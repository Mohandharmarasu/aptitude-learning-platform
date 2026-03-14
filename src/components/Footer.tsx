import { Link } from "react-router-dom";
import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 pt-12 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight">VisualAptitude</span>
          </Link>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            Empowering students to master aptitude concepts through the power of visualization, 
            interactive simulations, and AI-driven insights.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:border-emerald-200 transition-all">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:border-emerald-200 transition-all">
              <Github size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:border-emerald-200 transition-all">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Platform</h4>
          <ul className="space-y-3">
            <li><Link to="/" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Learning Modules</Link></li>
            <li><Link to="/practice/1" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Practice Mode</Link></li>
            <li><Link to="/mock-test" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Mock Tests</Link></li>
            <li><Link to="/dashboard" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Performance Analytics</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Support</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Help Center</a></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Terms of Service</a></li>
            <li className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={14} />
              <span>support@visualapt.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} Visual Aptitude Learning Platform. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Built with</span>
          <div className="w-4 h-4 bg-emerald-500 rounded-sm flex items-center justify-center text-[8px] text-white font-bold">AI</div>
          <span>for students worldwide.</span>
        </div>
      </div>
    </footer>
  );
}
