import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

async function fetchJson(url, options = {}) {
  const resp = await fetch(url, { credentials: 'include', ...options });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json?.error || 'Request failed');
  return json;
}

function useAuthHeader() {
  const { session } = useAuth();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminLeadsPage() {
  const { isSuperadmin } = useAuth();
  const headers = useAuthHeader();
  const [q, setQ] = React.useState('');
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [selected, setSelected] = React.useState(new Set());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [newLead, setNewLead] = React.useState({ name: '', email: '', phone: '', role: '' });
  const [csvText, setCsvText] = React.useState('');
  const [tmplPastor, setTmplPastor] = React.useState({ subject: '', html: '' });
  const [tmplUser, setTmplUser] = React.useState({ subject: '', html: '' });
  const [sendConf, setSendConf] = React.useState({ subject: '', html: '' });

  const pageSize = 25;

  const load = React.useCallback(async () => {
    if (!isSuperadmin()) return;
    setLoading(true);
    setError('');
    try {
      const json = await fetchJson(`/api/admin/leads?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`, { headers });
      setItems(json.items || []);
      setTotal(json.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    // Load templates best-effort
    (async () => {
      try {
        const p = await fetchJson('/api/admin/templates?key=lead_visitor_pastor', { headers });
        setTmplPastor({ subject: p.template?.subject || '', html: p.template?.html || '' });
      } catch {}
      try {
        const u = await fetchJson('/api/admin/templates?key=lead_visitor_user', { headers });
        setTmplUser({ subject: u.template?.subject || '', html: u.template?.html || '' });
      } catch {}
    })();
  }, []);

  if (!isSuperadmin()) {
    return <div className="p-6 text-red-200">Access denied. Superadmin only.</div>;
  }

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const allChecked = items.length && items.every(i => selected.has(i.id));
  const toggleAll = () => {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(items.map(i => i.id)));
  };

  const onAdd = async () => {
    try {
      await fetchJson('/api/admin/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(newLead) });
      setNewLead({ name: '', email: '', phone: '', role: '' });
      load();
    } catch (e) { alert(e.message); }
  };

  const onDeleteSelected = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} lead(s)?`)) return;
    try {
      await fetchJson('/api/admin/leads', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ ids: Array.from(selected) }) });
      setSelected(new Set());
      load();
    } catch (e) { alert(e.message); }
  };

  const onImportCsv = async () => {
    if (!csvText.trim()) return;
    try {
      await fetchJson('/api/admin/leads-import', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ csv: csvText }) });
      setCsvText('');
      load();
    } catch (e) { alert(e.message); }
  };

  const saveTemplate = async (key, tpl) => {
    try {
      const json = await fetchJson(`/api/admin/templates?key=${encodeURIComponent(key)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(tpl) });
      if (key === 'lead_visitor_pastor') setTmplPastor({ subject: json.template.subject, html: json.template.html });
      if (key === 'lead_visitor_user') setTmplUser({ subject: json.template.subject, html: json.template.html });
      alert('Saved');
    } catch (e) { alert(e.message); }
  };

  const sendBulk = async (preview = false) => {
    try {
      const json = await fetchJson('/api/admin/leads-send', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ subject: sendConf.subject, html: sendConf.html, ids: Array.from(selected), filter: q, preview }) });
      alert(preview ? `Preview sent to ${json.preview_to}` : `Sent: ${json.sent}, failures: ${json.failures}`);
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100">
      <h1 className="text-2xl font-bold mb-4">Leads</h1>

      {/* Search and bulk actions */}
      <div className="flex items-center gap-2 mb-4">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name/email/phone" className="px-3 py-2 rounded bg-slate-800 border border-slate-700 w-full" />
        <button onClick={load} className="px-3 py-2 rounded bg-amber-400 text-blue-900 font-semibold">Search</button>
        <button onClick={onDeleteSelected} className="px-3 py-2 rounded bg-red-500 text-white disabled:opacity-60" disabled={!selected.size}>Delete Selected</button>
      </div>

      {/* List */}
      <div className="overflow-auto border border-slate-700 rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-2"><input type="checkbox" checked={!!allChecked} onChange={toggleAll} /></th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading…</td></tr>
            ) : items.length ? items.map((l) => (
              <tr key={l.id} className="odd:bg-slate-900">
                <td className="p-2"><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} /></td>
                <td className="p-2">{l.name || '—'}</td>
                <td className="p-2">{l.email}</td>
                <td className="p-2">{l.phone || '—'}</td>
                <td className="p-2">{l.role || '—'}</td>
                <td className="p-2">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="p-4 text-center">No leads</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add lead + CSV import */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="border border-slate-700 rounded p-3">
          <h2 className="font-semibold mb-2">Add Lead</h2>
          <div className="grid grid-cols-2 gap-2">
            <input value={newLead.name} onChange={e=>setNewLead({...newLead,name:e.target.value})} placeholder="Name" className="px-2 py-2 rounded bg-slate-800 border border-slate-700" />
            <input value={newLead.email} onChange={e=>setNewLead({...newLead,email:e.target.value})} placeholder="Email" className="px-2 py-2 rounded bg-slate-800 border border-slate-700" />
            <input value={newLead.phone} onChange={e=>setNewLead({...newLead,phone:e.target.value})} placeholder="Phone" className="px-2 py-2 rounded bg-slate-800 border border-slate-700" />
            <input value={newLead.role} onChange={e=>setNewLead({...newLead,role:e.target.value})} placeholder="Role (pastor/user)" className="px-2 py-2 rounded bg-slate-800 border border-slate-700" />
          </div>
          <div className="mt-2"><button onClick={onAdd} className="px-3 py-2 rounded bg-emerald-500 text-white">Add</button></div>
        </div>
        <div className="border border-slate-700 rounded p-3">
          <h2 className="font-semibold mb-2">CSV Import</h2>
          <p className="text-xs text-slate-300 mb-2">Columns: name,email,phone,role,consent_email,consent_sms,source_path,utm_source,utm_medium,utm_campaign</p>
          <textarea value={csvText} onChange={(e)=>setCsvText(e.target.value)} rows={6} className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700"></textarea>
          <div className="mt-2"><button onClick={onImportCsv} className="px-3 py-2 rounded bg-amber-400 text-blue-900 font-semibold">Import</button></div>
        </div>
      </div>

      {/* Templates */}
      <div className="mt-8 border border-slate-700 rounded p-3">
        <h2 className="text-xl font-bold mb-3">Email Templates</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Visitor: Pastor</h3>
            <input value={tmplPastor.subject} onChange={(e)=>setTmplPastor({...tmplPastor,subject:e.target.value})} placeholder="Subject" className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700 mb-2" />
            <textarea value={tmplPastor.html} onChange={(e)=>setTmplPastor({...tmplPastor,html:e.target.value})} rows={10} className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700"></textarea>
            <div className="mt-2"><button onClick={()=>saveTemplate('lead_visitor_pastor', tmplPastor)} className="px-3 py-2 rounded bg-emerald-500 text-white">Save</button></div>
          </div>
          <div>
            <h3 className="font-semibold">Visitor: General</h3>
            <input value={tmplUser.subject} onChange={(e)=>setTmplUser({...tmplUser,subject:e.target.value})} placeholder="Subject" className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700 mb-2" />
            <textarea value={tmplUser.html} onChange={(e)=>setTmplUser({...tmplUser,html:e.target.value})} rows={10} className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700"></textarea>
            <div className="mt-2"><button onClick={()=>saveTemplate('lead_visitor_user', tmplUser)} className="px-3 py-2 rounded bg-emerald-500 text-white">Save</button></div>
          </div>
        </div>
        <div className="text-xs text-slate-300 mt-2">Placeholders: {'{{name}} {{email}} {{phone}} {{role}} {{organization}} {{chat_url}} {{roundtable_url}} {{studies_url}}'}</div>
      </div>

      {/* Send composer */}
      <div className="mt-8 border border-slate-700 rounded p-3">
        <h2 className="text-xl font-bold mb-3">Send Email to Leads</h2>
        <p className="text-sm text-slate-300 mb-2">Targets: selected leads (if any), otherwise current search results.</p>
        <input value={sendConf.subject} onChange={(e)=>setSendConf({...sendConf,subject:e.target.value})} placeholder="Subject" className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700 mb-2" />
        <textarea value={sendConf.html} onChange={(e)=>setSendConf({...sendConf,html:e.target.value})} rows={8} className="w-full px-2 py-2 rounded bg-slate-800 border border-slate-700"></textarea>
        <div className="flex gap-2 mt-2">
          <button onClick={()=>sendBulk(true)} className="px-3 py-2 rounded bg-slate-600 text-white">Send Preview to me</button>
          <button onClick={()=>sendBulk(false)} className="px-3 py-2 rounded bg-amber-400 text-blue-900 font-semibold">Send</button>
        </div>
      </div>
    </div>
  );
}
