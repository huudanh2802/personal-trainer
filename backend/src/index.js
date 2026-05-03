import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.MEAL_API_KEY || '';
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'diet-store.json');

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ days: {} }, null, 2), 'utf8');
  }
}

function readStore() {
  ensureStore();
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.days && typeof parsed.days === 'object') return parsed;
  } catch {
    /* fall through */
  }
  return { days: {} };
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function auth(req, res, next) {
  if (!API_KEY) {
    res.status(503).json({ error: 'Server misconfigured: set MEAL_API_KEY' });
    return;
  }
  const key = req.header('x-api-key');
  if (key !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/v1/diet/day', auth, (req, res) => {
  const date = String(req.query.date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Invalid date' });
    return;
  }
  const store = readStore();
  const row = store.days[date];
  res.json(row ?? null);
});

app.put('/api/v1/diet/day', auth, (req, res) => {
  const body = req.body;
  const date = typeof body.date === 'string' ? body.date.slice(0, 10) : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Invalid date' });
    return;
  }
  const caloriesConsumed = Number(body.caloriesConsumed);
  if (!Number.isFinite(caloriesConsumed) || caloriesConsumed < 0) {
    res.status(400).json({ error: 'Invalid caloriesConsumed' });
    return;
  }
  const caloriesHistory =
    body.caloriesHistory && typeof body.caloriesHistory === 'object' && !Array.isArray(body.caloriesHistory)
      ? body.caloriesHistory
      : undefined;

  const store = readStore();
  store.days[date] = {
    date,
    caloriesConsumed,
    caloriesHistory: caloriesHistory ?? {},
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Meal API listening on :${PORT}`);
});
