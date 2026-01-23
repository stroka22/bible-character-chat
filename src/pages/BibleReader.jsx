import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BOOK_AUTHOR } from '../data/bibleAuthorship.js';
import { characterRepository } from '../repositories/characterRepository.js';
import { LocalBibleProvider, AVAILABLE_TRANSLATIONS } from '../services/bible/providers/localBible.js';

const providers = {};
function getProvider(translation) {
  if (!providers[translation]) {
    providers[translation] = new LocalBibleProvider(translation);
  }
  return providers[translation];
}

function useCharacters() {
  const [map, setMap] = React.useState(new Map());
  React.useEffect(() => {
    (async () => {
      try {
        const chars = await characterRepository.getAll(false);
        const m = new Map();
        for (const c of chars) m.set((c.name || '').toLowerCase(), c);
        setMap(m);
      } catch {}
    })();
  }, []);
  return map;
}

function linkInline(text, charMap) {
  if (!text) return text;
  // Conservative: link unique names once per paragraph. Skip very common words.
  const skip = new Set(['god','lord']);
  let linked = text;
  const used = new Set();
  for (const [name, c] of charMap.entries()) {
    if (skip.has(name)) continue;
    if (used.has(name)) continue;
    const re = new RegExp(`\\b(${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'i');
    if (re.test(linked)) {
      linked = linked.replace(re, `<a href="/chat?character=${c.id}" class="text-blue-700 underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>`);
      used.add(name);
    }
  }
  return linked;
}

export default function BibleReader() {
  const navigate = useNavigate();
  const { translation = 'KJV', book = 'Genesis', chapter = '1' } = useParams();
  const [data, setData] = React.useState({ translation: 'KJV', book, chapter: Number(chapter), verses: [], notice: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [bookList, setBookList] = React.useState([]);
  const [chapterList, setChapterList] = React.useState([]);
  const charMap = useCharacters();

  const authorName = BOOK_AUTHOR[book];
  const authorChar = authorName ? charMap.get(authorName.toLowerCase()) : null;
  
  // Get provider for current translation (NIV falls back to KJV until API is ready)
  const effectiveTranslation = translation === 'NIV' ? 'KJV' : translation;
  const prov = getProvider(effectiveTranslation);

  React.useEffect(() => { (async () => setBookList(await prov.getBooks()))(); }, [effectiveTranslation]);
  React.useEffect(() => { (async () => setChapterList(await prov.getChapters(book)))(); }, [book, effectiveTranslation]);
  React.useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await prov.getChapterText(book, Number(chapter));
        // Add notice if NIV is selected but showing KJV
        if (translation === 'NIV') {
          setData({ ...res, notice: 'NIV coming soon via Bible Brain. Showing KJV.' });
        } else {
          setData(res);
        }
      } catch (e) {
        setError(e.message || 'Failed to load chapter');
      } finally {
        setLoading(false);
      }
    })();
  }, [translation, book, chapter]);

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bible – {translation}</h1>
          <p className="text-gray-600">{book} {chapter}{data.notice ? ' · ' + data.notice : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={translation} onChange={(e)=>navigate(`/bible/${e.target.value}/${book}/${chapter}`)} className="rounded-md border border-gray-300 px-2 py-1">
            {AVAILABLE_TRANSLATIONS.map(t => (
              <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
            ))}
          </select>
          <select value={book} onChange={(e)=>navigate(`/bible/${translation}/${e.target.value}/1`)} className="rounded-md border border-gray-300 px-2 py-1">
            {bookList.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={String(chapter)} onChange={(e)=>navigate(`/bible/${translation}/${book}/${e.target.value}`)} className="rounded-md border border-gray-300 px-2 py-1">
            {chapterList.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Body */}
      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded mb-3">{error}</div>}
      {loading ? (
        <div className="text-gray-700">Loading…</div>
      ) : (
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            {data.verses.length === 0 ? (
              <div className="p-4 bg-white border border-gray-200 rounded">No verses loaded.</div>
            ) : (
              <div className="space-y-3 bg-white border border-gray-200 rounded p-4">
                {data.verses.map((v, idx) => (
                  <p key={idx} className="text-gray-900" dangerouslySetInnerHTML={{ __html: `<span class='text-gray-500 select-none pr-2'>${idx+1}</span>` + linkInline(v, charMap) }} />
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-4">
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">People in this chapter</h3>
              <ul className="space-y-2 text-sm">
                {authorChar && (
                  <li>
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium mr-2">Author</span>
                    <a href={`/chat?character=${authorChar.id}`} className="text-blue-700 underline hover:no-underline" target="_blank" rel="noopener noreferrer">{authorChar.name}</a>
                  </li>
                )}
                {/* Future: detected names per chapter via lightweight NER/dictionary */}
              </ul>
            </div>
            <div className="mt-4 text-xs text-gray-500">Scripture quotations are from {AVAILABLE_TRANSLATIONS.find(t => t.code === translation)?.name || translation} (Public Domain).</div>
          </div>
        </div>
      )}
    </div>
  );
}
