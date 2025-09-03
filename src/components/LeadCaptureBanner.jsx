import React, { useEffect, useState, useRef } from 'react';
import { createLead } from '../services/leads';

const STORAGE_KEY = 'lead_capture_dismissed_until';
const HIDE_DAYS = 30;

export default function LeadCaptureBanner() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [consentEmail, setConsentEmail] = useState(true);
  const [consentSms, setConsentSms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  // `lead_test=1` or `lead_test=true` in URL forces banner to appear regardless of localStorage
  const [force, setForce] = useState(false);
  // timer ref for auto-dismiss after success
  const autoCloseRef = useRef(null);
  // dynamic offset so banner sits just below fixed header on mobile
  const [offset, setOffset] = useState(64); // sensible default

  useEffect(() => {
    // Calculate header height and update offset
    const updateOffset = () => {
      try {
        const header = document.querySelector('header');
        const h = header ? header.getBoundingClientRect().height : 64;
        setOffset(Math.max(0, h));
      } catch {
        /* ignore */
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    window.addEventListener('scroll', updateOffset); // header height shrinks on scroll

    // URL override
    try {
      const params = new URLSearchParams(window.location.search);
      const flag = params.get('lead_test');
      if (flag === '1' || flag === 'true') {
        setForce(true);
        setShow(true);
        return; // skip normal localStorage logic
      }
    } catch {
      /* ignore */
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return setShow(true);
      const until = new Date(raw);
      if (Date.now() > until.getTime()) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    // Do not persist dismissal if we're in forced-test mode
    if (!force) {
      try {
        const until = new Date();
        until.setDate(until.getDate() + HIDE_DAYS);
        localStorage.setItem(STORAGE_KEY, until.toISOString());
      } catch {
        /* ignore */
      }
    }
    setShow(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email.');
      }
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
      setSuccess("Thanks! You're on the list. We'll be in touch soon.");
      setName(''); setEmail(''); setPhone(''); setRole('user'); setConsentEmail(true); setConsentSms(false);
      // auto-dismiss after 3 s
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      autoCloseRef.current = setTimeout(dismiss, 3000);
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // cleanup any pending timer on unmount
  useEffect(() => () => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg"
      style={{ top: offset }}
    >
      <div className="container mx-auto px-4 py-3">
        {success ? (
          <div className="rounded-xl border border-blue-700/50 backdrop-blur-sm px-4 py-4 flex items-center justify-between">
            <span className="text-green-200 text-sm md:text-base">{success}</span>
            <button
              type="button"
              onClick={dismiss}
              className="ml-4 px-4 py-1 rounded-full bg-yellow-400 text-blue-900 font-semibold shadow hover:bg-yellow-300 text-sm"
            >
              Close
            </button>
          </div>
        ) : (
        <form onSubmit={onSubmit} className="rounded-xl border border-blue-700/50 backdrop-blur-sm px-4 py-3 grid grid-cols-1 md:grid-cols-8 gap-2 items-center">
          <div className="md:col-span-2">
            <div className="font-semibold">Get ministry updates and resources</div>
            <div className="text-sm text-white/80">Opt-out anytime — we respect your inbox.</div>
          </div>

          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="md:col-span-1 px-3 py-2 rounded-full bg-white text-blue-900 placeholder-blue-900/60 border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Name"
          />
          <input
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="md:col-span-2 px-3 py-2 rounded-full bg-white text-blue-900 placeholder-blue-900/60 border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Email*"
          />
          <input
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
            className="md:col-span-1 px-3 py-2 rounded-full bg-white text-blue-900 placeholder-blue-900/60 border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Phone"
          />
          <select
            value={role}
            onChange={(e)=>setRole(e.target.value)}
            className="md:col-span-1 px-3 py-2 rounded-full bg-white text-blue-900 border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="user">User</option>
            <option value="pastor">Pastor</option>
            <option value="leader">Leader</option>
            <option value="other">Other</option>
          </select>

          <button
            disabled={submitting}
            className="md:col-span-1 flex items-center justify-center gap-1 px-5 py-2 rounded-full bg-yellow-400 text-blue-900 font-semibold shadow hover:bg-yellow-300 disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Keep me updated'}
            {!submitting && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>

          <div className="md:col-span-8 flex items-center gap-4 text-xs text-white/80">
            <label className="flex items-center gap-1"><input type="checkbox" checked={consentEmail} onChange={(e)=>setConsentEmail(e.target.checked)} /> Email OK</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={consentSms} onChange={(e)=>setConsentSms(e.target.checked)} /> SMS OK</label>
            <button type="button" onClick={dismiss} className="ml-auto underline underline-offset-2 hover:text-white">Dismiss</button>
            {error && <div className="text-red-300">{error}</div>}
            {success && <div className="text-green-200">{success}</div>}
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
