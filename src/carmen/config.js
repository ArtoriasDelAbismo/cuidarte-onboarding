// Same backend the rest of the app talks to (see utils/notifyVideoOpened.js).
export const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'https://cuidarte-ia-backend-production.up.railway.app'

// The backend's voice routes require a JWT from its /api/auth login flow.
// Temporary stopgap until the app has a real login. VITE_DEV_JWT is the name
// cuidarte-carmen uses (and what the Netlify site already has), so either works.
export const CARMEN_JWT = import.meta.env.VITE_CARMEN_JWT || import.meta.env.VITE_DEV_JWT || ''

// Which voice provider Carmen connects to, as in cuidarte-carmen: OpenAI unless
// VITE_VOICE_PROVIDER is explicitly "elevenlabs" (the accent-quality variant),
// so a missing or misspelled value fails safe to the known-working path.
export const VOICE_PROVIDER = import.meta.env.VITE_VOICE_PROVIDER === 'elevenlabs' ? 'elevenlabs' : 'openai'
