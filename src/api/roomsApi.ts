import { MultiAgentDesign, Problem, Room, RoomParticipant } from '../types';
import { INITIAL_MULTI_AGENT_DESIGNS } from '../data/communitySeed';
import { PROBLEMS_CATALOG } from '../data/problems';

const STORAGE_PREFIX = 'vibeagent_room_';
const CHANNEL_NAME = 'vibeagent_multiagent_rooms_channel';

// Stable per-browser identity, so votes and presence are per person (not per display name)
export const clientId: string = (() => {
  const key = 'vibeagent_client_id';
  try {
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    // randomUUID is missing on non-HTTPS origins (e.g. LAN IP from the QR code)
    const id = `usr-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `usr-${Math.random().toString(36).slice(2)}`;
  }
})();

const userHeaders = { 'X-User-Id': clientId };

// In-browser BroadcastChannel for multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {}
}

export function subscribeToRoomBroadcast(onMessage: (data: unknown) => void) {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    onMessage(event.data);
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

export function broadcastRoomUpdate(roomId: string, type: string) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ roomId, type, timestamp: Date.now() });
    } catch {}
  }
}

// Local storage helpers
function getLocalRoom(roomId: string): Room | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${roomId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveLocalRoom(room: Room) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${room.id}`, JSON.stringify(room));
    broadcastRoomUpdate(room.id, 'ROOM_UPDATED');
  } catch {}
}

export function createDefaultRoom(roomId: string, problemId = 'black-friday-crash'): Room {
  return {
    id: roomId,
    name: `Sala ${roomId.replace(/^SALA-/, '')}`,
    problemId: problemId,
    createdAt: new Date().toISOString(),
    participants: [],
    submissions: INITIAL_MULTI_AGENT_DESIGNS.filter(
      (d) => d.problemId === problemId || d.roomId === roomId
    )
  };
}

// API methods with fallback
export async function fetchRoomData(roomId: string, defaultProblemId = 'black-friday-crash'): Promise<Room> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, { headers: userHeaders });
    if (res.ok) {
      const data = await res.json();
      saveLocalRoom(data);
      return data;
    }
  } catch {
    // server route not reachable, fallback to local storage
  }

  const local = getLocalRoom(roomId);
  if (local) {
    return local;
  }

  const created = createDefaultRoom(roomId, defaultProblemId);
  saveLocalRoom(created);
  return created;
}

export async function createNewRoom(roomId: string, name: string, problemId: string): Promise<Room> {
  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({ id: roomId, name, problemId })
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalRoom(data);
      return data;
    }
  } catch {}

  const created: Room = {
    id: roomId,
    name: name || `Sala ${roomId.replace(/^SALA-/, '')}`,
    problemId: problemId || 'black-friday-crash',
    createdAt: new Date().toISOString(),
    participants: [],
    submissions: []
  };
  saveLocalRoom(created);
  return created;
}

export async function submitMultiAgentDesign(roomId: string, design: MultiAgentDesign): Promise<Room> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({ design })
    });
    if (res.ok) {
      const updated = await res.json();
      saveLocalRoom(updated);
      return updated;
    }
  } catch {}

  // Fallback local update
  const current = getLocalRoom(roomId) || createDefaultRoom(roomId, design.problemId);
  const existingIdx = current.submissions.findIndex((s) => s.id === design.id);
  let nextSubmissions = [...current.submissions];
  if (existingIdx >= 0) {
    nextSubmissions[existingIdx] = design;
  } else {
    nextSubmissions = [design, ...nextSubmissions];
  }
  const updated: Room = { ...current, submissions: nextSubmissions };
  saveLocalRoom(updated);
  return updated;
}

export async function voteMultiAgentDesign(roomId: string, designId: string): Promise<Room> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({ designId })
    });
    if (res.ok) {
      const updated = await res.json();
      saveLocalRoom(updated);
      return updated;
    }
  } catch {}

  const current = getLocalRoom(roomId) || createDefaultRoom(roomId);
  const nextSubmissions = current.submissions.map((sub) => {
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
  const updated: Room = { ...current, submissions: nextSubmissions };
  saveLocalRoom(updated);
  return updated;
}

export async function updateRoomProblem(roomId: string, problemId: string): Promise<Room> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/problem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({ problemId })
    });
    if (res.ok) {
      const updated = await res.json();
      saveLocalRoom(updated);
      return updated;
    }
  } catch {}

  const current = getLocalRoom(roomId) || createDefaultRoom(roomId);
  const updated: Room = { ...current, problemId };
  saveLocalRoom(updated);
  return updated;
}

export async function sendHeartbeat(roomId: string, participant: RoomParticipant): Promise<void> {
  try {
    await fetch(`/api/rooms/${encodeURIComponent(roomId)}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({ participant })
    });
  } catch {}

  // Update local
  const current = getLocalRoom(roomId);
  if (current) {
    const others = current.participants.filter(
      (p) => p.id !== participant.id && Date.now() - p.lastSeen < 60000
    );
    const updated: Room = {
      ...current,
      participants: [...others, { ...participant, lastSeen: Date.now() }]
    };
    saveLocalRoom(updated);
  }
}
