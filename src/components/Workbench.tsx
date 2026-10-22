import React, { useState } from 'react';
import { Problem, AgentHarness, MuñequitoConfig } from '../types';
import { BRAIN_MODELS } from '../data/brainModels';
import { MCP_TOOLS } from '../data/mcpTools';
import { PixelMuñequito } from './PixelMuñequito';
import { soundFx } from '../utils/audio';
import { Dices, Sparkles, X, Plus, Rocket, ShieldCheck } from 'lucide-react';

interface WorkbenchProps {
  problem: Problem;
  problemsList: Problem[];
  onSelectProblem: (p: Problem) => void;
  harness: AgentHarness;
  onUpdateHarness: (h: AgentHarness) => void;
  muñequito: MuñequitoConfig;
  onUpdateMuñequito: (m: MuñequitoConfig) => void;
  agentName: string;
  onUpdateName: (name: string) => void;
  onLaunchSimulation: () => void;
  onOpenOnboarding: () => void;
}

const COLOR_PRESETS = [
  { name: 'Verde Cyber', emoji: '🟢', skin: '#10b981', sec: '#047857', glow: '#34d399' },
  { name: 'Púrpura Neón', emoji: '🟣', skin: '#8b5cf6', sec: '#6d28d9', glow: '#c084fc' },
  { name: 'Cian Láser', emoji: '🔵', skin: '#06b6d4', sec: '#0e7490', glow: '#22d3ee' },
  { name: 'Oro Solar', emoji: '🟡', skin: '#f59e0b', sec: '#b45309', glow: '#fbbf24' },
  { name: 'Furia Roja', emoji: '🔴', skin: '#ef4444', sec: '#b91c1c', glow: '#f87171' }
];

const HELMETS = [
  { id: 'crt-robot', label: 'Monitor CRT', emoji: '📺' },
  { id: 'cyber-visor', label: 'Visor Cyber', emoji: '🥽' },
  { id: 'mech-horns', label: 'Cuernos Mech', emoji: '😈' },
  { id: 'hacker-hood', label: 'Capucha Hacker', emoji: '🥷' },
  { id: 'neon-crown', label: 'Corona Neón', emoji: '👑' },
  { id: 'space-helm', label: 'Casco Espacial', emoji: '🧑‍🚀' }
] as const;

export const Workbench: React.FC<WorkbenchProps> = ({
  problem,
  problemsList,
  onSelectProblem,
  harness,
  onUpdateHarness,
  muñequito,
  onUpdateMuñequito,
  agentName,
  onUpdateName,
  onLaunchSimulation,
  onOpenOnboarding
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'customizer'>('tools');

  const selectedBrain = BRAIN_MODELS.find((b) => b.id === harness.brainId) || BRAIN_MODELS[0];
  const primaryTool = MCP_TOOLS.find((t) => t.id === harness.primaryMcpId);
  const secondaryTool = MCP_TOOLS.find((t) => t.id === harness.secondaryMcpId);
  const notifierTool = MCP_TOOLS.find((t) => t.id === harness.notifierMcpId);

  const handleRandomizeAvatar = () => {
    soundFx.playToolTrigger();
    const randomColor = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];
    const randomHelmet = HELMETS[Math.floor(Math.random() * HELMETS.length)].id;
    onUpdateMuñequito({
      ...muñequito,
      skinColor: randomColor.skin,
      secondaryColor: randomColor.sec,
      glowColor: randomColor.glow,
      helmet: randomHelmet
    });
  };

  const handleEquipTool = (mcpId: string) => {
    soundFx.playEquip();
    if (!harness.primaryMcpId || harness.primaryMcpId === mcpId) {
      onUpdateHarness({ ...harness, primaryMcpId: mcpId });
    } else if (!harness.secondaryMcpId || harness.secondaryMcpId === mcpId) {
      onUpdateHarness({ ...harness, secondaryMcpId: mcpId });
    } else {
      onUpdateHarness({ ...harness, notifierMcpId: mcpId });
    }
  };

  const handleDropToSlot = (e: React.DragEvent, slot: 'primaryMcpId' | 'secondaryMcpId' | 'notifierMcpId') => {
    e.preventDefault();
    const mcpId = e.dataTransfer.getData('application/mcp-id');
    if (mcpId) {
      soundFx.playEquip();
      onUpdateHarness({ ...harness, [slot]: mcpId });
    }
  };

  const handleRemoveSlot = (slot: 'primaryMcpId' | 'secondaryMcpId' | 'notifierMcpId') => {
    soundFx.playClick();
    onUpdateHarness({ ...harness, [slot]: null });
  };

  const equippedCount = [harness.primaryMcpId, harness.secondaryMcpId, harness.notifierMcpId].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. TOP: Problem Selector Strip with Representative Boss Images & Emojis */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Paso 1: Elige la Problemática a Resolver
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenOnboarding();
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>❓</span>
              <span>¿Cómo Jugar?</span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {problemsList.length} Desafíos disponibles
            </span>
          </div>
        </div>

        {/* Problem Cards Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {problemsList.map((p) => {
            const isSelected = problem.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectProblem(p);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/30 ring-1 ring-emerald-500/50 shadow-md scale-[1.02]'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Boss Thumbnail or Emoji */}
                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{p.emoji}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200 truncate">
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.title.split(':')[0]}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                    {p.difficulty} · {p.severity.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Problem Briefing Box with Boss Art */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center gap-5 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
          {problem.image && (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-lg shrink-0 relative group">
              <img
                src={problem.image}
                alt={problem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-1 right-1 text-xs bg-black/70 px-1.5 py-0.5 rounded text-white font-arcade">
                BOSS
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-xl">{problem.emoji}</span>
              <h4 className="text-base font-bold text-white">{problem.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {problem.description}
            </p>
            <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center justify-center md:justify-start gap-1">
              <span>🏆 Objetivo:</span>
              <span className="text-slate-200">{problem.winCriteria}</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-end gap-1.5 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-arcade uppercase">
              Dificultad: <span className="text-amber-400 font-bold">{problem.difficulty}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-code">
              Prioridad: {problem.severity}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CENTER: The Workbench (Muñequito in Center + Surrounding Harness Sockets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left/Center Column: The Muñequito Chassis & Direct Sockets */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Title & Quick Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => onUpdateName(e.target.value)}
                  placeholder="Nombre de tu muñequito"
                  className="bg-transparent font-arcade text-sm sm:text-base font-bold text-emerald-300 border-b border-dashed border-slate-600 focus:outline-none focus:border-emerald-400 pb-0.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRandomizeAvatar}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Generar estilo aleatorio"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-400" />
                  <span>Random</span>
                </button>
              </div>
            </div>

            {/* Central Stage with Sockets around Muñequito */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 arcade-grid">
              {/* Left Socket: Brain Core */}
              <div className="sm:col-span-4 flex flex-col gap-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                    <span>🧠</span>
                    <span>Cerebro AI</span>
                  </div>
                  <div className="space-y-1.5">
                    {BRAIN_MODELS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          soundFx.playClick();
                          onUpdateHarness({ ...harness, brainId: b.id });
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          harness.brainId === b.id
                            ? 'bg-cyan-950 text-cyan-200 border border-cyan-500 font-bold shadow-sm'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{b.emoji}</span>
                          <span className="truncate">{b.name}</span>
                        </span>
                        <span className="font-code text-[10px] text-slate-500">{b.contextWindow}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: Big Animated Muñequito */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center py-2">
                <PixelMuñequito config={muñequito} size="xl" state="idle" showPlatform={true} />
                <div className="flex items-center gap-1 mt-3">
                  {COLOR_PRESETS.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundFx.playClick();
                        onUpdateMuñequito({
                          ...muñequito,
                          skinColor: c.skin,
                          secondaryColor: c.sec,
                          glowColor: c.glow
                        });
                      }}
                      className="text-base p-1 hover:scale-125 transition-transform cursor-pointer"
                      title={c.name}
                    >
                      {c.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Sockets: 3 Harness Slots for MCPs */}
              <div className="sm:col-span-4 flex flex-col gap-2">
                {/* Slot 1: Primario */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropToSlot(e, 'primaryMcpId')}
                  className={`p-2.5 rounded-xl border transition-all text-xs ${
                    primaryTool
                      ? 'bg-slate-900 border-emerald-500/70 shadow-sm'
                      : 'bg-slate-950/60 border-dashed border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span>🛠️ SLOT 01: PRIMARIO</span>
                    {primaryTool && (
                      <button onClick={() => handleRemoveSlot('primaryMcpId')} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {primaryTool ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{primaryTool.emoji}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{primaryTool.name}</span>
                        <span className="text-[10px] text-emerald-400">Conectado</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-600 italic block text-center py-1">Toca un MCP abajo</span>
                  )}
                </div>

                {/* Slot 2: Secundario */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropToSlot(e, 'secondaryMcpId')}
                  className={`p-2.5 rounded-xl border transition-all text-xs ${
                    secondaryTool
                      ? 'bg-slate-900 border-purple-500/70 shadow-sm'
                      : 'bg-slate-950/60 border-dashed border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span>⚡ SLOT 02: ACCIÓN</span>
                    {secondaryTool && (
                      <button onClick={() => handleRemoveSlot('secondaryMcpId')} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {secondaryTool ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{secondaryTool.emoji}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{secondaryTool.name}</span>
                        <span className="text-[10px] text-purple-400">Conectado</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-600 italic block text-center py-1">Toca un MCP abajo</span>
                  )}
                </div>

                {/* Slot 3: Notificador */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropToSlot(e, 'notifierMcpId')}
                  className={`p-2.5 rounded-xl border transition-all text-xs ${
                    notifierTool
                      ? 'bg-slate-900 border-cyan-500/70 shadow-sm'
                      : 'bg-slate-950/60 border-dashed border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span>📢 SLOT 03: REPORTE</span>
                    {notifierTool && (
                      <button onClick={() => handleRemoveSlot('notifierMcpId')} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {notifierTool ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{notifierTool.emoji}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{notifierTool.name}</span>
                        <span className="text-[10px] text-cyan-400">Conectado</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-600 italic block text-center py-1">Toca un MCP abajo</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Big Launch Button */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span className="font-bold text-white">{equippedCount}/3</span> MCPs equipados en el arnés
            </div>

            <button
              onClick={onLaunchSimulation}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Rocket className="w-5 h-5 fill-current" />
              <span>¡LANZAR A RESOLVER!</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual MCP Tool Deck (Grid of click-to-equip cards) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧰</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Paso 2: Toca para Equipar MCPs
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Click o Arrastra</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {MCP_TOOLS.map((tool) => {
              const isEquipped =
                harness.primaryMcpId === tool.id ||
                harness.secondaryMcpId === tool.id ||
                harness.notifierMcpId === tool.id;

              return (
                <button
                  key={tool.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/mcp-id', tool.id);
                  }}
                  onClick={() => handleEquipTool(tool.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-emerald-400 bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{tool.emoji}</span>
                    {isEquipped ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        ✓ EQUIPADO
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                        + Equipar
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 truncate w-full">
                    {tool.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
