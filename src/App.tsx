import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import TalkView from "./components/TalkView";
import HistoryView from "./components/HistoryView";
import LibraryView from "./components/LibraryView";
import SettingsView from "./components/SettingsView";
import { Persona, VoiceSettings, Conversation } from "./types";
import { PERSONAS, INITIAL_CONVERSATIONS } from "./data";

const DEFAULT_SETTINGS: VoiceSettings = {
  voicePersona: "Nova",
  speakingRate: 1.0,
  voicePitch: 0,
  shareUsageData: true,
  autoplayResponses: true,
  language: "en-US",
};

const USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDBlCa4gkIFwEUGDn_6VvYI53Dyzp04flTNbBXqdlDZcZ7R2mSnN3XSX1EnpsLZ0vJwl8aX3lnjZEGwhCLfeWz-Xf64eKlOaa8dFpXQefkcwbFXmaEt1AUOPVfqtn1ZiualW5S7LZl05XnU2UCCLLoYzgIGkE-0VMbSwvKj0-3_lok7myyuaRXgKTe_mNujIoDwdKfwK_9IbRwVAmZyXX4pN8NS7VUtknVAhpxYtXjCB0lQWOW_AWhR";

export default function App() {
  const [activeTab, setActiveTab] = useState<"talk" | "history" | "library" | "settings">("talk");
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]); // Default to Nova
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // 1. Initial State Loading from LocalStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("luminous_settings");
    if (savedSettings) {
      try {
        setVoiceSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }

    const savedConversations = localStorage.getItem("luminous_conversations");
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
        } else {
          setConversations(INITIAL_CONVERSATIONS);
        }
      } catch (e) {
        console.error("Failed to parse conversations:", e);
        setConversations(INITIAL_CONVERSATIONS);
      }
    } else {
      setConversations(INITIAL_CONVERSATIONS);
    }

    const savedActivePersonaId = localStorage.getItem("luminous_active_persona_id");
    if (savedActivePersonaId) {
      const found = PERSONAS.find((p) => p.id === savedActivePersonaId);
      if (found) {
        setActivePersona(found);
      }
    }
  }, []);

  // 2. State Preservation to LocalStorage when states update
  useEffect(() => {
    if (voiceSettings !== DEFAULT_SETTINGS) {
      localStorage.setItem("luminous_settings", JSON.stringify(voiceSettings));
    }
  }, [voiceSettings]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("luminous_conversations", JSON.stringify(conversations));
    } else {
      localStorage.removeItem("luminous_conversations");
    }
  }, [conversations]);

  useEffect(() => {
    if (activePersona) {
      localStorage.setItem("luminous_active_persona_id", activePersona.id);
    }
  }, [activePersona]);

  // Clear all conversations callback
  const clearAllConversations = () => {
    setConversations([]);
    setActiveConversationId(null);
    localStorage.removeItem("luminous_conversations");
  };

  // Render view depending on the active tab
  const renderActiveView = () => {
    switch (activeTab) {
      case "talk":
        return (
          <TalkView
            activePersona={activePersona}
            voiceSettings={voiceSettings}
            conversations={conversations}
            setConversations={setConversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            setActiveTab={setActiveTab}
          />
        );
      case "history":
        return (
          <HistoryView
            conversations={conversations}
            setConversations={setConversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            setActiveTab={setActiveTab}
          />
        );
      case "library":
        return (
          <LibraryView
            activePersona={activePersona}
            setActivePersona={setActivePersona}
          />
        );
      case "settings":
        return (
          <SettingsView
            voiceSettings={voiceSettings}
            setVoiceSettings={setVoiceSettings}
            clearAllConversations={clearAllConversations}
          />
        );
      default:
        return (
          <TalkView
            activePersona={activePersona}
            voiceSettings={voiceSettings}
            conversations={conversations}
            setConversations={setConversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans overflow-x-hidden">
      
      {/* Background Soft Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#222a3d]/40 via-[#0b1326] to-[#060e20]" />
      
      {/* Shared Navigation (Header + Left Sidebar + Mobile Bottom bar) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userAvatar={USER_AVATAR}
      />

      {/* Screen view content container */}
      <div className="flex-1 flex flex-col w-full relative z-10">
        {renderActiveView()}
      </div>

    </div>
  );
}
