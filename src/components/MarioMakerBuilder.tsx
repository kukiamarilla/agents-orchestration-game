import React, { useState } from 'react';
import { AgentNode, McpTool, MuñequitoConfig, Problem, MultiAgentDesign } from '../types';
import { MCP_TOOLS } from '../data/mcpTools';
import { PixelMuñequito } from './PixelMuñequito';
import { MuñequitoCustomizer } from './MuñequitoCustomizer';
import { soundFx } from '../utils/audio';
import {
  Pointer,
  Plus,
  Zap,
  Sparkles,
  Eraser,
  Layers,
  Send,
  HelpCircle,
  Eye,
  Cpu,
  Terminal,
  MessageSquare,
  Check,
  X,
  Palette,
  Shuffle,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MarioMakerBuilderProps {
  problem: Problem;
  agents: AgentNode[];
  onUpdateAgents: (agents: AgentNode[]) => void;
  onPreviewDiagram: () => void;
  onSubmitToRoom: (design: { title: string; description: string }) => void;
  authorName: string;
}

type MakerTool = 'pointer' | 'add_agent' | 'connect_comm' | 'connect_spawn' | 'eraser';

const PROMPT_PRESETS = [
  {
    label: '🧠 Orquestador & Triage',
    prompt: 'Supervisa el flujo del incidente, clasifica severidad y despacha sub-agentes según los logs de error.'
  },
  {
    label: '🐘 DBA Postgres Fixer',
    prompt: 'Se conecta a PostgreSQL, busca transacciones trabadas o deadlocks y liquida los procesos bloqueantes.'
  },
  {
    label: '🐙 Git & Auto-Patch',
    prompt: 'Inspecciona archivos fuente, aplica el parche correctivo en sandbox y abre Pull Request de emergencia.'
  },
  {
    label: '💬 Alertas & SRE Comms',
    prompt: 'Sintetiza las acciones de remediación, envía reportes periódicos al canal de Slack y actualiza la guardia.'
  },
  {
    label: '⚡ Worker Efímero Spawned',
    prompt: 'Instanciado bajo demanda para ejecutar tareas paralelas intensivas y transferir el resultado al orquestador.'
  }
];

export const MarioMakerBuilder: React.FC<MarioMakerBuilderProps> = ({
  problem,
  agents,
  onUpdateAgents,
  onPreviewDiagram,
  onSubmitToRoom,
  authorName
}) => {
  const [activeTool, setActiveTool] = useState<MakerTool>('pointer');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    agents.length > 0 ? agents[0].id : null
  );

  // Connection tool states
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);

  // Inspector tabs: 'config' | 'prompt' | 'mcps' | 'avatar'
  const [inspectorTab, setInspectorTab] = useState<'prompt' | 'mcps' | 'avatar' | 'connections'>('prompt');

  // Submit modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitTitle, setSubmitTitle] = useState('Mi Enjambre Multi-Agente');
  const [submitDescription, setSubmitDescription] = useState('Arquitectura colaborativa de agentes y herramientas MCP.');

  // Problem info popover
  const [showProblemInfo, setShowProblemInfo] = useState(false);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;

  // Grid dimensions
  const GRID_COLS = 5;
  const GRID_ROWS = 4;

  const handleCellClick = (x: number, y: number) => {
    const existing = agents.find((a) => a.position.x === x && a.position.y === y);

    if (activeTool === 'eraser') {
      if (existing) {
        soundFx.playErase();
        deleteAgent(existing.id);
      }
      return;
    }

    if (activeTool === 'add_agent') {
      if (!existing) {
        soundFx.playPlace();
        createAgentAt(x, y);
      } else {
        setSelectedAgentId(existing.id);
      }
      return;
    }

    if (activeTool === 'connect_comm' || activeTool === 'connect_spawn') {
      if (!existing) return;

      if (!connectionSourceId) {
        soundFx.playClick();
        setConnectionSourceId(existing.id);
      } else {
        if (connectionSourceId === existing.id) {
          setConnectionSourceId(null);
          return;
        }

        soundFx.playConnect();
        if (activeTool === 'connect_comm') {
          toggleCommunication(connectionSourceId, existing.id);
        } else {
          toggleSpawnRelationship(connectionSourceId, existing.id);
        }
        setConnectionSourceId(null);
      }
      return;
    }

    // Default pointer: select
    if (existing) {
      soundFx.playClick();
      setSelectedAgentId(existing.id);
    }
  };

  const createAgentAt = (x: number, y: number) => {
    const newId = `agent-${Date.now()}`;
    const agentNum = agents.length + 1;
    const isFirst = agents.length === 0;

    const newAgent: AgentNode = {
      id: newId,
      name: `Agente ${agentNum}`,
      role: isFirst ? 'Orquestador Principal' : 'Operador Especialista',
      systemPrompt: isFirst
        ? 'Orquestador central: coordina tareas, monitorea el desafío y delega a sub-agentes.'
        : 'Ejecuta directivas operativas y reporta estado al orquestador.',
      muñequito: {
        skinColor: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][agents.length % 5],
        secondaryColor: ['#047857', '#1d4ed8', '#6d28d9', '#be185d', '#b45309'][agents.length % 5],
        glowColor: ['#34d399', '#60a5fa', '#c084fc', '#f472b6', '#fcd34d'][agents.length % 5],
        helmet: ['crt-robot', 'cyber-visor', 'mech-horns', 'space-helm'][agents.length % 4] as any,
        visor: ['scanline-slit', 'cyclops-beam', 'matrix-dots', 'retro-shades'][agents.length % 4] as any,
        suit: ['cyber-jacket', 'mech-armor', 'stealth-chassis', 'nano-suit'][agents.length % 4] as any,
        accessory: ['energy-halo', 'shoulder-drone', 'data-tentacles', 'satellite-dish'][agents.length % 4] as any
      },
      mcpToolIds: isFirst ? ['pagerduty', 'slack'] : ['postgres'],
      communicatesWith: isFirst ? [] : (agents[0] ? [agents[0].id] : []),
      canSpawn: isFirst,
      spawnsAgentIds: [],
      isSpawned: !isFirst && agents.length > 1,
      spawnedByAgentId: !isFirst && agents.length > 1 ? agents[0].id : undefined,
      position: { x, y }
    };

    const nextAgents = [...agents, newAgent];
    // If spawned by first, update first agent spawns list
    if (newAgent.spawnedByAgentId) {
      const parent = nextAgents.find((a) => a.id === newAgent.spawnedByAgentId);
      if (parent && !parent.spawnsAgentIds.includes(newId)) {
        parent.spawnsAgentIds.push(newId);
      }
    }

    onUpdateAgents(nextAgents);
    setSelectedAgentId(newId);
  };

  const deleteAgent = (agentId: string) => {
    const nextAgents = agents
      .filter((a) => a.id !== agentId)
      .map((a) => ({
        ...a,
        communicatesWith: a.communicatesWith.filter((id) => id !== agentId),
        spawnsAgentIds: a.spawnsAgentIds.filter((id) => id !== agentId),
        isSpawned: a.spawnedByAgentId === agentId ? false : a.isSpawned,
        spawnedByAgentId: a.spawnedByAgentId === agentId ? undefined : a.spawnedByAgentId
      }));

    onUpdateAgents(nextAgents);
    if (selectedAgentId === agentId) {
      setSelectedAgentId(nextAgents.length > 0 ? nextAgents[0].id : null);
    }
  };

  const toggleCommunication = (sourceId: string, targetId: string) => {
    const nextAgents = agents.map((agent) => {
      if (agent.id === sourceId) {
        const hasComm = agent.communicatesWith.includes(targetId);
        return {
          ...agent,
          communicatesWith: hasComm
            ? agent.communicatesWith.filter((id) => id !== targetId)
            : [...agent.communicatesWith, targetId]
        };
      }
      if (agent.id === targetId) {
        const hasComm = agent.communicatesWith.includes(sourceId);
        return {
          ...agent,
          communicatesWith: hasComm
            ? agent.communicatesWith.filter((id) => id !== sourceId)
            : [...agent.communicatesWith, sourceId]
        };
      }
      return agent;
    });
    onUpdateAgents(nextAgents);
  };

  const toggleSpawnRelationship = (parentId: string, childId: string) => {
    const nextAgents = agents.map((agent) => {
      if (agent.id === parentId) {
        const alreadySpawns = agent.spawnsAgentIds.includes(childId);
        return {
          ...agent,
          canSpawn: true,
          spawnsAgentIds: alreadySpawns
            ? agent.spawnsAgentIds.filter((id) => id !== childId)
            : [...agent.spawnsAgentIds, childId]
        };
      }
      if (agent.id === childId) {
        const isCurrentParent = agent.spawnedByAgentId === parentId;
        return {
          ...agent,
          isSpawned: !isCurrentParent,
          spawnedByAgentId: isCurrentParent ? undefined : parentId
        };
      }
      return agent;
    });
    onUpdateAgents(nextAgents);
  };

  const updateSelectedAgent = (updates: Partial<AgentNode>) => {
    if (!selectedAgentId) return;
    const nextAgents = agents.map((a) => {
      if (a.id === selectedAgentId) {
        return { ...a, ...updates };
      }
      return a;
    });
    onUpdateAgents(nextAgents);
  };

  const toggleMcpForSelectedAgent = (mcpId: string) => {
    if (!selectedAgent) return;
    soundFx.playCoin();
    const hasTool = selectedAgent.mcpToolIds.includes(mcpId);
    const nextTools = hasTool
      ? selectedAgent.mcpToolIds.filter((id) => id !== mcpId)
      : [...selectedAgent.mcpToolIds, mcpId];
    updateSelectedAgent({ mcpToolIds: nextTools });
  };

  const handleAutoLayout = () => {
    soundFx.playEquip();
    // Position agents neatly in a flow
    const nextAgents = agents.map((agent, idx) => {
      // 0: top center (x:2, y:0), workers in middle (x: 1, 2, 3; y: 1 or 2), notifiers at bottom
      let x = 2;
      let y = 1;
      if (idx === 0) {
        x = 2;
        y = 0;
      } else if (idx === 1) {
        x = 1;
        y = 1;
      } else if (idx === 2) {
        x = 3;
        y = 1;
      } else if (idx === 3) {
        x = 2;
        y = 2;
      } else {
        x = idx % GRID_COLS;
        y = Math.min(GRID_ROWS - 1, Math.floor(idx / GRID_COLS) + 1);
      }
      return { ...agent, position: { x, y } };
    });
    onUpdateAgents(nextAgents);
  };

  const handleOpenSubmit = () => {
    if (agents.length === 0) {
      soundFx.playError();
      return;
    }
    soundFx.playClick();
    setSubmitTitle(`${authorName} Swarm: ${problem.title}`);
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    soundFx.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onSubmitToRoom({
      title: submitTitle,
      description: submitDescription
    });
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Super Mario Maker Top Arcade Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mario Maker Tool Selection Palette */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            {/* Tool 1: Pointer */}
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTool('pointer');
                setConnectionSourceId(null);
              }}
              title="Seleccionar & Mover Agente"
              className={`p-2 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all ${
                activeTool === 'pointer'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Pointer className="w-4 h-4" />
              <span className="hidden md:inline">Seleccionar</span>
            </button>

            {/* Tool 2: Add Agent */}
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTool('add_agent');
                setConnectionSourceId(null);
              }}
              title="Colocar nuevo Agente en la cuadrícula"
              className={`p-2 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all ${
                activeTool === 'add_agent'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Colocar Agente</span>
            </button>

            {/* Tool 3: Connect Communication */}
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTool('connect_comm');
                setConnectionSourceId(null);
              }}
              title="Conectar comunicación directa entre 2 agentes"
              className={`p-2 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all ${
                activeTool === 'connect_comm'
                  ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Conectar Comunicación</span>
            </button>

            {/* Tool 4: Connect Spawner */}
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTool('connect_spawn');
                setConnectionSourceId(null);
              }}
              title="Configurar invocación dinámica de sub-agente"
              className={`p-2 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all ${
                activeTool === 'connect_spawn'
                  ? 'bg-purple-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">Invoca Agente</span>
            </button>

            {/* Tool 5: Eraser */}
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTool('eraser');
                setConnectionSourceId(null);
              }}
              title="Goma de borrar"
              className={`p-2 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all ${
                activeTool === 'eraser'
                  ? 'bg-rose-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span className="hidden md:inline">Goma</span>
            </button>
          </div>

          <button
            onClick={handleAutoLayout}
            title="Auto-organizar diagrama"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all text-xs flex items-center gap-1 font-mono"
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden lg:inline">Alinear</span>
          </button>
        </div>

        {/* Center: Challenge Banner with Info Popover */}
        <div className="relative">
          <button
            onClick={() => setShowProblemInfo(!showProblemInfo)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-colors"
          >
            <span className="text-xl">{problem.emoji}</span>
            <div>
              <div className="text-[10px] font-arcade text-amber-400 uppercase tracking-wider">
                Desafío de la Sala
              </div>
              <div className="text-xs font-bold text-white max-w-[200px] sm:max-w-xs truncate">
                {problem.title}
              </div>
            </div>
            <Info className="w-4 h-4 text-slate-500 ml-1" />
          </button>

          {showProblemInfo && (
            <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-40 w-80 sm:w-96 p-4 rounded-xl bg-slate-900 border-2 border-amber-500/60 shadow-2xl text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-arcade text-amber-400">Detalles del Desafío</span>
                <button
                  onClick={() => setShowProblemInfo(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-300 font-mono">{problem.description}</p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 font-code text-[11px] text-amber-300">
                {problem.contextLogs.join('\n')}
              </div>
              <div className="pt-1 text-[11px] text-emerald-400">
                💡 Pista: {problem.conceptualClue}
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview Diagram & Submit to War Room */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onPreviewDiagram();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-arcade tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Ver Diagrama</span>
          </button>

          <button
            onClick={handleOpenSubmit}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-arcade tracking-wider font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Publicar en Sala</span>
          </button>
        </div>
      </div>

      {/* Connection Mode Helper Toast */}
      {connectionSourceId && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>
              Haz click sobre el segundo agente para {activeTool === 'connect_comm' ? 'conectar la comunicación directa' : 'definir que será invocado dinámicamente'}.
            </span>
          </div>
          <button
            onClick={() => setConnectionSourceId(null)}
            className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 hover:bg-cyan-800 text-[10px]"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Main Split View: Super Mario Maker Grid (Left) + Agent Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Mario Maker Grid Stage */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative p-5 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-2xl overflow-hidden arcade-grid">
            {/* Stage Title */}
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-mono">
              <span className="font-arcade text-amber-400">Cuadrícula del Taller</span>
              <span>{agents.length} Agente(s) en escena</span>
            </div>

            {/* Grid Canvas */}
            <div
              className="grid gap-3 relative"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${GRID_ROWS}, minmax(110px, 1fr))`
              }}
            >
              {Array.from({ length: GRID_ROWS }).map((_, r) =>
                Array.from({ length: GRID_COLS }).map((_, c) => {
                  const agent = agents.find((a) => a.position.x === c && a.position.y === r);
                  const isSelected = agent && selectedAgentId === agent.id;
                  const isSource = agent && connectionSourceId === agent.id;

                  return (
                    <div
                      key={`cell-${c}-${r}`}
                      onClick={() => handleCellClick(c, r)}
                      className={`relative rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-2 cursor-pointer select-none ${
                        agent
                          ? isSelected
                            ? 'bg-slate-900/90 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                            : isSource
                            ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/40 animate-pulse'
                            : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-500'
                          : activeTool === 'add_agent'
                          ? 'border-dashed border-emerald-500/40 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-400'
                          : 'border-dashed border-slate-800/80 hover:border-slate-700 bg-slate-950/30'
                      }`}
                    >
                      {agent ? (
                        <>
                          {/* Origin tag */}
                          <div className="absolute top-1 left-1 z-10">
                            {agent.isSpawned ? (
                              <span className="p-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center" title="Invocado en runtime">
                                <Sparkles className="w-2.5 h-2.5" />
                              </span>
                            ) : (
                              <span className="p-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center" title="Agente Base">
                                <Cpu className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>

                          {/* Delete shortcut on cell hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.playErase();
                              deleteAgent(agent.id);
                            }}
                            className="absolute top-1 right-1 p-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 hover:opacity-100 transition-opacity"
                            title="Eliminar agente"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* Avatar */}
                          <div className="w-14 h-16 flex items-center justify-center pointer-events-none">
                            <PixelMuñequito config={agent.muñequito} size="sm" showPlatform={false} />
                          </div>

                          {/* Name & MCP chip */}
                          <p className="text-[10px] font-bold text-white truncate max-w-full text-center mt-0.5">
                            {agent.name}
                          </p>
                          <span className="text-[9px] font-mono text-cyan-300 px-1 rounded bg-slate-950/80 border border-slate-800">
                            {agent.mcpToolIds.length} MCPs
                          </span>
                        </>
                      ) : activeTool === 'add_agent' ? (
                        <div className="flex flex-col items-center text-emerald-400/80">
                          <Plus className="w-5 h-5" />
                          <span className="text-[9px] font-arcade mt-1">Colocar</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-700">
                          {c},{r}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Instruction Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Modo actual: <strong className="text-amber-400 uppercase">{activeTool.replace('_', ' ')}</strong></span>
              <span>Arrastra o selecciona celdas para componer tu enjambre.</span>
            </div>
          </div>

          {/* Quick MCP Palette (Bottom) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-arcade text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Herramientas MCP Disponibles (Click para agregar al agente activo)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Agente: <strong className="text-emerald-400">{selectedAgent?.name || 'Ninguno'}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {MCP_TOOLS.map((tool) => {
                const isEquipped = selectedAgent?.mcpToolIds.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      if (!selectedAgent) return;
                      toggleMcpForSelectedAgent(tool.id);
                    }}
                    disabled={!selectedAgent}
                    className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                      isEquipped
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-cyan-500/60'
                    } ${!selectedAgent ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    <span>{tool.emoji}</span>
                    <span>{tool.name.replace(' MCP', '')}</span>
                    {isEquipped && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inspector & Configurator Panel (Right) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedAgent ? (
            <div className="p-5 rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-2xl flex flex-col gap-4">
              {/* Agent Title & Quick Switch */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-arcade text-amber-400 uppercase tracking-wider">
                    Inspector de Agente
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="text"
                      value={selectedAgent.name}
                      onChange={(e) => updateSelectedAgent({ name: e.target.value })}
                      className="text-base font-bold text-white bg-transparent border-b border-dashed border-slate-600 focus:border-emerald-400 focus:outline-none px-1"
                      placeholder="Nombre del Agente"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundFx.playErase();
                      deleteAgent(selectedAgent.id);
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition-colors"
                    title="Eliminar este agente"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inspector Sub-Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setInspectorTab('prompt');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-arcade text-[10px] tracking-wider transition-all ${
                    inspectorTab === 'prompt'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Prompt
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setInspectorTab('mcps');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-arcade text-[10px] tracking-wider transition-all ${
                    inspectorTab === 'mcps'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  MCPs ({selectedAgent.mcpToolIds.length})
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setInspectorTab('connections');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-arcade text-[10px] tracking-wider transition-all ${
                    inspectorTab === 'connections'
                      ? 'bg-purple-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Red
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setInspectorTab('avatar');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-arcade text-[10px] tracking-wider transition-all ${
                    inspectorTab === 'avatar'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Avatar
                </button>
              </div>

              {/* TAB 1: System Prompt (Brief directive as requested) */}
              {inspectorTab === 'prompt' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-arcade text-emerald-400 flex items-center gap-1.5 mb-1">
                      <Terminal className="w-3.5 h-3.5" />
                      System Prompt Inicial (Breve)
                    </label>
                    <p className="text-[11px] text-slate-400 font-mono mb-2">
                      Descripción breve de lo que hace (simulado como prompt en el juego):
                    </p>
                    <textarea
                      rows={3}
                      value={selectedAgent.systemPrompt}
                      onChange={(e) => updateSelectedAgent({ systemPrompt: e.target.value })}
                      placeholder="Ej: Detecta caídas en la base de datos, ejecuta la remediación con PostgreSQL MCP y notifica a Slack."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-code text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Prompt Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-arcade text-slate-400">
                      Plantillas Rápidas de Prompt:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {PROMPT_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            soundFx.playClick();
                            updateSelectedAgent({ systemPrompt: preset.prompt });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left text-xs text-slate-300 font-mono transition-colors flex items-center justify-between group"
                        >
                          <span>{preset.label}</span>
                          <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Aplicar
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role field */}
                  <div>
                    <label className="text-xs font-mono text-slate-300 mb-1 block">
                      Rol / Especialidad en el Enjambre:
                    </label>
                    <input
                      type="text"
                      value={selectedAgent.role}
                      onChange={(e) => updateSelectedAgent({ role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Ej: DBA Cazador de Deadlocks"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MCPs (Unlimited tools) */}
              {inspectorTab === 'mcps' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-arcade text-cyan-400">
                      Herramientas MCP Equipadas ({selectedAgent.mcpToolIds.length})
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                      Sin límite de slots
                    </span>
                  </div>

                  {selectedAgent.mcpToolIds.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
                      Sin herramientas. Elige MCPs abajo para dotar a este agente de superpoderes.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      {selectedAgent.mcpToolIds.map((toolId) => {
                        const tool = MCP_TOOLS.find((t) => t.id === toolId);
                        if (!tool) return null;
                        return (
                          <div
                            key={tool.id}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{tool.emoji}</span>
                              <div>
                                <h5 className="text-xs font-bold text-white">{tool.name}</h5>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {tool.methods.map((m) => m.name).join(', ')}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleMcpForSelectedAgent(tool.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Remover MCP"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Connections / Swarm Network */}
              {inspectorTab === 'connections' && (
                <div className="space-y-4">
                  {/* Spawner Capability */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-arcade text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Capacidad de Invocar Sub-Agentes
                      </label>
                      <input
                        type="checkbox"
                        checked={selectedAgent.canSpawn}
                        onChange={(e) => updateSelectedAgent({ canSpawn: e.target.checked })}
                        className="rounded border-slate-700 text-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Permite que este agente decida instanciar más agentes dinámicamente en tiempo de ejecución.
                    </p>
                  </div>

                  {/* Communicates With Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-arcade text-blue-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Canal de Comunicación Bidireccional Con:
                    </label>
                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                      {agents
                        .filter((a) => a.id !== selectedAgent.id)
                        .map((other) => {
                          const isConnected = selectedAgent.communicatesWith.includes(other.id);
                          return (
                            <label
                              key={other.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-900 cursor-pointer"
                            >
                              <span>{other.name} ({other.role})</span>
                              <input
                                type="checkbox"
                                checked={isConnected}
                                onChange={() => toggleCommunication(selectedAgent.id, other.id)}
                                className="rounded border-slate-700 text-blue-500 focus:ring-blue-500"
                              />
                            </label>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Avatar Customizer */}
              {inspectorTab === 'avatar' && (
                <div className="space-y-3">
                  <div className="flex justify-center py-2">
                    <PixelMuñequito config={selectedAgent.muñequito} size="md" />
                  </div>
                  <MuñequitoCustomizer
                    config={selectedAgent.muñequito}
                    onChange={(newConfig) => updateSelectedAgent({ muñequito: newConfig })}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-800 text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-arcade text-slate-300">Ningún Agente Seleccionado</h4>
              <p className="text-xs text-slate-500 font-mono">
                Haz click en un agente de la cuadrícula o usa la herramienta "Colocar" para instanciar uno nuevo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Publish To Room Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="font-arcade text-sm text-emerald-400 uppercase">
                  Publicar en la Sala de Guerra
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Todos los usuarios conectados en esta sala podrán explorar tu arquitectura en el diagrama interactivo, inspeccionar cada agente y sus MCPs.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Título de tu Arquitectura Multi-Agente:
                </label>
                <input
                  type="text"
                  value={submitTitle}
                  onChange={(e) => setSubmitTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ej: Enjambre Centinela SRE Auto-remediable"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Descripción o Filosofía de Diseño:
                </label>
                <textarea
                  rows={3}
                  value={submitDescription}
                  onChange={(e) => setSubmitDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Explica brevemente cómo interactúan tus agentes para resolver este desafío..."
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-arcade"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-arcade font-bold tracking-wider shadow-lg shadow-emerald-500/20"
              >
                Confirmar y Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
