# Mind My Way 2

A demonstrator for a mobile mental health app (UK-focused) built at **VibeHack London 2026**. The app helps users journal their mental health state and surfaces AI-analysed insights to both the user and their clinician.

## Quick Start

```bash
# 1. Set your Claude API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 2. Install dependencies
cd client && npm install
cd ../server && npm install
cd .. && npm install

# 3. Start both servers
npm run dev
```

- **Client**: http://localhost:5173
- **Server API**: http://localhost:3001/api/health

## Architecture

```
mind-my-way-2/
├── client/          # React + Vite + TypeScript + Tailwind
├── server/          # Express + TypeScript + SQLite + Claude API
└── .env             # API keys
```

## 4 Interfaces

| Interface | View | Description |
|-----------|------|-------------|
| 1. Profile | Patient | Demographics, guardian (if <18), consent |
| 2. Journal | Patient | Daily check-in sliders, symptom tracking, reflective journal, audio, AI chat |
| 3. Dashboard | Patient | 2-week charts, AI insights, risk assessment, energy boosters, stress triggers |
| 4. Clinician | Doctor | Patient data, AI thematic analysis, condition checkboxes, notes, questionnaire sender |

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts
- **Backend**: Express 5 + TypeScript + SQLite (better-sqlite3)
- **AI**: Claude API (claude-sonnet-4-6) via @anthropic-ai/sdk
- **Audio**: Web Speech API (Chrome)
- **Mobile viewport**: 390×844px phone frame

## Features

- **14 days of seed data** pre-loaded for demo
- **PII abstraction**: double-layer (client + server) before Claude API calls
- **Risk assessment**: DSM-5 two-week criteria with GP referral flow
- **Emergency banner**: crisis hotline overlay when "thoughts of death" is checked
- **Questionnaire system**: MDQ and ASRS fully implemented; PCL-5, OCI-R, PQ-B, SAPAS as stubs
- **AI chat**: compassionate assistant with micro-intervention suggestions

## Demo Credentials

The app uses a pre-seeded demo patient: `Alex Thompson` (age 25). No login required — select Patient or Clinician from the landing page.

## Data Privacy

- All data stored locally in SQLite (no cloud database)
- PII (name, age, gender) abstracted to `[PATIENT]`, `[AGE]`, `[GENDER]` before Claude API calls
- Claude API key server-side only — client never calls Claude directly
- Consent tracking for data sharing with healthcare providers
