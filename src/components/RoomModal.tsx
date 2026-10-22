import React, { useState, useEffect } from 'react';
import { Problem, Room } from '../types';
import { PROBLEMS_CATALOG } from '../data/problems';
import { soundFx } from '../utils/audio';
import { fetchRoomList, RoomSummary } from '../api/roomsApi';
import {
  X,
  Plus,
  DoorOpen,
  Dices,
  Check,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomId: string;
  onSelectOrCreateRoom: (roomId: string, roomName?: string, problemId?: string) => void;
}

const RANDOM_NAMES = [
  'SRE-WAR-ROOM',
  'DEV-CRASH-99',
  'POSTGRES-OPS',
  'CYBER-CENTINELA',
  'HACKATHON-SWARM',
  'INCIDENTE-P1',
  'KUBERNETES-SAVIORS',
  'LATAM-AGENTS-404'
];

// Suggested rooms, shown after the live rooms from the server
const PRESET_ROOMS: RoomSummary[] = [
  { id: 'SALA-BLACKFRIDAY', name: 'Sala Black Friday War Room', problemId: 'black-friday-crash' },
  { id: 'SALA-ZERO-DAY', name: 'Sala Forense Zero-Day', problemId: 'zero-day-cve' },
  { id: 'SALA-SPIDER-BOT', name: 'Sala Inteligencia de Precios', problemId: 'e-commerce-scraper' },
  { id: 'SALA-VIP-REFUND', name: 'Sala Soporte & Reembolsos', problemId: 'support-refund-bot' }
];

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  currentRoomId,
  onSelectOrCreateRoom
}) => {
  const [tab, setTab] = useState<'create' | 'join' | 'preset'>('create');

  // Create Tab state
  const [newRoomId, setNewRoomId] = useState(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SALA-OPS-${randomSuffix}`;
  });
  const [newRoomName, setNewRoomName] = useState('Sala de Operaciones SRE');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(PROBLEMS_CATALOG[0].id);

  // Join Tab state
  const [joinCode, setJoinCode] = useState('');

  // Available rooms tab: live rooms from the server, refreshed each time the tab is shown
  const [liveRooms, setLiveRooms] = useState<RoomSummary[]>([]);
  useEffect(() => {
    if (isOpen && tab === 'preset') fetchRoomList().then(setLiveRooms);
  }, [isOpen, tab]);
  const liveIds = new Set(liveRooms.map((r) => r.id));
  const availableRooms = [...liveRooms, ...PRESET_ROOMS.filter((r) => !liveIds.has(r.id))];

  if (!isOpen) return null;

  const handleRandomize = () => {
    soundFx.playToolTrigger();
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const code = `SALA-${random}-${Math.floor(10 + Math.random() * 90)}`;
    setNewRoomId(code);
    setNewRoomName(`Sala ${random.replace(/-/g, ' ')}`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomId.trim()) return;

    soundFx.playVictory();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    const cleanId = newRoomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '-');
    onSelectOrCreateRoom(cleanId, newRoomName.trim() || `Sala ${cleanId}`, selectedProblemId);
    onClose();
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    soundFx.playCoin();
    const cleanId = joinCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '-');
    onSelectOrCreateRoom(cleanId);
    onClose();
  };

  const handleSelectPreset = (room: RoomSummary) => {
    soundFx.playCoin();
    // Existing rooms are joined as-is; passing name/problem would overwrite the room's challenge
    if (liveIds.has(room.id)) onSelectOrCreateRoom(room.id);
    else onSelectOrCreateRoom(room.id, room.name, room.problemId);
    onClose();
  };

  const selectedProblem = PROBLEMS_CATALOG.find((p) => p.id === selectedProblemId) || PROBLEMS_CATALOG[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-arcade text-xs text-emerald-400 tracking-wider uppercase">
                Salas Multijugador
              </h3>
              <p className="text-xs font-bold text-white font-mono">
                Sala actual: <span className="text-emerald-300">#{currentRoomId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 bg-slate-950/50 flex gap-2 border-b border-slate-800 text-xs font-arcade">
          <button
            onClick={() => {
              soundFx.playClick();
              setTab('create');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              tab === 'create'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Sala</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setTab('join');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              tab === 'join'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Unirse por Código</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setTab('preset');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              tab === 'preset'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Salas Disponibles</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: CREATE NEW ROOM */}
          {tab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-arcade text-emerald-400">
                    Código Identificador de la Sala
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Generar Aleatorio</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value.toUpperCase())}
                  placeholder="Ej: SALA-INCIDENTE-99"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-sm text-white uppercase focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 font-mono">
                  Este código aparecerá en el enlace para compartir y en el código QR.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">
                  Nombre descriptivo de la Sala:
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Ej: War Room P1 Black Friday"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Shared Challenge Selector for the Room */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-arcade text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Desafío Compartido para toda la Sala:
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Todos los que se unan jugarán este mismo incidente
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PROBLEMS_CATALOG.map((problem) => {
                    const isSelected = selectedProblemId === problem.id;
                    return (
                      <div
                        key={problem.id}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedProblemId(problem.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl shrink-0 p-1 rounded-lg bg-slate-900 border border-slate-800">
                          {problem.emoji}
                        </span>
                        <div className="truncate flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold truncate">{problem.title}</h4>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {problem.severity} · {problem.difficulty}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-arcade"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-arcade font-bold tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Sala y Entrar</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: JOIN BY CODE */}
          {tab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-arcade text-cyan-400">
                  Ingresa el Código de la Sala:
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ej: SALA-BLACKFRIDAY o SALA-OPS-4821"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm text-white uppercase focus:outline-none"
                />
                <p className="text-xs text-slate-400 font-mono">
                  Pídele el código o enlace a quien haya creado la sala o escanea su código QR.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-300 font-mono space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>💡 Consejo de conexión:</span>
                </p>
                <p className="text-cyan-200/80">
                  Al entrar a la sala, automáticamente sincronizarás el desafío y podrás ver las arquitecturas de agentes submiteadas por los demás participantes.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-arcade"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-arcade font-bold tracking-wider shadow-lg shadow-cyan-500/25 flex items-center gap-2 active:scale-95"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Entrar a la Sala</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: AVAILABLE PRESET ROOMS */}
          {tab === 'preset' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-mono">
                Selecciona una de las salas activas para unirte inmediatamente:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {availableRooms.map((room) => {
                  const isCurrent = room.id === currentRoomId;
                  const roomProblem = PROBLEMS_CATALOG.find((p) => p.id === room.problemId);
                  return (
                    <div
                      key={room.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                          {roomProblem?.emoji ?? '🎮'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{room.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              #{room.id}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Sala Actual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-1">
                            {roomProblem?.title}
                          </p>
                          {liveIds.has(room.id) && (
                            <p className="text-[10px] text-emerald-400 font-mono mt-1">
                              {room.players} conectados · {room.submissions} arquitecturas
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectPreset(room)}
                        disabled={isCurrent}
                        className={`px-4 py-2 rounded-xl text-xs font-arcade tracking-wider transition-all flex items-center gap-1.5 shrink-0 justify-center ${
                          isCurrent
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-95 shadow-md shadow-amber-500/20'
                        }`}
                      >
                        <span>{isCurrent ? 'Estás dentro' : 'Unirse'}</span>
                        {!isCurrent && <ArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
