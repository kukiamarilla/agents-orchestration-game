import React from 'react';
import { AgentNode } from '../types';
import { MCP_TOOLS } from '../data/mcpTools';
import { PixelMuñequito } from './PixelMuñequito';
import { X, Sparkles, MessageSquare, Terminal, Cpu, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AgentDetailModalProps {
  agent: AgentNode | null;
  allAgents: AgentNode[];
  onClose: () => void;
  onSelectRelatedAgent?: (agentId: string) => void;
  onToggleCommunication?: (sourceId: string, targetId: string) => void;
  onToggleSpawn?: (parentId: string, childId: string) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  allAgents,
  onClose,
  onSelectRelatedAgent,
  onToggleCommunication,
  onToggleSpawn
}) => {
  if (!agent) return null;

  const equippedTools = MCP_TOOLS.filter((tool) => agent.mcpToolIds.includes(tool.id));
  const otherAgents = allAgents.filter((a) => a.id !== agent.id);

  const parentAgent = agent.spawnedByAgentId
    ? allAgents.find((a) => a.id === agent.spawnedByAgentId)
    : null;

  const communicatingAgents = allAgents.filter((a) =>
    agent.communicatesWith.includes(a.id)
  );

  const spawnedAgents = allAgents.filter((a) =>
    agent.spawnsAgentIds.includes(a.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Retro Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block" />
            <h3 className="font-arcade text-xs tracking-wider text-emerald-400 uppercase">
              Inspector de Agente // {agent.name}
            </h3>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Profile Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="shrink-0 flex flex-col items-center">
              <PixelMuñequito config={agent.muñequito} size="md" state="idle" />
              <div className="mt-2 text-[10px] font-arcade px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Avatar del Agente
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">{agent.name}</h2>
                {agent.isSpawned ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    <Sparkles className="w-3 h-3" />
                    Invocado en runtime
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Cpu className="w-3 h-3" />
                    Agente Predeterminado
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-slate-400 font-mono">
                Rol: <span className="text-amber-300">{agent.role || 'Operador Especialista'}</span>
              </p>

              {parentAgent && (
                <p className="text-xs text-purple-300 bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-800/60 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Creado dinámicamente por:{' '}
                  <button
                    onClick={() => onSelectRelatedAgent?.(parentAgent.id)}
                    className="font-bold underline hover:text-white transition-colors"
                  >
                    {parentAgent.name}
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* System Prompt Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-arcade text-emerald-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                System Prompt (Directiva Operativa)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Simulado en el juego</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300/90 font-code text-sm leading-relaxed shadow-inner">
              <span className="text-emerald-500 select-none mr-2">{'>'}</span>
              {agent.systemPrompt || 'Sin directiva especificada. El agente opera con comportamiento predeterminado.'}
            </div>
          </div>

          {/* MCP Tools Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-arcade text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Herramientas MCP Equipadas ({equippedTools.length})
              </label>
              <span className="text-[10px] text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                Sin límite de slots
              </span>
            </div>

            {equippedTools.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
                Este agente no tiene herramientas MCP asignadas todavía.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {equippedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {tool.emoji}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{tool.name}</h4>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {tool.vendor}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{tool.description}</p>
                    <div className="pt-1 border-t border-slate-800/80 flex flex-wrap gap-1">
                      {tool.methods.map((m) => (
                        <span
                          key={m.name}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Relationship Configuration (Communication & Invocations) */}
          <div className="space-y-4 pt-2">
            {/* 1. Canales de Comunicación (Quién se puede comunicar con quién) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-arcade text-cyan-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Canales de Comunicación ({communicatingAgents.length})
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Define con qué otros agentes puede intercambiar mensajes directos:
                  </p>
                </div>
              </div>

              {otherAgents.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No hay otros agentes en el enjambre.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {otherAgents.map((other) => {
                    const isConnected = agent.communicatesWith.includes(other.id);
                    return (
                      <div
                        key={other.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          isConnected
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span className="text-xs font-bold text-white truncate">{other.name}</span>
                        </div>

                        {onToggleCommunication ? (
                          <button
                            onClick={() => {
                              soundFx.playConnect();
                              onToggleCommunication(agent.id, other.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-arcade tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              isConnected
                                ? 'bg-cyan-500 hover:bg-rose-500 text-slate-950 hover:text-white'
                                : 'bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Conectado</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Conectar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-cyan-400">
                            {isConnected ? '✓ Conectado' : 'Desconectado'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Invocaciones en Runtime (Quién puede invocar a quién) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-arcade text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Invocación de Sub-Agentes ({spawnedAgents.length})
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Define qué agentes puede crear o instanciar dinámicamente en runtime:
                  </p>
                </div>
              </div>

              {otherAgents.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No hay otros agentes en el enjambre.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {otherAgents.map((other) => {
                    const isSpawnedByThis = agent.spawnsAgentIds.includes(other.id);
                    return (
                      <div
                        key={other.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          isSpawnedByThis
                            ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Sparkles className={`w-3.5 h-3.5 ${isSpawnedByThis ? 'text-purple-400' : 'text-slate-600'}`} />
                          <span className="text-xs font-bold text-white truncate">{other.name}</span>
                        </div>

                        {onToggleSpawn ? (
                          <button
                            onClick={() => {
                              soundFx.playConnect();
                              onToggleSpawn(agent.id, other.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-arcade tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              isSpawnedByThis
                                ? 'bg-purple-500 hover:bg-rose-500 text-slate-950 hover:text-white'
                                : 'bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isSpawnedByThis ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Invoca</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Permitir Invocar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-purple-400">
                            {isSpawnedByThis ? '✓ Invocado' : 'No invoca'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-arcade tracking-wider transition-colors cursor-pointer"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
