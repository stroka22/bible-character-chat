import React, { useEffect, useState, useRef } from 'react';
import { createLead } from '../services/leads';

const STORAGE_KEY = 'lead_capture_dismissed_until';
const HIDE_DAYS = 30;

export default function LeadCaptureModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [consentEmail, setConsentEmail] = useState(true);
  const [consentSms, setConsentSms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const triggeredRef = useRef(false);
  const isDesktopRef = useRef(false);
  // `lead_test=1|true` forces modal regardless of dismissal memory
  const [force, setForce] = useState(false);

  // Determine desktop once on mount
  useEffect(() => {
    isDesktopRef.current = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
  }, []);

  // Respect prior dismissal
  useEffect(() => {
    if (!isDesktopRef.current) return; // desktop only
    // URL override – show immediately and skip timers/listeners
    try {
      const params = new URLSearchParams(window.location.search);
      const flag = params.get('lead_test');
      if (flag === '1' || flag === 'true') {
        setForce(true);
        setOpen(true);
        return; // skip normal gating logic
      }
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const until = new Date(raw);
        if (Date.now() <= until.getTime()) return; // still hidden
      }
    } catch {}

    const show = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setOpen(true);
    };

    const onMouseOut = (e) => {
      // Exit intent: only when leaving at top
      if (!e.toElement && !e.relatedTarget && e.clientY <= 0) {
        show();
      }
    };

    const fallbackTimer = setTimeout(show, 10000);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  const closeAndRemember = () => {
    // Persist dismissal only when not in forced-test mode
    if (!force) {
      try {
        const until = new Date();
        until.setDate(until.getDate() + HIDE_DAYS);
        localStorage.setItem(STORAGE_KEY, until.toISOString());
      } catch { /* ignore */ }
    }
    setOpen(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email.');
      await createLead({
        name: name || null,
        email,
        phone: phone || null,
        role,
        consent_email: !!consentEmail,
        consent_sms: !!consentSms,
        source_path: window.location.pathname + window.location.search,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      });
      closeAndRemember();
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={closeAndRemember} />
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h2 id="lead-modal-title" className="text-xl font-semibold">Get ministry updates and resources</h2>
                <p className="text-sm text-white/80">Opt-out anytime — we respect your inbox.</p>
              </div>
              <button onClick={closeAndRemember} aria-label="Close" className="ml-3 text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>
          <form onSubmit={onSubmit} className="bg-white px-6 py-5 text-blue-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={name} onChange={(e)=>setName(e.target.value)} className="px-3 py-2 rounded-full bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Name" />
              <input value={email} onChange={(e)=>setEmail(e.target.value)} className="px-3 py-2 rounded-full bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Email*" />
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="px-3 py-2 rounded-full bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Phone" />
              <select value={role} onChange={(e)=>setRole(e.target.value)} className="px-3 py-2 rounded-full bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                <option value="user">User</option>
                <option value="pastor">Pastor</option>
                <option value="leader">Leader</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <label className="flex items-center gap-1"><input type="checkbox" checked={consentEmail} onChange={(e)=>setConsentEmail(e.target.checked)} /> Email OK</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={consentSms} onChange={(e)=>setConsentSms(e.target.checked)} /> SMS OK</label>
            </div>
            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={closeAndRemember} className="mr-3 px-4 py-2 rounded-full border border-blue-200 text-blue-900 hover:bg-blue-50">Not now</button>
              <button disabled={submitting} className="px-5 py-2 rounded-full bg-yellow-400 text-blue-900 font-semibold shadow hover:bg-yellow-300 disabled:bg-gray-400">{submitting ? 'Submitting...' : 'Keep me updated'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
