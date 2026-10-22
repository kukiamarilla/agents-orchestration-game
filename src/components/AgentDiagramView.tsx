import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AgentNode, MultiAgentDesign } from '../types';
import { PixelMuñequito } from './PixelMuñequito';
import { AgentDetailModal } from './AgentDetailModal';
import {
  Sparkles,
  MessageSquare,
  Cpu,
  Layers,
  Info,
  Move,
  RotateCcw,
  Check,
  X,
  Trash2,
  HelpCircle,
  Scissors
} from 'lucide-react';
import { soundFx } from '../utils/audio';

type DiagramMode = 'move' | 'connect_comm' | 'connect_spawn' | 'disconnect';

interface AgentDiagramViewProps {
  design: MultiAgentDesign;
  onUpdateAgentPosition?: (agentId: string, position: { x: number; y: number }) => void;
  onUpdateAgents?: (agents: AgentNode[]) => void;
}

export const AgentDiagramView: React.FC<AgentDiagramViewProps> = ({
  design,
  onUpdateAgentPosition,
  onUpdateAgents
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<DiagramMode>('move');
  const [sourceAgentId, setSourceAgentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Diagram canvas dimensions
  const CANVAS_WIDTH = 920;
  const CANVAS_HEIGHT = 540;

  // Calculate default position for an agent
  const getDefaultCoords = useCallback((agent: AgentNode, idx: number) => {
    const posX = typeof agent.position?.x === 'number'
      ? Math.max(0, Math.min(4, agent.position.x))
      : (idx % 4);
    const posY = typeof agent.position?.y === 'number'
      ? Math.max(0, Math.min(3, agent.position.y))
      : Math.floor(idx / 4);

    const marginX = 130;
    const marginY = 100;
    const stepX = (CANVAS_WIDTH - marginX * 2) / 4;
    const stepY = (CANVAS_HEIGHT - marginY * 2) / 3;

    return {
      x: marginX + posX * stepX,
      y: marginY + posY * stepY
    };
  }, []);

  // Draggable positions state for all agents (in canvas space)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const initial: Record<string, { x: number; y: number }> = {};
    design.agents.forEach((agent, idx) => {
      initial[agent.id] = getDefaultCoords(agent, idx);
    });
    return initial;
  });

  // Keep positions synchronized if agents change
  useEffect(() => {
    setPositions((prev) => {
      const next: Record<string, { x: number; y: number }> = {};
      design.agents.forEach((agent, idx) => {
        next[agent.id] = prev[agent.id] || getDefaultCoords(agent, idx);
      });
      return next;
    });
  }, [design.agents, getDefaultCoords]);

  // Show temporary toast banner
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Dragging state tracking
  const [draggingAgentId, setDraggingAgentId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({ pointerX: 0, pointerY: 0, origX: 0, origY: 0, hasMoved: false });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Helper to toggle communication between two agents
  const toggleCommunication = (agentAId: string, agentBId: string) => {
    if (!onUpdateAgents) return;
    const agentA = design.agents.find((a) => a.id === agentAId);
    const agentB = design.agents.find((a) => a.id === agentBId);
    if (!agentA || !agentB) return;

    const areConnected = agentA.communicatesWith.includes(agentBId);
    const updated = design.agents.map((agent) => {
      if (agent.id === agentAId) {
        return {
          ...agent,
          communicatesWith: areConnected
            ? agent.communicatesWith.filter((id) => id !== agentBId)
            : [...agent.communicatesWith, agentBId]
        };
      }
      if (agent.id === agentBId) {
        return {
          ...agent,
          communicatesWith: areConnected
            ? agent.communicatesWith.filter((id) => id !== agentAId)
            : [...agent.communicatesWith, agentAId]
        };
      }
      return agent;
    });

    onUpdateAgents(updated);
    soundFx.playConnect();
    showToast(
      areConnected
        ? `Canal de comunicación desconectado entre ${agentA.name} y ${agentB.name}.`
        : `¡Canal de comunicación conectado entre ${agentA.name} y ${agentB.name}!`
    );
  };

  // Helper to toggle invocation / spawning relationship
  const toggleSpawnRelationship = (parentId: string, childId: string) => {
    if (!onUpdateAgents) return;
    const parent = design.agents.find((a) => a.id === parentId);
    const child = design.agents.find((a) => a.id === childId);
    if (!parent || !child) return;

    const alreadySpawns = parent.spawnsAgentIds.includes(childId);
    const updated = design.agents.map((agent) => {
      if (agent.id === parentId) {
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

    onUpdateAgents(updated);
    soundFx.playConnect();
    showToast(
      alreadySpawns
        ? `Invocación removida: ${parent.name} ya no invoca a ${child.name}.`
        : `¡Relación de invocación definida! ${parent.name} ahora invoca a ${child.name} en runtime.`
    );
  };

  // Helper to remove all connections of an agent
  const disconnectAgent = (agentId: string) => {
    if (!onUpdateAgents) return;
    const target = design.agents.find((a) => a.id === agentId);
    if (!target) return;

    const updated = design.agents.map((agent) => ({
      ...agent,
      communicatesWith: agent.communicatesWith.filter((id) => id !== agentId),
      spawnsAgentIds: agent.spawnsAgentIds.filter((id) => id !== agentId),
      isSpawned: agent.spawnedByAgentId === agentId ? false : agent.isSpawned,
      spawnedByAgentId: agent.spawnedByAgentId === agentId ? undefined : agent.spawnedByAgentId
    }));

    onUpdateAgents(updated);
    soundFx.playEquip();
    showToast(`Se desconectaron todas las conexiones de ${target.name}.`);
  };

  // Pointer Down on an agent card
  const handlePointerDown = (agentId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}

    const currentPos = positions[agentId] || { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      origX: currentPos.x,
      origY: currentPos.y,
      hasMoved: false
    };

    setDraggingAgentId(agentId);
  };

  // Pointer Move on canvas
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingAgentId) return;

    const deltaClientX = e.clientX - dragStartRef.current.pointerX;
    const deltaClientY = e.clientY - dragStartRef.current.pointerY;

    // Detect if dragging vs a simple tap
    if (Math.hypot(deltaClientX, deltaClientY) > 5) {
      dragStartRef.current.hasMoved = true;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const newX = dragStartRef.current.origX + deltaClientX * scaleX;
    const newY = dragStartRef.current.origY + deltaClientY * scaleY;

    // Clamping with margin for card dimensions
    const clampedX = Math.max(75, Math.min(CANVAS_WIDTH - 75, newX));
    const clampedY = Math.max(70, Math.min(CANVAS_HEIGHT - 70, newY));

    setPositions((prev) => ({
      ...prev,
      [draggingAgentId]: { x: clampedX, y: clampedY }
    }));
  };

  // Pointer Up
  const handlePointerUp = (agentId: string, e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    const hadMoved = dragStartRef.current.hasMoved;

    if (hadMoved) {
      soundFx.playPlace();
      const finalPos = positions[agentId];
      if (finalPos && onUpdateAgentPosition) {
        const gridX = Math.round(((finalPos.x - 130) / (CANVAS_WIDTH - 260)) * 4);
        const gridY = Math.round(((finalPos.y - 100) / (CANVAS_HEIGHT - 200)) * 3);
        onUpdateAgentPosition(agentId, {
          x: Math.max(0, Math.min(4, gridX)),
          y: Math.max(0, Math.min(3, gridY))
        });
      }
    } else {
      // Tap without dragging: handle according to active mode
      handleAgentTap(agentId);
    }

    setDraggingAgentId(null);
  };

  // Handle tap on agent according to active mode
  const handleAgentTap = (agentId: string) => {
    if (activeMode === 'move') {
      soundFx.playClick();
      setSelectedAgentId(agentId);
    } else if (activeMode === 'connect_comm') {
      if (!sourceAgentId) {
        soundFx.playClick();
        setSourceAgentId(agentId);
      } else if (sourceAgentId === agentId) {
        // Deselect
        soundFx.playClick();
        setSourceAgentId(null);
      } else {
        // Connect / Disconnect communication between source and target
        toggleCommunication(sourceAgentId, agentId);
        setSourceAgentId(null);
      }
    } else if (activeMode === 'connect_spawn') {
      if (!sourceAgentId) {
        soundFx.playClick();
        setSourceAgentId(agentId);
      } else if (sourceAgentId === agentId) {
        // Deselect
        soundFx.playClick();
        setSourceAgentId(null);
      } else {
        // Define / toggle invocation relationship
        toggleSpawnRelationship(sourceAgentId, agentId);
        setSourceAgentId(null);
      }
    } else if (activeMode === 'disconnect') {
      disconnectAgent(agentId);
    }
  };

  // Reset positions to default
  const handleResetPositions = () => {
    soundFx.playEquip();
    const resetMap: Record<string, { x: number; y: number }> = {};
    design.agents.forEach((agent, idx) => {
      resetMap[agent.id] = getDefaultCoords(agent, idx);
    });
    setPositions(resetMap);
  };

  // Build links data
  const links: Array<{
    id: string;
    from: AgentNode;
    to: AgentNode;
    type: 'comm' | 'spawn';
  }> = [];

  design.agents.forEach((agent) => {
    // Communication channels
    agent.communicatesWith.forEach((targetId) => {
      const target = design.agents.find((a) => a.id === targetId);
      if (target) {
        const linkKey = [agent.id, target.id].sort().join('-comm-');
        if (!links.some((l) => l.id === linkKey)) {
          links.push({
            id: linkKey,
            from: agent,
            to: target,
            type: 'comm'
          });
        }
      }
    });

    // Invocations
    agent.spawnsAgentIds.forEach((spawnedId) => {
      const target = design.agents.find((a) => a.id === spawnedId);
      if (target) {
        links.push({
          id: `${agent.id}-spawns-${target.id}`,
          from: agent,
          to: target,
          type: 'spawn'
        });
      }
    });
  });

  const selectedAgent = design.agents.find((a) => a.id === selectedAgentId) || null;
  const sourceAgent = design.agents.find((a) => a.id === sourceAgentId) || null;
  const canEdit = !!onUpdateAgents;

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Diagram Header with Interactive Modes Toolbar */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Design Title & Author */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-wide font-arcade">
                {design.title}
              </h3>
              <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {design.agents.length} Agentes
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {links.filter((l) => l.type === 'comm').length} Canales de Mensajes
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                {links.filter((l) => l.type === 'spawn').length} Invocaciones
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Diseñado por <span className="text-emerald-400">{design.author}</span> ({design.authorHandle})
            </p>
          </div>
        </div>

        {/* Center / Right: Action Toolbar for defining links & moving */}
        <div className="flex items-center flex-wrap gap-2">
          {canEdit ? (
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              {/* Tool 1: Move & Inspect */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveMode('move');
                  setSourceAgentId(null);
                }}
                title="Mover agentes libremente o hacer click para inspeccionar prompt y MCPs"
                className={`px-3 py-1.5 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'move'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Move className="w-3.5 h-3.5" />
                <span>Mover / Ver</span>
              </button>

              {/* Tool 2: Connect Communication */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveMode('connect_comm');
                  setSourceAgentId(null);
                }}
                title="Conectar canal de comunicación entre 2 agentes (click en agente A y luego en agente B)"
                className={`px-3 py-1.5 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'connect_comm'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Conectar Comunicación</span>
              </button>

              {/* Tool 3: Define Invocation */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveMode('connect_spawn');
                  setSourceAgentId(null);
                }}
                title="Definir invocación de sub-agente (click en agente padre y luego en sub-agente invocado)"
                className={`px-3 py-1.5 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'connect_spawn'
                    ? 'bg-purple-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Definir Invocación</span>
              </button>

              {/* Tool 4: Disconnect */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveMode('disconnect');
                  setSourceAgentId(null);
                }}
                title="Desconectar enlaces haciendo click en un agente o en la línea"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-arcade flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'disconnect'
                    ? 'bg-rose-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desconectar</span>
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>Modo Lectura</span>
            </div>
          )}

          {/* Reset positions */}
          <button
            onClick={handleResetPositions}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Resetear posiciones del diagrama"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Resetear</span>
          </button>
        </div>
      </div>

      {/* Mode Instruction Banner */}
      <div className={`px-5 py-2.5 border-b text-xs flex items-center justify-between gap-4 transition-colors ${
        activeMode === 'connect_comm'
          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
          : activeMode === 'connect_spawn'
          ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
          : activeMode === 'disconnect'
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
      }`}>
        <div className="flex items-center gap-2 truncate">
          {activeMode === 'connect_comm' && (
            <>
              <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {sourceAgent ? (
                  <>
                    <strong>Paso 2:</strong> Haz click en el segundo agente para enlazar o desenlazar comunicación con{' '}
                    <span className="text-white font-bold">{sourceAgent.name}</span>.
                  </>
                ) : (
                  <>
                    <strong>Modo Conectar Comunicación:</strong> Haz click en el primer agente para iniciar la conexión.
                  </>
                )}
              </span>
            </>
          )}

          {activeMode === 'connect_spawn' && (
            <>
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                {sourceAgent ? (
                  <>
                    <strong>Paso 2:</strong> Haz click en el sub-agente que será invocado por{' '}
                    <span className="text-white font-bold">{sourceAgent.name}</span> en runtime.
                  </>
                ) : (
                  <>
                    <strong>Modo Definir Invocación:</strong> Haz click en el agente <em>PADRE</em> (quien invoca a otro).
                  </>
                )}
              </span>
            </>
          )}

          {activeMode === 'disconnect' && (
            <>
              <Scissors className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Modo Desconectar:</strong> Haz click sobre cualquier línea o agente para retirar sus conexiones.
              </span>
            </>
          )}

          {activeMode === 'move' && (
            <>
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Arrastra</strong> cualquier agente para moverlo libremente en el diagrama. <strong>Haz click</strong> para ver su System Prompt y herramientas MCP.
              </span>
            </>
          )}
        </div>

        {sourceAgent && (
          <button
            onClick={() => {
              soundFx.playClick();
              setSourceAgentId(null);
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-arcade text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Cancelar selección ({sourceAgent.name})</span>
          </button>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border-2 border-emerald-500 shadow-2xl text-xs font-arcade text-emerald-300 animate-in fade-in slide-in-from-top duration-200">
          {toastMessage}
        </div>
      )}

      {/* Interactive Diagram Canvas */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        className={`relative w-full h-[540px] bg-slate-950 overflow-hidden select-none arcade-grid touch-none ${
          draggingAgentId
            ? 'cursor-grabbing'
            : activeMode === 'move'
            ? 'cursor-grab'
            : 'cursor-pointer'
        }`}
      >
        {/* SVG Cable Connectors Layer */}
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="commGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id="spawnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            <marker
              id="spawnArrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
            </marker>
          </defs>

          {/* Render All Cable Links dynamically attached to current positions */}
          {links.map((link) => {
            const start = positions[link.from.id] || { x: 100, y: 100 };
            const end = positions[link.to.id] || { x: 300, y: 300 };

            // Curved bezier path
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const cx1 = start.x + dx * 0.5;
            const cy1 = start.y;
            const cx2 = start.x + dx * 0.5;
            const cy2 = end.y;

            const pathD = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;

            const handleLinkClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (link.type === 'comm') {
                toggleCommunication(link.from.id, link.to.id);
              } else {
                toggleSpawnRelationship(link.from.id, link.to.id);
              }
            };

            if (link.type === 'comm') {
              return (
                <g key={link.id} className="group/link cursor-pointer" onClick={handleLinkClick}>
                  {/* Invisible wide hitbox for easy clicking/hovering */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="20"
                    className="hover:stroke-cyan-500/20 transition-colors pointer-events-auto"
                  />
                  {/* Glow underlay */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="4"
                    strokeOpacity="0.25"
                    className="group-hover/link:stroke-rose-400 group-hover/link:stroke-opacity-60 transition-colors pointer-events-none"
                  />
                  {/* Main communication canal */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#commGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-[dash_15s_linear_infinite] group-hover/link:stroke-rose-500 pointer-events-none"
                  />
                </g>
              );
            }

            // Spawn link
            return (
              <g key={link.id} className="group/link cursor-pointer" onClick={handleLinkClick}>
                {/* Invisible wide hitbox */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="hover:stroke-purple-500/20 transition-colors pointer-events-auto"
                />
                {/* Glow underlay */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="5"
                  strokeOpacity="0.3"
                  className="group-hover/link:stroke-rose-400 group-hover/link:stroke-opacity-60 transition-colors pointer-events-none"
                />
                {/* Spawner dynamic link */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#spawnGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  markerEnd="url(#spawnArrow)"
                  className="group-hover/link:stroke-rose-500 pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer: Agent Cards placed on canvas with drag-and-drop handles */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {design.agents.map((agent) => {
            const coords = positions[agent.id] || { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
            const leftPct = (coords.x / CANVAS_WIDTH) * 100;
            const topPct = (coords.y / CANVAS_HEIGHT) * 100;

            const isSelected = selectedAgentId === agent.id;
            const isSource = sourceAgentId === agent.id;
            const isDragging = draggingAgentId === agent.id;

            return (
              <div
                key={agent.id}
                onPointerDown={(e) => handlePointerDown(agent.id, e)}
                onPointerUp={(e) => handlePointerUp(agent.id, e)}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translate(-50%, -50%)',
                  touchAction: 'none'
                }}
                className={`absolute pointer-events-auto select-none group flex flex-col items-center transition-transform duration-75 ${
                  isDragging
                    ? 'cursor-grabbing scale-110 z-40'
                    : 'cursor-grab hover:scale-105 z-20'
                } ${isSource ? 'scale-105 z-30' : ''}`}
              >
                {/* Agent Card Container */}
                <div
                  className={`relative p-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border-2 transition-all duration-150 shadow-2xl flex flex-col items-center ${
                    isDragging
                      ? 'border-amber-400 shadow-amber-500/40 ring-4 ring-amber-400/30'
                      : isSource
                      ? activeMode === 'connect_comm'
                        ? 'border-cyan-400 shadow-cyan-500/40 ring-4 ring-cyan-400/50 animate-pulse'
                        : 'border-purple-400 shadow-purple-500/40 ring-4 ring-purple-400/50 animate-pulse'
                      : isSelected
                      ? 'border-emerald-400 shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                      : activeMode === 'disconnect'
                      ? 'border-slate-700/80 hover:border-rose-400 hover:ring-2 hover:ring-rose-400/40'
                      : 'border-slate-700/80 hover:border-slate-400'
                  }`}
                >
                  {/* Origin Badge & Drag Grip Icon */}
                  <div className="w-full flex items-center justify-between mb-1 gap-2">
                    {agent.isSpawned ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-arcade bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        Invocado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-arcade bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                        <Cpu className="w-2.5 h-2.5" />
                        Base
                      </span>
                    )}

                    <div className="text-slate-500 group-hover:text-amber-400 transition-colors" title="Arrastrar para mover">
                      <Move className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Agent Avatar */}
                  <div className="w-20 h-24 flex items-center justify-center pointer-events-none">
                    <PixelMuñequito config={agent.muñequito} size="sm" showPlatform={false} />
                  </div>

                  {/* Name & Role */}
                  <div className="mt-1 text-center w-28 pointer-events-none">
                    <p className="text-xs font-bold text-white truncate">{agent.name}</p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">
                      {agent.role || 'Operador'}
                    </p>
                  </div>

                  {/* Equipped MCPs Badge & Links Count */}
                  <div className="mt-1.5 flex items-center gap-1.5 pointer-events-none">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-300">
                      <Cpu className="w-2.5 h-2.5" />
                      <span>{agent.mcpToolIds.length} MCPs</span>
                    </div>

                    {agent.communicatesWith.length > 0 && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800 text-[9px] font-mono text-cyan-300" title="Canales de mensajes">
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>{agent.communicatesWith.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Move/Click hint tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 px-2 py-0.5 rounded bg-slate-950 text-[10px] font-arcade whitespace-nowrap border border-slate-800 pointer-events-none shadow-lg z-30">
                    {isDragging
                      ? 'Moviendo...'
                      : activeMode === 'connect_comm'
                      ? isSource
                        ? 'Seleccionado como origen'
                        : sourceAgent
                        ? `Conectar con ${sourceAgent.name}`
                        : 'Click para seleccionar'
                      : activeMode === 'connect_spawn'
                      ? isSource
                        ? 'Seleccionado como Padre'
                        : sourceAgent
                        ? `Definir como sub-agente de ${sourceAgent.name}`
                        : 'Click para seleccionar Padre'
                      : activeMode === 'disconnect'
                      ? 'Click para desconectar enlaces'
                      : 'Arrastra para mover o click para inspeccionar'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Hint & Legend Bar */}
      <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center flex-wrap gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-3 h-1 bg-cyan-400 rounded-full inline-block" />
            <span>Línea Continua: Canal de Comunicación</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400">
            <span className="w-3 h-1 border-t-2 border-dashed border-purple-400 inline-block" />
            <Sparkles className="w-3 h-3" />
            <span>Línea con Flecha: Invoca a (Runtime)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>(Click en cualquier línea para quitarla)</span>
          </div>
        </div>

        <span className="font-mono text-[11px] text-amber-400/90 flex items-center gap-1">
          <Move className="w-3 h-3" />
          Lienzo de Diagrama Interactivo
        </span>
      </div>

      {/* Modal Inspector on Agent Click */}
      <AgentDetailModal
        agent={selectedAgent}
        allAgents={design.agents}
        onClose={() => setSelectedAgentId(null)}
        onSelectRelatedAgent={(agentId) => setSelectedAgentId(agentId)}
        onToggleCommunication={canEdit ? toggleCommunication : undefined}
        onToggleSpawn={canEdit ? toggleSpawnRelationship : undefined}
      />
    </div>
  );
};
