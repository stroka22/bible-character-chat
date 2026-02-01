import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BOOK_AUTHOR } from '../data/bibleAuthorship.js';
import { characterRepository } from '../repositories/characterRepository.js';
import { LocalBibleProvider, AVAILABLE_TRANSLATIONS } from '../services/bible/providers/localBible.js';
import { readingPlansRepository } from '../repositories/readingPlansRepository.js';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const providers = {};
function getProvider(translation) {
  if (!providers[translation]) {
    providers[translation] = new LocalBibleProvider(translation);
  }
  return providers[translation];
}

function useCharacters() {
  const [map, setMap] = useState(new Map());
  useEffect(() => {
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
  const skip = new Set(['god','lord']);
  let linked = text;
  const used = new Set();
  for (const [name, c] of charMap.entries()) {
    if (skip.has(name)) continue;
    if (used.has(name)) continue;
    const re = new RegExp(`\\b(${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'i');
    if (re.test(linked)) {
      linked = linked.replace(re, `<a href="/chat?character=${c.id}" class="text-amber-700 underline hover:no-underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>`);
      used.add(name);
    }
  }
  return linked;
}

export default function BibleReaderScroll() {
  const navigate = useNavigate();
  const { translation = 'KJV', book = 'Genesis', chapter = '1' } = useParams();
  const [data, setData] = useState({ translation: 'KJV', book, chapter: Number(chapter), verses: [], notice: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookList, setBookList] = useState([]);
  const [chapterList, setChapterList] = useState([]);
  const charMap = useCharacters();

  const authorName = BOOK_AUTHOR[book];
  const authorChar = authorName ? charMap.get(authorName.toLowerCase()) : null;
  const [featuredPlans, setFeaturedPlans] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const plans = await readingPlansRepository.getAll();
        setFeaturedPlans(plans.filter(p => p.is_featured).slice(0, 3));
      } catch {}
    })();
  }, []);
  
  const prov = getProvider(translation);

  useEffect(() => { (async () => setBookList(await prov.getBooks()))(); }, [translation]);
  useEffect(() => { (async () => setChapterList(await prov.getChapters(book)))(); }, [book, translation]);
  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
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

  const goToChapter = (newChapter) => {
    navigate(`/bible/${translation}/${book}/${newChapter}`);
  };

  const goToBook = (newBook) => {
    navigate(`/bible/${translation}/${newBook}/1`);
  };

  const goToTranslation = (newTranslation) => {
    navigate(`/bible/${newTranslation}/${book}/${chapter}`);
  };

  const prevChapter = () => {
    const idx = chapterList.indexOf(Number(chapter));
    if (idx > 0) goToChapter(chapterList[idx - 1]);
  };

  const nextChapter = () => {
    const idx = chapterList.indexOf(Number(chapter));
    if (idx < chapterList.length - 1) goToChapter(chapterList[idx + 1]);
  };

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen">
        <ScrollWrap className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Home
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>
                  Holy Bible
                </h1>
                <p className="text-amber-700 mt-1">
                  {book} {chapter}
                  {data.notice ? <span className="text-amber-600 text-sm ml-2">({data.notice})</span> : ''}
                </p>
              </div>
              
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={translation} 
                  onChange={(e) => goToTranslation(e.target.value)} 
                  className="bg-white/80 border border-amber-300 rounded-lg px-3 py-2 text-amber-900 text-sm focus:ring-2 focus:ring-amber-500"
                >
                  {AVAILABLE_TRANSLATIONS.map(t => (
                    <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                  ))}
                </select>
                <select 
                  value={book} 
                  onChange={(e) => goToBook(e.target.value)} 
                  className="bg-white/80 border border-amber-300 rounded-lg px-3 py-2 text-amber-900 text-sm focus:ring-2 focus:ring-amber-500"
                >
                  {bookList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select 
                  value={String(chapter)} 
                  onChange={(e) => goToChapter(e.target.value)} 
                  className="bg-white/80 border border-amber-300 rounded-lg px-3 py-2 text-amber-900 text-sm focus:ring-2 focus:ring-amber-500"
                >
                  {chapterList.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <ScrollDivider className="my-4" />

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700" />
                <p className="mt-4 text-amber-700">Loading Scripture...</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-12 gap-6">
              {/* Main Content */}
              <div className="md:col-span-8">
                {/* Chapter Navigation */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={prevChapter}
                    disabled={chapterList.indexOf(Number(chapter)) === 0}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      chapterList.indexOf(Number(chapter)) === 0
                        ? 'text-amber-400 cursor-not-allowed'
                        : 'text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <span className="text-amber-800 font-medium">{book} {chapter}</span>
                  <button
                    onClick={nextChapter}
                    disabled={chapterList.indexOf(Number(chapter)) === chapterList.length - 1}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      chapterList.indexOf(Number(chapter)) === chapterList.length - 1
                        ? 'text-amber-400 cursor-not-allowed'
                        : 'text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Verses */}
                {data.verses.length === 0 ? (
                  <div className="p-6 bg-white/80 border border-amber-200 rounded-xl text-amber-700 text-center">
                    No verses loaded for this chapter.
                  </div>
                ) : (
                  <div className="bg-white/80 border border-amber-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-4">
                      {data.verses.map((v, idx) => (
                        <p 
                          key={idx} 
                          className="text-amber-900 leading-relaxed"
                          style={{ fontFamily: 'Georgia, serif' }}
                          dangerouslySetInnerHTML={{ 
                            __html: `<span class='text-amber-500 select-none pr-2 text-sm font-medium'>${idx+1}</span>` + linkInline(v, charMap) 
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Chapter Navigation */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={prevChapter}
                    disabled={chapterList.indexOf(Number(chapter)) === 0}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      chapterList.indexOf(Number(chapter)) === 0
                        ? 'bg-amber-100 text-amber-400 cursor-not-allowed'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous Chapter
                  </button>
                  <button
                    onClick={nextChapter}
                    disabled={chapterList.indexOf(Number(chapter)) === chapterList.length - 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      chapterList.indexOf(Number(chapter)) === chapterList.length - 1
                        ? 'bg-amber-100 text-amber-400 cursor-not-allowed'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    Next Chapter
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-4 space-y-4">
                {/* Author/People Section */}
                <div className="bg-white/80 border border-amber-200 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                    People in This Book
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {authorChar ? (
                      <li className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium border border-amber-200">
                          Author
                        </span>
                        <a 
                          href={`/chat?character=${authorChar.id}`} 
                          className="text-amber-700 hover:text-amber-900 underline"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {authorChar.name}
                        </a>
                      </li>
                    ) : (
                      <li className="text-amber-600 text-sm">Author attribution varies by tradition.</li>
                    )}
                  </ul>
                  <p className="text-amber-600 text-xs mt-3">
                    Click any highlighted name in the text to chat with that character.
                  </p>
                </div>
                
                {/* Reading Plans Section */}
                {featuredPlans.length > 0 && (
                  <div className="bg-white/80 border border-amber-200 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                      Reading Plans
                    </h3>
                    <div className="space-y-2">
                      {featuredPlans.map(plan => (
                        <Link 
                          key={plan.id} 
                          to={`/reading-plans/${plan.slug}`}
                          className="block p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                        >
                          <div className="font-medium text-amber-900 text-sm">{plan.title}</div>
                          <div className="text-xs text-amber-600 mt-1">{plan.duration_days} days · {plan.difficulty}</div>
                        </Link>
                      ))}
                    </div>
                    <Link 
                      to="/reading-plans" 
                      className="block mt-3 text-sm text-amber-700 hover:text-amber-900 font-medium"
                    >
                      View all plans →
                    </Link>
                  </div>
                )}

                {/* Translation Info */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-700">
                    Scripture quotations are from the {AVAILABLE_TRANSLATIONS.find(t => t.code === translation)?.name || translation} (Public Domain).
                  </p>
                </div>
              </div>
            </div>
          )}
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
}
