import { useEffect, useState } from 'react';

type Provider = 'openai' | 'anthropic' | 'arena' | 'github';

const labels: Record<Provider, string> = { openai: 'ChatGPT / OpenAI', anthropic: 'Claude / Anthropic', arena: 'Arena (API autorizada)', github: 'GitHub' };

export default function App() {
  const [provider, setProvider] = useState<Provider>('openai');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [repository, setRepository] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('Comprobando gateway local…');
  const [busy, setBusy] = useState(false);

  useEffect(() => { void window.desktopApi.health().then((health) => setStatus(health.ok ? `Gateway activo · ${health.providers.length} proveedor(es) configurado(s)` : health.error || 'Gateway no disponible')); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setBusy(true); setAnswer('');
    try {
      const result = await window.desktopApi.ask({ provider, prompt, model: model || undefined, repository: repository || undefined });
      setAnswer(result.text || 'El proveedor no devolvió texto.');
    } catch (error) { setAnswer(error instanceof Error ? error.message : 'No se pudo completar la petición.'); }
    finally { setBusy(false); }
  }

  return <main className="app-shell">
    <header><div><span className="eyebrow">MODO PC · LOCAL</span><h1>Plataforma Total</h1><p>Tu centro de trabajo para aprender, crear y conectar con servicios de IA.</p></div><span className="status">● {status}</span></header>
    <section className="workspace">
      <form className="panel composer" onSubmit={submit}>
        <h2>Nueva petición</h2>
        <label>Proveedor<select value={provider} onChange={(event) => setProvider(event.target.value as Provider)}>{(Object.keys(labels) as Provider[]).map((key) => <option key={key} value={key}>{labels[key]}</option>)}</select></label>
        <label>Modelo <span className="hint">(opcional)</span><input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Usar modelo configurado" /></label>
        {provider === 'github' && <label>Repositorio <span className="hint">owner/repo</span><input value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="SoftEngAi-dev/mi-proyecto" /></label>}
        <label>Petición<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe lo que quieres construir…" rows={10} /></label>
        <button disabled={busy || !prompt.trim()}>{busy ? 'Procesando…' : 'Enviar petición'}</button>
      </form>
      <section className="panel response"><div className="response-heading"><h2>Respuesta</h2><span>Protegida por gateway local</span></div>{answer ? <pre>{answer}</pre> : <div className="empty">La respuesta aparecerá aquí.<br /><small>Las claves nunca se exponen al renderer.</small></div>}</section>
    </section>
  </main>;
}
