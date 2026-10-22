import { BrainModel } from '../types';

export const BRAIN_MODELS: BrainModel[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    emoji: '⚡',
    provider: 'Google',
    speed: 9.8,
    reasoning: 9.1,
    contextWindow: '1M tokens',
    badgeColor: '#38bdf8',
    tagline: 'Ultra rápido con reflejos ninja para llamar herramientas en milisegundos.'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    emoji: '🔮',
    provider: 'Anthropic',
    speed: 8.6,
    reasoning: 9.7,
    contextWindow: '200K tokens',
    badgeColor: '#f97316',
    tagline: 'Mente analítica profunda para código difícil y arquitectura de parches.'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    emoji: '🟢',
    provider: 'OpenAI',
    speed: 8.9,
    reasoning: 9.2,
    contextWindow: '128K tokens',
    badgeColor: '#10b981',
    tagline: 'Todoterreno confiable para redactar reportes y coordinar flujos.'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    emoji: '🧠',
    provider: 'DeepSeek',
    speed: 7.2,
    reasoning: 9.8,
    contextWindow: '64K tokens',
    badgeColor: '#8b5cf6',
    tagline: 'Cadena de pensamiento exhaustiva para cazar bugs esotéricos.'
  }
];
