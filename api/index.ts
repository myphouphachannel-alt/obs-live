import express, { Request, Response } from 'express';
import { DEFAULT_SETTINGS, INITIAL_PEOPLE } from '../src/constants/broadcastDefaults';
import { BroadcastState, Person, BroadcastSettings } from '../src/types/broadcast';

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// In-memory serverless cache
let state: BroadcastState = {
  people: [...INITIAL_PEOPLE],
  settings: { ...DEFAULT_SETTINGS },
  activeLowerThird: {
    person: null,
    visible: false,
    timestamp: 0,
  },
  connectedClients: 1,
};

app.get('/api/state', (_req: Request, res: Response) => {
  res.json(state);
});

app.get('/api/people', (_req: Request, res: Response) => {
  res.json(state.people);
});

app.post('/api/people', (req: Request, res: Response) => {
  const newPerson: Person = {
    ...req.body,
    id: `p-${Date.now()}`,
    order: state.people.length,
    createdAt: Date.now(),
  };
  state.people.push(newPerson);
  res.status(201).json(newPerson);
});

app.put('/api/people/:id', (req: Request, res: Response) => {
  const idx = state.people.findIndex((p) => p.id === req.params.id);
  if (idx !== -1) {
    state.people[idx] = { ...state.people[idx], ...req.body };
    if (state.activeLowerThird.person?.id === req.params.id) {
      state.activeLowerThird.person = state.people[idx];
    }
    return res.json(state.people[idx]);
  }
  res.status(404).json({ error: 'Person not found' });
});

app.delete('/api/people/:id', (req: Request, res: Response) => {
  state.people = state.people.filter((p) => p.id !== req.params.id);
  if (state.activeLowerThird.person?.id === req.params.id) {
    state.activeLowerThird = { person: null, visible: false, timestamp: Date.now() };
  }
  res.json({ success: true });
});

app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(state.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  state.settings = { ...state.settings, ...req.body };
  res.json(state.settings);
});

app.post('/api/control/show', (req: Request, res: Response) => {
  const { personId } = req.body;
  const person = state.people.find((p) => p.id === personId);
  if (person) {
    state.activeLowerThird = {
      person,
      visible: true,
      timestamp: Date.now(),
    };
    return res.json(state.activeLowerThird);
  }
  res.status(404).json({ error: 'Person not found' });
});

app.post('/api/control/hide', (_req: Request, res: Response) => {
  state.activeLowerThird = {
    ...state.activeLowerThird,
    visible: false,
    timestamp: Date.now(),
  };
  res.json(state.activeLowerThird);
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', platform: 'vercel' });
});

export default app;
