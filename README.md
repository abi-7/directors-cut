# Director's Cut

Turn your code into a screenplay. Paste a code snippet, pick a TV show or movie, and Director's Cut rewrites exactly what the code does as a scene from that production — complete with characters, dialogue, and dramatic tension.

Built with React, TypeScript, Vite, Tailwind CSS, and the Gemini API.

## What it does

- You enter a show/movie name (e.g. "The Office", "Breaking Bad") and paste a code snippet
- The app sends both to Gemini 2.5 Flash Lite with a screenwriter prompt
- The response comes back formatted as a proper screenplay: scene headings, character names, action lines, and inline code references highlighted in yellow

## Getting started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Deployment (Netlify)

The app is set up for Netlify deployment. In production, API calls route through `netlify/functions/gemini-proxy.mjs` instead of calling Google directly, keeping the API key server-side.

Set the `GEMINI_API_KEY` environment variable in your Netlify dashboard (not `VITE_GEMINI_API_KEY` — the function reads from `process.env`).

> **Note:** The direct Gemini call in `src/App.tsx` is currently active for local development. The Netlify proxy code is commented out and ready to swap back in for production.

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React (icons)
- Google Gemini 2.5 Flash Lite
