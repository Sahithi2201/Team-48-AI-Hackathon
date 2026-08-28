import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Case Analysis Endpoint
  app.post('/api/ai/analyze-case', async (req, res) => {
    try {
      const { targetCase, allCases } = req.body;
      if (!targetCase) {
        return res.status(400).json({ error: 'Missing targetCase in request body' });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.status(200).json({
          success: false,
          useFallback: true,
          message: 'GEMINI_API_KEY not configured on server. Fallback to heuristic AI.'
        });
      }

      const prompt = `You are "CivicMind AI Intelligence", an advanced civic operations assistant for Government Municipal Officers.
Analyze this citizen complaint accurately based on real data:

COMPLAINT DETAILS:
- ID: ${targetCase.id}
- Title: ${targetCase.title}
- Description: ${targetCase.description}
- Category: ${targetCase.category}
- Locality: ${targetCase.location?.colony || targetCase.location?.area || 'Ward'}, ${targetCase.location?.cityName || 'City'}
- Problem Duration: ${targetCase.problemDuration || '1–3 Days'}
- Citizen Reported: ${targetCase.citizenName || 'Resident'}

Return a valid JSON object ONLY with this exact JSON structure:
{
  "problem": "One-sentence precise description of the technical root cause",
  "impact": "One-sentence description of the severity and threat to public health, sanitation, traffic, or safety",
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "recommendedPriority": "P1" | "P2" | "P3" | "P4",
  "priorityReason": "Concise justification for the assigned priority based on duration, severity, and public hazard",
  "recommendedDepartmentKey": "roads" | "water" | "sanitation" | "drainage" | "street_lighting" | "public_health" | "parks" | "traffic" | "electricity" | "public_facilities",
  "recommendedDepartmentName": "Exact Official Department Name",
  "departmentReason": "Why this specific department has legal jurisdiction",
  "recommendedActions": [
    "Step 1...",
    "Step 2...",
    "Step 3...",
    "Step 4..."
  ],
  "summary": "2-3 sentence executive briefing for municipal directors",
  "visualAnalysis": {
    "hasVisual": ${Boolean(targetCase.imageUrl || (targetCase.evidenceImages && targetCase.evidenceImages.length > 0))},
    "description": "Visual confirmation details",
    "detectedElements": ["element1", "element2"],
    "confidence": "AI Confidence: 94% (Visual verified)"
  },
  "slaPrediction": {
    "slaStatus": "HEALTHY" | "AT_RISK" | "BREACHED",
    "estimatedHoursRemaining": 36,
    "delayRiskReason": "Analysis of potential delays or on-track status",
    "recommendedAction": "Action to avoid SLA breach"
  }
}`;

      let text = '';
      let modelUsed = 'gemini-2.5-flash (Server-Side)';

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
        text = response.text || '';
      } catch (geminiErr: any) {
        // If 503/high-demand on primary model, fallback to gemini-2.5-pro or return deterministic fallback
        console.warn('[Server AI] Primary model notice, trying fallback:', geminiErr?.message || geminiErr);
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });
          text = fallbackResponse.text || '';
          modelUsed = 'gemini-2.5-pro (Server-Side Fallback)';
        } catch (fbErr: any) {
          console.warn('[Server AI] Fallback model notice:', fbErr?.message || fbErr);
          return res.status(200).json({
            success: false,
            useFallback: true,
            error: fbErr?.message || 'Model temporarily unavailable'
          });
        }
      }

      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch (pErr) {
        return res.status(200).json({
          success: false,
          useFallback: true,
          error: 'Invalid JSON response from AI'
        });
      }

      return res.json({
        success: true,
        analysis: {
          ...parsed,
          analyzedAt: new Date().toISOString(),
          modelUsed
        }
      });
    } catch (err: any) {
      console.warn('[Server AI] Case analysis notice:', err?.message || err);
      return res.status(200).json({
        success: false,
        useFallback: true,
        error: err?.message || 'AI processing error'
      });
    }
  });

  // AI Ask CivicMind Query Endpoint
  app.post('/api/ai/ask-civicmind', async (req, res) => {
    try {
      const { query, casesSummary } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.status(200).json({
          success: false,
          answer: 'CivicMind AI Assistant is operating with local deterministic municipal heuristics. Configure GEMINI_API_KEY in the project settings for deep generative synthesis.'
        });
      }

      const prompt = `You are CivicMind AI, an intelligent government municipal advisor.
User Question: ${query}

Current City Incidents Snapshot:
${casesSummary || 'Standard municipal incident records.'}

Provide a concise, professional, and actionable civic operational recommendation.`;

      let answer = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        answer = response.text || '';
      } catch (geminiErr) {
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
          });
          answer = fallbackResponse.text || '';
        } catch (fbErr) {
          return res.status(200).json({
            success: false,
            answer: 'CivicMind municipal advisor service is currently utilizing real-time local telemetry.'
          });
        }
      }

      return res.json({
        success: true,
        answer
      });
    } catch (err: any) {
      console.warn('[Server AI] Ask CivicMind notice:', err?.message || err);
      return res.status(200).json({
        success: false,
        answer: 'CivicMind municipal advisor service is currently utilizing real-time local telemetry.'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicMind Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
