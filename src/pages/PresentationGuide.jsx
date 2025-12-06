import React from 'react';
import { Link } from 'react-router-dom';

// Simple screenshot wrapper that falls back to a placeholder panel
function Screenshot({ src, alt, className = '' }) {
  const [failed, setFailed] = React.useState(false);
  if (failed || !src) {
    return (
      <div className={`w-full aspect-video bg-white/10 border border-white/15 rounded-lg flex items-center justify-center text-white/70 text-sm ${className}`}>
        <span>Screenshot placeholder – drop an image at {src || '/present/...png'}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full rounded-lg border border-white/15 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

function Section({ title, children, badge }) {
  return (
    <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/15">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-yellow-300" style={{ fontFamily: 'Cinzel, serif' }}>{title}</h2>
        {badge && (
          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-purple-200 text-purple-900 border border-purple-300">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

const PresentationGuide = () => {
  const open = (path) => window.open(path, '_blank', 'noopener,noreferrer');
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-indigo-800 py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400" style={{ fontFamily: 'Cinzel, serif' }}>FaithTalkAI – Presentation Guide</h1>
          <p className="text-white/80 mt-2">Speaker notes + quick links. Not visible in navigation.</p>
        </header>

        {/* Chat with Characters */}
        <Section title="Chat with Characters">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-white/90">
                Converse with curated biblical characters. Each persona draws from Scripture and historical context to respond naturally
                and consistently in first person.
              </p>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                <li>Grounded answers with citations and concise length</li>
                <li>Save, revisit, and continue conversations</li>
                <li>Premium controls via org settings (featured characters, free/premium access)</li>
              </ul>
              <div className="flex gap-2 mt-2">
                <button onClick={() => open('/chat')} className="px-3 py-2 rounded bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-300">Open Chat</button>
                <button onClick={() => open('/favorites')} className="px-3 py-2 rounded bg-white/10 text-white border border-white/20 hover:bg-white/15">Open Favorites</button>
              </div>
            </div>
            <Screenshot src="/present/chat.png" alt="Chat with Characters" />
          </div>
        </Section>

        {/* Roundtable */}
        <Section title="Roundtable">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3 order-2 md:order-1">
              <p className="text-white/90">
                Multiple characters discuss a topic together—each bringing a unique perspective. Configure replies per round, follow-ups,
                and max words to fit your experience.
              </p>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                <li>Auto-start or manual pacing</li>
                <li>Per-organization defaults and limits</li>
                <li>Tier gates for advanced modes</li>
              </ul>
              <div className="flex gap-2 mt-2">
                <button onClick={() => open('/roundtable/setup')} className="px-3 py-2 rounded bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-300">Open Setup</button>
                <button onClick={() => open('/roundtable')} className="px-3 py-2 rounded bg-white/10 text-white border border-white/20 hover:bg-white/15">Open Roundtable</button>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <Screenshot src="/present/roundtable.png" alt="Roundtable" />
            </div>
          </div>
        </Section>

        {/* Bible Studies */}
        <Section title="Bible Studies">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-white/90">
                Host studies with structured lessons and discussion. Tie premium studies to subscriptions for your organization.
              </p>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                <li>Public listing with optional premium-only studies</li>
                <li>Lesson navigation and persistent conversations</li>
              </ul>
              <div className="flex gap-2 mt-2">
                <button onClick={() => open('/studies')} className="px-3 py-2 rounded bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-300">Open Studies</button>
              </div>
            </div>
            <Screenshot src="/present/studies.png" alt="Bible Studies" />
          </div>
        </Section>

        {/* Admin org settings */}
        <Section title="Organization Settings (Admin)" badge="Admin">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-white/90">Configure business model per organization:</p>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                <li>Featured character for homepage</li>
                <li>Free vs Premium character access</li>
                <li>Premium gates for Roundtable (e.g., All-Speak, replies thresholds)</li>
                <li>Premium Bible Studies selection</li>
              </ul>
              <div className="flex gap-2 mt-2">
                <button onClick={() => open('/admin')} className="px-3 py-2 rounded bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-300">Open Admin</button>
              </div>
            </div>
            <Screenshot src="/present/admin-settings.png" alt="Admin Settings" />
          </div>
        </Section>

        {/* Billing */}
        <Section title="Billing & Subscriptions" badge="Admin">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-white/90">Stripe-powered subscriptions with admin portal for upgrades and management.</p>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                <li>Self-serve checkout and billing portal</li>
                <li>Premium recognition in-app</li>
              </ul>
              <div className="flex gap-2 mt-2">
                <button onClick={() => open('/account?open=1')} className="px-3 py-2 rounded bg-white/10 text-white border border-white/20 hover:bg-white/15">Open Billing</button>
              </div>
            </div>
            <Screenshot src="/present/billing.png" alt="Billing" />
          </div>
        </Section>

        {/* Invites & Access */}
        <Section title="Invites & Access Control" badge="Admin">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-white/90">Invite people to your organization with roles (user/admin). Track usage and manage access.</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => open('/admin/invites')} className="px-3 py-2 rounded bg-white/10 text-white border border-white/20 hover:bg-white/15">Open Invites</button>
              </div>
            </div>
            <Screenshot src="/present/invites.png" alt="Invites" />
          </div>
        </Section>

        {/* Multi-tenant owners */}
        <Section title="Multi‑Tenant Owners" badge="Super Admin">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-white/90">Super Admin can view and manage multiple organizations and their settings.</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => open('/admin/users')} className="px-3 py-2 rounded bg-purple-300 text-purple-900 font-semibold hover:bg-purple-200">Open Super Admin</button>
              </div>
            </div>
            <Screenshot src="/present/superadmin.png" alt="Super Admin" />
          </div>
        </Section>

        {/* Mobile App */}
        <Section title="Mobile App">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-white/90">Native React Native app sharing the same backend: chat, roundtable, and org-aware settings.</p>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                <li>Syncs featured character and premium gates per org</li>
                <li>Lightweight offline caching for settings</li>
              </ul>
            </div>
            <Screenshot src="/present/mobile.png" alt="Mobile App" />
          </div>
        </Section>

        {/* Roadmap */}
        <Section title="Coming Soon (Roadmap)">
          <ul className="list-disc list-inside text-white/90 space-y-1">
            <li>Video chats with characters</li>
            <li>Multiple language support</li>
            <li>Invite others into your live conversation</li>
          </ul>
        </Section>

        <footer className="text-center text-white/60 text-sm mt-6">
          Tip: Use Cmd/Ctrl+Click on the quick links to keep this guide open.
        </footer>
      </div>
    </div>
  );
};

export default PresentationGuide;
