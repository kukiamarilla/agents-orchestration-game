import React, { useState, useEffect, useCallback } from 'react';
import { Problem, Room, AgentNode, MultiAgentDesign, MuñequitoConfig } from './types';
import { PROBLEMS_CATALOG } from './data/problems';
import { INITIAL_MULTI_AGENT_DESIGNS } from './data/communitySeed';
import {
  fetchRoomData,
  createNewRoom,
  submitMultiAgentDesign,
  voteMultiAgentDesign,
  clientId,
  updateRoomProblem,
  sendHeartbeat,
  subscribeToRoomBroadcast
} from './api/roomsApi';
import { TopNav } from './components/TopNav';
import { MarioMakerBuilder } from './components/MarioMakerBuilder';
import { AgentDiagramView } from './components/AgentDiagramView';
import { WarRoom } from './components/WarRoom';
import { QrModal } from './components/QrModal';
import { RoomModal } from './components/RoomModal';
import { NameModal } from './components/NameModal';
import { ChallengeModal } from './components/ChallengeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { soundFx } from './utils/audio';

const STORAGE_KEY_ONBOARDED = 'vibeagent_onboarded_v2';
// v3: older versions auto-assigned a random name, so everyone is asked once
const STORAGE_KEY_USER_NAME = 'vibeagent_author_name_v3';

export default function App() {
  const [activeView, setActiveView] = useState<'maker' | 'war_room' | 'diagram'>('maker');
  const [isMuted, setIsMuted] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  // Author identity (empty until the player types it in NameModal)
  const [authorName, setAuthorName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_USER_NAME) || '';
    } catch {
      return '';
    }
  });
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const handleSaveName = (name: string) => {
    setAuthorName(name);
    setIsNameModalOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY_USER_NAME, name);
    } catch {}
  };

  // Room ID from URL (e.g. ?room=SALA-BLACKFRIDAY)
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && urlRoom.trim()) {
        return urlRoom.trim().toUpperCase();
      }
    }
    return 'SALA-BLACKFRIDAY';
  });

  // Room State
  const [room, setRoom] = useState<Room>(() => {
    return {
      id: roomId,
      name: `Sala ${roomId.replace(/^SALA-/, '')}`,
      problemId: 'black-friday-crash',
      createdAt: new Date().toISOString(),
      participants: [],
      submissions: [...INITIAL_MULTI_AGENT_DESIGNS]
    };
  });

  // Synchronized problem from the Room (all users in room play the same challenge)
  const activeProblem =
    PROBLEMS_CATALOG.find((p) => p.id === room.problemId) || PROBLEMS_CATALOG[0];

  // Active Multi-Agent swarm in builder
  const [makerAgents, setMakerAgents] = useState<AgentNode[]>(() => {
    // Initial 2-agent swarm pre-configured for the challenge
    return [
      {
        id: 'agent-lead-default',
        name: 'Nexus Orquestador',
        role: 'Orquestador Principal SRE',
        systemPrompt: 'Monitorea incidentes críticos, evalúa logs de la base de datos y delega tareas a sub-agentes.',
        muñequito: {
          skinColor: '#10b981',
          secondaryColor: '#047857',
          glowColor: '#34d399',
          helmet: 'neon-crown',
          visor: 'scanline-slit',
          suit: 'cyber-jacket',
          accessory: 'energy-halo'
        },
        mcpToolIds: ['pagerduty', 'slack', 'agent_spawner'],
        communicatesWith: ['agent-worker-default'],
        canSpawn: true,
        spawnsAgentIds: ['agent-worker-default'],
        isSpawned: false,
        position: { x: 1, y: 1 }
      },
      {
        id: 'agent-worker-default',
        name: 'Postgres Hunter',
        role: 'DBA Fixer de Deadlocks',
        systemPrompt: 'Invocado bajo demanda para liquidar queries trabadas en Postgres y refrescar el pool.',
        muñequito: {
          skinColor: '#3b82f6',
          secondaryColor: '#1d4ed8',
          glowColor: '#60a5fa',
          helmet: 'crt-robot',
          visor: 'cyclops-beam',
          suit: 'mech-armor',
          accessory: 'data-tentacles'
        },
        mcpToolIds: ['postgres', 'redis'],
        communicatesWith: ['agent-lead-default'],
        canSpawn: false,
        spawnsAgentIds: [],
        isSpawned: true,
        spawnedByAgentId: 'agent-lead-default',
        position: { x: 3, y: 1 }
      }
    ];
  });

  // Onboarding tutorial state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem(STORAGE_KEY_ONBOARDED);
    }
    return false;
  });

  // Refresh room data from API / storage
  const loadRoom = useCallback(async () => {
    try {
      const data = await fetchRoomData(roomId, activeProblem.id);
      setRoom(data);
    } catch (e) {
      console.warn('Failed to fetch room', e);
    }
  }, [roomId, activeProblem.id]);

  // Initial room load & heartbeat
  useEffect(() => {
    loadRoom();

    // Send heartbeat (repeated while polling, otherwise we'd be pruned as stale after 2 min)
    const heartbeat = () => authorName && sendHeartbeat(roomId, {
      id: clientId,
      name: authorName,
      avatar: makerAgents[0]?.muñequito || {
        skinColor: '#10b981',
        secondaryColor: '#047857',
        glowColor: '#34d399',
        helmet: 'crt-robot',
        visor: 'scanline-slit',
        suit: 'cyber-jacket',
        accessory: 'energy-halo'
      },
      lastSeen: Date.now()
    });

    heartbeat();

    // Polling sync every 5 seconds for live multi-user updates
    const pollTimer = setInterval(() => {
      loadRoom();
      heartbeat();
    }, 5000);

    // Multi-tab broadcast channel listener
    const unsub = subscribeToRoomBroadcast((msg: any) => {
      if (msg && msg.roomId === roomId) {
        loadRoom();
      }
    });

    return () => {
      clearInterval(pollTimer);
      unsub();
    };
  }, [roomId, loadRoom, authorName, makerAgents]);

  const handleToggleMute = () => {
    const nextMuted = soundFx.toggleMute();
    setIsMuted(nextMuted);
  };

  const [isChallengeOpen, setIsChallengeOpen] = useState(false);

  // Closing the tutorial (finish or skip) presents the room's challenge
  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    setIsChallengeOpen(true);
    try {
      localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
    } catch {}
  };

  const handleChangeRoomProblem = async (problemId: string) => {
    soundFx.playEquip();
    const updated = await updateRoomProblem(roomId, problemId);
    setRoom(updated);
  };

  const handleSelectOrCreateRoom = async (targetRoomId: string, roomName?: string, problemId?: string) => {
    setRoomId(targetRoomId);

    // Update URL query string
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', targetRoomId);
      window.history.pushState({}, '', url.toString());
    } catch {}

    let updatedRoom: Room;
    if (roomName || problemId) {
      updatedRoom = await createNewRoom(
        targetRoomId,
        roomName || `Sala ${targetRoomId}`,
        problemId || 'black-friday-crash'
      );
    } else {
      updatedRoom = await fetchRoomData(targetRoomId);
    }

    setRoom(updatedRoom);
    setActiveView('war_room');
  };

  const handleSubmitDesignToRoom = async (meta: { title: string; description: string }) => {
    const design: MultiAgentDesign = {
      id: `design-${Date.now()}`,
      title: meta.title || `${authorName} Swarm`,
      description: meta.description,
      author: authorName,
      authorHandle: `@${authorName.toLowerCase().replace(/\s+/g, '_')}`,
      authorAvatar: makerAgents[0]?.muñequito || {
        skinColor: '#10b981',
        secondaryColor: '#047857',
        glowColor: '#34d399',
        helmet: 'crt-robot',
        visor: 'scanline-slit',
        suit: 'cyber-jacket',
        accessory: 'energy-halo'
      },
      roomId: roomId,
      problemId: activeProblem.id,
      agents: [...makerAgents],
      createdAt: 'Recién publicado',
      votes: 1,
      hasVoted: true
    };

    const updated = await submitMultiAgentDesign(roomId, design);
    setRoom(updated);
    setActiveView('war_room');
  };

  const handleVoteSubmission = async (submissionId: string) => {
    const updated = await voteMultiAgentDesign(roomId, submissionId);
    setRoom(updated);
  };

  // Convert current maker state to a preview design object for AgentDiagramView
  const currentMakerDesign: MultiAgentDesign = {
    id: 'current-preview',
    title: `Tu Enjambre Actual (${makerAgents.length} Agentes)`,
    description: `Diseño en construcción para el desafío: ${activeProblem.title}`,
    author: authorName,
    authorHandle: `@${authorName.toLowerCase().replace(/\s+/g, '_')}`,
    authorAvatar: makerAgents[0]?.muñequito || {
      skinColor: '#10b981',
      secondaryColor: '#047857',
      glowColor: '#34d399',
      helmet: 'crt-robot',
      visor: 'scanline-slit',
      suit: 'cyber-jacket',
      accessory: 'energy-halo'
    },
    roomId: roomId,
    problemId: activeProblem.id,
    agents: makerAgents,
    createdAt: 'En vivo',
    votes: 0
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <TopNav
        activeView={activeView}
        onSelectView={(v) => {
          soundFx.playClick();
          setActiveView(v);
        }}
        roomId={roomId}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenRoomModal={() => setIsRoomModalOpen(true)}
        authorName={authorName}
        onEditName={() => setIsNameModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {activeView === 'maker' && (
          <MarioMakerBuilder
            problem={activeProblem}
            agents={makerAgents}
            onUpdateAgents={setMakerAgents}
            onPreviewDiagram={() => setActiveView('diagram')}
            onSubmitToRoom={handleSubmitDesignToRoom}
            authorName={authorName}
          />
        )}

        {activeView === 'diagram' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-arcade">
                  Diagrama Interactivo de tus Agentes
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Mueve agentes, conecta canales de comunicación directa y define quién puede invocar a quién en runtime. Haz click para ver el System Prompt y MCPs.
                </p>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveView('maker');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-arcade cursor-pointer"
              >
                Volver al Taller
              </button>
            </div>

            <AgentDiagramView
              design={currentMakerDesign}
              onUpdateAgents={(updatedAgents) => {
                setMakerAgents(updatedAgents);
              }}
              onUpdateAgentPosition={(agentId, pos) => {
                setMakerAgents((prev) =>
                  prev.map((a) => (a.id === agentId ? { ...a, position: pos } : a))
                );
              }}
            />
          </div>
        )}

        {activeView === 'war_room' && (
          <WarRoom
            room={room}
            problem={activeProblem}
            problemsList={PROBLEMS_CATALOG}
            onSelectProblem={handleChangeRoomProblem}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            onVoteSubmission={handleVoteSubmission}
            onNavigateToMaker={() => setActiveView('maker')}
            onRefreshRoom={loadRoom}
            onOpenRoomModal={() => setIsRoomModalOpen(true)}
          />
        )}
      </main>

      {/* Room Modal for creating a new room, joining by code, or switching rooms */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        currentRoomId={roomId}
        onSelectOrCreateRoom={handleSelectOrCreateRoom}
      />

      {/* QR Code Modal for joining with mobile / inviting colleagues */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        room={room}
        problem={activeProblem}
      />

      {/* Name prompt: required on first entry, editable from the top nav */}
      <NameModal
        key={authorName}
        isOpen={!authorName || isNameModalOpen}
        currentName={authorName}
        onSave={handleSaveName}
        onClose={authorName ? () => setIsNameModalOpen(false) : undefined}
      />

      {/* Onboarding Guide Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen && !!authorName}
        onClose={handleCloseOnboarding}
        onNavigateToView={(view) => {
          setActiveView(view);
          handleCloseOnboarding();
        }}
      />

      <ChallengeModal
        isOpen={isChallengeOpen && !isOnboardingOpen}
        problem={activeProblem}
        roomName={room.name}
        onClose={() => setIsChallengeOpen(false)}
        onStart={() => {
          setIsChallengeOpen(false);
          setActiveView('maker');
        }}
      />
    </div>
  );
}
