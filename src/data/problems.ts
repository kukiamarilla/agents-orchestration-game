import { Problem } from '../types';

export const PROBLEMS_CATALOG: Problem[] = [
  {
    id: 'black-friday-crash',
    title: 'Crisis Black Friday: Caída de Postgres',
    emoji: '💥',
    image: '/src/assets/images/boss_postgres_crash_1792621209011.jpg',
    category: 'devops',
    difficulty: 'Difícil',
    severity: 'P1 - Crítico',
    description: 'En pleno pico de compras, la base de datos PostgreSQL se congeló por deadlocks en la tabla de pagos y el checkout está caído.',
    contextLogs: [
      'ERROR [api-gateway]: 504 Gateway Timeout POST /api/checkout',
      'ALERT [pg_stat_activity]: PID 8941 bloqueando transacciones por 180s'
    ],
    requiredCapabilities: ['database', 'communication'],
    optimalTools: ['postgres', 'slack', 'sentry'],
    recommendedBrainType: 'speed',
    conceptualClue: 'El problema vive en las entrañas de una base de datos relacional que se trabó por bloqueos concurrentes. Además, ningún humano de guardia se enteró porque faltó un canal de alerta en tiempo real.',
    winCriteria: 'Matar la query corrupta con PostgreSQL MCP y reportar en Slack.'
  },
  {
    id: 'zero-day-cve',
    title: 'Zero-Day: Hack en Dependencia de Auth',
    emoji: '🦠',
    image: '/src/assets/images/boss_security_virus_1792621209049.jpg',
    category: 'security',
    difficulty: 'Pesadilla',
    severity: 'P1 - Crítico',
    description: 'Vulnerabilidad crítica en la librería de tokens JWT. Hay que auditar el repo, parchear el package.json y abrir un Pull Request de emergencia.',
    contextLogs: [
      'SECURITY ADVISORY: CVE-2026 CVSS 9.8 Remote Code Execution',
      'REQUIREMENT: Parchear versión y correr pruebas antes del merge'
    ],
    requiredCapabilities: ['devtools', 'filesystem', 'sandbox'],
    optimalTools: ['github', 'filesystem', 'bash_sandbox'],
    recommendedBrainType: 'deep-reasoning',
    conceptualClue: 'El exploit está dentro del árbol de código y dependencias del proyecto. Para resolverlo necesitás auditar archivos locales, validar tests en un entorno seguro y empujar el parche a la plataforma de control de versiones.',
    winCriteria: 'Parchear dependencias con Filesystem y abrir PR urgente en GitHub MCP.'
  },
  {
    id: 'e-commerce-scraper',
    title: 'Spider Bot: Espía de Precios de Competencia',
    emoji: '🕷️',
    image: '/src/assets/images/boss_scraper_bot_1792621209605.jpg',
    category: 'ecommerce',
    difficulty: 'Medio',
    severity: 'P3 - Medio',
    description: 'El competidor lanzó ofertas flash secretas. El agente debe navegar en Chromium con Puppeteer, capturar los descuentos y alertar en Slack.',
    contextLogs: [
      'TARGET: https://megastore.mock/deals/flash-cyber',
      'GOAL: Scrapear precios dinámicos y alertar caídas del 20%'
    ],
    requiredCapabilities: ['automation', 'communication'],
    optimalTools: ['puppeteer', 'slack', 'memory_vector'],
    recommendedBrainType: 'speed',
    conceptualClue: 'Para rastrear precios en una tienda web moderna necesitás una herramienta que navegue y renderice páginas como un usuario real, y un canal para escupir los reportes al equipo.',
    winCriteria: 'Extraer ofertas con Puppeteer MCP y publicar resumen en Slack.'
  },
  {
    id: 'support-refund-bot',
    title: 'Reembolso VIP: Cobro Duplicado en Stripe',
    emoji: '💸',
    category: 'support',
    difficulty: 'Fácil',
    severity: 'P2 - Alto',
    description: 'Un cliente VIP sufrió un doble cobro accidental. El agente debe consultar el historial, validar el cargo en Stripe y emitir la devolución.',
    contextLogs: [
      'TICKET #8491: "Me cobraron dos veces la suscripción Anual $499"',
      'ACTION: Validar charge_id en Stripe MCP y emitir reembolso'
    ],
    requiredCapabilities: ['payments', 'memory'],
    optimalTools: ['stripe', 'memory_vector', 'slack'],
    recommendedBrainType: 'balanced',
    conceptualClue: 'Hay dinero retenido y un cliente insatisfecho. Necesitás una herramienta capaz de interactuar con la pasarela financiera para revertir cobros y memoria para recordar el historial del usuario.',
    winCriteria: 'Emitir reembolso con Stripe MCP y registrar confirmación.'
  },
  {
    id: 'flaky-pipeline-fixer',
    title: 'Pipeline Roto: Docker OOM en CI/CD',
    emoji: '🐳',
    category: 'devops',
    difficulty: 'Medio',
    severity: 'P2 - Alto',
    description: 'Los tests de integración fallan con Exit Code 137 (Out Of Memory). El agente debe inspeccionar Docker y aumentar la memoria en el compose.',
    contextLogs: [
      'FATAL: Contenedor murió por falta de RAM (OOMKilled)',
      'REMEDY: Aumentar límite a 1024MB en docker-compose.yml'
    ],
    requiredCapabilities: ['devtools', 'containers'],
    optimalTools: ['docker', 'filesystem', 'github'],
    recommendedBrainType: 'deep-reasoning',
    conceptualClue: 'El problema está en la capa de contenedores y en los archivos de configuración de despliegue. Necesitás acceso al motor de virtualización y capacidad de editar archivos del repo.',
    winCriteria: 'Reiniciar contenedor con Docker MCP y aplicar parche de memoria.'
  }
];
