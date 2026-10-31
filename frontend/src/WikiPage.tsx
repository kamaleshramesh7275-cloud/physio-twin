import React from "react";
import { Sidebar } from "./components/Sidebar";
import { BookOpen, Search, Play, FileText, ChevronRight } from "lucide-react";

export default function WikiPage() {
  const articles = [
    { title: "The Functional Anatomy of the Knee & Meniscus", category: "Anatomy", type: "article", readTime: "5 min" },
    { title: "ACL Reconstruction: What to Expect in Phase 2", category: "Surgery", type: "video", readTime: "12 min" },
    { title: "Understanding Bilateral Force Asymmetry & Ground Contact", category: "Biomechanics", type: "article", readTime: "8 min" },
    { title: "Phase 3: Return to Running & Agility Protocol", category: "Rehab Phases", type: "article", readTime: "10 min" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900">
              <BookOpen className="w-6 h-6 text-blue-600" /> Educational Wiki &amp; Guides
            </h1>
            <p className="text-slate-500 text-sm mt-1">Clinical biomechanics, surgical recovery timelines, and movement protocols.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-3 space-y-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for anatomical models, conditions, or return-to-sport protocols..." 
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article, i) => (
                <div key={i} className="card bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between p-6 rounded-2xl group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge badge-purple text-[10px]">{article.category}</span>
                      {article.type === 'video' ? <Play className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" /> : <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{article.title}</h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>{article.readTime}</span>
                    <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center font-bold">Read <ChevronRight className="w-3.5 h-3.5 ml-0.5" /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-white border border-slate-200 shadow-sm p-6 space-y-3 rounded-2xl">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-3">Knowledge Tracks</h3>
              {["Anatomy Models", "Surgical Procedures", "Rehab Phases", "Biomechanics 101", "Nutrition & Tissue"].map((cat, i) => (
                <div key={i} className="text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between">
                  {cat}
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
