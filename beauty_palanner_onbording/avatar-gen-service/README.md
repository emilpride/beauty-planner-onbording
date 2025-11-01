# Avatar Generation Service (Cloud Run)

A minimal Node.js service to stylize a selfie into a Pixar-style avatar using Google Generative Language API (Gemini 2.5 Flash Image). It accepts a base64 image and a prompt, and returns a base64-encoded PNG.

Important note: While this service enforces the Gemini 2.5 Flash model, image generation quality and behavior may vary. The service instructs the model to return base64 image data directly in text.

## API

POST /generate

Body (JSON):
- imageBase64: string (base64-encoded image, JPEG/PNG)
- prompt: string (style prompt)
- style: string (optional, e.g., "pixar_3d_avatar")
- imageMimeType: string (optional, default "image/jpeg")

Response 200 (JSON):
- imageBase64: string
- model: "gemini-2.5-flash"
- elapsedMs: number

Errors: 400 (bad input), 502 (model did not return a valid base64), 500 (internal)

## Environment

- GEMINI_API_KEY: API key used for the Generative Language API (same as your analysis function). The service targets model "gemini-2.5-flash-image".
- SENTRY_DSN: optional, to enable error tracing
- PORT: optional, defaults to 8080

## Local Run

1. Install deps
   npm install
2. Run
   set GEMINI_API_KEY=your_key && npm start

## Deploy to Cloud Run (example)

Prereqs: gcloud CLI configured for your project, Artifact Registry or buildpacks enabled.

Option A: Buildpacks (no Dockerfile)

  gcloud run deploy avatar-gen-service \
    --source . \
    --region europe-west1 \
    --allow-unauthenticated \
    --set-env-vars GEMINI_API_KEY=YOUR_KEY

Option B: Docker (optional)

  docker build -t gcr.io/PROJECT/avatar-gen-service:latest .
  docker push gcr.io/PROJECT/avatar-gen-service:latest
  gcloud run deploy avatar-gen-service \
    --image gcr.io/PROJECT/avatar-gen-service:latest \
    --region europe-west1 \
    --allow-unauthenticated \
    --set-env-vars GEMINI_API_KEY=YOUR_KEY

## Example Request

POST https://<cloud-run-url>/generate
{
  "prompt": "Create a bright, friendly Pixar-style 3D avatar portrait.",
  "imageBase64": "<base64 of selfie>",
  "style": "pixar_3d_avatar",
  "imageMimeType": "image/jpeg"
}

