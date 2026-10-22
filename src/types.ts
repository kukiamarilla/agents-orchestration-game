export type McpCategory = 'database' | 'devtools' | 'communication' | 'automation' | 'memory' | 'security' | 'payments' | 'cloud' | 'productivity' | 'social';

export interface McpMethod {
  name: string;
  description: string;
  parameters: string[];
}

export interface McpTool {
  id: string;
  name: string;
  emoji: string;
  category: McpCategory;
  vendor: string;
  description: string;
  badgeColor: string;
  iconName: string;
  methods: McpMethod[];
  requiredForTags: string[];
}

export type HelmetStyle = 'crt-robot' | 'cyber-visor' | 'mech-horns' | 'hacker-hood' | 'neon-crown' | 'space-helm';
export type VisorStyle = 'scanline-slit' | 'matrix-dots' | 'retro-shades' | 'cyclops-beam' | 'kawaii-eyes';
export type SuitStyle = 'mech-armor' | 'cyber-jacket' | 'nano-suit' | 'lab-coat' | 'stealth-chassis';
export type AccessoryStyle = 'shoulder-drone' | 'data-tentacles' | 'energy-halo' | 'satellite-dish' | 'none';

export interface MuñequitoConfig {
  skinColor: string;
  secondaryColor: string;
  glowColor: string;
  helmet: HelmetStyle;
  visor: VisorStyle;
  suit: SuitStyle;
  accessory: AccessoryStyle;
}

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  systemPrompt: string; // Breve descripción o directiva operativa (simulada como system prompt)
  muñequito: MuñequitoConfig;
  mcpToolIds: string[]; // ¡Sin límite de slots! Lista de MCPs agregados
  communicatesWith: string[]; // IDs de otros agentes con los que intercambia mensajes
  canSpawn: boolean; // Si este agente puede instanciar/invocar nuevos agentes
  spawnsAgentIds: string[]; // IDs de los agentes invocados por este
  isSpawned: boolean; // Si fue creado en tiempo de ejecución por otro agente
  spawnedByAgentId?: string; // ID del agente padre que lo invocó
  position: { x: number; y: number }; // Coordenadas en la cuadrícula Super Mario Maker
}

export interface MultiAgentDesign {
  id: string;
  title: string;
  description: string;
  author: string;
  authorHandle: string;
  authorAvatar: MuñequitoConfig;
  roomId: string;
  problemId: string;
  agents: AgentNode[];
  createdAt: string;
  votes: number;
  hasVoted?: boolean;
}

export interface RoomParticipant {
  id: string;
  name: string;
  avatar: MuñequitoConfig;
  lastSeen: number;
}

export interface Room {
  id: string;
  name: string;
  problemId: string;
  createdAt: string;
  participants: RoomParticipant[];
  submissions: MultiAgentDesign[];
}

export interface Problem {
  id: string;
  title: string;
  emoji: string;
  image?: string;
  category: 'devops' | 'security' | 'data' | 'support' | 'ecommerce' | 'politics';
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Pesadilla';
  severity: 'P1 - Crítico' | 'P2 - Alto' | 'P3 - Medio';
  description: string;
  contextLogs: string[];
  requiredCapabilities: string[];
  optimalTools: string[];
  winCriteria: string;
  recommendedBrainType?: 'speed' | 'deep-reasoning' | 'balanced';
  conceptualClue?: string;
}

// Backward-compatible types for legacy components
export type BrainModelId = 'gemini-2.5-flash' | 'claude-3-5-sonnet' | 'gpt-4o' | 'deepseek-r1';

export interface BrainModel {
  id: BrainModelId;
  name: string;
  emoji: string;
  provider: string;
  speed: number;
  reasoning: number;
  contextWindow: string;
  badgeColor: string;
  tagline: string;
}

export interface AgentHarness {
  brainId: BrainModelId;
  primaryMcpId: string | null;
  secondaryMcpId: string | null;
  notifierMcpId: string | null;
  memoryMcpId: string | null;
  guardrailMode: 'strict-sandbox' | 'human-in-loop' | 'autonomous';
}

export interface SimulationStep {
  stepNumber: number;
  phase: string;
  title: string;
  actor: 'system' | 'agent' | 'mcp';
  mcpToolId?: string;
  methodCalled?: string;
  payload?: Record<string, unknown>;
  logOutput: string;
  success: boolean;
}

export interface SimulationResult {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  passed: boolean;
  latencyMs: number;
  mcpEfficiency: string;
  feedbackNotes: string[];
  steps: SimulationStep[];
}

export interface CommunityAgent {
  id: string;
  name: string;
  author: string;
  authorHandle: string;
  problemId: string;
  problemTitle: string;
  systemPrompt: string;
  harness: AgentHarness;
  muñequito: MuñequitoConfig;
  votes: number;
  hasVoted?: boolean;
  createdAt: string;
  verifiedScore: number;
  verifiedGrade: 'S' | 'A' | 'B' | 'C' | 'F';
}

