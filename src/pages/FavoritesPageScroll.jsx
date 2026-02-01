import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import userFavoritesRepository from '../repositories/userFavoritesRepository';
import userSettingsRepository from '../repositories/userSettingsRepository';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const generateFallbackAvatar = (name) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

const FavoritesPageScroll = () => {
  const { user, loading } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [featuredId, setFeaturedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allCharacters = await characterRepository.getAll();
        setCharacters(allCharacters);
        const favoriteIds = await userFavoritesRepository.getFavoriteIds(user?.id);
        const favorites = allCharacters.filter(char => favoriteIds.includes(char.id));
        setFavoriteCharacters(favorites);
        const feat = await userSettingsRepository.getFeaturedCharacterId(user?.id);
        setFeaturedId(feat);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  const handleToggleFavorite = async (characterId) => {
    try {
      const isFav = favoriteCharacters.some(c => c.id === characterId);
      await userFavoritesRepository.setFavorite(user?.id, characterId, !isFav);
      const favoriteIds = await userFavoritesRepository.getFavoriteIds(user?.id);
      const favorites = characters.filter(char => favoriteIds.includes(char.id));
      setFavoriteCharacters(favorites);
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  const handleSetFeatured = async (character) => {
    try {
      await userSettingsRepository.setFeaturedCharacterId(user?.id, character.id);
      setFeaturedId(character.id);
    } catch (err) {
      console.error('Error setting featured:', err);
    }
  };

  if (!user && !loading) {
    return (
      <PreviewLayout>
        <ScrollBackground className="min-h-screen py-8 px-4">
          <ScrollWrap className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Login Required</h1>
            <p className="text-amber-700 mb-6">Please log in to view your favorite characters.</p>
            <Link to="/login/preview" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Log In</Link>
          </ScrollWrap>
        </ScrollBackground>
        <FooterScroll />
      </PreviewLayout>
    );
  }

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-8 px-4">
        <ScrollWrap className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>Favorite Characters</h1>
            <Link to="/chat/preview" className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Browse All</Link>
          </div>

          <ScrollDivider />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
              <p className="mt-4 text-amber-700">Loading favorites...</p>
            </div>
          ) : favoriteCharacters.length === 0 ? (
            <div className="text-center py-12 bg-amber-50/50 rounded-xl border border-amber-200">
              <svg className="w-16 h-16 mx-auto text-amber-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>No Favorites Yet</h2>
              <p className="text-amber-700 mb-6">Start chatting with characters and add them to your favorites!</p>
              <Link to="/chat/preview" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
                Browse Characters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteCharacters.map(char => (
                <div
                  key={char.id}
                  className={`bg-white/80 rounded-xl border p-4 transition-all hover:shadow-md ${
                    featuredId === char.id ? 'border-amber-400 ring-2 ring-amber-300' : 'border-amber-200'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full overflow-hidden mb-3 ${featuredId === char.id ? 'ring-4 ring-amber-400' : 'ring-2 ring-amber-300'}`}>
                      <img
                        src={char.avatar_url || generateFallbackAvatar(char.name)}
                        alt={char.name}
                        className="w-full h-full object-cover object-[center_20%]"
                      />
                    </div>
                    <h3 className="font-bold text-amber-900 text-sm mb-1" style={{ fontFamily: 'Cinzel, serif' }}>{char.name}</h3>
                    <p className="text-amber-700/70 text-xs line-clamp-2 mb-3">{char.description || 'Biblical figure'}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleFavorite(char.id)}
                        className="p-1.5 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200"
                        title="Remove from favorites"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSetFeatured(char)}
                        className={`p-1.5 rounded-full ${featuredId === char.id ? 'bg-amber-200 text-amber-700' : 'bg-amber-100 text-amber-500 hover:bg-amber-200'}`}
                        title={featuredId === char.id ? "Currently featured" : "Set as featured"}
                      >
                        <svg className="w-4 h-4" fill={featuredId === char.id ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </button>
                      <Link
                        to={`/chat/preview?character=${char.id}`}
                        className="p-1.5 rounded-full bg-amber-600 text-white hover:bg-amber-700"
                        title="Chat"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/preview" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default FavoritesPageScroll;
