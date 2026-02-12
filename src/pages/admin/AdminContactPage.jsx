import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  replied: 'bg-green-100 text-green-800',
  resolved: 'bg-purple-100 text-purple-800',
  archived: 'bg-amber-100 text-amber-800',
};

const AdminContactPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    let query = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching contact submissions:', error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setSubmissions(prev =>
        prev.map(s => (s.id === id ? { ...s, status } : s))
      );
      if (selected?.id === id) {
        setSelected(prev => ({ ...prev, status }));
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={fetchSubmissions}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No contact submissions found.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelected(sub);
                    if (sub.status === 'new') {
                      updateStatus(sub.id, 'read');
                    }
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selected?.id === sub.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {sub.name || 'Anonymous'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[sub.status]}`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{sub.subject}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(sub.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {selected ? (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
                    <p className="text-sm text-gray-500">{formatDate(selected.created_at)}</p>
                  </div>
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    className={`px-3 py-1 text-sm rounded-lg border ${statusColors[selected.status]}`}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">From</label>
                    <p className="text-gray-900">{selected.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        {selected.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                      {selected.message}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    onClick={() => updateStatus(selected.id, 'replied')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => updateStatus(selected.id, 'resolved')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactPage;
