import React, { useState } from 'react';
import { Problem, Room, MultiAgentDesign } from '../types';
import { PixelMuñequito } from './PixelMuñequito';
import { AgentDiagramView } from './AgentDiagramView';
import { soundFx } from '../utils/audio';
import {
  Users,
  QrCode,
  Sparkles,
  Star,
  Eye,
  Plus,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Cpu,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WarRoomProps {
  room: Room;
  problem: Problem;
  problemsList: Problem[];
  onSelectProblem: (problemId: string) => void;
  onOpenQrModal: () => void;
  onVoteSubmission: (submissionId: string) => void;
  onCloneSubmission: (design: MultiAgentDesign) => void;
  onNavigateToMaker: () => void;
  onRefreshRoom?: () => void;
  onOpenRoomModal: () => void;
}

export const WarRoom: React.FC<WarRoomProps> = ({
  room,
  problem,
  problemsList,
  onSelectProblem,
  onOpenQrModal,
  onVoteSubmission,
  onCloneSubmission,
  onNavigateToMaker,
  onRefreshRoom,
  onOpenRoomModal
}) => {
  const [inspectingDesign, setInspectingDesign] = useState<MultiAgentDesign | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isChangingProblem, setIsChangingProblem] = useState(false);

  // Submissions for this challenge
  const roomSubmissions = room.submissions.filter(
    (s) => s.problemId === problem.id || s.roomId === room.id
  );

  const filteredSubmissions = roomSubmissions.filter((s) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.author.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term)
    );
  });

  const handleVote = (id: string) => {
    soundFx.playCoin();
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 }
    });
    onVoteSubmission(id);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* War Room Header & Challenge Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                  Sala Conectada
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{room.id}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                {room.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenRoomModal();
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 hover:border-emerald-400 text-slate-200 hover:text-white text-xs font-arcade tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-emerald-500/5"
              title="Crear una nueva sala o unirse a otra"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Crear / Cambiar Sala</span>
            </button>

            {onRefreshRoom && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onRefreshRoom();
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
                title="Sincronizar sala en vivo"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenQrModal();
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-arcade tracking-wider transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 active:scale-95"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>📱 Unirse con QR</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onNavigateToMaker();
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-arcade tracking-wider font-bold transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Diseñar Enjambre</span>
            </button>
          </div>
        </div>

        {/* Challenge Box (All players in the room share this exact challenge!) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">
              {problem.emoji}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-arcade text-amber-400">
                  Desafío Compartido de la Sala
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {problem.severity}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{problem.title}</h3>
              <p className="text-xs text-slate-400 font-mono">{problem.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsChangingProblem(!isChangingProblem)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              {isChangingProblem ? 'Cerrar selector' : 'Cambiar Desafío'}
            </button>
          </div>
        </div>

        {/* Change problem selector dropdown */}
        {isChangingProblem && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
            <span className="text-xs font-arcade text-slate-300">
              Seleccionar Desafío para toda la Sala:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {problemsList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    soundFx.playClick();
                    onSelectProblem(p.id);
                    setIsChangingProblem(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 ${
                    p.id === problem.id
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <div className="truncate">
                    <p className="text-xs truncate">{p.title}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{p.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submissions Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Arquitecturas Multi-Agente Enviadas</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-arcade bg-slate-800 text-emerald-400">
                {roomSubmissions.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Diseños creados por los participantes para resolver este incidente.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por autor o título..."
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 w-48 sm:w-64 font-mono"
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-3xl">
              👾
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-arcade">
                Aún no hay arquitecturas en esta sala
              </h3>
              <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                Sé el primero en componer tu equipo de agentes en el Taller de Arquitectura y publícalo para que todos lo exploren.
              </p>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigateToMaker();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-arcade font-bold tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Taller y Crear Agentes</span>
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubmissions.map((sub) => {
              // Count total MCPs across swarm
              const totalMcps = Array.from(
                new Set(sub.agents.flatMap((a) => a.mcpToolIds))
              ).length;

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between gap-4 shadow-xl group"
                >
                  {/* Card Top */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Author badge */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                          <PixelMuñequito config={sub.authorAvatar} size="sm" showPlatform={false} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{sub.author}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{sub.authorHandle}</span>
                        </div>
                      </div>

                      {/* Vote Button */}
                      <button
                        onClick={() => handleVote(sub.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-arcade flex items-center gap-1.5 transition-all active:scale-95 ${
                          sub.hasVoted
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${sub.hasVoted ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span>{sub.votes}</span>
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono line-clamp-2 mt-1">
                        {sub.description}
                      </p>
                    </div>

                    {/* Muñequitos Mini Preview Row */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center -space-x-3">
                        {sub.agents.slice(0, 4).map((agent) => (
                          <div
                            key={agent.id}
                            className="w-10 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md overflow-hidden"
                            title={`${agent.name} (${agent.role})`}
                          >
                            <PixelMuñequito config={agent.muñequito} size="sm" showPlatform={false} />
                          </div>
                        ))}
                        {sub.agents.length > 4 && (
                          <div className="w-10 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono text-slate-300">
                            +{sub.agents.length - 4}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-arcade text-emerald-400 block">
                          {sub.agents.length} Agentes
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300">
                          {totalMcps} MCPs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setInspectingDesign(sub);
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-arcade tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Diagrama</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playCoin();
                        onCloneSubmission(sub);
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-arcade tracking-wider transition-colors flex items-center gap-1"
                      title="Clonar este enjambre en tu Builder para editarlo"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Clonar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Screen Diagram Inspector Modal */}
      {inspectingDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="font-arcade text-xs text-emerald-400 tracking-wider">
                Diagrama de Agentes // {inspectingDesign.title}
              </span>
              <button
                onClick={() => setInspectingDesign(null)}
                className="px-3 py-1 rounded-lg text-xs font-arcade bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Volver a la Sala
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <AgentDiagramView
                design={inspectingDesign}
                onClone={() => {
                  onCloneSubmission(inspectingDesign);
                  setInspectingDesign(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
