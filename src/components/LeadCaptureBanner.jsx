import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
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
    try {
      const until = new Date();
      until.setDate(until.getDate() + HIDE_DAYS);
      localStorage.setItem(STORAGE_KEY, until.toISOString());
    } catch {}
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
      setSuccess('Thanks! We\'ll be in touch soon.');
      setName(''); setEmail(''); setPhone(''); setRole('user'); setConsentEmail(true); setConsentSms(false);
      dismiss();
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 text-blue-900">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1">
          <div className="font-semibold">Stay in the loop</div>
          <div className="text-sm">Get updates, ministry resources, and launches. Opt-out anytime.</div>
        </div>
        <form onSubmit={onSubmit} className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
          <input value={name} onChange={(e)=>setName(e.target.value)} className="md:col-span-1 px-3 py-2 rounded border border-yellow-300 bg-white" placeholder="Name" />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="md:col-span-2 px-3 py-2 rounded border border-yellow-300 bg-white" placeholder="Email*" />
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="md:col-span-1 px-3 py-2 rounded border border-yellow-300 bg-white" placeholder="Phone" />
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="md:col-span-1 px-3 py-2 rounded border border-yellow-300 bg-white">
            <option value="user">User</option>
            <option value="pastor">Pastor</option>
            <option value="leader">Leader</option>
            <option value="other">Other</option>
          </select>
          <button disabled={submitting} className="md:col-span-1 px-4 py-2 rounded bg-blue-900 text-white font-semibold hover:bg-blue-800 disabled:bg-gray-400">{submitting ? 'Submitting...' : 'Keep me updated'}</button>
          <div className="md:col-span-6 flex items-center gap-4 text-xs text-blue-900/80">
            <label className="flex items-center gap-1"><input type="checkbox" checked={consentEmail} onChange={(e)=>setConsentEmail(e.target.checked)} /> Email OK</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={consentSms} onChange={(e)=>setConsentSms(e.target.checked)} /> SMS OK</label>
            <button type="button" onClick={dismiss} className="ml-auto underline">Dismiss</button>
          </div>
          {error && <div className="md:col-span-6 text-red-700 text-sm">{error}</div>}
          {success && <div className="md:col-span-6 text-green-700 text-sm">{success}</div>}
        </form>
      </div>
    </div>
  );
}
