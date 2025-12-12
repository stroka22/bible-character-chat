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
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);

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
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded">Access denied. Superadmin only.</div>
      </div>
    );
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
    <div className="container mx-auto px-4 pt-24 pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-sm text-gray-600">Search, import, add, email, and delete leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setShowImportModal(true)} className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50">Import CSV</button>
          <button onClick={()=>setShowAddModal(true)} className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Add Lead</button>
          <button onClick={onDeleteSelected} disabled={!selected.size} className={`inline-flex items-center px-3 py-2 rounded-md ${selected.size? 'bg-red-600 text-white hover:bg-red-700':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Delete Selected</button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/></svg>
          </div>
          <input value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} onKeyDown={(e)=>{ if(e.key==='Enter') load(); }} placeholder="Search name, email, or phone" className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2"><input type="checkbox" checked={!!allChecked} onChange={toggleAll} /></th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Role</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600">Loading…</td></tr>
              ) : items.length ? items.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2"><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} /></td>
                  <td className="px-4 py-2 text-gray-900">{l.name || '—'}</td>
                  <td className="px-4 py-2 text-gray-900">{l.email}</td>
                  <td className="px-4 py-2 text-gray-900">{l.phone || '—'}</td>
                  <td className="px-4 py-2"><span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">{l.role || 'user'}</span></td>
                  <td className="px-4 py-2 text-gray-700">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-10 text-center">
                  <div className="text-gray-700 font-medium mb-1">No leads found</div>
                  <div className="text-gray-500 text-sm">Try adjusting your search or add/import leads.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer: pagination & counts */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700">
          <div>Page {page} • {total} total</div>
          <div className="space-x-2">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className={`px-3 py-1.5 rounded border ${page<=1?'bg-gray-100 text-gray-400 border-gray-200':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Prev</button>
            <button onClick={()=>setPage(p=>p+1)} disabled={items.length===0 || items.length<25} className={`px-3 py-1.5 rounded border ${(items.length===0||items.length<25)?'bg-gray-100 text-gray-400 border-gray-200':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Next</button>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Template: Visitor (Pastor)</h2>
          <input value={tmplPastor.subject} onChange={(e)=>setTmplPastor({...tmplPastor,subject:e.target.value})} placeholder="Subject" className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={tmplPastor.html} onChange={(e)=>setTmplPastor({...tmplPastor,html:e.target.value})} rows={10} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          <div className="mt-2"><button onClick={()=>saveTemplate('lead_visitor_pastor', tmplPastor)} className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Save</button></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Template: Visitor (General)</h2>
          <input value={tmplUser.subject} onChange={(e)=>setTmplUser({...tmplUser,subject:e.target.value})} placeholder="Subject" className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={tmplUser.html} onChange={(e)=>setTmplUser({...tmplUser,html:e.target.value})} rows={10} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          <div className="mt-2"><button onClick={()=>saveTemplate('lead_visitor_user', tmplUser)} className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Save</button></div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">Placeholders: {'{{name}} {{email}} {{phone}} {{role}} {{organization}} {{chat_url}} {{roundtable_url}} {{studies_url}}'}</div>

      {/* Send composer */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Send Email to Leads</h2>
        <p className="text-sm text-gray-600 mb-2">Targets: selected leads (if any), otherwise current search results.</p>
        <input value={sendConf.subject} onChange={(e)=>setSendConf({...sendConf,subject:e.target.value})} placeholder="Subject" className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea value={sendConf.html} onChange={(e)=>setSendConf({...sendConf,html:e.target.value})} rows={8} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        <div className="flex gap-2 mt-2">
          <button onClick={()=>sendBulk(true)} className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50">Send Preview to me</button>
          <button onClick={()=>sendBulk(false)} className="inline-flex items-center px-3 py-2 rounded-md bg-amber-500 text-blue-900 font-semibold hover:bg-amber-600">Send</button>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Lead</h3>
              <button onClick={()=>setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={newLead.name} onChange={e=>setNewLead({...newLead,name:e.target.value})} placeholder="Name" className="px-3 py-2 rounded-md border border-gray-300 text-gray-900" />
                <input value={newLead.email} onChange={e=>setNewLead({...newLead,email:e.target.value})} placeholder="Email" className="px-3 py-2 rounded-md border border-gray-300 text-gray-900" />
                <input value={newLead.phone} onChange={e=>setNewLead({...newLead,phone:e.target.value})} placeholder="Phone" className="px-3 py-2 rounded-md border border-gray-300 text-gray-900" />
                <input value={newLead.role} onChange={e=>setNewLead({...newLead,role:e.target.value})} placeholder="Role (pastor/user)" className="px-3 py-2 rounded-md border border-gray-300 text-gray-900" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={()=>setShowAddModal(false)} className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50">Cancel</button>
                <button onClick={async ()=>{ await onAdd(); setShowAddModal(false); }} className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Add Lead</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Import CSV</h3>
              <button onClick={()=>setShowImportModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">Columns: name, email, phone, role, consent_email, consent_sms, source_path, utm_source, utm_medium, utm_campaign</p>
              <textarea value={csvText} onChange={(e)=>setCsvText(e.target.value)} rows={10} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"></textarea>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={()=>setShowImportModal(false)} className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50">Cancel</button>
                <button onClick={async ()=>{ await onImportCsv(); setShowImportModal(false); }} className="px-3 py-2 rounded-md bg-amber-500 text-blue-900 font-semibold hover:bg-amber-600">Import</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
