import React, { useState } from "react";
import { Mic, ShieldAlert, Check, HelpCircle, Globe, Volume2, Sparkles, Trash } from "lucide-react";
import { VoiceSettings } from "../types";

interface SettingsViewProps {
  voiceSettings: VoiceSettings;
  setVoiceSettings: (settings: VoiceSettings) => void;
  clearAllConversations: () => void;
}

export default function SettingsView({
  voiceSettings,
  setVoiceSettings,
  clearAllConversations,
}: SettingsViewProps) {
  // Local form states (optimistic edits before saving)
  const [formVoice, setFormVoice] = useState(voiceSettings.voicePersona);
  const [formRate, setFormRate] = useState(voiceSettings.speakingRate);
  const [formPitch, setFormPitch] = useState(voiceSettings.voicePitch);
  const [formShare, setFormShare] = useState(voiceSettings.shareUsageData);
  const [formAutoplay, setFormAutoplay] = useState(voiceSettings.autoplayResponses);
  const [formLang, setFormLang] = useState(voiceSettings.language);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setVoiceSettings({
      voicePersona: formVoice,
      speakingRate: formRate,
      voicePitch: formPitch,
      shareUsageData: formShare,
      autoplayResponses: formAutoplay,
      language: formLang,
    });
    setToastMessage("Settings successfully saved.");
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRevert = () => {
    setFormVoice(voiceSettings.voicePersona);
    setFormRate(voiceSettings.speakingRate);
    setFormPitch(voiceSettings.voicePitch);
    setFormShare(voiceSettings.shareUsageData);
    setFormAutoplay(voiceSettings.autoplayResponses);
    setFormLang(voiceSettings.language);
    setToastMessage("Changes reverted back to saved state.");
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleClearData = () => {
    const doubleConfirmed = window.confirm(
      "CRITICAL: Are you absolutely sure you want to delete all conversation transcripts and voice caches? This cannot be undone."
    );
    if (doubleConfirmed) {
      clearAllConversations();
      alert("Transcripts cleared successfully.");
    }
  };

  // Convert pitch rating into a friendly UI string
  const getPitchLabel = (pitch: number) => {
    if (pitch === 0) return "Neutral";
    if (pitch > 0 && pitch <= 4) return "Warm";
    if (pitch > 4) return "Expressive";
    if (pitch < 0 && pitch >= -4) return "Deep";
    return "Resonant";
  };

  return (
    <main className="flex-grow pt-20 pb-32 px-4 md:pl-28 md:pr-8 max-w-4xl mx-auto w-full relative z-10">
      
      {/* Ambient Radial background glows */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-gradient-to-t from-[#8083ff]/10 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Floating Success Alert Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[99] bg-[#171f33] border border-[#8083ff]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-left">
          <div className="w-5 h-5 rounded-full bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Header Title Section */}
      <div className="mb-8 pt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Settings</h1>
        <p className="text-sm text-[#c7c4d7]">
          Manage your AI agent's behavior, voice profile, and privacy constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Voice Preferences Section (Large span) */}
        <section className="glass-card rounded-2xl p-6 md:col-span-2 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#464554]/30 pb-4">
            <Volume2 className="w-5 h-5 text-[#89ceff]" />
            <h2 className="font-semibold text-base text-white">Voice Preferences</h2>
          </div>

          {/* Voice Persona Selection Button Matrix */}
          <div className="flex flex-col gap-3">
            <label className="text-xs text-[#c7c4d7]/80 font-semibold tracking-wide uppercase font-label-md">
              Voice Persona
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Nova", "Echo", "Aura", "Orion"].map((name) => {
                const isSelected = formVoice === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormVoice(name)}
                    className={`py-3 px-4 rounded-full border text-xs font-semibold font-label-md transition-all duration-300 active:scale-95 ${
                      isSelected
                        ? "border-[#8083ff] bg-[#8083ff]/15 text-[#c0c1ff] shadow-[0_0_15px_rgba(128,131,255,0.15)]"
                        : "border-[#464554]/40 bg-[#0b1326] text-white hover:bg-[#2d3449]/50"
                    }`}
                  >
                    {name} {name === "Nova" ? "(Default)" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed / Speaking Rate Slider */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[#c7c4d7]/80 font-semibold tracking-wide uppercase font-label-md">
                Speaking Rate
              </label>
              <span className="text-xs font-semibold text-[#89ceff] font-label-md">
                {formRate.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={formRate}
              onChange={(e) => setFormRate(parseFloat(e.target.value))}
              className="w-full h-1 cursor-pointer bg-[#2d3449] rounded-lg appearance-none"
            />
          </div>

          {/* Voice Pitch Slider */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[#c7c4d7]/80 font-semibold tracking-wide uppercase font-label-md">
                Voice Pitch
              </label>
              <span className="text-xs font-semibold text-[#89ceff] font-label-md">
                {getPitchLabel(formPitch)}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={formPitch}
              onChange={(e) => setFormPitch(parseInt(e.target.value))}
              className="w-full h-1 cursor-pointer bg-[#2d3449] rounded-lg appearance-none"
            />
          </div>
        </section>

        {/* Privacy Section */}
        <section className="glass-card rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#464554]/30 pb-4">
            <ShieldAlert className="w-5 h-5 text-[#ffafd3]" />
            <h2 className="font-semibold text-base text-white">Privacy Constraints</h2>
          </div>

          {/* Share Usage Toggle (Styled Switch) */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-medium text-white">Share Usage Data</span>
              <span className="text-xs text-[#c7c4d7]/60 mt-0.5">
                Improve cognitive intelligence models securely
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFormShare(!formShare)}
              className={`w-12 h-6 flex-shrink-0 rounded-full transition-all duration-300 relative border ${
                formShare
                  ? "bg-[#8083ff]/30 border-[#8083ff]"
                  : "bg-[#2d3449]/40 border-[#464554]/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform duration-300 absolute top-0.5 left-0.5 ${
                  formShare ? "translate-x-6 bg-[#c0c1ff]" : "bg-gray-400"
                }`}
              />
            </button>
          </div>

          {/* Clear Transcripts Action */}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#464554]/10">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-medium text-red-400">Clear Logs</span>
              <span className="text-xs text-[#c7c4d7]/60 mt-0.5">
                Instantly wipe all transcript caches
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearData}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
              title="Delete Cache"
            >
              <Trash className="w-4.5 h-4.5" />
            </button>
          </div>
        </section>

        {/* General Section */}
        <section className="glass-card rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#464554]/30 pb-4">
            <Globe className="w-5 h-5 text-[#c0c1ff]" />
            <h2 className="font-semibold text-base text-white">General Setup</h2>
          </div>

          {/* Language Selection */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white">Language</span>
            <select
              value={formLang}
              onChange={(e) => setFormLang(e.target.value)}
              className="bg-[#131b2e] border border-[#464554]/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#8083ff]"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="fr-FR">French (France)</option>
              <option value="de-DE">German (Germany)</option>
              <option value="ja-JP">Japanese (Japan)</option>
            </select>
          </div>

          {/* Auto-Play Responses Toggle */}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#464554]/10">
            <div className="flex flex-col pr-4">
              <span className="text-sm font-medium text-white">Auto-play Responses</span>
              <span className="text-xs text-[#c7c4d7]/60 mt-0.5">
                Automatically read back Gemini output spoken words
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFormAutoplay(!formAutoplay)}
              className={`w-12 h-6 flex-shrink-0 rounded-full transition-all duration-300 relative border ${
                formAutoplay
                  ? "bg-[#8083ff]/30 border-[#8083ff]"
                  : "bg-[#2d3449]/40 border-[#464554]/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform duration-300 absolute top-0.5 left-0.5 ${
                  formAutoplay ? "translate-x-6 bg-[#c0c1ff]" : "bg-gray-400"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Action Triggers (Revert & Save Changes) */}
        <div className="md:col-span-2 flex justify-end gap-3.5 mt-4">
          <button
            type="button"
            onClick={handleRevert}
            className="px-6 py-2.5 rounded-full text-xs font-semibold font-label-md text-white bg-[#222a3d] hover:bg-[#2d3449] active:scale-95 transition-all duration-300"
          >
            Revert Changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full text-xs font-semibold font-label-md text-white bg-[#8083ff] hover:bg-[#494bd6] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(128,131,255,0.4)] hover:shadow-[0_0_30px_rgba(128,131,255,0.6)]"
          >
            Save Changes
          </button>
        </div>

      </div>

    </main>
  );
}
