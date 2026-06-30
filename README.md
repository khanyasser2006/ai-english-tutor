# 🍝 La Bella Vista — AI English Tutor

An immersive English speaking practice app featuring **Marco**, a 3D animated Italian waiter at a fine-dining restaurant. Talk to him with your voice or type to him, and he'll roleplay the conversation while coaching your English in real time.

🔗 Live demo: *add your deployed link here*

![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Three.js](https://img.shields.io/badge/-Three.js-000000?style=flat-square&logo=three.js&logoColor=white) ![.NET](https://img.shields.io/badge/-.NET%208-512BD4?style=flat-square&logo=dotnet&logoColor=white) ![C#](https://img.shields.io/badge/-C%23-239120?style=flat-square&logo=csharp&logoColor=white) ![Web Speech API](https://img.shields.io/badge/-Web%20Speech%20API-4285F4?style=flat-square&logo=googlechrome&logoColor=white) ![Groq](https://img.shields.io/badge/-Groq-F55036?style=flat-square&logoColor=white)

---

## 🧰 Technologies

- `React`
- `Vite`
- `Three.js`
- `.NET 8 Web API`
- `C#`
- `Web Speech API`
- `Groq LLM API`

---

## 🎯 Features

Here's what you can do in La Bella Vista:

- **Talk to Marco**: A fully procedural 3D waiter built in Three.js, with idle breathing, eye blinking, a talking jaw animation, a listening lean, and thinking gestures.
- **Restaurant Roleplay**: An ambient dining scene with tables, candles, wine glasses, background diners, pendant lights, and a bar, so the practice feels like a real conversation, not a quiz.
- **Voice Conversation**: Speak into your mic using the Web Speech API, and Marco replies out loud using speech synthesis.
- **Live English Coaching**: Grammar corrections appear in real time, with new vocabulary introduced every few exchanges.
- **Text Fallback**: No mic? Type instead and the same conversation flow still works.

---

## 🪜 The Process

I started by building the frontend first, since this began as a demo project, so I went with a cartoonish 3D waiter character rather than a fully realistic model to keep things fast and fun to build.

While working on the character and scene, I explored a few different approaches and libraries before settling on plain React + Three.js for full control over the animations, rather than pulling in a heavier framework.

Once the frontend scene and conversation UI were in place, I moved on to the backend. This was the harder part, since live, real-time interaction was a completely new area for me — handling a continuous back-and-forth conversation is very different from a normal request/response API.

To make Marco actually talk and listen, I had to integrate the Web Speech API for voice input and speech synthesis for output. I got a free API key and wired it up to the backend.

The first integration attempt threw a lot of errors, mostly around timing, conversation state, and getting the voice input/output to sync with the 3D character's animations. After debugging through those issues one by one, the app is now working properly end-to-end: you can speak, Marco listens, responds with voice, and his 3D model animates in sync.

---

## 📚 What I Learned

During this project, I picked up a much better understanding of real-time, voice-driven interfaces and 3D web graphics.

- **Building a 3D Character**: I learned how to construct a cartoonish 3D character procedurally in Three.js, layering simple shapes into something that reads as a personality.
- **Animating in Real Time**: I learned how to drive that character's animations (idle breathing, blinking, talking, listening) based on live app state instead of pre-baked animation clips.
- **Voice Output**: I learned how to make a character actually speak using the Web Speech API's speech synthesis, and how to time it with the visual talking animation.
- **Live Microphone Input**: I learned how to capture and process live speech from the user's microphone and turn it into text the backend could understand.
- **Real-Time State Management**: Handling a continuous conversation loop (listening → thinking → responding → listening again) taught me a lot about managing state for live interactions, which is very different from typical CRUD apps.
- **Debugging Integration Issues**: Most of the early errors came from the voice API and backend not staying in sync, which pushed me to get much more comfortable debugging async, real-time bugs.

---

## 🔧 How Can It Be Improved?

- Add more character options beyond Marco, with different personalities and scenarios.
- Support more languages for non-English speakers practicing other languages.
- Add a progress tracker so users can see their grammar improvement over time.
- Improve mobile support for the Web Speech API, which currently works best on desktop Chrome.
- Add adjustable difficulty levels for the conversation and vocabulary.

---

## 🚀 Running the Project

### Step 1 — Get a Free API Key

Sign up for a free API key from your LLM provider (e.g. [Groq](https://console.groq.com/keys)) and copy it.

### Step 2 — Configure the Backend

Open `backend/EnglishTutor.API/appsettings.json` and paste your key in place of the placeholder.

### Step 3 — Run the Backend

**Prerequisites:** [.NET 8 SDK](https://dotnet.microsoft.com/download)

```bash
cd backend/EnglishTutor.API
dotnet run
```

The API starts at `http://localhost:5000`.

### Step 4 — Run the Frontend

**Prerequisites:** [Node.js 18+](https://nodejs.org)

```bash
cd frontend
npm install
npm run dev
```

Open the address shown in your console (usually `http://localhost:5173`) to start talking to Marco.

---

## 🎥 Video

https://github.com/user-attachments/assets/c43c6b3c-f8d9-45ab-94f2-c09e148db777







*Video link goes here — see the next message for how to add it.*
