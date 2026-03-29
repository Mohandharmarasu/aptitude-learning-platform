import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FloatingNav from "./components/FloatingNav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TopicLearning from "./pages/TopicLearning";
import Practice from "./pages/Practice";
import MockTest from "./pages/MockTest";
import Introduction from "./pages/Introduction";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/user/1")
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-emerald-200 flex flex-col">
        <Navbar user={user} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
            <div className="container mx-auto max-w-7xl">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/introduction" element={<Introduction />} />
                <Route path="/category/:category" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/learn/:topicId" element={<TopicLearning />} />
                <Route path="/practice/:topicId" element={<Practice />} />
                <Route path="/mock-test" element={<MockTest />} />
              </Routes>
              <Footer />
            </div>
          </main>
        </div>
        <FloatingNav />
      </div>
    </Router>
  );
}
