import React from 'react';
import { X } from 'lucide-react';
import { Problem } from '../types';
import { soundFx } from '../utils/audio';

interface ChallengeModalProps {
  isOpen: boolean;
  problem: Problem;
  roomName: string;
  onClose: () => void;
  onStart: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, problem, roomName, onClose, onStart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div
        role="dialog"
        aria-labelledby="challenge-title"
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl p-6 space-y-4"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[10px] font-arcade text-amber-400 uppercase tracking-wider">
          El desafío de {roomName}
        </span>

        <div className="flex items-start gap-3">
          <span className="text-4xl p-2 rounded-xl bg-slate-950 border border-slate-800">{problem.emoji}</span>
          <div className="space-y-1.5">
            <h3 id="challenge-title" className="text-lg font-bold text-white">{problem.title}</h3>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">{problem.severity}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{problem.difficulty}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-300">{problem.description}</p>

        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono whitespace-pre-wrap">
          {problem.contextLogs.join('\n')}
        </pre>

        {problem.conceptualClue && (
          <p className="text-xs text-amber-200 font-mono">💡 Pista: {problem.conceptualClue}</p>
        )}

        <p className="text-xs text-slate-400">
          Todos en la sala juegan este mismo desafío. Armá tu enjambre de agentes, publicalo y votá los mejores.
        </p>

        <button
          onClick={() => {
            soundFx.playCoin();
            onStart();
          }}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-arcade text-xs cursor-pointer active:scale-95"
        >
          Empezar a diseñar
        </button>
      </div>
    </div>
  );
};
