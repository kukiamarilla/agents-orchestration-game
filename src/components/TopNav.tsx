import React from 'react';
import { Volume2, VolumeX, QrCode, HelpCircle, Layers, Grid, Users, Plus, ChevronDown } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TopNavProps {
  activeView: 'maker' | 'war_room' | 'diagram';
  onSelectView: (view: 'maker' | 'war_room' | 'diagram') => void;
  roomId: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenQrModal: () => void;
  onOpenOnboarding: () => void;
  onOpenRoomModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  roomId,
  isMuted,
  onToggleMute,
  onOpenQrModal,
  onOpenOnboarding,
  onOpenRoomModal
}) => {
  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      {/* Brand */}
      <div
        onClick={() => onSelectView('maker')}
        className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
      >
        <span className="text-xl">👾</span>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap font-arcade">
            VIBEAGENT <span className="text-emerald-400">ARENA</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
            Multi-Agentes & MCP Swarms
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-arcade">
        <button
          onClick={() => onSelectView('maker')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'maker'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Taller / Builder</span>
        </button>

        <button
          onClick={() => onSelectView('diagram')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'diagram'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Diagrama</span>
        </button>

        <div className="flex items-center p-0.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => onSelectView('war_room')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'war_room'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Sala #{roomId.replace(/^SALA-/, '')}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onOpenRoomModal();
            }}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors ml-0.5"
            title="Cambiar de sala o crear una nueva"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenRoomModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-arcade transition-all cursor-pointer active:scale-95"
          title="Crear una nueva sala o unirse por código"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Crear Sala</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenQrModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-arcade transition-all cursor-pointer shadow-sm active:scale-95"
          title="Compartir o unirse con código QR"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Unirse con QR</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenOnboarding();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-arcade transition-all cursor-pointer shadow-sm active:scale-95"
          title="Tutorial y Guía para Principiantes"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">¿Cómo Jugar?</span>
        </button>

        <button
          onClick={onToggleMute}
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          title={isMuted ? 'Activar Sonido 8-bit' : 'Silenciar Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
