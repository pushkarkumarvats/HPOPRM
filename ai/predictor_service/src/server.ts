import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.AI_PORT || 8000);

const PredictBody = z.object({
  commodity: z.string(),
  history: z.array(z.number()).min(10).describe('Historical prices'),
  horizonDays: z.number().min(1).max(90).default(30)
});

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

app.post('/predict', (req, res) => {
  const parse = PredictBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const { commodity, history, horizonDays } = parse.data;
  const avg = history.reduce((a,b)=>a+b,0)/history.length;
  const forecast = Array.from({ length: horizonDays }).map((_, i) => ({
    timestamp: new Date(Date.now() + (i+1)*86400000).toISOString(),
    price: Math.round((avg * (1 + 0.001*i))*100)/100,
    conf_low: Math.round(avg*0.98*100)/100,
    conf_high: Math.round(avg*1.02*100)/100,
  }));
  res.json({ commodity, generated_at: new Date().toISOString(), horizon_days: horizonDays, forecast, model_version: process.env.AI_MODEL_VERSION || 'v1.0.0' });
});

app.post('/explain', async (req, res) => {
  try {
    const { commodity, context } = req.body as { commodity: string; context?: string };
    const useStub = (process.env.USE_STUB_AI || 'true') === 'true';
    if (useStub) {
      return res.json({ explanation: `Prices for ${commodity} likely stable to slightly up next month due to seasonal demand and stable supply.`, model: 'stub' });
    }
    // Optional OpenAI call
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'OPENAI_API_KEY not set and USE_STUB_AI=false' });
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const prompt = `You are an agri-market analyst. Summarize price outlook for ${commodity}. Context: ${context ?? 'N/A'}.`;
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [ { role: 'user', content: prompt } ],
      temperature: 0.2,
      max_tokens: 120
    });
    const text = completion.choices[0].message?.content ?? 'No explanation.';
    res.json({ explanation: text, model: 'openai' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'AI error' });
  }
});

app.listen(port, () => {
  console.log(`AI predictor listening on :${port}`);
});
