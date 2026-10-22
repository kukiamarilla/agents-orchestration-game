import { McpTool } from '../types';

export const MCP_TOOLS: McpTool[] = [
  {
    id: 'postgres',
    name: 'PostgreSQL MCP',
    emoji: '🐘',
    category: 'database',
    vendor: 'Bases de Datos',
    description: 'Inspecciona esquemas SQL, corre queries SELECT/UPDATE y liquida deadlocks colgados.',
    badgeColor: '#336791',
    iconName: 'database',
    requiredForTags: ['database', 'sql'],
    methods: [
      { name: 'query(sql)', description: 'Ejecuta consulta SELECT o UPDATE segura.', parameters: ['sql: string'] },
      { name: 'list_active_locks()', description: 'Detecta transacciones bloqueadas.', parameters: [] }
    ]
  },
  {
    id: 'github',
    name: 'GitHub MCP',
    emoji: '🐙',
    category: 'devtools',
    vendor: 'Control de Versiones',
    description: 'Abre Pull Requests, revisa diffs de código y busca funciones en el repo.',
    badgeColor: '#8957e5',
    iconName: 'git-pull-request',
    requiredForTags: ['devtools', 'git', 'pr'],
    methods: [
      { name: 'create_pull_request(title, diff)', description: 'Abre PR remediador.', parameters: ['title', 'diff'] },
      { name: 'search_code(query)', description: 'Busca dependencias en el repositorio.', parameters: ['q'] }
    ]
  },
  {
    id: 'slack',
    name: 'Slack MCP',
    emoji: '💬',
    category: 'communication',
    vendor: 'Comunicación',
    description: 'Publica mensajes con formato en canales de guardia y envía alertas al equipo.',
    badgeColor: '#e01e5a',
    iconName: 'message-square',
    requiredForTags: ['communication', 'alerts'],
    methods: [
      { name: 'post_message(channel, text)', description: 'Envía reporte de incidente al canal.', parameters: ['channel', 'text'] }
    ]
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer MCP',
    emoji: '🌐',
    category: 'automation',
    vendor: 'Browser Headless',
    description: 'Navega webs en Chromium, extrae selectores de precios y toma capturas.',
    badgeColor: '#00d8ff',
    iconName: 'globe',
    requiredForTags: ['scraping', 'web', 'automation'],
    methods: [
      { name: 'scrape_selector(url, css)', description: 'Extrae contenido de tiendas online.', parameters: ['url', 'css'] }
    ]
  },
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    emoji: '📁',
    category: 'devtools',
    vendor: 'Archivos Locales',
    description: 'Lee ficheros locales, modifica package.json y aplica parches atómicos.',
    badgeColor: '#10b981',
    iconName: 'folder-code',
    requiredForTags: ['filesystem', 'code', 'logs'],
    methods: [
      { name: 'apply_patch(path, diff)', description: 'Aplica parche en código fuente.', parameters: ['path', 'diff'] },
      { name: 'read_file(path)', description: 'Lee configuración del sistema.', parameters: ['path'] }
    ]
  },
  {
    id: 'memory_vector',
    name: 'Memoria Vectorial',
    emoji: '🧠',
    category: 'memory',
    vendor: 'Contexto & Historial',
    description: 'Recupera runbooks pasados, historial de clientes y contexto semántico a largo plazo.',
    badgeColor: '#ec4899',
    iconName: 'brain',
    requiredForTags: ['memory', 'context'],
    methods: [
      { name: 'semantic_search(query)', description: 'Recupera soluciones de incidentes previos.', parameters: ['query'] }
    ]
  },
  {
    id: 'docker',
    name: 'Docker / K8s MCP',
    emoji: '🐳',
    category: 'devtools',
    vendor: 'Contenedores',
    description: 'Inspecciona memoria de pods, reinicia servicios en fallo y escala réplicas.',
    badgeColor: '#2496ed',
    iconName: 'box',
    requiredForTags: ['containers', 'docker', 'devops'],
    methods: [
      { name: 'restart_container(id)', description: 'Reinicia un contenedor colgado.', parameters: ['id'] },
      { name: 'scale_replicas(service, count)', description: 'Escala pods en Kubernetes.', parameters: ['service', 'count'] }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe MCP',
    emoji: '💳',
    category: 'payments',
    vendor: 'Cobros & Pagos',
    description: 'Consulta cargos con tarjeta y emite reembolsos de dinero en 1 segundo.',
    badgeColor: '#635bff',
    iconName: 'credit-card',
    requiredForTags: ['payments', 'billing', 'support'],
    methods: [
      { name: 'issue_refund(id, reason)', description: 'Emite devolución bancaria.', parameters: ['id', 'reason'] }
    ]
  },
  {
    id: 'sentry',
    name: 'Sentry MCP',
    emoji: '🚨',
    category: 'security',
    vendor: 'Monitoreo de Errores',
    description: 'Rastrea stacktraces de bugs en tiempo real y alerta cuando sube el porcentaje de crashes.',
    badgeColor: '#7a22bf',
    iconName: 'activity',
    requiredForTags: ['telemetry', 'observability', 'errors'],
    methods: [
      { name: 'get_issue_trace(id)', description: 'Obtiene traza de la excepción.', parameters: ['id'] }
    ]
  },
  {
    id: 'bash_sandbox',
    name: 'Bash Sandbox MCP',
    emoji: '⚡',
    category: 'devtools',
    vendor: 'Terminal Segura',
    description: 'Ejecuta scripts aislados, corre npm test y verifica que los parches compilen bien.',
    badgeColor: '#059669',
    iconName: 'terminal',
    requiredForTags: ['sandbox', 'cli', 'tests'],
    methods: [
      { name: 'run_tests()', description: 'Corre tests automáticos.', parameters: [] }
    ]
  },
  {
    id: 'redis',
    name: 'Redis Cache MCP',
    emoji: '⚡',
    category: 'database',
    vendor: 'Cache In-Memory',
    description: 'Invalida keys saturadas, purga colas de mensajes y mitiga thundering herds.',
    badgeColor: '#dc2626',
    iconName: 'zap',
    requiredForTags: ['cache', 'redis', 'speed'],
    methods: [
      { name: 'flush_prefix(pattern)', description: 'Purga claves cacheadas con un patrón.', parameters: ['pattern'] },
      { name: 'inspect_memory()', description: 'Obtiene estadísticas de memoria RAM ocupada.', parameters: [] }
    ]
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty MCP',
    emoji: '📟',
    category: 'communication',
    vendor: 'Guardia & On-Call',
    description: 'Escala alertas severas a los ingenieros de guardia y actualiza el incidente en vivo.',
    badgeColor: '#059669',
    iconName: 'bell',
    requiredForTags: ['incident', 'oncall', 'alerts'],
    methods: [
      { name: 'trigger_incident(title, urgency)', description: 'Despierta al ingeniero en guardia.', parameters: ['title', 'urgency'] }
    ]
  },
  {
    id: 'brave_search',
    name: 'Brave Search MCP',
    emoji: '🔍',
    category: 'automation',
    vendor: 'Buscador Web',
    description: 'Investiga documentación técnica fresca, avisos de seguridad y librerías en la web.',
    badgeColor: '#fb542b',
    iconName: 'search',
    requiredForTags: ['search', 'web'],
    methods: [
      { name: 'web_search(query)', description: 'Busca soluciones en Internet.', parameters: ['query'] }
    ]
  },
  {
    id: 'agent_spawner',
    name: 'Sub-Agent Spawner MCP',
    emoji: '✨',
    category: 'automation',
    vendor: 'Multi-Agent Core',
    description: 'Permite a este agente instanciar trabajadores efímeros en caliente para tareas paralelas.',
    badgeColor: '#8b5cf6',
    iconName: 'users',
    requiredForTags: ['multi-agent', 'orchestration', 'subagents'],
    methods: [
      { name: 'spawn_worker(role, prompt)', description: 'Crea un agente secundario con directiva específica.', parameters: ['role', 'prompt'] },
      { name: 'collect_results(workerId)', description: 'Recupera el output del agente hijo.', parameters: ['workerId'] }
    ]
  },
  {
    id: 'linear',
    name: 'Linear MCP',
    emoji: '📐',
    category: 'productivity',
    vendor: 'Linear Project Hub',
    description: 'Gestiona issues de ingeniería, ciclos y sprints técnicos. Asigna tareas de remediación a los desarrolladores.',
    badgeColor: '#5e6ad2',
    iconName: 'check-square',
    requiredForTags: ['tickets', 'linear', 'dev', 'project'],
    methods: [
      { name: 'create_issue(title, priority, team)', description: 'Abre un issue técnico urgente en Linear.', parameters: ['title', 'priority', 'team'] },
      { name: 'update_status(issueId, state)', description: 'Mueve el ticket a In Progress o Done.', parameters: ['issueId', 'state'] },
      { name: 'list_sprint_backlog()', description: 'Consulta el backlog del ciclo actual.', parameters: [] }
    ]
  },
  {
    id: 'jira',
    name: 'Jira MCP',
    emoji: '📋',
    category: 'productivity',
    vendor: 'Atlassian Enterprise',
    description: 'Abre y actualiza tickets corporativos de incidentes, gestiona tableros Kanban y vincula fallos a Epics de producto.',
    badgeColor: '#0052cc',
    iconName: 'trello',
    requiredForTags: ['tickets', 'jira', 'enterprise', 'incident'],
    methods: [
      { name: 'create_incident_ticket(project, summary, severity)', description: 'Crea un ticket de incidente P1/P2 en Jira.', parameters: ['project', 'summary', 'severity'] },
      { name: 'transition_issue(key, status)', description: 'Cambia el estado del ticket en el workflow corporativo.', parameters: ['key', 'status'] },
      { name: 'add_comment(key, text)', description: 'Registra bitácora y updates de estado en el ticket.', parameters: ['key', 'text'] }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram MCP',
    emoji: '📸',
    category: 'social',
    vendor: 'Meta Social',
    description: 'Publica comunicados oficiales y stories sobre el estado del servicio, monitorea quejas de usuarios y responde mensajes directos (DMs).',
    badgeColor: '#e1306c',
    iconName: 'camera',
    requiredForTags: ['social', 'instagram', 'pr', 'marketing', 'support'],
    methods: [
      { name: 'post_status_story(image, caption)', description: 'Sube una Story informativa con el estado del incidente.', parameters: ['image', 'caption'] },
      { name: 'reply_direct_message(userId, message)', description: 'Responde a usuarios afectados por mensaje privado.', parameters: ['userId', 'message'] },
      { name: 'monitor_mentions()', description: 'Rastrea menciones de la marca y quejas de clientes en posts.', parameters: [] }
    ]
  }
];
