import React, { useState } from 'react';
import { McpTool, McpCategory } from '../types';
import { MCP_TOOLS } from '../data/mcpTools';
import { soundFx } from '../utils/audio';
import {
  Database,
  GitPullRequest,
  MessageSquare,
  Globe,
  FolderCode,
  Brain,
  Search,
  Box,
  CreditCard,
  Activity,
  Terminal,
  FileText,
  GripVertical,
  Plus
} from 'lucide-react';

interface McpToolDeckProps {
  onEquipToSlot?: (mcpId: string) => void;
  equippedIds: string[];
}

const CATEGORY_TABS: { id: McpCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'database', label: 'Bases de Datos' },
  { id: 'devtools', label: 'DevTools & Git' },
  { id: 'communication', label: 'Comunicación' },
  { id: 'automation', label: 'Navegación / Web' },
  { id: 'memory', label: 'Memoria' },
  { id: 'payments', label: 'Pagos' }
];

export const McpToolDeck: React.FC<McpToolDeckProps> = ({ onEquipToSlot, equippedIds }) => {
  const [activeCategory, setActiveCategory] = useState<McpCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'database': return <Database {...props} />;
      case 'git-pull-request': return <GitPullRequest {...props} />;
      case 'message-square': return <MessageSquare {...props} />;
      case 'globe': return <Globe {...props} />;
      case 'folder-code': return <FolderCode {...props} />;
      case 'brain': return <Brain {...props} />;
      case 'search': return <Search {...props} />;
      case 'box': return <Box {...props} />;
      case 'credit-card': return <CreditCard {...props} />;
      case 'activity': return <Activity {...props} />;
      case 'terminal': return <Terminal {...props} />;
      case 'file-text': return <FileText {...props} />;
      default: return <Terminal {...props} />;
    }
  };

  const filteredTools = MCP_TOOLS.filter((tool) => {
    const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
    const matchesQuery =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.methods.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    soundFx.playClick();
    e.dataTransfer.setData('application/mcp-id', toolId);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header zone with title and filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="font-arcade text-xs text-emerald-400">02.</span>
            <span>Arsenal de Herramientas MCP (Model Context Protocol)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrastra una herramienta a un slot del arnés o haz clic en <span className="text-emerald-400">+ Equipar</span>.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar herramienta o método..."
            className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundFx.playClick();
              setActiveCategory(tab.id);
            }}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-slate-800 text-emerald-300 font-medium border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTools.map((tool) => {
          const isEquipped = equippedIds.includes(tool.id);

          return (
            <div
              key={tool.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tool.id)}
              className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                isEquipped
                  ? 'border-emerald-500/50 bg-emerald-950/15 shadow-sm'
                  : 'border-slate-800/90 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-md'
              }`}
            >
              <div>
                {/* Top bar of card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                      style={{ backgroundColor: `${tool.badgeColor}22`, color: tool.badgeColor }}
                    >
                      {renderIcon(tool.iconName)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">{tool.vendor}</p>
                    </div>
                  </div>

                  <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {tool.description}
                </p>

                {/* Method highlights */}
                <div className="bg-slate-900/90 border border-slate-800/70 rounded-md p-2 mb-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                    Métodos MCP Soportados:
                  </span>
                  <div className="space-y-0.5">
                    {tool.methods.map((m, idx) => (
                      <div key={idx} className="text-[11px] font-code text-slate-300 truncate">
                        <span className="text-emerald-400">⚡</span> {m.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom action zone */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                {isEquipped ? (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    ✓ Equipado en arnés
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Arrastrable
                  </span>
                )}

                {onEquipToSlot && (
                  <button
                    onClick={() => {
                      soundFx.playEquip();
                      onEquipToSlot(tool.id);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      isEquipped
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isEquipped ? 'Reasignar' : 'Equipar'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
