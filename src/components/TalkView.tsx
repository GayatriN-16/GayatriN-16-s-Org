import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, AlertCircle, Volume2, Keyboard, MessageSquare, History } from "lucide-react";
import { Persona, VoiceSettings, Message, Conversation } from "../types";

interface TalkViewProps {
  activePersona: Persona;
  voiceSettings: VoiceSettings;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  setActiveTab: (tab: "talk" | "history" | "library" | "settings") => void;
}

export default function TalkView({
  activePersona,
  voiceSettings,
  conversations,
  setConversations,
  activeConversationId,
  setActiveConversationId,
  setActiveTab,
}: TalkViewProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  // References for Speech Recognition & Audio
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Greeting based on time
  const [greeting, setGreeting] = useState("Good evening.");
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good morning.");
    } else if (hours >= 12 && hours < 17) {
      setGreeting("Good afternoon.");
    } else {
      setGreeting("Good evening.");
    }
  }, []);

  // Initialize Web Speech APIs
  useEffect(() => {
    // 1. Speech Recognition Setup
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = voiceSettings.language || "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setTranscriptText("Listening closely...");
        setApiError(null);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setTranscriptText(`" ${resultText} "`);
          handleSendMessage(resultText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setApiError("Microphone permission denied. Please allow mic access or use keyboard typing.");
        } else {
          setApiError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    // 2. Speech Synthesis Setup
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [voiceSettings.language]);

  // Handle TTS playback
  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // Stop current speech

    // Remove markdown symbols from spoken text to make speech natural
    const cleanText = text
      .replace(/[\*\#\`\-\_]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Find custom voices based on persona name or setting
    const voices = synthRef.current.getVoices();
    let selectedVoice = voices.find((v) =>
      v.name.toLowerCase().includes(voiceSettings.voicePersona.toLowerCase())
    );

    if (!selectedVoice) {
      // Default voice backup
      selectedVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = voiceSettings.speakingRate;
    // Map pitch from slider [-10 to 10] to speechSynthesis pitch [0.5 to 2.0]
    const pitchVal = 1 + voiceSettings.voicePitch / 20;
    utterance.pitch = Math.min(Math.max(pitchVal, 0.5), 2.0);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Toggle voice capture
  const handleToggleVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Stop playing anything
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
          // Retry
          recognitionRef.current.abort();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      } else {
        setApiError("Web Speech API is not supported in this browser. Please use keyboard mode!");
        setShowKeyboardInput(true);
      }
    }
  };

  // Process message submission
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setApiError(null);
    setIsProcessing(true);

    // Find or create active conversation
    let currentConvId = activeConversationId;
    let currentConv = conversations.find((c) => c.id === currentConvId);

    if (!currentConv) {
      // Create new conversation
      const newId = `conv-${Date.now()}`;
      currentConv = {
        id: newId,
        title: text.length > 25 ? text.substring(0, 25) + "..." : text,
        personaId: activePersona.id,
        messages: [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        summary: "Conversational briefing with " + activePersona.name,
        category: "Today",
      };
      currentConvId = newId;
      setActiveConversationId(newId);
    }

    // Add User Message to local state immediately
    const userMsg: Message = {
      id: `msg-u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...currentConv.messages, userMsg];
    
    // Optimistic update of state
    const updatedConv = {
      ...currentConv,
      messages: updatedMessages,
      title: currentConv.messages.length === 0 ? (text.length > 30 ? text.substring(0, 30) + "..." : text) : currentConv.title,
    };

    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== currentConvId);
      return [updatedConv, ...filtered];
    });

    try {
      // Call server backend proxying Gemini
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: currentConv.messages,
          systemInstruction: activePersona.systemInstruction,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server model response error.");
      }

      const data = await response.json();
      const modelReply = data.text;

      // Add Model Message
      const modelMsg: Message = {
        id: `msg-m-${Date.now()}`,
        role: "model",
        text: modelReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalMessages = [...updatedMessages, modelMsg];
      const finalConv = {
        ...updatedConv,
        messages: finalMessages,
        summary: modelReply.length > 100 ? modelReply.substring(0, 100) + "..." : modelReply,
      };

      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== currentConvId);
        return [finalConv, ...filtered];
      });

      setTranscriptText(modelReply);

      // Play audio response if auto-play is enabled
      if (voiceSettings.autoplayResponses) {
        speakText(modelReply);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Something went wrong. Please check your network connection.");
    } finally {
      setIsProcessing(false);
      setTextInput("");
    }
  };

  // Get active conversation messages
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messagesList = activeConversation ? activeConversation.messages : [];

  return (
    <main className="flex-1 flex flex-col items-center justify-start pt-20 pb-32 px-4 md:pl-28 md:pr-8 max-w-5xl mx-auto w-full relative z-10 bg-ambient">
      
      {/* Active Persona Banner Indicator */}
      <div className="mt-4 mb-4 flex items-center gap-2 bg-[#171f33]/60 border border-[#464554]/30 rounded-full px-4 py-1.5 backdrop-blur-md animate-fade-in text-xs text-[#dae2fd]/80">
        <Sparkles className="w-3.5 h-3.5 text-[#ffd8e7] animate-pulse" />
        <span>Active Profile: <strong className="text-white">{activePersona.name} {activePersona.title}</strong></span>
        {conversations.length > 0 && activeConversationId && (
          <button 
            onClick={() => {
              setActiveConversationId(null);
              setTranscriptText("");
              setApiError(null);
            }} 
            className="ml-3 px-2 py-0.5 rounded-full bg-[#2d3449]/80 text-[#89ceff] hover:bg-[#8083ff]/20 text-[10px]"
          >
            New Session
          </button>
        )}
      </div>

      {/* Welcome & Prompt Header */}
      <div className="text-center mb-6 opacity-90">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
          {greeting}
        </h1>
        <p className="text-base text-[#c7c4d7]">
          How can I assist you today?
        </p>
      </div>

      {/* Pulsating Voice Orb Container */}
      <div className="relative w-60 h-60 md:w-72 md:h-72 flex items-center justify-center mb-8">
        
        {/* Pulsating Glow Layers */}
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#8083ff] to-[#494bd6] mix-blend-screen opacity-70 transition-all duration-700 ${
            isListening 
              ? "scale-105 animate-pulse orb-glow" 
              : isProcessing 
              ? "scale-95 animate-spin duration-1000 bg-gradient-to-r from-[#ffd8e7] via-[#8083ff] to-[#89ceff]" 
              : "orb-glow"
          }`}
        />
        
        {/* Deep Core Light Source */}
        <div className="absolute w-1/2 h-1/2 rounded-full bg-[#c0c1ff] blur-2xl opacity-40 animate-pulse" />

        {/* Inner Interactive Ring */}
        <div className="w-44 h-44 md:w-56 md:h-56 rounded-full border border-white/10 bg-[#131b2e]/60 backdrop-blur-lg flex flex-col items-center justify-center z-10 transition-all duration-500 hover:scale-105">
          {isListening ? (
            // Equalizer Waveform Bars (Highly reactive animation)
            <div className="flex items-end justify-center gap-1.5 h-12 mb-2 px-4">
              <span className="w-1.5 bg-[#89ceff] rounded-full animate-bounce h-12" style={{ animationDelay: "0.1s" }} />
              <span className="w-1.5 bg-[#c0c1ff] rounded-full animate-bounce h-8" style={{ animationDelay: "0.3s" }} />
              <span className="w-1.5 bg-[#ffd8e7] rounded-full animate-bounce h-14" style={{ animationDelay: "0s" }} />
              <span className="w-1.5 bg-[#8083ff] rounded-full animate-bounce h-9" style={{ animationDelay: "0.5s" }} />
              <span className="w-1.5 bg-[#89ceff] rounded-full animate-bounce h-11" style={{ animationDelay: "0.2s" }} />
            </div>
          ) : isProcessing ? (
            // Spinner Indicator
            <div className="w-10 h-10 border-4 border-t-[#8083ff] border-[#222a3d] rounded-full animate-spin mb-2" />
          ) : (
            // Static Equalizer Graphic (Lucide icon animated softly)
            <Volume2 className="w-14 h-14 text-[#c0c1ff]/80 animate-pulse mb-1" />
          )}
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#c7c4d7] font-label-md">
            {isListening ? "Listening" : isProcessing ? "Thinking" : "Awaiting Voice"}
          </span>
        </div>
      </div>

      {/* System Errors or Warning Indicator */}
      {apiError && (
        <div className="max-w-md w-full mb-6 bg-[#93000a]/20 border border-[#93000a]/50 rounded-xl p-3.5 flex items-start gap-3 text-sm text-[#ffdad6]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#ffb4ab]" />
          <div>
            <p className="font-semibold text-xs uppercase tracking-wide">Connection Error</p>
            <p className="text-[#ffb4ab]/90 mt-0.5 text-xs">{apiError}</p>
          </div>
        </div>
      )}

      {/* Suggested Action Chips (Centered horizontally) */}
      {!isListening && !isProcessing && (
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-lg w-full">
          <button
            onClick={() => handleSendMessage("Summarize My Day")}
            className="px-4 py-2 rounded-full bg-[#171f33]/80 border border-[#464554]/40 text-sm text-[#c7c4d7] hover:bg-[#2d3449] hover:text-white hover:border-[#c0c1ff]/50 hover:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all duration-300 flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ffd8e7]" />
            Summarize My Day
          </button>
          <button
            onClick={() => handleSendMessage("Set an Alarm for 7:00 AM")}
            className="px-4 py-2 rounded-full bg-[#171f33]/80 border border-[#464554]/40 text-sm text-[#c7c4d7] hover:bg-[#2d3449] hover:text-white hover:border-[#c0c1ff]/50 hover:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all duration-300 flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">alarm</span>
            Set an Alarm
          </button>
          <button
            onClick={() => handleSendMessage("Play music")}
            className="px-4 py-2 rounded-full bg-[#171f33]/80 border border-[#464554]/40 text-sm text-[#c7c4d7] hover:bg-[#2d3449] hover:text-white hover:border-[#c0c1ff]/50 hover:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all duration-300 flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">music_note</span>
            Play Music
          </button>
        </div>
      )}

      {/* Voice Trigger Buttons or Keyboard Input Panel */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        {showKeyboardInput ? (
          // Text Input Box (Fallback mode)
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(textInput);
            }}
            className="w-full flex items-center gap-2 bg-[#171f33]/80 border border-[#464554]/40 rounded-full px-4 py-1.5 focus-within:border-[#8083ff] focus-within:shadow-[0_0_15px_rgba(128,131,255,0.15)] transition-all duration-300 backdrop-blur-md"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Send a message to ${activePersona.name}...`}
              className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-white placeholder-[#c7c4d7]/50 focus:ring-0"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="p-2 rounded-full bg-[#8083ff] text-white hover:bg-[#494bd6] transition-colors disabled:bg-[#464554]/30 disabled:text-gray-500 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowKeyboardInput(false)}
              className="p-2 rounded-full text-[#c7c4d7] hover:bg-[#222a3d] transition-colors"
              title="Switch to Voice Mode"
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>
        ) : (
          // Primary Hold to Speak Mic Trigger Button
          <div className="w-full flex items-center justify-center gap-2">
            <button
              onClick={handleToggleVoice}
              disabled={isProcessing}
              className={`flex-1 max-w-xs py-4 px-6 rounded-full font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-95 ${
                isListening
                  ? "bg-[#93000a] text-white shadow-[0_0_25px_rgba(147,0,10,0.5)] animate-pulse"
                  : "bg-gradient-to-r from-[#8083ff] to-[#494bd6] text-white shadow-[0_0_30px_rgba(128,131,255,0.4)] hover:shadow-[0_0_40px_rgba(128,131,255,0.6)] hover:scale-[1.02]"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Tap to Finish Speaking
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 animate-pulse" />
                  Hold to Speak
                </>
              )}
            </button>

            {/* Quick Keyboard toggle */}
            <button
              onClick={() => setShowKeyboardInput(true)}
              className="p-3.5 rounded-full bg-[#171f33] border border-[#464554]/40 text-[#c7c4d7] hover:bg-[#222a3d] hover:text-white transition-all duration-300 active:scale-95"
              title="Type with keyboard"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Live Transcript / Response Streaming Area */}
      {transcriptText && (
        <div className="w-full max-w-lg mt-8 bg-[#131b2e]/60 backdrop-blur-md rounded-2xl p-5 border border-[#464554]/30 animate-fade-in">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#89ceff]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#89ceff] font-label-md">Live Stream</span>
            </div>
            {activeConversationId && (
              <button
                onClick={() => setActiveTab("history")}
                className="text-xs text-[#c0c1ff] hover:underline flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                View Transcript
              </button>
            )}
          </div>
          <p className="text-sm leading-relaxed text-[#dae2fd] select-text">
            {transcriptText}
          </p>
        </div>
      )}

      {/* Messages Stream for Active Conversation */}
      {messagesList.length > 0 && (
        <div className="w-full max-w-xl mt-8 flex flex-col gap-4 border-t border-[#464554]/20 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c7c4d7]/70 mb-1 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Transcript History
          </h3>
          {messagesList.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] rounded-2xl p-4 border transition-all duration-300 ${
                msg.role === "user"
                  ? "self-end bg-[#8083ff]/10 border-[#8083ff]/30 text-[#dae2fd]"
                  : "self-start bg-[#171f33]/80 border-[#464554]/30 text-white"
              }`}
            >
              <div className="flex justify-between items-baseline gap-4 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === "user" ? "text-[#c0c1ff]" : "text-[#89ceff]"}`}>
                  {msg.role === "user" ? "You" : activePersona.name}
                </span>
                <span className="text-[10px] text-[#c7c4d7]/60">{msg.timestamp}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
