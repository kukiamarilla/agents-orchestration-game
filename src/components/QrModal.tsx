import React, { useState, useEffect } from 'react';
import { generateQrDataUrl } from '../utils/qr';
import { Problem, Room } from '../types';
import { X, Copy, Check, QrCode, Smartphone, ExternalLink, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  problem: Problem;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, room, problem }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  // Compute invite URL
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room.id)}`
    : `https://vibeagent.dev/?room=${room.id}`;

  useEffect(() => {
    if (isOpen) {
      generateQrDataUrl(inviteUrl).then(setQrUrl);
    }
  }, [isOpen, inviteUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    soundFx.playCoin();
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative w-full ${
          fullScreen ? 'max-w-3xl' : 'max-w-md'
        } bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-arcade text-xs text-emerald-400 tracking-wider uppercase">
                Código QR de la Sala
              </h3>
              <p className="text-xs font-bold text-white font-mono">{room.name} (#{room.id})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullScreen(!fullScreen)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-arcade text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              {fullScreen ? 'Normal' : 'Agrandar'}
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Shared Challenge Pill */}
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2 shadow-sm">
            <span className="text-base">{problem.emoji}</span>
            <span>Desafío Común: <strong>{problem.title}</strong></span>
          </div>

          {/* QR Code Canvas */}
          <div className="relative p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-inner group">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`Código QR para unirse a ${room.id}`}
                className={`pixel-crisp rounded-xl transition-transform duration-200 ${
                  fullScreen ? 'w-80 h-80' : 'w-56 h-56'
                }`}
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-500 font-mono text-xs">
                Generando QR...
              </div>
            )}

            <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-arcade bg-slate-900/90 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                Escaneo instantáneo
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Escanea desde tu móvil o comparte el enlace
            </p>
            <p className="text-xs text-slate-400 font-mono max-w-sm">
              Cualquiera que escanee este QR entrará a la misma sala, con el mismo desafío, para ver y publicar arquitecturas multi-agente en vivo.
            </p>
          </div>

          {/* Copy Link Input Bar */}
          <div className="w-full flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-300 truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-arcade font-bold tracking-wider transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Sala sincronizada en tiempo real</span>
          <span className="text-emerald-400 font-arcade">Multi-Jugador Activo</span>
        </div>
      </div>
    </div>
  );
};
