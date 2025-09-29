# Beauty Mirror Onboarding

This workspace contains the assets we use to prototype the Beauty Mirror onboarding flow and supporting quiz experience. The repository is organized into two layers:

- eauty-quiz/ – the Next.js application that implements the onboarding, assistant selection, and multi-step assessment. It relies on Tailwind CSS, Zustand for client state, and Firebase for hosting plus serverless extensions.
- ssets/ – brand collateral, icons, animations, documents, and other static content shared by the design team.

## Getting Started

1. Install Node.js (LTS) and the Firebase CLI.
2. Install dependencies inside eauty-quiz/:
   `ash
   cd beauty-quiz
   npm install
   `
3. Launch the local development server:
   `ash
   npm run dev
   `
4. Visit http://localhost:3000 to walk through the onboarding flow.

## Deployment Notes

- The project is set up for Firebase Hosting with rewrites that serve the pre-rendered Next.js output from the out/ directory.
- Cloud Functions live under eauty-quiz/functions/ and currently ship with a single sample endpoint.
- Update .env files, Firebase targets, and billing integrations (Stripe/RevenueCat) before pushing to production.

## Licensing

All proprietary assets, copy, and illustrations remain the property of Beauty Mirror. Do not distribute outside the company without written approval.
