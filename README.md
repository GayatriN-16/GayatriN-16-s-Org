# ✨ Luminous AI — Conversational Voice Assistant

Luminous AI is an interactive voice assistant powered by **Google Gemini**. You can talk to it or type, and choose from different **cognitive personas** (Creative, Logic, Empath) that change how it thinks and responds. It includes customizable voice settings and a searchable chat history.

---

## ✨ Features

- **Talk View** – speak using your microphone (speech recognition) or type; replies can be read aloud automatically with text-to-speech.
- **Persona Library** – switch between AI personalities, each with its own system instructions and tone:
  | Persona | Style |
  |---|---|
  | **Nova** – The Creative | Ideation, storytelling, lateral thinking |
  | **Atlas** – The Logic | Analysis, coding, precise breakdowns |
  | **Lyra** – The Empath | Supportive, high-EQ conversation |
  | **Orion** – The Strategist | Planning and optimization *(locked, Pro tier placeholder)* |
- **Conversation History** – past chats grouped into Today / Yesterday / Older, with search, resume and delete.
- **Voice Settings** – choose the voice, speaking rate, pitch, language, and toggle autoplay of responses and usage-data sharing.
- **Clear data** – one action to delete all saved transcripts.
- **Secure backend** – the Gemini API key stays on the server and is never exposed to the browser.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React, Motion
- **Backend:** Node.js, Express (TypeScript, run with `tsx`)
- **AI:** Google Gemini via the `@google/genai` SDK
- **Voice:** Browser Web Speech API (speech recognition + speech synthesis)

---

## 📁 Project Structure

```
├── server.ts                # Express server, /api/chat endpoint (Gemini)
├── index.html
├── src/
│   ├── App.tsx
│   ├── data.ts              # Personas and sample conversations
│   ├── types.ts             # Message, Conversation, Persona, VoiceSettings
│   └── components/
│       ├── TalkView.tsx
│       ├── LibraryView.tsx
│       ├── HistoryView.tsx
│       ├── SettingsView.tsx
│       └── Navigation.tsx
└── .env.example
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
# 1. Clone the repository
git clone https://github.com/GayatriN-16/GayatriN-16-s-Org.git
cd GayatriN-16-s-Org

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env
# open .env and set GEMINI_API_KEY="your_key_here"

# 4. Run in development mode
npm run dev
```

Open **http://localhost:3000**.

### Production build

```bash
npm run build
npm start
```

> **Tip:** Voice input works best in Google Chrome or Microsoft Edge, and requires microphone permission.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key (required) |
| `APP_URL` | URL where the app is hosted (optional) |

Never commit your real `.env` file.

---

## 🗺️ Roadmap

- Unlock the Orion persona
- Save conversations to a database instead of the browser session
- Add more languages and voices

---

## 👩‍💻 Author

**Gayatri Nikam** – Final-year B.E. Computer Engineering student, aspiring Data Scientist
GitHub: [@GayatriN-16](https://github.com/GayatriN-16)
