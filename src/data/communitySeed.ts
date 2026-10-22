import { MultiAgentDesign } from '../types';

export const INITIAL_MULTI_AGENT_DESIGNS: MultiAgentDesign[] = [
  {
    id: 'swarm-postgres-triage',
    title: 'Cluster SRE Tripartito con Auto-Spawn',
    description: 'Arquitectura de 3 agentes: un Orquestador PagerDuty que triagea la alerta e invoca a un DBA Cazador de Deadlocks, comunicándose con un Reportero de Slack.',
    author: 'Kuki Amarilla',
    authorHandle: '@kuki_vibe',
    roomId: 'SALA-BLACKFRIDAY',
    problemId: 'black-friday-crash',
    createdAt: 'Hace 20 min',
    votes: 42,
    hasVoted: false,
    authorAvatar: {
      skinColor: '#10b981',
      secondaryColor: '#047857',
      glowColor: '#34d399',
      helmet: 'crt-robot',
      visor: 'scanline-slit',
      suit: 'cyber-jacket',
      accessory: 'energy-halo'
    },
    agents: [
      {
        id: 'agent-lead-1',
        name: 'Nexus Commander',
        role: 'Orquestador & Triage P1',
        systemPrompt: 'Recibe alertas críticas de PagerDuty y Sentry. Si detecta caída de base de datos, invoca al DBA Cazador y coordina la sala de incidentes.',
        muñequito: {
          skinColor: '#10b981',
          secondaryColor: '#047857',
          glowColor: '#34d399',
          helmet: 'neon-crown',
          visor: 'scanline-slit',
          suit: 'cyber-jacket',
          accessory: 'energy-halo'
        },
        mcpToolIds: ['pagerduty', 'sentry', 'agent_spawner'],
        communicatesWith: ['agent-comm-3'],
        canSpawn: true,
        spawnsAgentIds: ['agent-dba-2'],
        isSpawned: false,
        position: { x: 1, y: 1 }
      },
      {
        id: 'agent-dba-2',
        name: 'Deadlock Hunter',
        role: 'DBA Especialista en Bloqueos',
        systemPrompt: 'Invocado por Nexus Commander. Se conecta a PostgreSQL, identifica el PID 8941 que traba las transacciones, ejecuta pg_terminate_backend y purga cache.',
        muñequito: {
          skinColor: '#3b82f6',
          secondaryColor: '#1d4ed8',
          glowColor: '#60a5fa',
          helmet: 'mech-horns',
          visor: 'cyclops-beam',
          suit: 'mech-armor',
          accessory: 'data-tentacles'
        },
        mcpToolIds: ['postgres', 'redis'],
        communicatesWith: ['agent-lead-1', 'agent-comm-3'],
        canSpawn: false,
        spawnsAgentIds: [],
        isSpawned: true,
        spawnedByAgentId: 'agent-lead-1',
        position: { x: 3, y: 1 }
      },
      {
        id: 'agent-comm-3',
        name: 'Slack Announcer',
        role: 'Comunicación y Runbook SRE',
        systemPrompt: 'Monitorea el progreso del triage, redacta updates claros en Slack cada 2 minutos y actualiza la documentación post-mortem en Notion.',
        muñequito: {
          skinColor: '#f59e0b',
          secondaryColor: '#b45309',
          glowColor: '#fcd34d',
          helmet: 'crt-robot',
          visor: 'retro-shades',
          suit: 'lab-coat',
          accessory: 'shoulder-drone'
        },
        mcpToolIds: ['slack', 'notion'],
        communicatesWith: ['agent-lead-1', 'agent-dba-2'],
        canSpawn: false,
        spawnsAgentIds: [],
        isSpawned: false,
        position: { x: 2, y: 3 }
      }
    ]
  },
  {
    id: 'swarm-security-cve',
    title: 'Dúo Centinela: Auditor & PR Patchmaker',
    description: 'Audita el árbol de dependencias, compila tests en un sandbox seguro y levanta un Pull Request con el parche de seguridad firmado.',
    author: 'Nery Dev',
    authorHandle: '@nery_sec',
    roomId: 'SALA-BLACKFRIDAY',
    problemId: 'zero-day-cve',
    createdAt: 'Hace 1 hora',
    votes: 35,
    hasVoted: false,
    authorAvatar: {
      skinColor: '#8b5cf6',
      secondaryColor: '#6d28d9',
      glowColor: '#c084fc',
      helmet: 'cyber-visor',
      visor: 'cyclops-beam',
      suit: 'mech-armor',
      accessory: 'satellite-dish'
    },
    agents: [
      {
        id: 'agent-sec-1',
        name: 'Vulnerability Auditor',
        role: 'Analista de CVEs',
        systemPrompt: 'Inspecciona package.json y busca advisories en Brave Search. Si hay RCE crítico, invoca al Patch Engineer con los parámetros exactos de versión segura.',
        muñequito: {
          skinColor: '#8b5cf6',
          secondaryColor: '#6d28d9',
          glowColor: '#c084fc',
          helmet: 'hacker-hood',
          visor: 'matrix-dots',
          suit: 'stealth-chassis',
          accessory: 'satellite-dish'
        },
        mcpToolIds: ['brave_search', 'filesystem', 'agent_spawner'],
        communicatesWith: ['agent-sec-2'],
        canSpawn: true,
        spawnsAgentIds: ['agent-sec-2'],
        isSpawned: false,
        position: { x: 1, y: 2 }
      },
      {
        id: 'agent-sec-2',
        name: 'Auto-Patch Engine',
        role: 'Compilador & Git Remediation',
        systemPrompt: 'Invocado por el Auditor. Aplica el parche en código, ejecuta la suite de tests en sandbox aislado y crea el Pull Request de emergencia en GitHub.',
        muñequito: {
          skinColor: '#10b981',
          secondaryColor: '#047857',
          glowColor: '#34d399',
          helmet: 'space-helm',
          visor: 'retro-shades',
          suit: 'nano-suit',
          accessory: 'energy-halo'
        },
        mcpToolIds: ['filesystem', 'bash_sandbox', 'github', 'slack'],
        communicatesWith: ['agent-sec-1'],
        canSpawn: false,
        spawnsAgentIds: [],
        isSpawned: true,
        spawnedByAgentId: 'agent-sec-1',
        position: { x: 3, y: 2 }
      }
    ]
  },
  {
    id: 'swarm-crawler-quad',
    title: 'Enjambre Spider: Coordinador + Crawlers Paralelos',
    description: 'El líder divide los selectores CSS y crea 2 agentes de scraping efímeros para no bloquear el hilo de ejecución, guardando todo en Memoria Vectorial.',
    author: 'Martín Scraping',
    authorHandle: '@crawler_king',
    roomId: 'SALA-BLACKFRIDAY',
    problemId: 'e-commerce-scraper',
    createdAt: 'Hace 3 horas',
    votes: 27,
    hasVoted: false,
    authorAvatar: {
      skinColor: '#06b6d4',
      secondaryColor: '#0e7490',
      glowColor: '#22d3ee',
      helmet: 'mech-horns',
      visor: 'matrix-dots',
      suit: 'stealth-chassis',
      accessory: 'shoulder-drone'
    },
    agents: [
      {
        id: 'agent-crawler-master',
        name: 'Spider Queen',
        role: 'Orquestadora de Scraping',
        systemPrompt: 'Lee las URLs objetivo y coordina el despliegue de browsers headless. Recibe los precios consolidados y los vectoriza para inferencia histórica.',
        muñequito: {
          skinColor: '#06b6d4',
          secondaryColor: '#0e7490',
          glowColor: '#22d3ee',
          helmet: 'crt-robot',
          visor: 'cyclops-beam',
          suit: 'cyber-jacket',
          accessory: 'data-tentacles'
        },
        mcpToolIds: ['memory_vector', 'slack', 'agent_spawner'],
        communicatesWith: ['agent-crawler-worker'],
        canSpawn: true,
        spawnsAgentIds: ['agent-crawler-worker'],
        isSpawned: false,
        position: { x: 1, y: 1 }
      },
      {
        id: 'agent-crawler-worker',
        name: 'DOM Harvester',
        role: 'Crawler Efímero Puppeteer',
        systemPrompt: 'Invocado por Spider Queen. Renderiza Chromium sin interfaz, evade detección anti-bot y extrae los precios con selectores dinámicos.',
        muñequito: {
          skinColor: '#ec4899',
          secondaryColor: '#be185d',
          glowColor: '#f472b6',
          helmet: 'space-helm',
          visor: 'kawaii-eyes',
          suit: 'nano-suit',
          accessory: 'none'
        },
        mcpToolIds: ['puppeteer', 'filesystem'],
        communicatesWith: ['agent-crawler-master'],
        canSpawn: false,
        spawnsAgentIds: [],
        isSpawned: true,
        spawnedByAgentId: 'agent-crawler-master',
        position: { x: 3, y: 1 }
      }
    ]
  }
];
