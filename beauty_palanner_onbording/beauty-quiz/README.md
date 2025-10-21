# Beauty Quiz Application

Beauty Quiz is a Next.js (App Router) project that powers the Beauty Mirror onboarding journey. It values smooth animations, snackable copy, and quick progress through more than 30 curated steps.

## Tech Stack

- Next.js 15 with the App Router and TypeScript
- Tailwind CSS for styling
- Zustand for client-side quiz state persistence
- Firebase Hosting + Functions for deployment
- Lottie animations and custom illustrations

## Local Development

`ash
npm install
npm run dev
`

The app boots on http://localhost:3000. By default it serves the loading screen, welcome carousel, assistant selection, and the dynamic quiz flow under /quiz/[step].

## Project Structure

- pp/ – entry layout, global styles, page routes, and onboarding screens
- components/ – UI building blocks, quiz steps, and procedure flows
- store/quizStore.ts – Zustand store that persists answers across sessions
- unctions/ – Firebase Functions source (Node 20)
- public/ – static assets used at runtime

## Scripts

- 
pm run dev – start the local dev server
- 
pm run build – create a production build
- 
pm run start – serve the production build locally
- 
pm run lint – run Next.js ESLint configuration

## Deployment

The repository expects 
pm run build && npm run export (or another SSG pipeline) before irebase deploy --only hosting:quiz,functions. Update Firebase project aliases and environment secrets before promoting to production.
