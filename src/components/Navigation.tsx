import React from "react";
import { Mic, History, Brain, Settings } from "lucide-react";

interface NavigationProps {
  activeTab: "talk" | "history" | "library" | "settings";
  setActiveTab: (tab: "talk" | "history" | "library" | "settings") => void;
  userAvatar: string;
}

export default function Navigation({ activeTab, setActiveTab, userAvatar }: NavigationProps) {
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 bg-[#0b1326]/80 backdrop-blur-xl border-b border-[#464554]/20 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#464554]/30 flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              src={userAvatar}
              alt="User Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-[#c0c1ff] to-[#89ceff] bg-clip-text text-transparent">
            Luminous AI
          </span>
        </div>

        {/* Desktop Quick Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131b2e] rounded-full p-1 border border-[#464554]/40">
          <button
            onClick={() => setActiveTab("talk")}
            className={`px-4 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-all duration-300 ${
              activeTab === "talk"
                ? "bg-[#8083ff] text-white shadow-[0_0_15px_rgba(128,131,255,0.4)]"
                : "text-[#c7c4d7] hover:bg-[#2d3449]/50 hover:text-white"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Talk
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-all duration-300 ${
              activeTab === "history"
                ? "bg-[#8083ff] text-white shadow-[0_0_15px_rgba(128,131,255,0.4)]"
                : "text-[#c7c4d7] hover:bg-[#2d3449]/50 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-all duration-300 ${
              activeTab === "library"
                ? "bg-[#8083ff] text-white shadow-[0_0_15px_rgba(128,131,255,0.4)]"
                : "text-[#c7c4d7] hover:bg-[#2d3449]/50 hover:text-white"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Library
          </button>
        </nav>

        <button
          onClick={() => setActiveTab("settings")}
          className={`p-2 rounded-full transition-all duration-300 active:scale-95 text-[#c7c4d7] hover:bg-[#222a3d] hover:text-white ${
            activeTab === "settings" ? "bg-[#222a3d] text-white" : ""
          }`}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 transition-transform duration-500 hover:rotate-45" />
        </button>
      </header>

      {/* Desktop Sidenv (Left) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-24 bg-[#060e20]/90 backdrop-blur-2xl z-40 gap-6 border-r border-[#464554]/10">
        <button
          onClick={() => setActiveTab("talk")}
          className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 transition-all duration-300 active:scale-95 hover:scale-105 ${
            activeTab === "talk"
              ? "bg-[#8083ff] text-white shadow-lg shadow-[#8083ff]/30"
              : "text-[#c7c4d7] hover:bg-[#2d3449]/40"
          }`}
          title="Talk"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 transition-all duration-300 active:scale-95 hover:scale-105 ${
            activeTab === "history"
              ? "bg-[#8083ff] text-white shadow-lg shadow-[#8083ff]/30"
              : "text-[#c7c4d7] hover:bg-[#2d3449]/40"
          }`}
          title="History"
        >
          <History className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab("library")}
          className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 transition-all duration-300 active:scale-95 hover:scale-105 ${
            activeTab === "library"
              ? "bg-[#8083ff] text-white shadow-lg shadow-[#8083ff]/30"
              : "text-[#c7c4d7] hover:bg-[#2d3449]/40"
          }`}
          title="Persona Library"
        >
          <Brain className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 transition-all duration-300 active:scale-95 hover:scale-105 mt-auto mb-4 ${
            activeTab === "settings"
              ? "bg-[#8083ff] text-white shadow-lg shadow-[#8083ff]/30"
              : "text-[#c7c4d7] hover:bg-[#2d3449]/40"
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </aside>

      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-5 pt-2.5 bg-[#060e20]/95 backdrop-blur-2xl rounded-t-2xl border-t border-[#464554]/15 shadow-2xl">
        <button
          onClick={() => setActiveTab("talk")}
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 ${
            activeTab === "talk"
              ? "bg-[#8083ff] text-white rounded-full px-5 py-1 shadow-[0_0_15px_rgba(128,131,255,0.3)]"
              : "text-[#c7c4d7] p-2 hover:bg-[#2d3449]/30 rounded-lg"
          }`}
        >
          <Mic className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-wide">Talk</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 ${
            activeTab === "history"
              ? "bg-[#8083ff] text-white rounded-full px-5 py-1 shadow-[0_0_15px_rgba(128,131,255,0.3)]"
              : "text-[#c7c4d7] p-2 hover:bg-[#2d3449]/30 rounded-lg"
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-wide">History</span>
        </button>

        <button
          onClick={() => setActiveTab("library")}
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 ${
            activeTab === "library"
              ? "bg-[#8083ff] text-white rounded-full px-5 py-1 shadow-[0_0_15px_rgba(128,131,255,0.3)]"
              : "text-[#c7c4d7] p-2 hover:bg-[#2d3449]/30 rounded-lg"
          }`}
        >
          <Brain className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-wide">Library</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 ${
            activeTab === "settings"
              ? "bg-[#8083ff] text-white rounded-full px-5 py-1 shadow-[0_0_15px_rgba(128,131,255,0.3)]"
              : "text-[#c7c4d7] p-2 hover:bg-[#2d3449]/30 rounded-lg"
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-wide">Settings</span>
        </button>
      </nav>
    </>
  );
}
