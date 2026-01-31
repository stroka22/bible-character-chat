import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { characterRepository } from '../repositories/characterRepository';
import { useRoundtable } from '../contexts/RoundtableContext';
import Footer from '../components/Footer';
import { usePremium } from '../hooks/usePremium';
import UpgradeModal from '../components/modals/UpgradeModal';
import { getSettings as getTierSettings } from '../services/tierSettingsService';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const RoundtableSetupScroll = () => {
  const navigate = useNavigate();
  const { startRoundtable } = useRoundtable();
  const { isPremium } = usePremium();
  
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([]);
  const [topic, setTopic] = useState('');
  const [repliesPerRound, setRepliesPerRound] = useState(3);
  const [premiumGates, setPremiumGates] = useState({ repliesPerRoundMin: null });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLetter, setCurrentLetter] = useState('all');
  
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      try {
        const data = await characterRepository.getAll(false);
        setCharacters(data);
        try {
          const ts = await getTierSettings();
          if (ts && ts.premiumRoundtableGates) setPremiumGates(ts.premiumRoundtableGates);
        } catch {}
      } catch (err) {
        console.error('Failed to fetch characters:', err);
        setError('Failed to load characters. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacters();
  }, []);
  
  const handleToggleCharacter = (characterId) => {
    setSelectedCharacterIds(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };
  
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = !searchQuery || 
      character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (character.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = currentLetter === 'all' || 
      character.name.toUpperCase().startsWith(currentLetter);
    return matchesSearch && matchesLetter;
  }).sort((a, b) => a.name.localeCompare(b.name));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedCharacterIds.length === 0) {
      setError('Please select at least one character for the roundtable');
      return;
    }
    
    if (!topic.trim()) {
      setError('Please provide a topic for the roundtable');
      return;
    }
    
    if (!isPremium && premiumGates?.premiumOnly !== false) {
      setShowUpgrade(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newId = await startRoundtable({
        participantIds: selectedCharacterIds,
        topic,
        repliesPerRound,
        autoStart
      });
      
      if (newId) {
        const qp = new URLSearchParams();
        qp.set('conv', newId);
        navigate(`/roundtable?${qp.toString()}`);
      } else {
        setError('Failed to start roundtable. Please try again.');
      }
    } catch (err) {
      console.error('Error starting roundtable:', err);
      setError(`Failed to start roundtable: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  if (isLoading && characters.length === 0) {
    return (
      <ScrollBackground>
        <ScrollWrap className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-amber-900 mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
            Setting Up Roundtable
          </h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700" />
            <span className="ml-3 text-amber-800">Loading characters...</span>
          </div>
        </ScrollWrap>
      </ScrollBackground>
    );
  }
  
  return (
    <>
      <ScrollBackground>
        <ScrollWrap className="max-w-4xl mx-auto">
          <Link
            to="/preview"
            className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Home
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Create a Biblical Roundtable
            </h1>
            
            <p className="text-amber-800/80 text-center mb-6">
              Select multiple biblical figures to discuss a topic together. They will respond to each other and to your messages.
            </p>

            <ScrollDivider className="my-4" />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            
            {/* Topic input */}
            <div className="mb-5">
              <label htmlFor="topic" className="block text-amber-900 font-medium mb-2">
                Discussion Topic
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The nature of faith, Forgiveness, God's plan for humanity..."
                className="w-full bg-white/80 border border-amber-300 rounded-lg py-3 px-4 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            {/* Replies per round */}
            <div className="mb-5">
              <label htmlFor="repliesPerRound" className="block text-amber-900 font-medium mb-2">
                Replies per Round: <span className="font-bold">{repliesPerRound}</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-amber-600 text-sm">1</span>
                <input
                  type="range"
                  id="repliesPerRound"
                  min="1"
                  max="5"
                  value={repliesPerRound}
                  onChange={(e) => {
                    const next = parseInt(e.target.value);
                    const gate = premiumGates?.repliesPerRoundMin;
                    if (!isPremium && gate != null && next > gate) {
                      setShowUpgrade(true);
                      setRepliesPerRound(gate);
                    } else {
                      setRepliesPerRound(next);
                    }
                  }}
                  className="flex-1 accent-amber-600"
                />
                <span className="text-amber-600 text-sm">5</span>
              </div>
              <p className="text-amber-600 text-sm mt-1">
                How many characters will respond in each round.
              </p>
            </div>
            
            {/* Auto-start toggle */}
            <div className="mb-5 flex items-center gap-3">
              <input
                type="checkbox"
                id="autoStart"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="autoStart" className="text-amber-900 font-medium select-none">
                Auto-start discussion <span className="text-amber-600 text-sm">(begins immediately)</span>
              </label>
            </div>

            <ScrollDivider className="my-4" />

            {/* Character selection */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-amber-900 font-medium">
                  Select Characters <span className="text-amber-600 text-sm">({selectedCharacterIds.length} selected)</span>
                </label>
                {selectedCharacterIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCharacterIds([])}
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {/* Search */}
              <div className="mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search characters..."
                  className="w-full bg-white/80 border border-amber-300 rounded-full py-2 px-4 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              {/* Alphabet selector */}
              <div className="mb-3 flex flex-wrap gap-0.5 justify-center">
                <button
                  type="button"
                  onClick={() => setCurrentLetter('all')}
                  className={`px-1.5 py-1 rounded text-xs font-medium ${
                    currentLetter === 'all' 
                      ? 'bg-amber-600 text-white' 
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  All
                </button>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setCurrentLetter(letter)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                      currentLetter === letter 
                        ? 'bg-amber-600 text-white' 
                        : 'text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              
              {/* Character list */}
              <div className="bg-white/60 rounded-xl p-3 max-h-80 overflow-y-auto border border-amber-200">
                {filteredCharacters.length > 0 ? (
                  <ul className="divide-y divide-amber-100">
                    {filteredCharacters.map(character => (
                      <li
                        key={character.id}
                        className="py-2 px-2 flex items-center gap-3 hover:bg-amber-50 rounded-lg cursor-pointer"
                        onClick={() => handleToggleCharacter(character.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCharacterIds.includes(character.id)}
                          onChange={() => handleToggleCharacter(character.id)}
                          className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-amber-300">
                          <img
                            src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`}
                            alt={character.name}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: 'center 0%' }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-amber-900 font-medium text-sm">{character.name}</h3>
                          <p className="text-amber-600 text-xs line-clamp-1">
                            {character.description || character.scriptural_context || "Biblical figure"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-amber-600">
                    No characters found matching your search.
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={isLoading || selectedCharacterIds.length === 0 || !topic.trim()}
                className={`
                  px-8 py-3 rounded-lg font-medium text-lg transition-colors
                  ${isLoading || selectedCharacterIds.length === 0 || !topic.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg'}
                `}
              >
                {isLoading ? "Setting up..." : "Start Roundtable"}
              </button>
            </div>
          </form>
        </ScrollWrap>
      </ScrollBackground>

      <Footer />
      
      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        limitType="roundtable" 
        featureName="Roundtables" 
      />
    </>
  );
};

export default RoundtableSetupScroll;
