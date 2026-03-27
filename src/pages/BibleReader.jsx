import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BOOK_AUTHOR } from '../data/bibleAuthorship.js';
import { characterRepository } from '../repositories/characterRepository.js';
import { LocalBibleProvider, AVAILABLE_TRANSLATIONS } from '../services/bible/providers/localBible.js';
import { readingPlansRepository } from '../repositories/readingPlansRepository.js';

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
  const [searchParams] = useSearchParams();
  const [data, setData] = React.useState({ translation: 'KJV', book, chapter: Number(chapter), verses: [], notice: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [bookList, setBookList] = React.useState([]);
  const [chapterList, setChapterList] = React.useState([]);
  const [selectedVerses, setSelectedVerses] = React.useState(new Set());
  const charMap = useCharacters();

  const authorName = BOOK_AUTHOR[book];
  const authorChar = authorName ? charMap.get(authorName.toLowerCase()) : null;
  const [featuredPlans, setFeaturedPlans] = React.useState([]);
  
  // Reading plan context from URL params
  const fromPlan = searchParams.get('from') === 'plan';
  const planSlug = searchParams.get('plan');
  const planDay = searchParams.get('day');

  // Load featured reading plans
  React.useEffect(() => {
    (async () => {
      try {
        const plans = await readingPlansRepository.getAll();
        setFeaturedPlans(plans.filter(p => p.is_featured).slice(0, 3));
      } catch {}
    })();
  }, []);
  
  // Get provider for current translation
  const prov = getProvider(translation);

  React.useEffect(() => { (async () => setBookList(await prov.getBooks()))(); }, [translation]);
  React.useEffect(() => { (async () => setChapterList(await prov.getChapters(book)))(); }, [book, translation]);
  React.useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      setSelectedVerses(new Set()); // Clear selection on chapter change
      try {
        const res = await prov.getChapterText(book, Number(chapter));
        setData(res);
      } catch (e) {
        setError(e.message || 'Failed to load chapter');
      } finally {
        setLoading(false);
      }
    })();
  }, [translation, book, chapter]);

  const toggleVerseSelection = (verseNum) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(verseNum)) {
        next.delete(verseNum);
      } else {
        next.add(verseNum);
      }
      return next;
    });
  };

  const chatAboutSelection = () => {
    if (selectedVerses.size === 0 || !data.verses.length) return;
    
    const sortedVerses = Array.from(selectedVerses).sort((a, b) => a - b);
    const passageText = sortedVerses
      .map(v => `${v}. ${data.verses[v - 1]}`)
      .join('\n');
    
    // Build reference string
    let reference = `${book} ${chapter}:`;
    if (sortedVerses.length === 1) {
      reference += sortedVerses[0];
    } else {
      const ranges = [];
      let start = sortedVerses[0];
      let end = sortedVerses[0];
      for (let i = 1; i < sortedVerses.length; i++) {
        if (sortedVerses[i] === end + 1) {
          end = sortedVerses[i];
        } else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          start = sortedVerses[i];
          end = sortedVerses[i];
        }
      }
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      reference += ranges.join(', ');
    }
    
    // Find suggested character based on book
    const suggestedChar = authorChar || Array.from(charMap.values())[0];
    const characterId = suggestedChar?.id || '';
    const context = encodeURIComponent(`Discussing ${reference} (${translation}):\n\n${passageText}`);
    
    navigate(`/chat?character=${characterId}&context=${context}`);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      {/* Back to Reading Plan link */}
      {fromPlan && planSlug && (
        <div className="mb-4">
          <Link 
            to={`/reading-plans/${planSlug}`}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            ← Back to Reading Plan{planDay ? ` (Day ${planDay})` : ''}
          </Link>
        </div>
      )}
      
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
            {/* Verse selection chat button */}
            {selectedVerses.size > 0 && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <span className="text-purple-800 font-medium">
                  {selectedVerses.size} verse{selectedVerses.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedVerses(new Set())}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button
                    onClick={chatAboutSelection}
                    className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                  >
                    💬 Chat About These Verses
                  </button>
                </div>
              </div>
            )}
            
            {data.verses.length === 0 ? (
              <div className="p-4 bg-white border border-gray-200 rounded">No verses loaded.</div>
            ) : (
              <div className="space-y-1 bg-white border border-gray-200 rounded p-4">
                <p className="text-xs text-gray-500 mb-3">Tap verses to select them for discussion</p>
                {data.verses.map((v, idx) => {
                  const verseNum = idx + 1;
                  const isSelected = selectedVerses.has(verseNum);
                  return (
                    <p 
                      key={idx} 
                      onClick={() => toggleVerseSelection(verseNum)}
                      className={`text-gray-900 cursor-pointer p-2 rounded transition-colors ${
                        isSelected 
                          ? 'bg-purple-100 border-l-4 border-purple-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      dangerouslySetInnerHTML={{ 
                        __html: `<span class='${isSelected ? 'text-purple-700 font-bold' : 'text-gray-500'} select-none pr-2'>${verseNum}</span>` + linkInline(v, charMap) 
                      }} 
                    />
                  );
                })}
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
            
            {/* Reading Plans Section */}
            {featuredPlans.length > 0 && (
              <div className="mt-4 bg-white border border-gray-200 rounded p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reading Plans</h3>
                <div className="space-y-3">
                  {featuredPlans.map(plan => (
                    <Link 
                      key={plan.id} 
                      to={`/reading-plans/${plan.slug}`}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm">{plan.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{plan.duration_days} days · {plan.difficulty}</div>
                    </Link>
                  ))}
                </div>
                <Link 
                  to="/reading-plans" 
                  className="block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all plans →
                </Link>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500">Scripture quotations are from {AVAILABLE_TRANSLATIONS.find(t => t.code === translation)?.name || translation} (Public Domain).</div>
          </div>
        </div>
      )}
    </div>
  );
}
