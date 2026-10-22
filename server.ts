import express from 'express';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { INITIAL_MULTI_AGENT_DESIGNS } from './src/data/communitySeed.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Room {
  id: string;
  name: string;
  problemId: string;
  createdAt: string;
  participants: Array<{ id: string; name: string; avatar: any; lastSeen: number }>;
  submissions: any[];
}

const STALE_MS = 120000;

function blankRoom(id: string, problemId = 'black-friday-crash', submissions: any[] = []): Room {
  return {
    id,
    name: `Sala ${id}`,
    problemId,
    createdAt: new Date().toISOString(),
    participants: [],
    submissions
  };
}

// Rooms live in Postgres when DATABASE_URL is set (survives restarts, shared across instances),
// otherwise in memory for local dev.
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;
const memoryStore = new Map<string, Room>();

async function getRoom(id: string): Promise<Room | undefined> {
  if (!pool) return memoryStore.get(id);
  const { rows } = await pool.query('SELECT data FROM rooms WHERE id = $1', [id]);
  return rows[0]?.data;
}

async function listRooms(): Promise<Room[]> {
  if (!pool) return [...memoryStore.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50);
  const { rows } = await pool.query("SELECT data FROM rooms ORDER BY data->>'createdAt' DESC LIMIT 50");
  return rows.map((r) => r.data);
}

// Read-modify-write under a row lock so concurrent requests on any instance don't lose updates.
async function updateRoom(id: string, fn: (room: Room | undefined) => Room): Promise<Room> {
  if (!pool) {
    const room = fn(memoryStore.get(id));
    memoryStore.set(id, room);
    return room;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT data FROM rooms WHERE id = $1 FOR UPDATE', [id]);
    const room = fn(rows[0]?.data);
    await client.query(
      'INSERT INTO rooms (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
      [id, room]
    );
    await client.query('COMMIT');
    return room;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Votes are tracked per user in `voters`; each response is personalized with that user's hasVoted.
function viewFor(room: Room, userId: string): Room {
  const now = Date.now();
  return {
    ...room,
    participants: room.participants.filter((p) => now - p.lastSeen < STALE_MS),
    submissions: room.submissions.map(({ voters = [], ...sub }) => ({
      ...sub,
      hasVoted: voters.includes(userId)
    }))
  };
}

async function initStore() {
  if (pool) {
    await pool.query('CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, data JSONB NOT NULL)');
  }
  // Seed default room
  await updateRoom('SALA-BLACKFRIDAY', (room) => room ?? {
    ...blankRoom('SALA-BLACKFRIDAY', 'black-friday-crash', [...INITIAL_MULTI_AGENT_DESIGNS]),
    name: 'Sala Black Friday War Room',
    participants: [
      {
        id: 'bot-kuki',
        name: 'Kuki Amarilla',
        avatar: INITIAL_MULTI_AGENT_DESIGNS[0].authorAvatar,
        lastSeen: Date.now()
      },
      {
        id: 'bot-nery',
        name: 'Nery Dev',
        avatar: INITIAL_MULTI_AGENT_DESIGNS[1].authorAvatar,
        lastSeen: Date.now()
      }
    ]
  });
}

async function startServer() {
  await initStore();

  const app = express();
  app.use(express.json());

  // Express 4 doesn't catch async errors; forward them so a DB failure returns 500 instead of crashing
  const route = (fn: express.RequestHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  const userIdOf = (req: express.Request) => String(req.get('x-user-id') || '');

  // API: List rooms (newest first) for the room picker
  app.get('/api/rooms', route(async (_req, res) => {
    const now = Date.now();
    const rooms = await listRooms();
    res.json(rooms.map((r) => ({
      id: r.id,
      name: r.name,
      problemId: r.problemId,
      createdAt: r.createdAt,
      players: r.participants.filter((p) => now - p.lastSeen < STALE_MS).length,
      submissions: r.submissions.length
    })));
  }));

  // API: Get or create room
  app.get('/api/rooms/:roomId', route(async (req, res) => {
    const { roomId } = req.params;
    const room =
      (await getRoom(roomId)) ??
      (await updateRoom(roomId, (r) => r ?? blankRoom(roomId, 'black-friday-crash',
        INITIAL_MULTI_AGENT_DESIGNS.filter((d) => d.problemId === 'black-friday-crash'))));
    res.json(viewFor(room, userIdOf(req)));
  }));

  // API: Create new room
  app.post('/api/rooms', route(async (req, res) => {
    const { id, name, problemId } = req.body;
    const roomId = (id || `SALA-${Date.now().toString(36).toUpperCase()}`).toUpperCase();
    const room = await updateRoom(roomId, (r) => {
      const next = r ?? blankRoom(roomId, problemId || 'black-friday-crash');
      if (problemId) next.problemId = problemId;
      if (name) next.name = name;
      return next;
    });
    res.json(viewFor(room, userIdOf(req)));
  }));

  // API: Submit multi-agent design
  app.post('/api/rooms/:roomId/submit', route(async (req, res) => {
    const { roomId } = req.params;
    const userId = userIdOf(req);
    const { hasVoted, ...design } = req.body.design;
    const room = await updateRoom(roomId, (r) => {
      const next = r ?? blankRoom(roomId, design.problemId || 'black-friday-crash');
      const idx = next.submissions.findIndex((s) => s.id === design.id);
      if (idx >= 0) {
        // Votes are server-owned; keep the existing tally on resubmit
        const { votes, voters } = next.submissions[idx];
        next.submissions[idx] = { ...design, votes, voters };
      } else {
        const voters = hasVoted && userId ? [userId] : [];
        next.submissions.unshift({ ...design, votes: voters.length, voters });
      }
      return next;
    });
    res.json(viewFor(room, userId));
  }));

  // API: Vote design (toggles this user's vote)
  app.post('/api/rooms/:roomId/vote', route(async (req, res) => {
    const { roomId } = req.params;
    const { designId } = req.body;
    const userId = userIdOf(req);
    if (!userId) return res.status(400).json({ error: 'Missing X-User-Id' });
    if (!(await getRoom(roomId))) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = await updateRoom(roomId, (r) => {
      const next = r ?? blankRoom(roomId);
      next.submissions = next.submissions.map((sub) => {
        if (sub.id !== designId) return sub;
        const voters: string[] = sub.voters ?? [];
        const voted = voters.includes(userId);
        return {
          ...sub,
          voters: voted ? voters.filter((v) => v !== userId) : [...voters, userId],
          votes: voted ? Math.max(0, sub.votes - 1) : sub.votes + 1
        };
      });
      return next;
    });
    res.json(viewFor(room, userId));
  }));

  // API: Update room problem
  app.post('/api/rooms/:roomId/problem', route(async (req, res) => {
    const { roomId } = req.params;
    const { problemId } = req.body;
    const room = await updateRoom(roomId, (r) => {
      const next = r ?? blankRoom(roomId, problemId);
      next.problemId = problemId;
      return next;
    });
    res.json(viewFor(room, userIdOf(req)));
  }));

  // API: Heartbeat
  app.post('/api/rooms/:roomId/heartbeat', route(async (req, res) => {
    const { roomId } = req.params;
    const { participant } = req.body;
    if (participant && (await getRoom(roomId))) {
      await updateRoom(roomId, (r) => {
        const next = r!;
        const now = Date.now();
        next.participants = [
          ...next.participants.filter((p) => p.id !== participant.id && now - p.lastSeen < STALE_MS),
          { ...participant, lastSeen: now }
        ];
        return next;
      });
    }
    res.json({ ok: true });
  }));

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Loaded lazily so production doesn't need vite at runtime
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ready on port ${PORT} (rooms: ${pool ? 'postgres' : 'memory'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
