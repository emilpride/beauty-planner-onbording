# Beauty Web (Next.js)

This is the new React + Next.js web client for Beauty Mirror. It mirrors the quiz app's design system and adds theme + accent customization.

## Features implemented
- App layout with global styles (Tailwind + CSS variables)
- ThemeProvider with light/dark/system and accent color persistence
- Pages:
  - `/` dashboard stub
  - `/dashboard` stub
  - `/account` appearance settings (theme + accent)

## Quick start
1. Install Node.js 18+
2. Install deps
   - Optional command:
     - cd "beauty_web"
     - npm install
3. Run the app
   - Optional command:
     - npm run dev
4. Open http://localhost:3000

## Theming
- CSS variables control colors: `--bg`, `--surface`, `--text`, `--accent`
- `data-theme="dark"` is applied on `<html>` for dark mode
- Accent is stored in localStorage (`bm_accent`) and used via `rgb(var(--accent))`

## Next steps
- Wire Firebase SDK (`src/lib/firebase.ts`)
- Port dashboard widgets and account settings from Flutter to React
- Add auth flow and protected routes

## Security rules and deployment
- A Firestore security rules file is included at `firestore.rules` with access controls for:
  - `Users/{uid}` profile and subcollections: `Activities`, `Updates`, `AIAnalysis`, `AIAnalysisUploads`, `FcmTokens`, `NotificationPrefs`, and read-only `NotificationsSent`.
- A minimal `firebase.json` maps Firestore rules to this file. To deploy rules to your Firebase project, use the Firebase CLI from this directory.
  - Optional commands:
    - firebase use <your-project-id>
    - firebase deploy --only firestore:rules
