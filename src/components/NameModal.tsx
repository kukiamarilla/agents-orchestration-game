import React, { useState } from 'react';
import { X } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NameModalProps {
  isOpen: boolean;
  currentName: string;
  onSave: (name: string) => void;
  onClose?: () => void; // omitted on first entry: a name is required
}

export const NameModal: React.FC<NameModalProps> = ({ isOpen, currentName, onSave, onClose }) => {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  const trimmed = name.trim();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!trimmed) return;
          soundFx.playCoin();
          onSave(trimmed);
        }}
        className="relative w-full max-w-sm bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl p-6 space-y-4"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <h3 className="font-arcade text-sm text-emerald-400 uppercase tracking-wider">¿Cómo te llamás?</h3>
        <p className="text-xs text-slate-400 font-mono">
          Tus arquitecturas van a aparecer con este nombre en la sala.
        </p>
        <label className="block">
          <span className="sr-only">Tu nombre</span>
          <input
            type="text"
            autoFocus
            required
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Ana García"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-sm text-white focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={!trimmed}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold font-arcade text-xs cursor-pointer"
        >
          Entrar a la sala
        </button>
      </form>
    </div>
  );
};
