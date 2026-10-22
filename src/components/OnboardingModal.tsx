import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Sparkles,
  Grid,
  Layers,
  Users,
  Bot,
  Wrench,
  MessageSquare,
  Zap,
  CheckCircle2,
  HelpCircle,
  Share2,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { PixelMuñequito } from './PixelMuñequito';
import { MuñequitoConfig } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: 'maker' | 'diagram' | 'war_room') => void;
}

const STORAGE_KEY_ONBOARDED = 'vibeagent_onboarding_completed';

const DEMO_LEAD_AVATAR: MuñequitoConfig = {
  skinColor: '#10b981',
  secondaryColor: '#047857',
  glowColor: '#34d399',
  helmet: 'crt-robot',
  visor: 'scanline-slit',
  suit: 'cyber-jacket',
  accessory: 'energy-halo'
};

const DEMO_HELPER_AVATAR: MuñequitoConfig = {
  skinColor: '#a855f7',
  secondaryColor: '#7e22ce',
  glowColor: '#c084fc',
  helmet: 'cyber-visor',
  visor: 'cyclops-beam',
  suit: 'mech-armor',
  accessory: 'data-tentacles'
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Close with Escape key, navigate with Left/Right
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' && currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
        soundFx.playClick();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
        soundFx.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleClose = () => {
    soundFx.playClick();
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
      } catch {}
    }
    onClose();
  };

  const handleFinish = (targetView: 'maker' | 'diagram' | 'war_room' = 'maker') => {
    soundFx.playVictory();
    try {
      localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
    } catch {}
    if (onNavigateToView) {
      onNavigateToView(targetView);
    } else {
      onClose();
    }
  };

  const steps = [
    {
      id: 'agents',
      title: '¿Qué es un Agente de IA?',
      tag: 'CONCEPTO 1/5',
      subtitle: 'No es solo una ventana de chat: es un colaborador virtual con misión propia.',
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
      content: (
        <div className="space-y-4">
          {/* Main comparison card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💬</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-arcade">
                  Chatbot Normal
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Es <strong className="text-slate-200">pasivo</strong>. Espera a que tú le preguntes algo, escribe una respuesta en pantalla y se apaga. No puede ver bases de datos ni actuar por su cuenta.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-left relative overflow-hidden shadow-inner">
              <div className="absolute top-1 right-2 text-[10px] font-arcade text-emerald-400/60 font-bold">
                ¡ACTIVO!
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🤖</span>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-arcade">
                  Agente de IA
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tiene un <strong className="text-emerald-300">objetivo claro</strong>. Analiza la situación, toma decisiones lógicas por su cuenta y usa herramientas reales para solucionar problemas.
              </p>
            </div>
          </div>

          {/* The 3 parts of an agent */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-arcade block mb-2 text-center">
              Las 3 partes de cada agente en el juego
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-xl block mb-1">🧠</span>
                <span className="text-[11px] font-bold text-amber-300 block">1. Su Rol</span>
                <span className="text-[10px] text-slate-400">Su misión y reglas de conducta</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-xl block mb-1">🧰</span>
                <span className="text-[11px] font-bold text-cyan-300 block">2. Herramientas</span>
                <span className="text-[10px] text-slate-400">MCPs que le dan manos y ojos</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-xl block mb-1">⚡</span>
                <span className="text-[11px] font-bold text-purple-300 block">3. Conexiones</span>
                <span className="text-[10px] text-slate-400">Con quién habla y a quién invoca</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <div className="shrink-0">
              <PixelMuñequito config={DEMO_LEAD_AVATAR} size="sm" state="idle" showPlatform={false} />
            </div>
            <div className="text-left text-xs text-slate-300">
              <span className="font-bold text-emerald-400 block font-arcade text-[11px] mb-0.5">
                Ejemplo real en el juego:
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                El <strong className="text-slate-200">"SRE Incident Commander"</strong> vigila los servidores. Cuando detecta lentitud, no te pide permiso: pide ayuda al especialista en bases de datos y manda una alerta por Slack.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mcps',
      title: '¿Qué son los MCPs (Herramientas)?',
      tag: 'CONCEPTO 2/5',
      subtitle: 'La mochila de superpoderes que conecta al agente con el mundo real.',
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40',
      content: (
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 text-left">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-400 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-arcade uppercase mb-1">
                  Analogía: La caja de herramientas del mecánico
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Por sí solo, un modelo de lenguaje solo puede hablar. Está "atrapado" sin manos. Un <strong className="text-cyan-300">MCP (Model Context Protocol)</strong> es un enchufe estándar que le da habilidades reales para interactuar con sistemas informáticos y aplicaciones.
                </p>
              </div>
            </div>
          </div>

          {/* Tool catalog showcase */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-arcade block text-left">
              Ejemplos de MCPs disponibles en el juego:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className="text-lg">🐘</span>
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">PostgreSQL</span>
                  <span className="text-[10px] text-slate-400">Consulta y arregla BD</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">Slack / Discord</span>
                  <span className="text-[10px] text-slate-400">Avisa al equipo humano</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">Jira & Linear</span>
                  <span className="text-[10px] text-slate-400">Crea y asigna tickets</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className="text-lg">🐙</span>
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">GitHub</span>
                  <span className="text-[10px] text-slate-400">Abre Pull Requests</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className="text-lg">📸</span>
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">Instagram</span>
                  <span className="text-[10px] text-slate-400">Monitorea y publica</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className="text-lg">🌐</span>
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">Web Scraper</span>
                  <span className="text-[10px] text-slate-400">Inspecciona páginas</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-left text-xs text-cyan-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>¡En el juego no hay límite de slots!</strong> Puedes equiparle a un agente todas las herramientas MCP que su rol necesite.
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'multiagent',
      title: '¿Qué es un Sistema Multi-Agente (Enjambre)?',
      tag: 'CONCEPTO 3/5',
      subtitle: 'Por qué un equipo de especialistas supera por completo a un "sabelotodo".',
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
      content: (
        <div className="space-y-4 text-left">
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 font-arcade uppercase mb-1 flex items-center gap-1.5">
              <span>🍳</span> Analogía: La cocina de un restaurante gourmet
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Si pones a <strong className="text-rose-400">una sola persona</strong> a recibir clientes, tomar órdenes, cocinar la carne, hornear los postres, lavar los platos y cobrar la cuenta, todo se quemará y los comensales se irán enojados.
            </p>
            <p className="text-xs text-emerald-300 leading-relaxed">
              En cambio, con un <strong className="text-emerald-400">equipo coordinado</strong> (el Chef, el Sommelier, el Cajero y los Meseros), cada uno hace a la perfección su tarea especializada y cooperan en armonía.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-800/40 text-left">
              <span className="text-xs font-bold text-rose-300 block font-arcade mb-1">
                ❌ Un Agente Gigante "Todoterreno"
              </span>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Instrucciones gigantescas que se olvidan</li>
                <li>Alucinaciones y confusiones frecuentes</li>
                <li>Si falla, se cae todo el proceso</li>
              </ul>
            </div>

            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/40 text-left">
              <span className="text-xs font-bold text-emerald-300 block font-arcade mb-1">
                ✅ Sistema Multi-Agente (Swarm)
              </span>
              <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                <li>Agentes pequeños con 1 sola misión clara</li>
                <li>Herramientas precisas para su labor</li>
                <li>Trabajo en paralelo a alta velocidad</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center font-mono">
            Tú eres el <strong>Director Técnico</strong>: diseñas qué agentes existen y cómo se reparten la responsabilidad.
          </p>
        </div>
      )
    },
    {
      id: 'connections',
      title: 'Comunicación e Invocación entre Agentes',
      tag: 'CONCEPTO 4/5',
      subtitle: 'Cómo colaboran: Canales de conversación directa vs. Invocación de sub-agentes.',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
      content: (
        <div className="space-y-3.5 text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            En el juego existen dos formas distintas en que los agentes interactúan entre sí:
          </p>

          {/* 1. Canales de comunicacion */}
          <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/40 relative">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-emerald-400 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-300 font-arcade uppercase">
                    1. Canales de Comunicación (Línea Verde 🟢)
                  </span>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                    Bilateral
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                  <strong className="text-white">Analogía:</strong> Como un walkie-talkie. Dos agentes intercambian mensajes de ida y vuelta.
                </p>
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-emerald-400 font-bold">Ejemplo:</span> El <em>Agente Analista</em> descubre un error en la base de datos y le pasa el reporte al <em>Agente Notificador</em> para que publique en Slack.
                </div>
              </div>
            </div>
          </div>

          {/* 2. Invocacion / Spawners */}
          <div className="p-3 bg-slate-950 rounded-xl border border-purple-500/40 relative">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30 text-purple-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-300 font-arcade uppercase">
                    2. Invocación de Sub-Agentes (Flecha Morada 🟣)
                  </span>
                  <span className="text-[10px] bg-purple-950 border border-purple-800 text-purple-400 px-1.5 py-0.5 rounded font-mono">
                    Jerarquía
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                  <strong className="text-white">Analogía:</strong> El Capitán o Gerente que llama a refuerzos cuando hay una emergencia.
                </p>
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-purple-400 font-bold">Ejemplo:</span> Si llegan 100 pedidos a la vez, el <em>Agente Líder</em> invoca a 3 <em>Agentes Asistentes</em> efímeros para procesar todo en paralelo y luego se retiran.
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
            En la vista <strong className="text-cyan-300">Diagrama</strong> puedes hacer click en las herramientas superiores para conectar o desconectar estas relaciones con un solo click.
          </div>
        </div>
      )
    },
    {
      id: 'gametutorial',
      title: 'Tutorial del Juego: ¿Cómo Jugar en 3 Pasos?',
      tag: 'TUTORIAL RÁPIDO',
      subtitle: 'Diseña, conecta en el diagrama y comparte tu solución en la Sala de Guerra.',
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
      content: (
        <div className="space-y-3 text-left">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-amber-500/30">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-arcade font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 font-arcade">
                  TALLER / BUILDER: CREA TUS AGENTES
                </span>
                <Grid className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Haz click en cualquier casilla para colocar un agente. Haz click sobre él para abrir su ficha, darle un nombre, redactar su directiva y equiparle sus herramientas MCP (Slack, Postgres, Jira, etc.).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-cyan-500/30">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-arcade font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300 font-arcade">
                  DIAGRAMA: CONECTA LAS MENTES
                </span>
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Pasa a la pestaña Diagrama. Puedes mover a los agentes arrastrándolos. Usa las herramientas superiores para trazar <span className="text-emerald-400 font-bold">canales de comunicación (verde)</span> o <span className="text-purple-400 font-bold">invocación (morado)</span>. ¡Haz click sobre cualquier cable para cortarlo si te equivocas!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-arcade font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300 font-arcade">
                  SALA DE GUERRA: PUBLICA Y VOTA
                </span>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Publica tu solución al desafío. Todos los miembros de la sala (o quienes se unan con el Código QR) verán tu diseño. Puedes votar por las mejores ideas.
              </p>
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-2 font-arcade text-xs">
            <button
              onClick={() => handleFinish('maker')}
              className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Grid className="w-4 h-4" />
              <span>Ir al Taller</span>
            </button>

            <button
              onClick={() => handleFinish('diagram')}
              className="py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Ver Diagrama</span>
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    soundFx.playClick();
    if (isLast) {
      handleFinish('maker');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arcade text-[10px] text-emerald-400 font-bold">
                  GUÍA PARA PRINCIPIANTES
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  · Paso {currentStep + 1} de {steps.length}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {currentStepData.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Cerrar guía (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs Navigation for Quick Jumping */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto text-[11px] font-arcade shrink-0 scrollbar-none">
          {steps.map((st, idx) => {
            const isActive = currentStep === idx;
            return (
              <button
                key={st.id}
                onClick={() => {
                  soundFx.playClick();
                  setCurrentStep(idx);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{idx + 1}.</span>
                <span>{st.id === 'agents' ? 'Agentes' : st.id === 'mcps' ? 'MCP Tools' : st.id === 'multiagent' ? 'Multi-Agentes' : st.id === 'connections' ? 'Conexiones' : 'Tutorial'}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-400 font-mono text-left border-l-2 border-emerald-500/80 pl-2.5 py-0.5">
            {currentStepData.subtitle}
          </p>

          {currentStepData.content}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Don't show again toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-400 hover:text-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span>No volver a mostrar automáticamente al iniciar</span>
          </label>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 font-arcade text-xs ml-auto">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95 ${
                isLast
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <span>{isLast ? '¡A Jugar! 🎮' : 'Siguiente'}</span>
              {isLast ? <Rocket className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
