import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import { Activity, Bot, BrainCircuit, CheckCircle2, ChevronRight, Code2, FolderOpen, GitBranch, PanelLeft, Plus, Send, Settings2, ShieldCheck, TerminalSquare, Workflow, X } from 'lucide-react';

type Provider = 'ollama' | 'openai' | 'anthropic';
type Project = { id: string; name: string; updatedAt: string };

const flowNodes: Node[] = [
  { id: 'a', position: { x: 30, y: 90 }, data: { label: 'Analizar' } },
  { id: 'p', position: { x: 230, y: 30 }, data: { label: 'Planificar' } },
  { id: 'b', position: { x: 430, y: 90 }, data: { label: 'Construir' } },
  { id: 't', position: { x: 630, y: 30 }, data: { label: 'Validar' } },
  { id: 's', position: { x: 830, y: 90 }, data: { label: 'Resumen' } }
].map(node => ({ ...node, style: { borderRadius: 12, padding: 12, background: '#121a2d', color: '#dbe7ff', border: '1px solid #2e436f', fontSize: 12 } }));
const flowEdges: Edge[] = [
  { id: 'e1', source: 'a', target: 'p', animated: true }, { id: 'e2', source: 'p', target: 'b', animated: true }, { id: 'e3', source: 'b', target: 't', animated: true }, { id: 'e4', source: 't', target: 's', animated: true }
];
const starters = [
  { icon: Code2, title: 'Crear una app', prompt: 'Crea una aplicación full-stack pequeña y divide la implementación en tareas verificables.' },
  { icon: Workflow, title: 'Diseñar workflow', prompt: 'Diseña un workflow de agentes para analizar, construir, probar y documentar un proyecto.' },
  { icon: BrainCircuit, title: 'Explicar código', prompt: 'Explícame un concepto complejo de programación de principiante a experto.' }
];

export default function App() {
  const [provider, setProvider] = useState<Provider>('ollama');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Conectando…');
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState('Plataforma Studio');
  const [showModal, setShowModal] = useState(false);
  const activeProvider = useMemo(() => ({ ollama: 'Ollama local', openai: 'OpenAI', anthropic: 'Anthropic' }[provider]), [provider]);

  async function refresh() {
    try {
      const health = await window.desktopApi.health();
      setStatus(health.ollamaReachable ? 'Ollama local listo' : health.providers.length ? health.providers.length + ' proveedor(es) configurado(s)' : 'Modo base · sin proveedor');
      setProjects(await window.desktopApi.listProjects());
    } catch { setStatus('Gateway local no disponible'); }
  }
  useEffect(() => { void refresh(); }, []);

  async function runAgent(text: string = prompt) {
    if (!text.trim()) return;
    setBusy(true); setAnswer('');
    try {
      const plan = await window.desktopApi.plan(text);
      const contract = plan.plan.map((step, index) => (index + 1) + '. ' + step).join('\n');
      const result = await window.desktopApi.ask({ provider, prompt: text + '\n\nContrato de trabajo:\n' + contract, projectId: project });
      setAnswer(result.text || 'El proveedor no devolvió contenido.');
    } catch (error) { setAnswer(error instanceof Error ? error.message : 'No se pudo completar la tarea.'); }
    finally { setBusy(false); }
  }
  async function createProject() {
    const name = window.prompt('Nombre del proyecto', 'Mi nuevo proyecto');
    if (!name || !name.trim()) return;
    const created = await window.desktopApi.createProject(name.trim());
    setProject(created.name); setShowModal(false); await refresh();
  }

  return <div className="studio-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Bot size={18} /></div><div><strong>Plataforma</strong><span>TOTAL STUDIO</span></div></div>
      <div className="workspace-switch"><span>PROYECTO ACTIVO</span><button onClick={() => setShowModal(true)}><span>{project}</span><ChevronRight size={16} /></button></div>
      <nav>
        <button className="nav-item active"><Activity size={17} /> Studio <span className="pill">LIVE</span></button>
        <button className="nav-item"><FolderOpen size={17} /> Proyectos</button>
        <button className="nav-item"><TerminalSquare size={17} /> Terminal</button>
        <button className="nav-item"><GitBranch size={17} /> Versiones</button>
      </nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={17} /> Ajustes</button><div className="security"><ShieldCheck size={18} /><div><strong>Local-first</strong><span>Credenciales fuera del renderer</span></div></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="crumb"><PanelLeft size={17} /><span>Workspace</span><ChevronRight size={15} /><strong>{project}</strong></div><div className="top-actions"><span className="connection"><span className="dot" /> {status}</span><button className="icon-btn" title="Nuevo proyecto" onClick={createProject}><Plus size={17} /></button></div></header>

      <div className="content-grid">
        <section className="left-column">
          <div className="hero-block"><div className="eyebrow">AGENTIC DEVELOPMENT STUDIO</div><h1>Describe. Construye.<br /><em>Valida automáticamente.</em></h1><p>Un entorno único para pasar de una idea a un proyecto verificable, manteniendo archivos, decisiones y contexto bajo tu control.</p></div>
          <div className="prompt-card">
            <div className="prompt-head"><div><span className="label">AGENTE</span><strong>Constructor principal</strong></div><select value={provider} onChange={(event) => setProvider(event.target.value as Provider)}><option value="ollama">Ollama local</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select></div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void runAgent(); }} placeholder="Ej.: crea un dashboard de ventas con autenticación, base de datos y tests…" />
            <div className="prompt-foot"><span>Ctrl + Enter · ejecutar</span><button className="run" disabled={busy || !prompt.trim()} onClick={() => void runAgent()}>{busy ? <><Activity size={16} /> Trabajando…</> : <><Send size={16} /> Ejecutar agente</>}</button></div>
          </div>
          <div className="starter-grid">{starters.map(({ icon: Icon, title, prompt: starter }) => <button key={title} className="starter" onClick={() => { setPrompt(starter); void runAgent(starter); }}><Icon size={18} /><div><strong>{title}</strong><span>Usar plantilla guiada</span></div></button>)}</div>
          <div className="result-card"><div className="section-head"><div><span className="label">RESULTADO</span><h2>Salida del agente</h2></div><span className="provider-badge">{activeProvider}</span></div>{answer ? <pre>{answer}</pre> : <div className="result-empty"><CheckCircle2 size={24} /><span>La salida aparecerá aquí. El agente debe pasar por análisis, construcción y validación.</span></div>}</div>
        </section>

        <section className="right-column">
          <div className="canvas-card"><div className="section-head"><div><span className="label">CANVAS</span><h2>Estado del flujo</h2></div><span className="live-badge"><span className="dot" /> EN VIVO</span></div><div className="canvas"><ReactFlow nodes={flowNodes} edges={flowEdges} fitView proOptions={{ hideAttribution: true }}><Background gap={24} size={1} /><Controls /><MiniMap /></ReactFlow></div></div>
          <div className="activity-card"><div className="section-head"><div><span className="label">ACTIVIDAD</span><h2>Workspace</h2></div><button className="text-btn" onClick={refresh}>Actualizar</button></div><div className="project-list">{projects.length ? projects.slice(0, 6).map(item => <button key={item.id} className={item.name === project ? 'project-row selected' : 'project-row'} onClick={() => setProject(item.name)}><FolderOpen size={16} /><div><strong>{item.name}</strong><span>{new Date(item.updatedAt).toLocaleString()}</span></div></button>) : <div className="empty-list"><FolderOpen size={20} /><span>Aún no hay proyectos. Crea el primero desde <b>+</b>.</span></div>}</div></div>
        </section>
      </div>
    </main>

    {showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}><div className="project-modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="label">WORKSPACE</span><h3>Seleccionar proyecto</h3></div><button className="icon-btn" onClick={() => setShowModal(false)}><X size={17} /></button></div>{projects.map(item => <button key={item.id} className={item.name === project ? 'modal-project selected' : 'modal-project'} onClick={() => { setProject(item.name); setShowModal(false); }}><FolderOpen size={17} /><span>{item.name}</span></button>)}<button className="new-project" onClick={createProject}><Plus size={17} /> Crear proyecto</button></div></div>}
  </div>;
}