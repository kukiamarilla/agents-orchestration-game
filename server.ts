import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
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

const roomsStore = new Map<string, Room>();

// Seed default room
roomsStore.set('SALA-BLACKFRIDAY', {
  id: 'SALA-BLACKFRIDAY',
  name: 'Sala Black Friday War Room',
  problemId: 'black-friday-crash',
  createdAt: new Date().toISOString(),
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
  ],
  submissions: [...INITIAL_MULTI_AGENT_DESIGNS]
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Get or create room
  app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    let room = roomsStore.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        name: `Sala ${roomId}`,
        problemId: 'black-friday-crash',
        createdAt: new Date().toISOString(),
        participants: [],
        submissions: INITIAL_MULTI_AGENT_DESIGNS.filter(
          (d) => d.problemId === 'black-friday-crash'
        )
      };
      roomsStore.set(roomId, room);
    }
    // Clean stale participants (> 2 min)
    const now = Date.now();
    room.participants = room.participants.filter((p) => now - p.lastSeen < 120000);
    res.json(room);
  });

  // API: Create new room
  app.post('/api/rooms', (req, res) => {
    const { id, name, problemId } = req.body;
    const roomId = (id || `SALA-${Date.now().toString(36).toUpperCase()}`).toUpperCase();
    let room = roomsStore.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        name: name || `Sala ${roomId}`,
        problemId: problemId || 'black-friday-crash',
        createdAt: new Date().toISOString(),
        participants: [],
        submissions: []
      };
      roomsStore.set(roomId, room);
    } else {
      if (problemId) room.problemId = problemId;
      if (name) room.name = name;
    }
    res.json(room);
  });

  // API: Submit multi-agent design
  app.post('/api/rooms/:roomId/submit', (req, res) => {
    const { roomId } = req.params;
    const { design } = req.body;
    let room = roomsStore.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        name: `Sala ${roomId}`,
        problemId: design.problemId || 'black-friday-crash',
        createdAt: new Date().toISOString(),
        participants: [],
        submissions: []
      };
      roomsStore.set(roomId, room);
    }

    const idx = room.submissions.findIndex((s) => s.id === design.id);
    if (idx >= 0) {
      room.submissions[idx] = design;
    } else {
      room.submissions.unshift(design);
    }
    res.json(room);
  });

  // API: Vote design
  app.post('/api/rooms/:roomId/vote', (req, res) => {
    const { roomId } = req.params;
    const { designId } = req.body;
    const room = roomsStore.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.submissions = room.submissions.map((sub) => {
      if (sub.id === designId) {
        const hasVoted = !sub.hasVoted;
        return {
          ...sub,
          votes: hasVoted ? sub.votes + 1 : Math.max(0, sub.votes - 1),
          hasVoted
        };
      }
      return sub;
    });

    res.json(room);
  });

  // API: Update room problem
  app.post('/api/rooms/:roomId/problem', (req, res) => {
    const { roomId } = req.params;
    const { problemId } = req.body;
    let room = roomsStore.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        name: `Sala ${roomId}`,
        problemId,
        createdAt: new Date().toISOString(),
        participants: [],
        submissions: []
      };
      roomsStore.set(roomId, room);
    } else {
      room.problemId = problemId;
    }
    res.json(room);
  });

  // API: Heartbeat
  app.post('/api/rooms/:roomId/heartbeat', (req, res) => {
    const { roomId } = req.params;
    const { participant } = req.body;
    const room = roomsStore.get(roomId);
    if (room && participant) {
      const idx = room.participants.findIndex((p) => p.id === participant.id);
      if (idx >= 0) {
        room.participants[idx] = { ...participant, lastSeen: Date.now() };
      } else {
        room.participants.push({ ...participant, lastSeen: Date.now() });
      }
    }
    res.json({ ok: true });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ready on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
