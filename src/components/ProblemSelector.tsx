import React, { useState } from 'react';
import { Problem } from '../types';
import { PROBLEMS_CATALOG } from '../data/problems';
import { soundFx } from '../utils/audio';
import { AlertTriangle, Plus, Terminal } from 'lucide-react';

interface ProblemSelectorProps {
  selectedProblem: Problem;
  onSelectProblem: (problem: Problem) => void;
  onAddCustomProblem?: (custom: Problem) => void;
}

export const ProblemSelector: React.FC<ProblemSelectorProps> = ({
  selectedProblem,
  onSelectProblem,
  onAddCustomProblem
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customLog, setCustomLog] = useState('');

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDesc.trim()) return;

    soundFx.playToolTrigger();
    const newProblem: Problem = {
      id: `custom-${Date.now()}`,
      title: customTitle,
      emoji: '⚡',
      category: 'devops',
      difficulty: 'Medio',
      severity: 'P2 - Alto',
      description: customDesc,
      contextLogs: [
        customLog || 'WARN [custom-incident]: System anomaly reported by user',
        'ACTION REQUIRED: Formulate agent harness with matching MCP capabilities'
      ],
      requiredCapabilities: ['devtools', 'communication'],
      optimalTools: ['filesystem', 'slack', 'bash_sandbox'],
      winCriteria: 'Resolver la anomalía usando las herramientas adecuadas en el arnés.'
    };

    if (onAddCustomProblem) {
      onAddCustomProblem(newProblem);
    }
    onSelectProblem(newProblem);
    setShowCustomModal(false);
    setCustomTitle('');
    setCustomDesc('');
    setCustomLog('');
  };

  const getDifficultyColor = (diff: Problem['difficulty']) => {
    switch (diff) {
      case 'Fácil': return 'text-emerald-400';
      case 'Medio': return 'text-amber-400';
      case 'Difícil': return 'text-orange-400';
      case 'Pesadilla': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="font-arcade text-xs text-amber-400">MISIÓN ACTIVA</span>
            <span>Problemática Técnica a Resolver</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Elige el escenario de combate para el cual vas a entrenar y armar tu agente.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowCustomModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Crear Desafío Personalizado</span>
        </button>
      </div>

      {/* Selector Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {PROBLEMS_CATALOG.map((p) => {
          const isSelected = selectedProblem.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                soundFx.playClick();
                onSelectProblem(p);
              }}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-950/25 shadow-sm'
                  : 'border-slate-800/90 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="w-full flex items-center justify-between text-[10px] mb-1">
                <span className={`font-semibold ${getDifficultyColor(p.difficulty)}`}>
                  {p.difficulty}
                </span>
                <span className="text-slate-500">{p.severity.split(' ')[0]}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                {p.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Selected Problem Active Briefing Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-5 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="text-sm font-bold text-slate-100">{selectedProblem.title}</h4>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 capitalize">{selectedProblem.category}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedProblem.description}
          </p>

          {/* Context Logs Console */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 font-code text-[11px] text-slate-400 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>Trazas del Incidente en Producción:</span>
            </div>
            {selectedProblem.contextLogs.map((log, idx) => (
              <div key={idx} className="truncate">
                <span className="text-amber-400/90">&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>

        {/* Win Criteria card */}
        <div className="w-full md:w-72 bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shrink-0">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Criterio de Victoria
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedProblem.winCriteria}
          </p>

          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-500">Capacidades sugeridas:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedProblem.optimalTools.map((t, idx) => (
                <span key={idx} className="text-[10px] font-code text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Problem Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Crear Problemática Personalizada</span>
              </h4>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Título de la Problemática
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ej. Memory Leak en Redis Cluster de Notificaciones"
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descripción del Incidente / Tarea
                </label>
                <textarea
                  rows={3}
                  required
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Explica qué está roto y qué se espera que el agente resuelva..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Log o Traza de Error Simulada
                </label>
                <input
                  type="text"
                  value={customLog}
                  onChange={(e) => setCustomLog(e.target.value)}
                  placeholder="Ej. FATAL [redis-node-02]: OOM killer triggered by high key eviction rate"
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-code"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg cursor-pointer"
                >
                  Guardar & Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
