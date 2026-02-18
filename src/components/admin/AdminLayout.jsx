import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { isSuperadmin } = useAuth();
  
  const isActive = (path) => location.pathname === path;
  const isTabActive = (tab) => location.search.includes(`tab=${tab}`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop left sidebar navigation */}
      <div className="hidden md:block">
        <aside className="fixed top-24 left-6 w-64 bg-white rounded-md shadow border max-h-[calc(100vh-120px)] overflow-y-auto z-10">
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Content Management</div>
          <nav className="px-2 pb-3 space-y-1">
            <Link to="/admin" className={`block w-full text-left px-3 py-2 rounded ${isActive('/admin') && !location.search ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Overview</Link>
            <Link to="/admin?tab=characters" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('characters') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Characters</Link>
            <Link to="/admin?tab=groups" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('groups') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Groups</Link>
            <Link to="/admin?tab=featured" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('featured') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Featured Character</Link>
            <Link to="/admin?tab=studies" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('studies') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Bible Studies</Link>
            <Link to="/admin?tab=readingPlans" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('readingPlans') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Reading Plans</Link>
            <Link to="/admin?tab=branding" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('branding') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Branding</Link>
            <Link to="/admin?tab=faq" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('faq') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>FAQ</Link>
            <Link to="/admin/marketing" className={`block w-full text-left px-3 py-2 rounded ${isActive('/admin/marketing') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Marketing</Link>
          </nav>
          
          <div className="px-4 pt-3 text-xs font-semibold text-gray-500 uppercase">Users</div>
          <nav className="px-2 pb-3 space-y-1">
            <Link to="/admin?tab=favorites" className={`block w-full text-left px-3 py-2 rounded ${isTabActive('favorites') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>User Favorites</Link>
          </nav>

          {isSuperadmin && (
            <>
              <div className="px-4 pt-3 text-xs font-semibold text-gray-500 uppercase">Super Admin</div>
              <nav className="px-2 pb-3 space-y-1">
                <Link to="/admin/users" className={`block px-3 py-2 rounded ${isActive('/admin/users') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Users & Organizations</Link>
                <Link to="/admin?tab=accountTiers" className={`block px-3 py-2 rounded ${isTabActive('accountTiers') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Account Tiers</Link>
                <Link to="/admin?tab=roundtable" className={`block px-3 py-2 rounded ${isTabActive('roundtable') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Roundtable Settings</Link>
                <Link to="/admin/leads" className={`block px-3 py-2 rounded ${isActive('/admin/leads') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Leads</Link>
                <Link to="/admin/contact" className={`block px-3 py-2 rounded ${isActive('/admin/contact') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Contact Submissions</Link>
                <Link to="/admin/marketing" className={`block px-3 py-2 rounded ${isActive('/admin/marketing') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Marketing Vault</Link>
                <Link to="/admin/partners" className={`block px-3 py-2 rounded ${isActive('/admin/partners') ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'}`}>Business Partners</Link>
              </nav>
            </>
          )}
        </aside>
      </div>

      {/* Main content area - offset for sidebar */}
      <div className="md:ml-72 p-6">
        {children}
      </div>
    </div>
  );
}
