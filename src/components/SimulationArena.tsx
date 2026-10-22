import React, { useState, useEffect, useRef } from 'react';
import { Problem, AgentHarness, MuñequitoConfig, SimulationResult, SimulationStep, BrainModel, McpTool } from '../types';
import { BRAIN_MODELS } from '../data/brainModels';
import { MCP_TOOLS } from '../data/mcpTools';
import { PixelMuñequito } from './PixelMuñequito';
import { soundFx } from '../utils/audio';
import { RotateCcw, ArrowLeft, Heart, Skull, Swords, Trophy, AlertCircle, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface SimulationArenaProps {
  problem: Problem;
  harness: AgentHarness;
  muñequito: MuñequitoConfig;
  agentName: string;
  systemPrompt: string;
  onPublishToCommunity: (result: SimulationResult) => void;
  onBackToForge: () => void;
}

type BattleOutcome = 'VICTORY' | 'CLOSE_FIGHT' | 'DEFEAT';

interface SlotReview {
  slotNumber: number;
  slotLabel: string;
  tool: McpTool | null;
  status: 'good' | 'partial' | 'bad' | 'empty';
  message: string;
}

interface BrainReview {
  brain: BrainModel;
  complies: boolean;
  message: string;
}

export const SimulationArena: React.FC<SimulationArenaProps> = ({
  problem,
  harness,
  muñequito,
  agentName,
  systemPrompt,
  onPublishToCommunity,
  onBackToForge
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);
  const [displayedLogs, setDisplayedLogs] = useState<SimulationStep[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [avatarState, setAvatarState] = useState<'idle' | 'working' | 'victory' | 'error'>('idle');
  const [bossHp, setBossHp] = useState<number>(100);
  const [agentHp, setAgentHp] = useState<number>(100);
  const [battleOutcome, setBattleOutcome] = useState<BattleOutcome | null>(null);
  const [isBossAttacking, setIsBossAttacking] = useState<boolean>(false);
  const [isAgentAttacking, setIsAgentAttacking] = useState<boolean>(false);
  const [hasPublished, setHasPublished] = useState(false);

  // Deep critique states
  const [brainReview, setBrainReview] = useState<BrainReview | null>(null);
  const [slotsReview, setSlotsReview] = useState<SlotReview[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const selectedBrain = BRAIN_MODELS.find((b) => b.id === harness.brainId) || BRAIN_MODELS[0];
  const primaryTool = MCP_TOOLS.find((t) => t.id === harness.primaryMcpId) || null;
  const secondaryTool = MCP_TOOLS.find((t) => t.id === harness.secondaryMcpId) || null;
  const notifierTool = MCP_TOOLS.find((t) => t.id === harness.notifierMcpId) || null;

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedLogs]);

  // Helper to formulate a conceptual, tailored critique for each tool
  const getToolCritique = (tool: McpTool | null, slotLabel: string, isPrimary: boolean): { status: SlotReview['status']; message: string } => {
    if (!tool) {
      return {
        status: 'empty',
        message: `${slotLabel} quedó vacío. El agente salió a combatir con una mano atada a la espalda.`
      };
    }

    const isOptimal = problem.optimalTools.includes(tool.id);

    if (isOptimal) {
      return {
        status: 'good',
        message: `${tool.emoji} ${tool.name}: ¡Gran decisión! Esta herramienta interactúa directamente con la capa afectada.`
      };
    }

    // Specific domain rationale
    if (problem.category === 'devops') {
      if (tool.id === 'puppeteer') {
        return { status: 'bad', message: `${tool.emoji} ${tool.name}: Un navegador web no puede arreglar un fallo interno de base de datos o servidor.` };
      }
      if (tool.id === 'stripe') {
        return { status: 'bad', message: `${tool.emoji} ${tool.name}: Las pasarelas de pago no resuelven cuellos de botella de infraestructura.` };
      }
    }

    if (problem.category === 'security') {
      if (tool.id === 'stripe' || tool.id === 'puppeteer') {
        return { status: 'bad', message: `${tool.emoji} ${tool.name}: En una auditoría de código o CVE, esto no te permite inspeccionar ni parchar dependencias.` };
      }
    }

    if (problem.category === 'ecommerce') {
      if (tool.id === 'docker' || tool.id === 'bash_sandbox') {
        return { status: 'bad', message: `${tool.emoji} ${tool.name}: Muy técnica pero no tiene capacidad de navegar webs externas para espiar precios.` };
      }
    }

    if (problem.category === 'support') {
      if (tool.id === 'docker' || tool.id === 'filesystem') {
        return { status: 'bad', message: `${tool.emoji} ${tool.name}: Tareas de servidores locales no ayudan a gestionar la cuenta ni los fondos de un cliente.` };
      }
    }

    return {
      status: 'partial',
      message: `${tool.emoji} ${tool.name}: Aportó soporte general, pero no era la pieza determinante para este desafío.`
    };
  };

  const evaluateBrainCompliance = (brain: BrainModel, prob: Problem): BrainReview => {
    const requiredType = prob.recommendedBrainType || 'balanced';

    if (requiredType === 'speed') {
      if (brain.speed >= 9.0) {
        return {
          brain,
          complies: true,
          message: `${brain.emoji} ${brain.name}: ¡Cumplió a la perfección! Su velocidad ultra rápida (${brain.speed}/10) respondió antes de que el incidente colapsara.`
        };
      } else {
        return {
          brain,
          complies: false,
          message: `${brain.emoji} ${brain.name}: No cumplió del todo. En una caída crítica en vivo cada segundo cuenta, y su latencia demoró la respuesta.`
        };
      }
    }

    if (requiredType === 'deep-reasoning') {
      if (brain.reasoning >= 9.5) {
        return {
          brain,
          complies: true,
          message: `${brain.emoji} ${brain.name}: ¡Cumplió con honores! Su razonamiento forense (${brain.reasoning}/10) desentrañó la lógica del bug sin falsos positivos.`
        };
      } else {
        return {
          brain,
          complies: false,
          message: `${brain.emoji} ${brain.name}: Se quedó corto. Este problema requería razonamiento exhaustivo y profundo de código, no solo velocidad.`
        };
      }
    }

    // Balanced
    return {
      brain,
      complies: true,
      message: `${brain.emoji} ${brain.name}: Cumplió adecuadamente manteniendo balance entre velocidad y razonamiento.`
    };
  };

  const runSimulation = () => {
    soundFx.playToolTrigger();
    setIsRunning(true);
    setActiveStepIdx(0);
    setDisplayedLogs([]);
    setSimulationResult(null);
    setAvatarState('working');
    setBossHp(100);
    setAgentHp(100);
    setBattleOutcome(null);
    setHasPublished(false);

    // 1. Evaluate Brain
    const bReview = evaluateBrainCompliance(selectedBrain, problem);
    setBrainReview(bReview);

    // 2. Evaluate each of the 3 slots individually
    const s1Critique = getToolCritique(primaryTool, 'Slot 1 (Primario)', true);
    const s2Critique = getToolCritique(secondaryTool, 'Slot 2 (Acción)', false);
    const s3Critique = getToolCritique(notifierTool, 'Slot 3 (Reporte)', false);

    const fullSlotsReview: SlotReview[] = [
      { slotNumber: 1, slotLabel: 'Slot 1 (Primario)', tool: primaryTool, status: s1Critique.status, message: s1Critique.message },
      { slotNumber: 2, slotLabel: 'Slot 2 (Acción)', tool: secondaryTool, status: s2Critique.status, message: s2Critique.message },
      { slotNumber: 3, slotLabel: 'Slot 3 (Reporte)', tool: notifierTool, status: s3Critique.status, message: s3Critique.message }
    ];
    setSlotsReview(fullSlotsReview);

    // Count how many slots were genuinely good
    const goodSlotsCount = fullSlotsReview.filter((s) => s.status === 'good').length;
    const partialSlotsCount = fullSlotsReview.filter((s) => s.status === 'partial').length;

    // Dynamic RNG roll variance (dice roll ±10)
    const rngJitter = Math.floor(Math.random() * 21) - 10;
    const brainModifier = bReview.complies ? 8 : -6;

    let outcome: BattleOutcome = 'DEFEAT';
    let baseScore = 20;

    if (goodSlotsCount >= 2 && s1Critique.status === 'good') {
      outcome = 'VICTORY';
      baseScore = 80;
    } else if (goodSlotsCount === 1 || (partialSlotsCount >= 2 && s1Critique.status !== 'empty')) {
      outcome = 'CLOSE_FIGHT';
      baseScore = 55;
    } else {
      outcome = 'DEFEAT';
      baseScore = 25;
    }

    const finalScore = Math.min(99, Math.max(12, baseScore + brainModifier + rngJitter));
    const passed = outcome === 'VICTORY' || (outcome === 'CLOSE_FIGHT' && finalScore >= 60);

    let grade: SimulationResult['grade'] = 'F';
    if (finalScore >= 90) grade = 'S';
    else if (finalScore >= 80) grade = 'A';
    else if (finalScore >= 65) grade = 'B';
    else if (finalScore >= 50) grade = 'C';
    else grade = 'F';

    // Step sequence
    const steps: SimulationStep[] = [];
    const feedbackNotes: string[] = [];

    // Step 1: Ingestion
    steps.push({
      stepNumber: 1,
      phase: 'INGEST',
      title: `Alerta: ${problem.title}`,
      actor: 'system',
      logOutput: `📡 [EVENTO DISPATCHER]: Notificación P1 recibida: "${problem.title}". Boss ${problem.title.split(':')[0]} en combate.`,
      success: true
    });

    // Step 2: Brain Reasoning
    steps.push({
      stepNumber: 2,
      phase: 'REASON',
      title: `Evaluación de ${selectedBrain.emoji} ${selectedBrain.name}`,
      actor: 'agent',
      logOutput: `🧠 [CEREBRO AI]: ${bReview.message}`,
      payload: {
        brainModel: selectedBrain.name,
        compliance: bReview.complies ? 'CUMPLE_REQUISITOS' : 'SUBÓPTIMO',
        speedScore: selectedBrain.speed,
        reasoningScore: selectedBrain.reasoning
      },
      success: bReview.complies
    });

    // Step 3: Tool 1 execution
    if (primaryTool) {
      const isGood = s1Critique.status === 'good';
      steps.push({
        stepNumber: 3,
        phase: 'CALL_TOOL_1',
        title: `Invocación Slot 1: ${primaryTool.emoji} ${primaryTool.name}`,
        actor: 'mcp',
        logOutput: isGood
          ? `⚡ [GOLPE ÓPTIMO]: ${primaryTool.name} atacó el problema de raíz con ${primaryTool.methods[0]?.name}.`
          : `❌ [DISPARO FALLIDO]: ${s1Critique.message}`,
        success: isGood
      });
    } else {
      steps.push({
        stepNumber: 3,
        phase: 'CALL_TOOL_1',
        title: `Slot 1 Vacío`,
        actor: 'agent',
        logOutput: `❌ [SIN HERRAMIENTA]: No asignaste ningún MCP en el Slot 1.`,
        success: false
      });
    }

    // Step 4: Clash Turn 2
    if (outcome === 'DEFEAT') {
      steps.push({
        stepNumber: 4,
        phase: 'CALL_TOOL_2',
        title: `💥 Contraataque Fulminante del Boss`,
        actor: 'system',
        logOutput: `💀 [CONTRAATAQUE]: El Boss detectó la debilidad del arnés. ¡Ataque crítico contra el Agente!`,
        success: false
      });
    } else if (outcome === 'CLOSE_FIGHT') {
      steps.push({
        stepNumber: 4,
        phase: 'CALL_TOOL_2',
        title: secondaryTool ? `Choque de Poderes con ${secondaryTool.emoji} ${secondaryTool.name}` : `Resistencia Agónica`,
        actor: secondaryTool ? 'mcp' : 'system',
        logOutput: `⚔️ [PELEA AL LÍMITE]: Daño mutuo. La crisis no se detuvo del todo pero el agente sigue en pie.`,
        success: true
      });
    } else {
      steps.push({
        stepNumber: 4,
        phase: 'CALL_TOOL_2',
        title: `Combo Definitivo con ${secondaryTool ? secondaryTool.name : 'MCPs'}`,
        actor: 'mcp',
        logOutput: `🎉 [COMBO CRÍTICO]: Las herramientas interactuaron perfectamente. Parche aplicado y boss destruido.`,
        success: true
      });
    }

    // Step 5: Final Resolution
    steps.push({
      stepNumber: 5,
      phase: 'RESOLVE',
      title:
        outcome === 'VICTORY'
          ? '🎉 ¡VICTORIA ÉPICA!'
          : outcome === 'CLOSE_FIGHT'
          ? '⚔️ PELEA REÑIDA'
          : '💀 DERROTA TOTAL',
      actor: 'system',
      logOutput:
        outcome === 'VICTORY'
          ? `🏆 [VICTORIA LIMPIA]: Puntaje ${finalScore}/100 (Grado ${grade}). ¡Liquidaste el problema de forma óptima!`
          : outcome === 'CLOSE_FIGHT'
          ? `⚔️ [PELEA REÑIDA]: Puntaje ${finalScore}/100 (Grado ${grade}). El sistema no murió pero quedó inestable.`
          : `💀 [DERROTA]: Puntaje ${finalScore}/100 (Grado ${grade}). Tu equipamiento no pudo contener la crisis.`,
      success: passed
    });

    feedbackNotes.push(
      outcome === 'VICTORY'
        ? '¡Excelente combinación de herramientas y motor cognitivo!'
        : outcome === 'CLOSE_FIGHT'
        ? 'Pelea muy cerrada: acertaste parte de la estrategia pero faltó contundencia.'
        : 'Derrota: las herramientas elegidas no eran compatibles con la problemática.'
    );

    const result: SimulationResult = {
      score: finalScore,
      grade,
      passed,
      latencyMs: Math.round((130 / selectedBrain.speed) * 10 + Math.random() * 25),
      mcpEfficiency: `${Math.round(finalScore * 0.9)}%`,
      feedbackNotes,
      steps
    };

    // Sequential animation execution
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setActiveStepIdx(idx);
        setDisplayedLogs((prev) => [...prev, step]);

        if (step.phase === 'REASON') {
          soundFx.playEquip();
        }

        if (step.phase === 'CALL_TOOL_1') {
          if (step.success) {
            setIsAgentAttacking(true);
            setTimeout(() => setIsAgentAttacking(false), 400);
            soundFx.playToolTrigger();
            setBossHp((prev) => Math.max(outcome === 'DEFEAT' ? 70 : outcome === 'CLOSE_FIGHT' ? 40 : 15, prev - 45));
          } else {
            setIsBossAttacking(true);
            setTimeout(() => setIsBossAttacking(false), 400);
            soundFx.playDamage();
            setAgentHp((prev) => Math.max(30, prev - 45));
          }
        }

        if (step.phase === 'CALL_TOOL_2') {
          if (outcome === 'DEFEAT') {
            setIsBossAttacking(true);
            setTimeout(() => setIsBossAttacking(false), 500);
            soundFx.playDamage();
            setAgentHp(0);
            setBossHp((prev) => Math.max(65, prev));
          } else if (outcome === 'CLOSE_FIGHT') {
            setIsAgentAttacking(true);
            setIsBossAttacking(true);
            setTimeout(() => {
              setIsAgentAttacking(false);
              setIsBossAttacking(false);
            }, 450);
            soundFx.playDamage();
            setBossHp(20);
            setAgentHp(35);
          } else {
            // Victory
            setIsAgentAttacking(true);
            setTimeout(() => setIsAgentAttacking(false), 400);
            soundFx.playToolTrigger();
            setBossHp(0);
            setAgentHp((prev) => Math.max(75, prev));
          }
        }

        if (idx === steps.length - 1) {
          setIsRunning(false);
          setSimulationResult(result);
          setBattleOutcome(outcome);

          if (outcome === 'VICTORY') {
            setAvatarState('victory');
            setBossHp(0);
            soundFx.playVictory();
          } else if (outcome === 'CLOSE_FIGHT') {
            setAvatarState('idle');
            soundFx.playEquip();
          } else {
            setAvatarState('error');
            setAgentHp(0);
            soundFx.playDefeat();
          }
        }
      }, (idx + 1) * 850);
    });
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const handlePublish = () => {
    if (!simulationResult) return;
    soundFx.playVictory();
    setHasPublished(true);
    onPublishToCommunity(simulationResult);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBackToForge}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Taller</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-arcade text-xs text-emerald-400">THE ARENA</span>
          <span className="text-slate-500">·</span>
          <span className="text-xs text-slate-200 font-bold">{problem.title}</span>
        </div>

        <button
          disabled={isRunning}
          onClick={runSimulation}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isRunning
              ? 'bg-slate-800 text-slate-500'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>{simulationResult ? 'Pelear de Nuevo' : 'Combatiendo...'}</span>
        </button>
      </div>

      {/* Battle Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 min-h-[360px] flex flex-col justify-between p-6 shadow-inner">
        {/* Arena Backdrop Image */}
        <img
          src="/src/assets/images/arena_arcade_battle_1792621208153.jpg"
          alt="Arcade Arena Stage"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-75"
        />

        {/* Health Bars HUD */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-xs">
          {/* Agent HP */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-base">🤖</span>
            <div className="flex-1 sm:w-40">
              <div className="flex items-center justify-between text-[11px] font-arcade mb-1">
                <span className="text-emerald-400 font-bold">{agentName || 'KukiBot'}</span>
                <span className={agentHp > 40 ? 'text-emerald-300' : 'text-rose-400 font-bold'}>{agentHp}% HP</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-emerald-500/40">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${agentHp > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${agentHp}%` }}
                />
              </div>
            </div>
          </div>

          <span className="font-arcade text-xs text-slate-400 font-bold hidden sm:inline">VS</span>

          {/* Boss HP */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex-1 sm:w-40 text-right">
              <div className="flex items-center justify-between text-[11px] font-arcade mb-1">
                <span className="text-rose-400 font-bold">{problem.title.split(':')[0]}</span>
                <span className="text-rose-300 font-bold">{bossHp}% HP</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-500/40">
                <div
                  className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
            <span className="text-base">{problem.emoji}</span>
          </div>
        </div>

        {/* Center Face-Off */}
        <div className="relative z-10 my-auto flex items-center justify-around py-4">
          {/* Muñequito */}
          <div className={`flex flex-col items-center transition-all duration-200 ${isAgentAttacking ? 'scale-110 translate-x-3' : ''} ${agentHp === 0 ? 'opacity-60 grayscale' : ''}`}>
            <PixelMuñequito config={muñequito} size="xl" state={avatarState} showPlatform={true} />
            <div className="mt-2 text-center bg-black/70 px-3 py-1 rounded-lg border border-emerald-500/40">
              <span className="text-xs font-bold text-white font-arcade">{agentName || 'KukiBot'}</span>
              {agentHp === 0 && <span className="text-[10px] text-rose-400 block font-bold">K.O. 💀</span>}
            </div>
          </div>

          {/* Clashing Banner */}
          <div className="flex flex-col items-center gap-2">
            {isRunning ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="flex items-center gap-1 text-2xl">
                  <span>⚡</span>
                  <Swords className="w-6 h-6 text-amber-400" />
                  <span>⚡</span>
                </div>
                <span className="text-[11px] font-arcade text-amber-300 bg-black/80 px-2 py-1 rounded border border-amber-500 mt-1">
                  ¡PELEANDO!
                </span>
              </div>
            ) : battleOutcome === 'VICTORY' ? (
              <div className="flex flex-col items-center bg-emerald-950/90 border border-emerald-500 px-5 py-3 rounded-2xl text-center shadow-xl animate-bounce">
                <Trophy className="w-7 h-7 text-amber-400 mb-1" />
                <span className="font-arcade text-sm font-bold text-emerald-300">¡VICTORIA ÉPICA!</span>
                <span className="text-[10px] text-slate-300">Solución Óptima</span>
              </div>
            ) : battleOutcome === 'CLOSE_FIGHT' ? (
              <div className="flex flex-col items-center bg-amber-950/90 border border-amber-500 px-5 py-3 rounded-2xl text-center shadow-xl">
                <Swords className="w-7 h-7 text-amber-400 mb-1" />
                <span className="font-arcade text-sm font-bold text-amber-300">PELEA REÑIDA</span>
                <span className="text-[10px] text-slate-300">Solución Incompleta</span>
              </div>
            ) : (
              <div className="flex flex-col items-center bg-rose-950/90 border border-rose-500 px-5 py-3 rounded-2xl text-center shadow-xl">
                <Skull className="w-7 h-7 text-rose-400 mb-1" />
                <span className="font-arcade text-sm font-bold text-rose-300">¡DERROTA!</span>
                <span className="text-[10px] text-slate-300">Solución Inadecuada</span>
              </div>
            )}
          </div>

          {/* Boss Monster */}
          <div className={`flex flex-col items-center transition-all duration-200 ${isBossAttacking ? 'scale-110 -translate-x-3' : ''}`}>
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 shadow-2xl relative bg-slate-950 flex items-center justify-center ${bossHp === 0 ? 'border-emerald-500/50 grayscale opacity-50' : 'border-rose-500/80'}`}>
              {problem.image ? (
                <img
                  src={problem.image}
                  alt={problem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">{problem.emoji}</span>
              )}
              {bossHp === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-arcade text-sm text-emerald-400 font-bold">DERROTADO 🎉</span>
                </div>
              )}
            </div>
            <div className="mt-2 text-center bg-black/70 px-3 py-1 rounded-lg border border-rose-500/40">
              <span className="text-xs font-bold text-rose-300 font-arcade">{problem.title.split(':')[0]}</span>
            </div>
          </div>
        </div>

        {/* Equipped Tool Chips in Battle */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 pt-2">
          {primaryTool && (
            <span className="px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-bold border bg-slate-900 border-slate-700 text-slate-200">
              <span>{primaryTool.emoji}</span>
              <span>{primaryTool.name}</span>
            </span>
          )}
          {secondaryTool && (
            <span className="px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-bold border bg-slate-900 border-slate-700 text-slate-200">
              <span>{secondaryTool.emoji}</span>
              <span>{secondaryTool.name}</span>
            </span>
          )}
          {notifierTool && (
            <span className="px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-bold border bg-slate-900 border-slate-700 text-slate-200">
              <span>{notifierTool.emoji}</span>
              <span>{notifierTool.name}</span>
            </span>
          )}
        </div>
      </div>

      {/* DETAILED POST-BATTLE DEBRIEFING: BRAIN + EACH OF 3 SLOTS + CONCEPTUAL CLUE */}
      {!isRunning && simulationResult && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            <span>🔍</span>
            <span>Auditoría Táctica del Combate (Por qué ganaste o perdiste)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Brain Compliance Review */}
            {brainReview && (
              <div className={`p-3 rounded-lg border text-xs ${brainReview.complies ? 'bg-cyan-950/30 border-cyan-700/80' : 'bg-amber-950/30 border-amber-800/80'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>🧠</span>
                    <span>Cerebro AI: {brainReview.brain.name}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${brainReview.complies ? 'bg-cyan-900 text-cyan-300' : 'bg-amber-900 text-amber-300'}`}>
                    {brainReview.complies ? '✓ CUMPLE' : '⚠️ SUBÓPTIMO'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {brainReview.message}
                </p>
              </div>
            )}

            {/* 2. Conceptual Clue (NO SPOILERS) */}
            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/80 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
                <span>💡</span>
                <span>Pista Táctica (La idea sin spoilers):</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {problem.conceptualClue || 'Pensá en qué tipo de sistema se rompió y qué capacidades de lectura/escritura requiere.'}
              </p>
            </div>
          </div>

          {/* 3. Review of EACH of the 3 slots chosen by the player */}
          <div className="mt-1">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Evaluación de cada uno de tus 3 Slots de MCPs:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {slotsReview.map((slot) => {
                const isGood = slot.status === 'good';
                const isPartial = slot.status === 'partial';
                const isEmpty = slot.status === 'empty';

                return (
                  <div
                    key={slot.slotNumber}
                    className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                      isGood
                        ? 'bg-emerald-950/20 border-emerald-700/70 text-emerald-200'
                        : isPartial
                        ? 'bg-amber-950/20 border-amber-700/70 text-amber-200'
                        : isEmpty
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : 'bg-rose-950/20 border-rose-800/70 text-rose-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                        <span>{slot.slotLabel}</span>
                        {isGood ? (
                          <span className="text-emerald-400">✓ Acierto</span>
                        ) : isPartial ? (
                          <span className="text-amber-400">⚡ Parcial</span>
                        ) : isEmpty ? (
                          <span className="text-slate-500">Vacío</span>
                        ) : (
                          <span className="text-rose-400">❌ Ineficaz</span>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {slot.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Stream + Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Terminal Output Stream */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-4 font-code text-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>battle_turn_resolver.log</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {isRunning ? '⏳ Peleando turno a turno...' : '✓ Combate finalizado'}
            </span>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {displayedLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed text-slate-300">
                <span>{log.logOutput}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Score Card & Action */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
              Puntaje del Combate
            </span>
            {simulationResult ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center font-arcade text-3xl font-bold border ${
                    battleOutcome === 'VICTORY'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : battleOutcome === 'CLOSE_FIGHT'
                      ? 'bg-amber-950 text-amber-400 border-amber-600'
                      : 'bg-rose-950 text-rose-400 border-rose-600'
                  }`}
                >
                  {simulationResult.grade}
                </div>
                <div>
                  <span className="text-lg font-bold text-white block">
                    {simulationResult.score} / 100 Pts
                  </span>
                  <span className="text-xs text-slate-400 leading-snug block">
                    {simulationResult.feedbackNotes[0]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                Calculando efectividad...
              </div>
            )}
          </div>

          {/* Social Share / Action */}
          {simulationResult && (
            <div className="pt-3 border-t border-slate-800 mt-3 space-y-2">
              <button
                disabled={hasPublished}
                onClick={handlePublish}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  hasPublished
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasPublished ? 'fill-purple-300' : ''}`} />
                <span>{hasPublished ? '✓ Guardado en Galería' : '💖 Publicar en Galería'}</span>
              </button>

              <button
                onClick={onBackToForge}
                className="w-full py-2 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-center"
              >
                Modificar MCPs en el Taller
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
