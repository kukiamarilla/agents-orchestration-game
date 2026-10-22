# VibeAgent: MCP Arena & Muñequitos

Un juego conceptual arcade y colaborativo donde los desarrolladores resuelven problemáticas del mundo real ensamblando sus propios agentes con avatares en pixel-art ("muñequitos"), conectando servidores MCP (Model Context Protocol) mediante un harness con drag-and-drop, ejecutando simulaciones animadas paso a paso con efectos de sonido 8-bit, y compartiendo sus creaciones en una galería comunitaria interactiva.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas por el usuario:**
> - **Mecánica:** Misiones estructuradas con simulación paso a paso en vivo y feedback animado en tiempo real.
> - **Estética:** Pixel art arcade retro con muñequitos modulares personalizables y logos de herramientas tecnológicas/MCPs.
> - **Galería Comunitaria:** Tablero de tarjetas comunitarias con vista previa del muñequito animado, votos, filtrado por categorías y modo de inspección con repetición de la simulación.

---

## 1. Overview & Core Concept

- **Qué es:** Una plataforma lúdica e interactiva estilo retro arcade donde los participantes reciben misiones o problemáticas técnicas (ej. incidentes en producción, scraping de competidores, auditorías de seguridad, soporte inteligente) y deben configurar un Agente de IA armando su "muñequito" visual y equipando el "Harness" adecuado con herramientas MCP (`GitHub`, `Postgres`, `Slack`, `Puppeteer`, `Filesystem`, `Brave Search`, `Memory`, `Docker`, etc.).
- **Público Objetivo:** Desarrolladores, entusiastas de IA, vibe coders y equipos de producto que quieran entender y experimentar con la arquitectura de agentes y MCPs de una forma sumamente visual y divertida.
- **Propuesta de Valor:** Hace tangibles y lúdicos conceptos abstractos como *Agentic Harness*, *Model Context Protocol (MCP)*, *Tool calling* y *Agent Orchestration*, fomentando el aprendizaje social al ver cómo otros resolvieron la misma problemática.

---

## 2. User Experience & Visual Design

### Flujo de Usuario Principal
1. **Selección de Problemática / Misión:**
   - El jugador elige una misión activa (ej. *"Black Friday Crash: Postgres bloqueado y usuarios quejándose en Discord"*, *"Ghost Vulnerability: CVE zero-day en repo privado"*, o crear un desafío personalizado).
   - Se despliega el briefing con los objetivos, requisitos y restricciones.
2. **Agent Forge & Muñequito Workshop:**
   - **Customizador de Muñequito:** Selector modular de cabeza/casco, torso, visor de ojos, color de chasis y accesorios cibernéticos con vista previa pixel art animada.
   - **Harness de Slots:** Espacios dedicados para:
     1. *Motor Cognitivo / Brain* (Gemini 2.5 Flash, Claude Sonnet, GPT-4o, DeepSeek R1).
     2. *Slot MCP Primario* (ej. Postgres Database Connector).
     3. *Slot MCP Secundario* (ej. GitHub Version Control).
     4. *Slot MCP Terciario / Notifier* (ej. Slack / Discord Webhook).
     5. *Memory / Context Cache* (ej. SQLite Memory, Vector Index).
     6. *Execution Guardrail* (Sandbox estricto, Auto-pilot, Human-in-the-loop).
   - **Bandeja de MCPs con Drag & Drop:** Tarjetas de herramientas con iconos nítidos, métodos soportados (`postgres.query`, `github.open_pr`, etc.) y arrastre táctil/mouse directo hacia los sockets del muñequito.
   - **Personalización:** Nombre del agente (ej. *"KukiBot 9000"*), descripción y prompt de sistema.
3. **Simulación en Vivo (The Arena):**
   - El muñequito entra en la arena de prueba contra la problemática.
   - Ejecución animada por fases: *Trigger -> Reasoning -> MCP Query 1 -> Data Transform -> MCP Action 2 -> Final Resolution*.
   - Retro terminal stream con logs en vivo y visualización de payloads JSON.
   - Audio retro sintetizado (Web Audio API) con bleeps de procesamiento, acordes de éxito y fanfarria al resolver.
   - Cálculo de puntaje: Eficacia de MCPs seleccionados, latencia simulada y cobertura de objetivos.
4. **Publicación y Galería Comunitaria:**
   - Al completar la misión, el usuario puede publicar su agente en la Galería Comunitaria con 1 clic.
   - La galería muestra muñequitos animados creados por la comunidad, su harness equipado, el problema resuelto y contador de votos/aplausos.
   - Modo Inspección: Permite abrir el muñequito de otro usuario, inspeccionar sus MCPs y ejecutar una simulación para ver cómo trabaja.

### Identidad Visual & Estética
- **Paleta de Colores (60-30-10):**
  - *Canvas (60%):* Fondo arcade oscuro con sutil cuadrícula técnica (`#090D16` / `#0F172A`).
  - *Estructuras & Paneles (30%):* Tarjetas de consola de laboratorio con bordes pixelados sutiles (`#1E293B`, `#111827`).
  - *Acentos (10%):* Verde fósforo terminal (`#10B981`), ámbar retro (`#F59E0B`), cian cibernético (`#06B6D4`) y púrpura arcade (`#8B5CF6`).
- **Tipografía:**
  - Títulos y display: `Plus Jakarta Sans` y fuente arcade mono para métricas numéricas y terminales de comando.
  - Cero pills genéricas: Metadatos limpios con separadores tipográficos (`·`, `/`).

---

## 3. Key Product Decisions & Trade-Offs

- **Simulación Reactiva en Frontend con Web Audio API:**
  - *Enfoque:* Motor de simulación determinista y visual con árboles de decisión según los MCPs equipados y el problema elegido, complementado con sintetizador de audio retro nativo sin dependencias pesadas externas.
  - *Por qué:* Garantiza latencia cero, máxima fluidez animada en 60 FPS, sin requerir claves de API complejas para jugar de inmediato.
- **Persistencia Híbrida (Seed Curado + LocalStorage):**
  - *Enfoque:* Una colección precargada de muñequitos de la comunidad con creadores divertidos ("Kuki Amarilla", "DevOps Ninja", "Data Goblin"), combinada con sincronización en `localStorage` para que los agentes que el usuario cree queden guardados y persistentes.
- **Drag & Drop con fallback de 1-Click Equip:**
  - *Enfoque:* Soporta arrastrar y soltar fluido mediante HTML5 Drag and Drop / Touch events, y también click directo sobre el slot o tarjeta para máxima accesibilidad mobile y desktop.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VibeAgent: MCP Arena                           │
├────────────────────────────────────────────────────────────────────────┤
│ Top Bar: Brand Wordmark · Missions · Agent Forge · Community Gallery   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │   Active Problem Box  │   │        Agent Forge / Harness         │  │
│  │  - Title & Context    │   │  - Pixel Avatar Canvas / SVG Sprite  │  │
│  │  - Required MCP Needs │   │  - 5 Harness Slots (Brain, MCPs...)  │  │
│  │  - Win Conditions     │   │  - Agent Name & System Persona       │  │
│  └───────────┬───────────┘   └──────────────────┬───────────────────┘  │
│              │                                  │                      │
│              ▼                                  ▼                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Available MCP Tools Deck (Drag & Drop)           │  │
│  │  [GitHub]  [Postgres]  [Slack]  [Puppeteer]  [Filesystem]  ...   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Live Simulation Arena (Terminal + Anim)          │  │
│  │  - Stage with Muñequito animated actions & tool beam effects     │  │
│  │  - Step-by-step resolution logs & live JSON payloads             │  │
│  │  - Retro Sound FX (Beeps, Triggers, Victory)                     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Community Showcase / Gallery                     │  │
│  │  - Grid of community agents with animated pixel avatars           │  │
│  │  - Upvotes, inspect modal & instant replay against problems      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Modelos de Datos Clave
- `Problem`: `{ id, title, category, description, requiredCapabilities, difficulty, mockEvents }`
- `McpTool`: `{ id, name, category, icon, description, availableMethods, badgeColor }`
- `AgentHarness`: `{ brainModel, primaryMcp, secondaryMcp, tertiaryMcp, memoryMcp, guardrail }`
- `MuñequitoConfig`: `{ skinColor, helmetStyle, visorStyle, suitStyle, accessory, eyeGlowColor }`
- `CommunityAgent`: `{ id, name, author, problemId, harness, muñequito, votes, createdAt, simulationSummary }`

---

## 5. Implementation Roadmap

1. **Pixel Art Avatar Engine (`PixelMuñequito.tsx`):**
   - Renderizador SVG modular de pixel art escalable para caras, visores, trajes y animaciones de respiración/caminar/acción.
2. **MCP Catalog & Problem Deck (`mcpData.ts` & `problemsData.ts`):**
   - Definición exhaustiva de 12+ herramientas MCP con métodos auténticos, y 6 misiones desafiantes con generador de problemas personalizados.
3. **Interactive Harness & Drag-and-Drop Builder (`AgentForge.tsx`):**
   - Slots visuales con cables de conexión, drag-and-drop intuitivo y customizador de muñequito en tiempo real.
4. **Arena Simulation Runner (`SimulationArena.tsx`):**
   - Ejecución por etapas, terminal de logs en vivo, animación de poderes MCP y sintetizador de audio retro Web Audio.
5. **Community Gallery & Inspector (`CommunityGallery.tsx`):**
   - Galería de muñequitos de la comunidad, sistema de votos, filtros y modal de inspección/repetición.
6. **Main Navigation & Polish (`App.tsx`, `index.html`, `metadata.json`):**
   - Integración completa con pestañas fluidas, sincronización de título y metadata.
