import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import userFavoritesRepository from '../repositories/userFavoritesRepository';
import userSettingsRepository from '../repositories/userSettingsRepository';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CharacterCard from '../components/CharacterCard.jsx';

/**
 * FavoritesPage Component
 * 
 * Route: /favorites
 * Displays all characters that the user has marked as favorites
 */
const FavoritesPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredId, setFeaturedId] = useState(null);
  const [error, setError] = useState(null);

  // Load all characters and server favorites
  useEffect(() => {
    const fetchCharactersAndFavorites = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allCharacters = await characterRepository.getAll();
        setCharacters(allCharacters);
        const favoriteIds = await userFavoritesRepository.getFavoriteIds(user?.id);
        const favorites = allCharacters.filter(char => favoriteIds.includes(char.id));
        setFavoriteCharacters(favorites);
        const feat = await userSettingsRepository.getFeaturedCharacterId(user?.id);
        setFeaturedId(feat);
      } catch (err) {
        console.error('Failed to fetch favorites or featured:', err);
        setError('Failed to load your favorites.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharactersAndFavorites();
  }, [user?.id]);

  // Handle toggling a character as favorite
  const handleToggleFavorite = async (characterId) => {
    try {
      const isFav = favoriteCharacters.some((c) => c.id === characterId);
      await userFavoritesRepository.setFavorite(user?.id, characterId, !isFav);
      const favoriteIds = await userFavoritesRepository.getFavoriteIds(user?.id);
      const favorites = characters.filter(char => favoriteIds.includes(char.id));
      setFavoriteCharacters(favorites);
    } catch (err) {
      console.error('Error updating favorite characters:', err);
      setError('Failed to update favorites. Please try again.');
    }
  };

  // Handle setting a character as featured
  const handleSetAsFeatured = async (character) => {
    if (!character) return;
    try {
      await userSettingsRepository.setFeaturedCharacterId(user?.id, character.id);
      setFeaturedId(character.id);
      alert(`${character.name} is now your featured character across devices!`);
    } catch (error) {
      console.error('Error setting featured character:', error);
    }
  };

  // Placeholder when not logged in
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-blue-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              Login Required
            </h3>
            <p className="text-blue-100 mb-6">
              Please log in to view your favorite characters.
            </p>
            <Link
              to="/login"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
          </div>
          <p className="text-center text-blue-100">Loading your favorite characters...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-300">Your Favorite Characters</h1>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Error block */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {favoriteCharacters.length === 0 && (
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              No Favorite Characters Yet
            </h3>
            <p className="text-blue-100 mb-6">
              You haven't added any characters to your favorites yet. Browse characters and click the star icon to add them to your favorites.
            </p>
            <Link
              to="/"
              className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Browse Characters
            </Link>
          </div>
        )}

        {/* Grid of favorite characters */}
        {favoriteCharacters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteCharacters.map((character, index) => (
              <CharacterCard
                key={character?.id || `character-${index}`}
                character={character}
                onSelect={(char) => window.location.href = `/chat?character=${char.id}`}
                isFavorite={true}
                onToggleFavorite={() => handleToggleFavorite(character.id)}
                isFeatured={featuredId === character.id}
                onSetAsFeatured={() => handleSetAsFeatured(character)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
