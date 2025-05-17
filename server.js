
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { storeMemory, queryMemory, USE_QDRANT } = require('./qdrant');
const app = express();
app.use(cors());
app.use(express.json());

let lastSuccessfulPrompt = null;
let lastPromptTimestamp = null;
let modeStatus = 'exploit-chain';

const SYSTEM_PROMPTS = {
  'exploit-chain': (target) => `TARGET: ${target}

Conduct an adversarial cognitive and operational profile.
1. Identify psychological levers and emotional vulnerabilities.
2. Determine most probable compromise vector (technical, social, or perceptual).
3. Draft a high-leverage funnel exploiting their predictable behavior.
4. Simulate their exact reply — tone, hesitation, rationalization.
5. Return a tailored counter-offensive strategy to override resistance.`,

  'persona-profile': (target) => `Analyze the persona of ${target}.
Extract traits, tone patterns, confidence signals, deception markers, and intent indicators. Output in bullet list.`,

  'recon': (target) => `Perform digital recon on ${target}.
Identify available surface area, traceable digital trails, account exposure points, and passive data aggregation methods.`
};

function getSystemPrompt(target) {
  const fn = SYSTEM_PROMPTS[modeStatus] || SYSTEM_PROMPTS['exploit-chain'];
  return fn(target);
}

app.get('/api/set-mode', (req, res) => {
  const newMode = req.query.name;
  if (SYSTEM_PROMPTS[newMode]) {
    modeStatus = newMode;
    return res.json({ status: 'ok', mode: modeStatus });
  }
  res.status(400).json({ status: 'error', message: 'Invalid mode' });
});

app.get('/api/list-modes', (req, res) => {
  res.json({
    availableModes: Object.keys(SYSTEM_PROMPTS),
    current: modeStatus
  });
});

app.get('/api/exploit', async (req, res) => {
  const target = req.query.target;

  let memoryContext = '';
  if (USE_QDRANT) {
    try {
      const similar = await queryMemory(target);
      memoryContext = similar.map((item, i) => `Memory ${i + 1}:
${item.metadata.prompt}
${item.metadata.response}`).join('\n\n');
    } catch (e) {
      console.error('Qdrant read failed:', e);
    }
  }

  const systemPrompt = getSystemPrompt(target);
  const prompt = `${memoryContext}\n\n${systemPrompt}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'dolphin-mixtral',
        prompt,
        stream: true
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    lastSuccessfulPrompt = prompt;
    lastPromptTimestamp = new Date().toISOString();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      buffer += text;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          fullResponse += data.response;
          res.write(`data: ${data.response}\n\n`);
        } catch (err) {}
      }
    }

    if (USE_QDRANT) {
      try {
        await storeMemory(target, prompt, fullResponse);
      } catch (e) {
        console.error('Qdrant store failed:', e);
      }
    }
  } catch (error) {
    res.write(`data: [ERROR] Failed to stream: ${error.message}\n\n`);
  }

  res.end();
});

app.get('/api/ai-status', (req, res) => {
  res.json({
    status: 'online',
    model: 'dolphin-mixtral',
    mode: modeStatus,
    lastPrompt: lastSuccessfulPrompt ? lastSuccessfulPrompt.slice(0, 120) + '...' : null,
    lastTimestamp: lastPromptTimestamp
  });
});
