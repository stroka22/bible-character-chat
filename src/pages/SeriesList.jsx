import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bibleSeriesRepository } from '../repositories/bibleSeriesRepository';

const SeriesList = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await bibleSeriesRepository.listSeries({ includePrivate: false });
      setSeries(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Bible Study Series</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500" />
        </div>
      ) : series.length === 0 ? (
        <p className="text-gray-600">No series available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map(s => (
            <Link key={s.id} to={`/series/${s.slug}`} className="block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              {s.cover_image_url && (
                <img
                  src={s.cover_image_url}
                  alt={s.title}
                  className="w-full h-40 object-cover object-[center_20%]"
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={160}
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{s.title}</h2>
                {s.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{s.description}</p>
                )}
                {s.is_premium && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Premium</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesList;
