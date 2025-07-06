import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../../services/supabase';
import ScriptureReference from './ScriptureReference';

interface CharacterInsightsPanelProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: '0%', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.5, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const CharacterInsightsPanel: React.FC<CharacterInsightsPanelProps> = ({
  character,
  isOpen,
  onClose,
}) => {
  if (!character) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 shadow-2xl z-50 overflow-y-auto p-6"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-yellow-300 transition-colors"
              aria-label="Close insights panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Character Header */}
            <div className="text-center mb-8 pt-4">
              <img
                src={
                  character.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    character.name,
                  )}&background=random`
                }
                alt={character.name}
                className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-yellow-300 shadow-lg"
              />
              <h2
                className="text-3xl font-extrabold text-white mb-2"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                {character.name}
              </h2>
              <p className="text-blue-100 text-lg">{character.description}</p>
            </div>

            {/* Insights Sections */}
            <div className="space-y-8">
              {/* Historical Context */}
              <section className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">
                  Historical Context
                </h3>
                <p className="text-blue-100 text-sm mb-2">
                  <span className="font-semibold">Time Period:</span>{' '}
                  {character.timeline_period || 'Unknown'}
                </p>
                <p className="text-blue-100 text-sm mb-2">
                  <span className="font-semibold">Location:</span>{' '}
                  {character.geographic_location || 'Unknown'}
                </p>
                <p className="text-blue-100 text-sm">
                  {character.historical_context || 'No historical context available.'}
                </p>
              </section>

              {/* Biblical References */}
              <section className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">
                  Key Scripture References
                </h3>
                {character.key_scripture_references ? (
                  <div className="text-blue-100 text-sm space-y-1">
                    {character.key_scripture_references
                      .split(';')
                      .map((ref, index) => (
                        <div key={index}>
                          <ScriptureReference reference={ref.trim()} className="text-blue-200 hover:text-yellow-300" />
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-blue-100 text-sm">No key scripture references available.</p>
                )}
              </section>

              {/* Relationships */}
              <section className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">
                  Relationships
                </h3>
                {character.relationships &&
                Object.keys(character.relationships).length > 0 ? (
                  <ul className="text-blue-100 text-sm space-y-1">
                    {Object.entries(character.relationships).map(
                      ([type, names]) => (
                        <li key={type}>
                          <span className="font-semibold capitalize">
                            {type}:
                          </span>{' '}
                          {names.join(', ')}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-blue-100 text-sm">No relationship data available.</p>
                )}
              </section>

              {/* Theological Significance */}
              <section className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">
                  Theological Significance
                </h3>
                <p className="text-blue-100 text-sm">
                  {character.theological_significance ||
                    'No theological significance provided.'}
                </p>
              </section>

              {/* Study Questions */}
              <section className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">
                  Study Questions
                </h3>
                {character.study_questions ? (
                  <ul className="text-blue-100 text-sm list-disc list-inside space-y-1">
                    {character.study_questions.split('\n').map((q, index) => (
                      <li key={index}>{q.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-100 text-sm">No study questions available.</p>
                )}
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CharacterInsightsPanel;
