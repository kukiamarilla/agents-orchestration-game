import React from 'react';
import { MuñequitoConfig, HelmetStyle, VisorStyle, SuitStyle, AccessoryStyle } from '../types';
import { PixelMuñequito } from './PixelMuñequito';
import { soundFx } from '../utils/audio';
import { Sparkles, Dices, Palette } from 'lucide-react';

interface MuñequitoCustomizerProps {
  config: MuñequitoConfig;
  onChange: (newConfig: MuñequitoConfig) => void;
}

const COLOR_PALETTES = [
  { name: 'Emerald Cyber', skin: '#10b981', sec: '#047857', glow: '#34d399' },
  { name: 'Neon Violet', skin: '#8b5cf6', sec: '#6d28d9', glow: '#c084fc' },
  { name: 'Electric Cyan', skin: '#06b6d4', sec: '#0e7490', glow: '#22d3ee' },
  { name: 'Solar Amber', skin: '#f59e0b', sec: '#b45309', glow: '#fbbf24' },
  { name: 'Crimson Fury', skin: '#ef4444', sec: '#b91c1c', glow: '#f87171' },
  { name: 'Titanium Ice', skin: '#94a3b8', sec: '#475569', glow: '#38bdf8' }
];

const HELMET_OPTIONS: { id: HelmetStyle; label: string }[] = [
  { id: 'crt-robot', label: 'Monitor CRT' },
  { id: 'cyber-visor', label: 'Visor Cyber' },
  { id: 'mech-horns', label: 'Cuernos Mech' },
  { id: 'hacker-hood', label: 'Capucha Hacker' },
  { id: 'neon-crown', label: 'Corona Neón' },
  { id: 'space-helm', label: 'Casco Espacial' }
];

const VISOR_OPTIONS: { id: VisorStyle; label: string }[] = [
  { id: 'scanline-slit', label: 'Scanline' },
  { id: 'matrix-dots', label: 'Matriz Puntos' },
  { id: 'retro-shades', label: 'Gafas Pixel' },
  { id: 'cyclops-beam', label: 'Cíclope Láser' },
  { id: 'kawaii-eyes', label: 'Kawaii Ojos' }
];

const SUIT_OPTIONS: { id: SuitStyle; label: string }[] = [
  { id: 'cyber-jacket', label: 'Chaqueta Cyber' },
  { id: 'mech-armor', label: 'Armadura Mech' },
  { id: 'nano-suit', label: 'Traje Nano' },
  { id: 'lab-coat', label: 'Bata Científica' },
  { id: 'stealth-chassis', label: 'Chasis Sigilo' }
];

const ACCESSORY_OPTIONS: { id: AccessoryStyle; label: string }[] = [
  { id: 'energy-halo', label: 'Halo de Energía' },
  { id: 'shoulder-drone', label: 'Dron de Hombro' },
  { id: 'data-tentacles', label: 'Cables de Datos' },
  { id: 'satellite-dish', label: 'Antena Radar' },
  { id: 'none', label: 'Ninguno' }
];

export const MuñequitoCustomizer: React.FC<MuñequitoCustomizerProps> = ({ config, onChange }) => {
  const handleRandomize = () => {
    soundFx.playToolTrigger();
    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const randomHelmet = HELMET_OPTIONS[Math.floor(Math.random() * HELMET_OPTIONS.length)].id;
    const randomVisor = VISOR_OPTIONS[Math.floor(Math.random() * VISOR_OPTIONS.length)].id;
    const randomSuit = SUIT_OPTIONS[Math.floor(Math.random() * SUIT_OPTIONS.length)].id;
    const randomAcc = ACCESSORY_OPTIONS[Math.floor(Math.random() * ACCESSORY_OPTIONS.length)].id;

    onChange({
      skinColor: randomPalette.skin,
      secondaryColor: randomPalette.sec,
      glowColor: randomPalette.glow,
      helmet: randomHelmet,
      visor: randomVisor,
      suit: randomSuit,
      accessory: randomAcc
    });
  };

  const handleApplyPalette = (palette: typeof COLOR_PALETTES[0]) => {
    soundFx.playClick();
    onChange({
      ...config,
      skinColor: palette.skin,
      secondaryColor: palette.sec,
      glowColor: palette.glow
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Visual Live Preview Zone */}
      <div className="md:col-span-5 flex flex-col items-center justify-between p-6 bg-slate-950/70 border border-slate-800/80 rounded-xl relative overflow-hidden">
        <div className="w-full flex items-center justify-between text-xs text-slate-400">
          <span className="font-arcade text-[10px] text-emerald-400">CHASSIS 01 · ACTIVO</span>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            title="Generar combinación al azar"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Random</span>
          </button>
        </div>

        <div className="my-6">
          <PixelMuñequito config={config} size="lg" state="idle" showPlatform={true} />
        </div>

        {/* Selected Specs pill-free summary */}
        <div className="w-full text-center text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <span>{HELMET_OPTIONS.find(h => h.id === config.helmet)?.label}</span>
          <span className="mx-1 text-slate-600">/</span>
          <span>{VISOR_OPTIONS.find(v => v.id === config.visor)?.label}</span>
          <span className="mx-1 text-slate-600">/</span>
          <span>{SUIT_OPTIONS.find(s => s.id === config.suit)?.label}</span>
        </div>
      </div>

      {/* Modular Config Tabs & Controls */}
      <div className="md:col-span-7 flex flex-col gap-4">
        {/* Color Palette Selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Esquema de Colores</h4>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {COLOR_PALETTES.map((p, idx) => {
              const isSelected = config.skinColor === p.skin;
              return (
                <button
                  key={idx}
                  onClick={() => handleApplyPalette(p)}
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-400 bg-slate-800/90 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.skin }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.glow }} />
                  </div>
                  <span className="text-[10px] text-slate-300 truncate w-full text-center">{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Helmet / Headgear */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Casco / Cabeza</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {HELMET_OPTIONS.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  soundFx.playClick();
                  onChange({ ...config, helmet: h.id });
                }}
                className={`px-3 py-1.5 text-xs rounded-md border text-left transition-colors cursor-pointer truncate ${
                  config.helmet === h.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 font-medium'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visor / Eyes */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Visor / Ojos</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {VISOR_OPTIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  soundFx.playClick();
                  onChange({ ...config, visor: v.id });
                }}
                className={`px-3 py-1.5 text-xs rounded-md border text-left transition-colors cursor-pointer truncate ${
                  config.visor === v.id
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-medium'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suit & Accessories Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Traje / Chasis</h4>
            <div className="flex flex-col gap-1">
              {SUIT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    soundFx.playClick();
                    onChange({ ...config, suit: s.id });
                  }}
                  className={`px-3 py-1.5 text-xs rounded-md border text-left transition-colors cursor-pointer truncate ${
                    config.suit === s.id
                      ? 'border-purple-500 bg-purple-950/40 text-purple-200 font-medium'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Accesorio / Aura</h4>
            <div className="flex flex-col gap-1">
              {ACCESSORY_OPTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    soundFx.playClick();
                    onChange({ ...config, accessory: a.id });
                  }}
                  className={`px-3 py-1.5 text-xs rounded-md border text-left transition-colors cursor-pointer truncate ${
                    config.accessory === a.id
                      ? 'border-amber-500 bg-amber-950/40 text-amber-200 font-medium'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
