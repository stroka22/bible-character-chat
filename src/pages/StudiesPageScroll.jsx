import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import { usePremium } from '../hooks/usePremium';
import UpgradeModal from '../components/modals/UpgradeModal';
import FooterScroll from '../components/FooterScroll';
import { supabase } from '../services/supabase';
import { getOwnerSlug, getSettings as getTierSettings } from '../services/tierSettingsService';
import { useAuth } from '../contexts/AuthContext';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';
import PreviewLayout from '../components/PreviewLayout';

const StudiesPageScroll = () => {
  const [studies, setStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [premiumStudyIds, setPremiumStudyIds] = useState([]);
  const { isPremium } = usePremium();
  const { role } = useAuth();
  
  const isStudyPremium = (study) => {
    if (study.is_premium) return true;
    if (premiumStudyIds.includes(study.id)) return true;
    return false;
  };

  const [ownerSlug, setOwnerSlug] = useState((getOwnerSlug() || '').toLowerCase());
  const [ownerOptions, setOwnerOptions] = useState(['__ALL__', (getOwnerSlug() || '').toLowerCase(), 'faithtalkai']);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getTierSettings();
        if (Array.isArray(settings?.premiumStudyIds)) {
          setPremiumStudyIds(settings.premiumStudyIds);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setIsLoading(true);
        const wantAll = ownerSlug === '__ALL__';
        const data = await bibleStudiesRepository.listStudies({ ownerSlug, includePrivate: false, allOwners: wantAll });
        if (wantAll && Array.isArray(data)) {
          const norm = (t) => String(t || '').trim().toLowerCase().replace(/-\d+$/,'');
          const seen = new Set();
          const uniq = [];
          for (const s of data) {
            const key = norm(s?.title);
            if (!seen.has(key)) { seen.add(key); uniq.push(s); }
          }
          setStudies(uniq);
        } else {
          setStudies(data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching Bible studies:', err);
        setError('Failed to load Bible studies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudies();
  }, [ownerSlug]);

  useEffect(() => {
    const fetchOwnerOptions = async () => {
      try {
        const { data, error } = await supabase.from('bible_studies').select('owner_slug');
        if (!error && Array.isArray(data)) {
          const uniques = Array.from(new Set([
            '__ALL__',
            (getOwnerSlug() || '').toLowerCase(),
            'faithtalkai',
            ...data.map(r => (r?.owner_slug || '').trim().toLowerCase()).filter(Boolean),
          ]));
          setOwnerOptions(uniques);
        }
      } catch (e) {}
    };
    if (role === 'superadmin') fetchOwnerOptions();
  }, [role]);

  const handleStudyClick = (study) => {
    if (isStudyPremium(study) && !isPremium) {
      setShowUpgrade(true);
      return;
    }
  };

  return (
    <PreviewLayout>
      <ScrollBackground>
        <ScrollWrap className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Home
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
              Character-Directed Bible Studies
            </h1>
            <p className="text-amber-800/80 max-w-2xl mx-auto">
              Explore the Bible through guided studies led by biblical characters. Deepen your understanding with scripture-based lessons and reflections.
            </p>

            {role === 'superadmin' && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <label className="text-sm text-amber-700">Owner</label>
                <select 
                  value={ownerSlug} 
                  onChange={(e) => setOwnerSlug(e.target.value)} 
                  className="text-sm bg-white/80 text-amber-900 rounded-md py-1 px-2 border border-amber-300"
                >
                  {ownerOptions.map(opt => (
                    <option key={`owner-${opt}`} value={opt}>
                      {opt === '__ALL__' ? 'All owners' : opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <ScrollDivider className="my-6" />

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700" />
                <p className="mt-4 text-amber-700">Loading Bible studies...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-8">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && studies.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center my-8">
              <h3 className="text-2xl font-bold text-amber-900 mb-4">Coming Soon!</h3>
              <p className="text-amber-700 mb-6">
                We're preparing character-directed Bible studies for you. Check back soon for new content!
              </p>
              <Link
                to="/"
                className="px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Return Home
              </Link>
            </div>
          )}

          {/* Studies Grid */}
          {!isLoading && !error && studies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
              {studies.map(study => (
                <Link
                  key={study.id}
                  to={`/studies/${study.id}`}
                  onClick={(e) => {
                    if (isStudyPremium(study) && !isPremium) {
                      e.preventDefault();
                      handleStudyClick(study);
                    }
                  }}
                  className={`
                    relative block bg-white/70 rounded-xl overflow-hidden
                    border border-amber-200 transition-all duration-300
                    hover:bg-white hover:shadow-lg hover:-translate-y-1
                  `}
                >
                  {study.cover_image_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={study.cover_image_url}
                        alt={study.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">{study.title}</h3>
                    <p className="text-amber-700/80 text-sm mb-3 line-clamp-2">{study.description}</p>
                    
                    {isStudyPremium(study) && (
                      <span className={`
                        inline-block px-3 py-1 text-xs font-medium rounded-full
                        ${isPremium 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300'}
                      `}>
                        {isPremium ? "Premium" : "Premium Only"}
                      </span>
                    )}
                  </div>

                  {isStudyPremium(study) && !isPremium && (
                    <div className="pointer-events-none absolute inset-0 bg-amber-900/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg shadow-lg">
                        Upgrade to Access
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </ScrollWrap>
      </ScrollBackground>

      <FooterScroll />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        message="Upgrade to access premium Bible studies led by biblical characters."
      />
    </PreviewLayout>
  );
};

export default StudiesPageScroll;
