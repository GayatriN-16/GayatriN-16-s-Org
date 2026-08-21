export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  personaId: string;
  messages: Message[];
  timestamp: string;
  summary: string;
  category: 'Today' | 'Yesterday' | 'Older';
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
  icon: string; // lucide-react icon name
  themeColor: string; // Tailwind tint for borders, text
  bgColor: string; // Tailwind low-opacity tint
  locked?: boolean;
  systemInstruction: string;
}

export interface VoiceSettings {
  voicePersona: string; // 'Nova' | 'Echo' | 'Aura' | 'Orion'
  speakingRate: number; // 0.5 - 2.0
  voicePitch: number; // -10 - 10 (or string representation)
  shareUsageData: boolean;
  autoplayResponses: boolean;
  language: string;
}
