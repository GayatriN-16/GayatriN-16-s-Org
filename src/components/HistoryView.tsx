import React, { useState } from "react";
import { Search, Brain, Cpu, Sparkles, Heart, Trash2, ArrowLeft, Send, MessageSquare, Clock } from "lucide-react";
import { Conversation, Message, Persona } from "../types";
import { PERSONAS } from "../data";

interface HistoryViewProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  setActiveTab: (tab: "talk" | "history" | "library" | "settings") => void;
}

export default function HistoryView({
  conversations,
  setConversations,
  activeConversationId,
  setActiveConversationId,
  setActiveTab,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Helper to map personaId to icon and colors
  const getPersonaMetaData = (personaId: string) => {
    const persona = PERSONAS.find((p) => p.id === personaId);
    if (!persona) {
      return {
        icon: <Brain className="w-5 h-5 text-[#89ceff]" />,
        bgColor: "bg-[#89ceff]/15",
        borderColor: "border-[#89ceff]/20",
        name: "Assistant",
      };
    }

    let iconEl = <Sparkles className="w-5 h-5 text-[#ffd8e7]" />;
    if (persona.icon === "Cpu") {
      iconEl = <Cpu className="w-5 h-5 text-[#89ceff]" />;
    } else if (persona.icon === "Heart") {
      iconEl = <Heart className="w-5 h-5 text-[#c0c1ff]" />;
    }

    return {
      icon: iconEl,
      bgColor: persona.bgColor,
      borderColor: persona.themeColor,
      name: persona.name,
    };
  };

  // Delete conversation log
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open drawer
    const confirmed = window.confirm("Are you sure you want to delete this conversation log? This action is irreversible.");
    if (!confirmed) return;

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    if (selectedConv?.id === id) {
      setSelectedConv(null);
    }
  };

  // Reply to selected conversation
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    setIsReplying(true);
    const text = replyText;
    setReplyText("");

    const userMsg: Message = {
      id: `msg-u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...selectedConv.messages, userMsg];
    const updatedConv = {
      ...selectedConv,
      messages: updatedMessages,
    };

    // Update main state
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== selectedConv.id);
      return [updatedConv, ...filtered];
    });
    setSelectedConv(updatedConv);

    try {
      const persona = PERSONAS.find((p) => p.id === selectedConv.personaId);
      const systemInstruction = persona ? persona.systemInstruction : "";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: selectedConv.messages,
          systemInstruction,
        }),
      });

      if (!response.ok) throw new Error("Reply response failed.");

      const data = await response.json();
      const modelMsg: Message = {
        id: `msg-m-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalMessages = [...updatedMessages, modelMsg];
      const finalConv = {
        ...updatedConv,
        messages: finalMessages,
        summary: data.text.length > 100 ? data.text.substring(0, 100) + "..." : data.text,
      };

      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== selectedConv.id);
        return [finalConv, ...filtered];
      });
      setSelectedConv(finalConv);
    } catch (err) {
      console.error(err);
      alert("Failed to send reply. Please verify your GEMINI_API_KEY connection.");
    } finally {
      setIsReplying(false);
    }
  };

  // Filters conversations by query
  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      c.summary.toLowerCase().includes(query) ||
      c.messages.some((m) => m.text.toLowerCase().includes(query))
    );
  });

  const todayConversations = filteredConversations.filter((c) => c.category === "Today");
  const yesterdayConversations = filteredConversations.filter((c) => c.category === "Yesterday" || c.category === "Older");

  return (
    <main className="flex-1 pt-20 pb-28 px-4 md:pl-28 md:pr-8 max-w-4xl mx-auto w-full relative">
      
      {/* Search Input Box */}
      <section className="w-full relative group mb-8 pt-4">
        <div className="relative flex items-center w-full border-b border-[#464554]/50 focus-within:border-[#8083ff] transition-all duration-300 pb-2">
          <Search className="w-5 h-5 text-[#c7c4d7] absolute left-2 group-focus-within:text-[#8083ff] transition-colors" />
          <input
            className="w-full bg-transparent border-none outline-none pl-10 pr-4 text-base text-white placeholder-[#c7c4d7]/60 focus:ring-0"
            placeholder="Search conversations..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#8083ff] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left shadow-[0_0_10px_rgba(128,131,255,0.5)]"></div>
      </section>

      {/* History Lists */}
      <section className="flex flex-col gap-6">
        
        {/* Today Group */}
        {todayConversations.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 py-2">
              <h2 className="text-[10px] font-bold text-[#8083ff] uppercase tracking-widest font-label-md">Today</h2>
              <div className="h-[1px] flex-grow bg-gradient-to-r from-[#464554]/30 to-transparent"></div>
            </div>

            {todayConversations.map((conv) => {
              const meta = getPersonaMetaData(conv.personaId);
              return (
                <article
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className="bg-[#131b2e]/40 backdrop-blur-md rounded-2xl p-4 flex gap-4 items-start border border-[#464554]/10 hover:bg-[#222a3d]/50 hover:border-[#8083ff]/30 transition-all duration-300 cursor-pointer group shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-full ${meta.bgColor} ${meta.borderColor} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-300 shadow-inner`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm text-white truncate pr-4 group-hover:text-[#8083ff] transition-colors">
                        {conv.title}
                      </h3>
                      <span className="text-[10px] text-[#c7c4d7]/60 font-label-md whitespace-nowrap">{conv.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#c7c4d7]/80 leading-relaxed line-clamp-2">
                      {conv.summary}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="p-1.5 rounded-full text-[#c7c4d7]/40 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* Yesterday/Older Group */}
        {yesterdayConversations.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 py-2 mt-4">
              <h2 className="text-[10px] font-bold text-[#c7c4d7]/60 uppercase tracking-widest font-label-md">Yesterday</h2>
              <div className="h-[1px] flex-grow bg-gradient-to-r from-[#464554]/20 to-transparent"></div>
            </div>

            {yesterdayConversations.map((conv) => {
              const meta = getPersonaMetaData(conv.personaId);
              return (
                <article
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className="bg-[#131b2e]/30 backdrop-blur-md rounded-2xl p-4 flex gap-4 items-start border border-[#464554]/5 hover:bg-[#222a3d]/40 hover:border-[#8083ff]/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-full ${meta.bgColor} ${meta.borderColor} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-300`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm text-white truncate pr-4 group-hover:text-[#8083ff] transition-colors">
                        {conv.title}
                      </h3>
                      <span className="text-[10px] text-[#c7c4d7]/60 font-label-md whitespace-nowrap">{conv.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#c7c4d7]/70 leading-relaxed line-clamp-2">
                      {conv.summary}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="p-1.5 rounded-full text-[#c7c4d7]/40 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-[#c7c4d7]/60">
            <span className="material-symbols-outlined text-4xl mb-3 text-[#464554]">folder_open</span>
            <p className="text-sm">No conversations found.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-[#8083ff] mt-1 hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </section>

      {/* Transcript Detail Slide-Out Side-Drawer */}
      {selectedConv && (
        <div className="fixed inset-0 bg-[#060e20]/80 backdrop-blur-sm z-[100] flex justify-end animate-fade-in">
          
          {/* Dismiss Back-pane */}
          <div className="absolute inset-0" onClick={() => setSelectedConv(null)} />

          {/* Drawer Body */}
          <div className="w-full max-w-xl bg-[#0b1326] border-l border-[#464554]/30 h-full shadow-2xl relative z-10 flex flex-col justify-between animate-slide-left">
            
            {/* Drawer Header */}
            <div className="p-4 md:p-6 border-b border-[#464554]/20 flex items-center justify-between bg-[#131b2e]/40">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConv(null)}
                  className="p-2 rounded-full hover:bg-[#2d3449]/60 text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="font-semibold text-base text-white line-clamp-1">{selectedConv.title}</h2>
                  <p className="text-[10px] uppercase font-label-md text-[#8083ff] tracking-wider mt-0.5">
                    Profile: {getPersonaMetaData(selectedConv.personaId).name}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  handleDeleteConversation(selectedConv.id, e);
                  setSelectedConv(null);
                }}
                className="p-2.5 rounded-full text-red-400 hover:bg-red-400/10 transition-colors"
                title="Delete Conversation log"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Transcripts Bubble Stream */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
              {selectedConv.messages.length === 0 ? (
                <div className="text-center py-12 text-[#c7c4d7]/50 text-xs">No messages yet.</div>
              ) : (
                selectedConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] rounded-2xl p-4 border ${
                      msg.role === "user"
                        ? "self-end bg-[#8083ff]/10 border-[#8083ff]/30 text-[#dae2fd]"
                        : "self-start bg-[#171f33] border-[#464554]/30 text-white"
                    }`}
                  >
                    <div className="flex justify-between items-baseline gap-4 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === "user" ? "text-[#c0c1ff]" : "text-[#89ceff]"}`}>
                        {msg.role === "user" ? "You" : getPersonaMetaData(selectedConv.personaId).name}
                      </span>
                      <span className="text-[10px] text-[#c7c4d7]/50">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Quick Reply Form */}
            <div className="p-4 border-t border-[#464554]/20 bg-[#131b2e]/60 backdrop-blur-md">
              <form onSubmit={handleSendReply} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Continue discussion...`}
                  className="flex-1 bg-[#0b1326] border border-[#464554]/40 rounded-full px-4 py-2.5 text-sm text-white placeholder-[#c7c4d7]/40 focus:outline-none focus:border-[#8083ff] focus:ring-0"
                  disabled={isReplying}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isReplying}
                  className="p-3 bg-[#8083ff] text-white rounded-full hover:bg-[#494bd6] disabled:bg-[#464554]/30 disabled:text-gray-500 transition-colors flex items-center justify-center flex-shrink-0"
                >
                  {isReplying ? (
                    <div className="w-4 h-4 border-2 border-t-white border-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <div className="flex justify-between items-center mt-2.5 px-1">
                <span className="text-[10px] text-[#c7c4d7]/50 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Real-time synchronization active
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveConversationId(selectedConv.id);
                    setActiveTab("talk");
                  }}
                  className="text-[10px] text-[#8083ff] font-semibold hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  Open in Voice Center
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
