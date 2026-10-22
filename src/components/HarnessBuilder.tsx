import React, { useState } from 'react';
import { AgentHarness, BrainModelId, MuñequitoConfig } from '../types';
import { BRAIN_MODELS } from '../data/brainModels';
import { MCP_TOOLS } from '../data/mcpTools';
import { PixelMuñequito } from './PixelMuñequito';
import { soundFx } from '../utils/audio';
import { Cpu, ShieldCheck, X, Zap, Sparkles } from 'lucide-react';

interface HarnessBuilderProps {
  harness: AgentHarness;
  muñequito: MuñequitoConfig;
  agentName: string;
  systemPrompt: string;
  onUpdateHarness: (newHarness: AgentHarness) => void;
  onUpdateName: (name: string) => void;
  onUpdatePrompt: (prompt: string) => void;
  onQuickSimulate: () => void;
}

type SlotKey = 'primaryMcpId' | 'secondaryMcpId' | 'notifierMcpId' | 'memoryMcpId';

export const HarnessBuilder: React.FC<HarnessBuilderProps> = ({
  harness,
  muñequito,
  agentName,
  systemPrompt,
  onUpdateHarness,
  onUpdateName,
  onUpdatePrompt,
  onQuickSimulate
}) => {
  const [activeDropZone, setActiveDropZone] = useState<SlotKey | null>(null);

  const selectedBrain = BRAIN_MODELS.find((b) => b.id === harness.brainId) || BRAIN_MODELS[0];

  const handleDragOver = (e: React.DragEvent, slot: SlotKey) => {
    e.preventDefault();
    setActiveDropZone(slot);
  };

  const handleDragLeave = () => {
    setActiveDropZone(null);
  };

  const handleDrop = (e: React.DragEvent, slot: SlotKey) => {
    e.preventDefault();
    setActiveDropZone(null);
    const mcpId = e.dataTransfer.getData('application/mcp-id');
    if (mcpId) {
      soundFx.playEquip();
      onUpdateHarness({
        ...harness,
        [slot]: mcpId
      });
    }
  };

  const handleRemoveSlot = (slot: SlotKey) => {
    soundFx.playClick();
    onUpdateHarness({
      ...harness,
      [slot]: null
    });
  };

  const renderSlot = (slotKey: SlotKey, label: string, hint: string) => {
    const equippedId = harness[slotKey];
    const equippedTool = MCP_TOOLS.find((t) => t.id === equippedId);
    const isDragTarget = activeDropZone === slotKey;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, slotKey)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slotKey)}
        className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 min-h-[105px] ${
          isDragTarget
            ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50 scale-[1.02]'
            : equippedTool
            ? 'border-slate-700 bg-slate-900/90 shadow-sm'
            : 'border-dashed border-slate-800 bg-slate-950/40 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: equippedTool ? equippedTool.badgeColor : '#475569' }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              {label}
            </span>
          </div>

          {equippedTool && (
            <button
              onClick={() => handleRemoveSlot(slotKey)}
              className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
              title="Desequipar slot"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {equippedTool ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">{equippedTool.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {equippedTool.methods[0]?.name}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 text-center">
            <span className="text-xs text-slate-500 font-medium">{hint}</span>
            <span className="text-[10px] text-slate-600 mt-0.5">Arrastra aquí un MCP</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 border-t border-slate-800/40 pt-1">
          <span>SOCKET 0{slotKey === 'primaryMcpId' ? '1' : slotKey === 'secondaryMcpId' ? '2' : slotKey === 'notifierMcpId' ? '3' : '4'}</span>
          <span className="font-code text-slate-400">{equippedTool ? 'CONNECTED' : 'EMPTY'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="font-arcade text-xs text-emerald-400">01.</span>
            <span>Harness de Agente & Workbench</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configura el motor cerebral, conecta los conectores MCP y asigna la personalidad del agente.
          </p>
        </div>

        <button
          onClick={onQuickSimulate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Probar en la Arena</span>
        </button>
      </div>

      {/* Main Grid: Muñequito Identity & Brain & Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar + Name + System Prompt */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
              <PixelMuñequito config={muñequito} size="sm" state="idle" showPlatform={false} />
            </div>

            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Nombre del Agente
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => onUpdateName(e.target.value)}
                placeholder="Ej. KukiBot Turbo 3000"
                className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Directiva de Sistema (Prompt / Personalidad)
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => onUpdatePrompt(e.target.value)}
              placeholder="Define las instrucciones maestras del agente..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none font-code"
            />
          </div>

          {/* Guardrail mode selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardrail de Ejecución</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'strict-sandbox', label: 'Sandbox Estricto' },
                { id: 'human-in-loop', label: 'Human-in-Loop' },
                { id: 'autonomous', label: 'Autónomo' }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    soundFx.playClick();
                    onUpdateHarness({ ...harness, guardrailMode: g.id as AgentHarness['guardrailMode'] });
                  }}
                  className={`px-2 py-1.5 text-[11px] rounded-md border text-center transition-colors cursor-pointer truncate ${
                    harness.guardrailMode === g.id
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-medium'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Brain Model Selector & 4 MCP Slots */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Brain Model Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Motor Cognitivo (Brain Core)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-code">
                {selectedBrain.contextWindow}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BRAIN_MODELS.map((b) => {
                const isSelected = harness.brainId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      soundFx.playClick();
                      onUpdateHarness({ ...harness, brainId: b.id });
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-800 shadow-sm'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-100 truncate w-full">{b.name}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{b.provider}</span>
                    <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
                      <span>Razonam.</span>
                      <span className="font-code text-cyan-400 font-semibold">{b.reasoning}/10</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 italic">
              {selectedBrain.tagline}
            </p>
          </div>

          {/* 4 Harness Sockets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Harness Slots (Conectores MCP)</span>
              </span>
              <span className="text-xs text-slate-400">
                {[harness.primaryMcpId, harness.secondaryMcpId, harness.notifierMcpId, harness.memoryMcpId].filter(Boolean).length}/4 Conectados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderSlot('primaryMcpId', 'Slot 01 · Primario', 'Base de datos / Repo')}
              {renderSlot('secondaryMcpId', 'Slot 02 · Acción', 'Ejecutor / Navegador')}
              {renderSlot('notifierMcpId', 'Slot 03 · Notificador', 'Slack / Telemetría')}
              {renderSlot('memoryMcpId', 'Slot 04 · Memoria', 'Vector Cache / Contexto')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
