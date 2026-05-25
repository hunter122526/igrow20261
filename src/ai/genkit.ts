import { genkit } from 'genkit'
import { googleAI, vertexAI } from '@genkit-ai/google-genai'

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const vertexApiKey = process.env.VERTEX_EXPRESS_API_KEY
const useVertexAdc = !googleApiKey && !vertexApiKey && (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT)

const plugins = []
let defaultModel: ReturnType<typeof googleAI.model> | ReturnType<typeof vertexAI.model> | undefined

if (googleApiKey) {
  plugins.push(googleAI({ apiKey: googleApiKey }))
  defaultModel = googleAI.model('gemini-2.5-flash')
} else if (vertexApiKey) {
  plugins.push(vertexAI({ apiKey: vertexApiKey }))
  defaultModel = vertexAI.model('gemini-2.5-pro')
} else if (useVertexAdc) {
  plugins.push(vertexAI({ location: process.env.VERTEX_AI_LOCATION || 'us-central1' }))
  defaultModel = vertexAI.model('gemini-2.5-pro')
} else {
  console.warn('AI support is not configured: set GEMINI_API_KEY, GOOGLE_API_KEY, VERTEX_EXPRESS_API_KEY, or Google ADC credentials.')
}

export const ai = genkit({
  plugins,
  model: defaultModel,
});
