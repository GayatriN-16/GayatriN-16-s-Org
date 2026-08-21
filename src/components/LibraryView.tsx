import React, { useState } from "react";
import { Sparkles, Cpu, Heart, Compass, Lock, ArrowRight, Check } from "lucide-react";
import { Persona } from "../types";
import { PERSONAS } from "../data";

interface LibraryViewProps {
  activePersona: Persona;
  setActivePersona: (persona: Persona) => void;
}

export default function LibraryView({ activePersona, setActivePersona }: LibraryViewProps) {
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  const handleSelectPersona = (p: Persona) => {
    if (p.locked) {
      alert("Orion Strategy Matrix: Orion is a premium analytical profile. Upgrade to Pro Tier under settings or contact support to unlock structural macro-planning models.");
      return;
    }
    setActivePersona(p);
    setSuccessAlert(p.name);
    setTimeout(() => {
      setSuccessAlert(null);
    }, 3000);
  };

  // Helper to render Lucide Icons by name
  const renderPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-[#ffafd3]" />;
      case "Cpu":
        return <Cpu className="w-6 h-6 text-[#89ceff]" />;
      case "Heart":
        return <Heart className="w-6 h-6 text-[#c0c1ff]" />;
      case "Compass":
        return <Compass className="w-6 h-6 text-gray-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-white" />;
    }
  };

  return (
    <main className="flex-grow pt-20 pb-28 px-4 md:pl-28 md:pr-8 max-w-7xl mx-auto w-full">
      
      {/* Dynamic Persona Switched Alert Banner */}
      {successAlert && (
        <div className="fixed top-20 right-4 z-[99] bg-[#171f33] border border-[#8083ff]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-left">
          <div className="w-5 h-5 rounded-full bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs">
            Specialized in <strong className="text-[#8083ff]">{successAlert}</strong> cognitive traits successfully.
          </span>
        </div>
      )}

      {/* Header Description */}
      <div className="mb-10 text-center md:text-left pt-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Persona Library</h2>
        <p className="text-sm md:text-base text-[#c7c4d7] max-w-2xl">
          Select a cognitive profile to specialize your interaction. Each persona is tuned with distinct analytical, tone, and conversational traits.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PERSONAS.map((p) => {
          const isActive = p.id === activePersona.id;
          const isLocked = p.locked;

          return (
            <article
              key={p.id}
              onClick={() => handleSelectPersona(p)}
              className={`glass-card rounded-3xl p-1 relative overflow-hidden group cursor-pointer transition-all duration-300 ${
                isLocked ? "opacity-60 grayscale hover:grayscale-0" : ""
              }`}
            >
              {/* Custom ambient radial backlighting */}
              <div 
                className={`absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none ${
                  p.id === "nova" 
                    ? "ambient-glow-nova" 
                    : p.id === "atlas" 
                    ? "ambient-glow-atlas" 
                    : "ambient-glow-lyra"
                }`} 
              />

              {/* Card Foreground */}
              <div className="bg-[#131b2e]/80 rounded-[20px] p-6 h-full flex flex-col relative z-10 border border-[#464554]/20 justify-between">
                
                {/* Meta details */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-[#464554]/30 ${p.bgColor}`}>
                      {renderPersonaIcon(p.icon)}
                    </div>
                    {isActive ? (
                      <span className="px-3 py-1 rounded-full bg-[#171f33] border border-[#ffd8e7]/30 text-[10px] font-semibold text-[#ffd8e7] flex items-center gap-1.5 font-label-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffafd3] shadow-[0_0_8px_rgba(255,175,211,0.8)] animate-ping" />
                        Active
                      </span>
                    ) : isLocked ? (
                      <span className="px-3 py-1 rounded-full bg-[#131b2e] border border-gray-500/30 text-[10px] text-gray-400 flex items-center gap-1 font-label-md">
                        <Lock className="w-3 h-3" />
                        Pro Only
                      </span>
                    ) : null}
                  </div>

                  {/* Persona Title and Copywriting */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-0.5">{p.name}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${
                      p.id === "nova" ? "text-[#ffafd3]" : p.id === "atlas" ? "text-[#89ceff]" : "text-[#c0c1ff]"
                    }`}>
                      {p.title}
                    </p>
                    <p className="text-xs text-[#c7c4d7]/90 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Tags and Action CTAs */}
                <div>
                  <div className="flex gap-1.5 flex-wrap mb-5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-[#2d3449]/40 border border-[#464554]/20 text-[10px] text-[#c7c4d7]/70 font-label-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {isActive ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ffd8e7]/20 to-[#ffafd3]/20 border border-[#ffafd3]/40 text-[#ffafd3] text-xs font-bold font-label-md cursor-default flex justify-center items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Currently Engaged
                    </button>
                  ) : isLocked ? (
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl bg-[#171f33]/40 border border-dashed border-[#464554]/40 text-gray-500 text-xs font-semibold hover:border-gray-400 hover:text-white transition-all cursor-pointer flex justify-center items-center gap-1.5"
                    >
                      Unlock with Pro
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex justify-center items-center gap-1.5 ${
                        p.id === "nova"
                          ? "bg-[#ffafd3] text-[#620040] hover:bg-[#ffd8e7]"
                          : p.id === "atlas"
                          ? "bg-[#89ceff] text-[#00344d] hover:bg-[#c9e6ff]"
                          : "bg-[#c0c1ff] text-[#1000a9] hover:bg-[#e1e0ff]"
                      }`}
                    >
                      Specialize in {p.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            </article>
          );
        })}
      </div>

    </main>
  );
}
