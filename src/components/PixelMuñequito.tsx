import React from 'react';
import { MuñequitoConfig } from '../types';

interface PixelMuñequitoProps {
  config: MuñequitoConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'working' | 'victory' | 'error';
  showPlatform?: boolean;
}

export const PixelMuñequito: React.FC<PixelMuñequitoProps> = ({
  config,
  size = 'md',
  state = 'idle',
  showPlatform = true
}) => {
  const pixelSizeMap = {
    sm: 'w-16 h-20',
    md: 'w-28 h-36',
    lg: 'w-44 h-56',
    xl: 'w-64 h-80'
  };

  const animationClass = {
    idle: 'animate-[bounce_3s_ease-in-out_infinite]',
    working: 'animate-pulse',
    victory: 'animate-[bounce_0.6s_ease-in-out_infinite]',
    error: 'animate-[ping_0.8s_ease-in-out_1]'
  }[state];

  const {
    skinColor = '#10b981',
    secondaryColor = '#047857',
    glowColor = '#34d399',
    helmet = 'crt-robot',
    visor = 'scanline-slit',
    suit = 'cyber-jacket',
    accessory = 'energy-halo'
  } = config;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${pixelSizeMap[size]}`}>
      {/* Glow Backdrop */}
      <div
        className="absolute -inset-2 rounded-full opacity-25 blur-lg transition-all duration-300 pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      {/* SVG Canvas for Pixel Art Muñequito */}
      <svg
        viewBox="0 0 32 40"
        className={`w-full h-full pixel-crisp transition-transform duration-200 ${animationClass}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${config.glowColor.replace('#', '')}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ACCESSORY: Energy Halo (behind) */}
        {accessory === 'energy-halo' && (
          <g>
            <rect x="10" y="2" width="12" height="2" fill={glowColor} fillOpacity="0.8" />
            <rect x="8" y="3" width="2" height="2" fill={glowColor} fillOpacity="0.6" />
            <rect x="22" y="3" width="2" height="2" fill={glowColor} fillOpacity="0.6" />
          </g>
        )}

        {/* ACCESSORY: Satellite Dish */}
        {accessory === 'satellite-dish' && (
          <g>
            <rect x="23" y="4" width="6" height="2" fill="#94a3b8" />
            <rect x="27" y="2" width="3" height="4" fill={glowColor} />
            <rect x="21" y="6" width="3" height="4" fill="#64748b" />
          </g>
        )}

        {/* ACCESSORY: Shoulder Drone */}
        {accessory === 'shoulder-drone' && (
          <g className="animate-bounce">
            <rect x="25" y="14" width="5" height="4" fill="#0f172a" stroke={glowColor} strokeWidth="0.8" />
            <rect x="27" y="15" width="2" height="2" fill={glowColor} />
            <rect x="24" y="13" width="7" height="1" fill="#38bdf8" />
          </g>
        )}

        {/* ACCESSORY: Data Tentacles */}
        {accessory === 'data-tentacles' && (
          <g>
            <rect x="3" y="20" width="3" height="8" fill={glowColor} fillOpacity="0.7" />
            <rect x="2" y="26" width="3" height="6" fill={secondaryColor} />
            <rect x="26" y="20" width="3" height="8" fill={glowColor} fillOpacity="0.7" />
            <rect x="27" y="26" width="3" height="6" fill={secondaryColor} />
          </g>
        )}

        {/* HEAD / BASE CHASSIS */}
        <rect x="10" y="8" width="12" height="11" fill={skinColor} rx="1" />
        <rect x="11" y="9" width="10" height="9" fill={skinColor} />
        {/* Head shadow / bevel */}
        <rect x="10" y="17" width="12" height="2" fill={secondaryColor} />

        {/* HELMET STYLES */}
        {helmet === 'crt-robot' && (
          <g>
            {/* CRT Monitor casing */}
            <rect x="8" y="7" width="16" height="13" fill="#1e293b" rx="2" />
            <rect x="9" y="8" width="14" height="11" fill="#0f172a" rx="1" />
            {/* CRT Antenna */}
            <rect x="15" y="4" width="2" height="3" fill="#94a3b8" />
            <rect x="14" y="3" width="4" height="2" fill={glowColor} />
            {/* Screws */}
            <rect x="8" y="8" width="1" height="1" fill="#64748b" />
            <rect x="23" y="8" width="1" height="1" fill="#64748b" />
          </g>
        )}

        {helmet === 'cyber-visor' && (
          <g>
            {/* Tech Headband */}
            <rect x="9" y="7" width="14" height="4" fill="#334155" />
            <rect x="8" y="8" width="2" height="4" fill={secondaryColor} />
            <rect x="22" y="8" width="2" height="4" fill={secondaryColor} />
            <rect x="13" y="6" width="6" height="2" fill={glowColor} />
          </g>
        )}

        {helmet === 'mech-horns' && (
          <g>
            {/* Horn antennas */}
            <rect x="7" y="5" width="2" height="4" fill={secondaryColor} />
            <rect x="6" y="3" width="2" height="3" fill={glowColor} />
            <rect x="23" y="5" width="2" height="4" fill={secondaryColor} />
            <rect x="24" y="3" width="2" height="3" fill={glowColor} />
            <rect x="10" y="7" width="12" height="3" fill="#1e293b" />
          </g>
        )}

        {helmet === 'hacker-hood' && (
          <g>
            {/* Shadowy hoodie cowl */}
            <rect x="8" y="6" width="16" height="13" fill="#090d16" rx="2" />
            <rect x="10" y="8" width="12" height="10" fill="#020617" />
            <rect x="9" y="18" width="14" height="2" fill="#090d16" />
          </g>
        )}

        {helmet === 'neon-crown' && (
          <g>
            {/* Pixel crown spikes */}
            <rect x="10" y="5" width="2" height="3" fill="#fbbf24" />
            <rect x="15" y="4" width="2" height="4" fill="#f59e0b" />
            <rect x="20" y="5" width="2" height="3" fill="#fbbf24" />
            <rect x="9" y="7" width="14" height="2" fill="#d97706" />
          </g>
        )}

        {helmet === 'space-helm' && (
          <g>
            {/* Transparent domed helmet */}
            <rect x="8" y="6" width="16" height="14" rx="4" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="10" y="8" width="3" height="3" fill="#ffffff" fillOpacity="0.6" rx="1" />
          </g>
        )}

        {/* VISOR / EYES */}
        {visor === 'scanline-slit' && (
          <g>
            <rect x="11" y="11" width="10" height="3" fill="#020617" />
            <rect x="12" y="12" width="8" height="1" fill={glowColor} filter={`url(#glow-${config.glowColor.replace('#', '')})`} />
          </g>
        )}

        {visor === 'matrix-dots' && (
          <g>
            <rect x="11" y="10" width="10" height="4" fill="#020617" />
            <rect x="12" y="11" width="2" height="2" fill={glowColor} />
            <rect x="18" y="11" width="2" height="2" fill={glowColor} />
            <rect x="15" y="12" width="2" height="1" fill={glowColor} fillOpacity="0.7" />
          </g>
        )}

        {visor === 'retro-shades' && (
          <g>
            {/* Pixel sunglasses */}
            <rect x="10" y="11" width="5" height="3" fill="#000000" />
            <rect x="17" y="11" width="5" height="3" fill="#000000" />
            <rect x="15" y="12" width="2" height="1" fill="#000000" />
            <rect x="11" y="11" width="2" height="1" fill="#ffffff" fillOpacity="0.8" />
            <rect x="18" y="11" width="2" height="1" fill="#ffffff" fillOpacity="0.8" />
          </g>
        )}

        {visor === 'cyclops-beam' && (
          <g>
            <rect x="10" y="11" width="12" height="3" fill="#0f172a" />
            <rect x="14" y="11" width="4" height="3" fill={glowColor} filter={`url(#glow-${config.glowColor.replace('#', '')})`} />
          </g>
        )}

        {visor === 'kawaii-eyes' && (
          <g>
            <rect x="12" y="11" width="2" height="3" fill="#0f172a" />
            <rect x="18" y="11" width="2" height="3" fill="#0f172a" />
            <rect x="12" y="11" width="1" height="1" fill="#ffffff" />
            <rect x="18" y="11" width="1" height="1" fill="#ffffff" />
            {/* Blushing cheeks */}
            <rect x="10" y="14" width="2" height="1" fill="#f43f5e" fillOpacity="0.7" />
            <rect x="20" y="14" width="2" height="1" fill="#f43f5e" fillOpacity="0.7" />
          </g>
        )}

        {/* TORSO / SUIT */}
        <rect x="10" y="19" width="12" height="10" fill={secondaryColor} />

        {suit === 'mech-armor' && (
          <g>
            <rect x="11" y="20" width="10" height="8" fill="#1e293b" />
            {/* Core reactor */}
            <rect x="14" y="22" width="4" height="4" fill={glowColor} rx="1" filter={`url(#glow-${config.glowColor.replace('#', '')})`} />
            <rect x="15" y="23" width="2" height="2" fill="#ffffff" />
            {/* Shoulder pads */}
            <rect x="7" y="19" width="3" height="5" fill="#334155" />
            <rect x="22" y="19" width="3" height="5" fill="#334155" />
          </g>
        )}

        {suit === 'cyber-jacket' && (
          <g>
            {/* Open neon-lined jacket */}
            <rect x="9" y="19" width="4" height="9" fill="#1e1b4b" />
            <rect x="19" y="19" width="4" height="9" fill="#1e1b4b" />
            <rect x="13" y="20" width="6" height="8" fill={skinColor} />
            <rect x="12" y="19" width="1" height="9" fill={glowColor} />
            <rect x="19" y="19" width="1" height="9" fill={glowColor} />
          </g>
        )}

        {suit === 'nano-suit' && (
          <g>
            <rect x="11" y="19" width="10" height="9" fill="#0f172a" />
            {/* Hexagon tech lines */}
            <rect x="13" y="21" width="6" height="1" fill={glowColor} fillOpacity="0.8" />
            <rect x="12" y="23" width="8" height="1" fill={glowColor} fillOpacity="0.6" />
            <rect x="14" y="25" width="4" height="1" fill={glowColor} fillOpacity="0.8" />
          </g>
        )}

        {suit === 'lab-coat' && (
          <g>
            {/* White scientist coat */}
            <rect x="9" y="19" width="14" height="10" fill="#f8fafc" />
            <rect x="14" y="20" width="4" height="6" fill="#0284c7" />
            <rect x="15" y="21" width="2" height="4" fill="#e0f2fe" />
            <rect x="11" y="22" width="2" height="3" fill="#cbd5e1" />
          </g>
        )}

        {suit === 'stealth-chassis' && (
          <g>
            <rect x="10" y="19" width="12" height="9" fill="#020617" />
            <rect x="12" y="21" width="2" height="5" fill={secondaryColor} />
            <rect x="18" y="21" width="2" height="5" fill={secondaryColor} />
            <rect x="15" y="22" width="2" height="2" fill={glowColor} />
          </g>
        )}

        {/* ARMS / HANDS */}
        <rect x="7" y="21" width="3" height="6" fill={skinColor} />
        <rect x="7" y="27" width="3" height="2" fill={secondaryColor} />
        <rect x="22" y="21" width="3" height="6" fill={skinColor} />
        <rect x="22" y="27" width="3" height="2" fill={secondaryColor} />

        {/* LEGS / FEET */}
        <rect x="11" y="29" width="4" height="6" fill="#0f172a" />
        <rect x="17" y="29" width="4" height="6" fill="#0f172a" />
        {/* Boots */}
        <rect x="10" y="34" width="5" height="2" fill={secondaryColor} />
        <rect x="17" y="34" width="5" height="2" fill={secondaryColor} />
      </svg>

      {/* Futuristic Arcade Pedestal / Platform */}
      {showPlatform && (
        <div className="w-full flex flex-col items-center mt-1">
          <div
            className="w-4/5 h-1.5 rounded-full blur-[1px] opacity-75"
            style={{ backgroundColor: glowColor }}
          />
          <div className="w-full h-1 bg-slate-800 rounded-full border-t border-slate-700/80 mt-0.5" />
        </div>
      )}
    </div>
  );
};
