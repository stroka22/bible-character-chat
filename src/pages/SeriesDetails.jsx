import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bibleSeriesRepository } from '../repositories/bibleSeriesRepository';

const SeriesDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [series, setSeries] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await bibleSeriesRepository.getBySlug(slug);
      setSeries(s);
      if (s) {
        const it = await bibleSeriesRepository.listItemsWithStudies(s.id);
        setItems(it || []);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const firstCharacterId = useMemo(() => {
    const first = items && items.length > 0 ? items[0] : null;
    return first?.study?.character_id || null;
  }, [items]);

  const handleIntroChat = () => {
    if (!firstCharacterId || !series) return;
    // Pass series slug to let chat set hidden context and auto-post intro
    navigate(`/chat?character=${firstCharacterId}&series=${encodeURIComponent(series.slug)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-semibold text-gray-900">Series not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row gap-6">
        {series.cover_image_url && (
          <img
            src={series.cover_image_url}
            alt={series.title}
            className="w-full md:w-80 h-40 md:h-48 object-cover rounded-lg object-[center_20%] border border-gray-200"
            loading="lazy"
            decoding="async"
            width={320}
            height={192}
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{series.title}</h1>
          {series.description && (
            <p className="mt-2 text-gray-700 whitespace-pre-line">{series.description}</p>
          )}
          <div className="mt-4 flex gap-2 items-center">
            {series.is_premium && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Premium</span>
            )}
            {user && items.length > 0 && firstCharacterId && (
              <button onClick={handleIntroChat} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Start intro chat
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Included Studies</h2>
        {items.length === 0 ? (
          <p className="text-gray-600">No studies have been added yet.</p>
        ) : (
          <ol className="space-y-3">
            {items.map((it, idx) => (
              <li key={it.id} className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-100 text-gray-700">{idx + 1}</div>
                  <div>
                    <div className="font-medium text-gray-900">{it.override_title || it.study?.title || 'Study'}</div>
                    {it.study?.description && (<div className="text-sm text-gray-600 line-clamp-2 max-w-2xl">{it.study.description}</div>)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/studies/${it.study?.id || it.study_id}`)}
                    className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  >
                    Open
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default SeriesDetails;
