import React, { useState } from 'react';
import { CommunityAgent, Problem } from '../types';
import { PixelMuñequito } from './PixelMuñequito';
import { PROBLEMS_CATALOG } from '../data/problems';
import { MCP_TOOLS } from '../data/mcpTools';
import { soundFx } from '../utils/audio';
import { Heart, Play, Copy, Sparkles, User, Search } from 'lucide-react';

interface CommunityGalleryProps {
  agents: CommunityAgent[];
  onVoteAgent: (agentId: string) => void;
  onInspectAndTest: (agent: CommunityAgent) => void;
  onCloneAgent: (agent: CommunityAgent) => void;
  onNavigateToForge: () => void;
}

export const CommunityGallery: React.FC<CommunityGalleryProps> = ({
  agents,
  onVoteAgent,
  onInspectAndTest,
  onCloneAgent,
  onNavigateToForge
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter((agent) => {
    return (
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.problemTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getProblemData = (problemId: string): Problem | undefined => {
    return PROBLEMS_CATALOG.find((p) => p.id === problemId);
  };

  const getToolEmoji = (toolId: string | null) => {
    if (!toolId) return null;
    const tool = MCP_TOOLS.find((t) => t.id === toolId);
    return tool ? tool.emoji : '⚡';
  };

  const getToolName = (toolId: string | null) => {
    if (!toolId) return null;
    const tool = MCP_TOOLS.find((t) => t.id === toolId);
    return tool ? tool.name : toolId;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h3 className="text-base font-bold text-white font-arcade">
              Galería Comunitaria de Agentes
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mirá los agentes y combinaciones de MCPs que armaron los demás para cada problemática.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por creador o problema..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={onNavigateToForge}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Armar Mi Agente</span>
          </button>
        </div>
      </div>

      {/* Grid of Community Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => {
          const problemData = getProblemData(agent.problemId);

          return (
            <div
              key={agent.id}
              className="flex flex-col justify-between bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 shadow-md group hover:bg-slate-900/50"
            >
              <div>
                {/* Author & Score Header */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-white">{agent.author}</span>
                    <span className="text-[11px] text-slate-500">{agent.authorHandle}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-arcade text-[10px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-800">
                      GRADO {agent.verifiedGrade}
                    </span>
                    <span className="font-code text-xs text-slate-400 font-semibold">{agent.verifiedScore} pts</span>
                  </div>
                </div>

                {/* Muñequito Stage + Problem Boss Art Split */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/60 rounded-xl p-3 border border-slate-800/60 mb-3 arcade-grid items-center justify-center">
                  {/* Left: Pixel Muñequito */}
                  <div className="flex flex-col items-center justify-center">
                    <PixelMuñequito config={agent.muñequito} size="md" state="idle" showPlatform={true} />
                    <span className="text-[10px] text-slate-400 font-arcade mt-1 truncate max-w-[100px]">
                      {agent.name}
                    </span>
                  </div>

                  {/* Right: Problem Boss Thumbnail */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center relative">
                      {problemData?.image ? (
                        <img
                          src={problemData.image}
                          alt={agent.problemTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">{problemData?.emoji || '🎯'}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold mt-1 text-center truncate max-w-[110px]">
                      {agent.problemTitle.split(':')[0]}
                    </span>
                  </div>
                </div>

                {/* Agent Name & Problem Description */}
                <h4 className="text-sm font-bold text-slate-100 font-arcade mb-1">
                  {agent.name}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  <span className="text-amber-400 font-semibold">Desafío: </span>
                  {agent.problemTitle}
                </p>

                {/* Equipped Tools Chips with Emojis */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 mb-3">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">
                    Harness Equipado:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.harness.primaryMcpId && (
                      <span className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 font-medium">
                        <span>{getToolEmoji(agent.harness.primaryMcpId)}</span>
                        <span className="text-[11px]">{getToolName(agent.harness.primaryMcpId)?.split(' ')[0]}</span>
                      </span>
                    )}
                    {agent.harness.secondaryMcpId && (
                      <span className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 font-medium">
                        <span>{getToolEmoji(agent.harness.secondaryMcpId)}</span>
                        <span className="text-[11px]">{getToolName(agent.harness.secondaryMcpId)?.split(' ')[0]}</span>
                      </span>
                    )}
                    {agent.harness.notifierMcpId && (
                      <span className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 font-medium">
                        <span>{getToolEmoji(agent.harness.notifierMcpId)}</span>
                        <span className="text-[11px]">{getToolName(agent.harness.notifierMcpId)?.split(' ')[0]}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Vote + Test + Clone */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                {/* Vote button */}
                <button
                  onClick={() => {
                    soundFx.playToolTrigger();
                    onVoteAgent(agent.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    agent.hasVoted
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800/80'
                      : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800'
                  }`}
                  title="Dar apoyo / aplauso"
                >
                  <Heart className={`w-3.5 h-3.5 ${agent.hasVoted ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span className="font-bold">{agent.votes}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playEquip();
                      onCloneAgent(agent);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Copiar este agente a mi taller"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Clonar</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playToolTrigger();
                      onInspectAndTest(agent);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-md"
                    title="Ver este agente en combate"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Probar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
