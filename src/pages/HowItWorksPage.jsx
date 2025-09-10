import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* ------------------------------------------------------------------
         * Hero – Getting Started
         * ------------------------------------------------------------------ */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-3">
              Getting Started
            </h1>
            <p className="text-blue-100 mb-6">
              Pick a character, ask your questions, and save your journey
              in&nbsp;
              <span className="text-yellow-300 font-semibold">My&nbsp;Walk</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors text-center"
              >
                Start a Conversation
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors text-center"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-8">How It Works</h1>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <p className="text-blue-100 text-lg mb-8">
              FaithTalkAI allows you to engage in meaningful conversations with biblical characters through the power of AI. 
              Our platform brings scripture to life in a new, interactive way.
            </p>
            
            <div className="space-y-12 mb-8">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center text-2xl font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">Choose a Character</h3>
                  <p className="text-blue-100">
                    Select from a diverse range of biblical figures including Moses, David, Esther, Mary, Paul, and many others. 
                    Each character's responses are based on their biblical context, personality, and teachings.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center text-2xl font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">Ask Questions</h3>
                  <p className="text-blue-100">
                    Engage in a conversation by asking questions about faith, biblical events, or seeking wisdom. 
                    The characters respond based on their biblical knowledge and perspective, helping you explore 
                    scripture in a personal and interactive way.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center text-2xl font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">Save & Continue Your Journey</h3>
                  <p className="text-blue-100">
                    Save your conversations to revisit later, mark characters as favorites, and continue your 
                    spiritual exploration at your own pace. Your faith journey is saved in "My Walk" where you 
                    can easily access all your saved conversations and favorite characters.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Note */}
          {/* ------------------------------------------------------------------
           * User Features
           * ------------------------------------------------------------------ */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-6">
              User Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Character Conversations */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-300">
                    Character Conversations
                  </h3>
                  <p className="text-blue-100 text-sm">
                    One-on-one dialogue with biblical figures grounded in Scripture.
                  </p>
                </div>
              </div>

              {/* Roundtable Discussions */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-300">
                    Roundtable Discussions
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Multi-character conversations that explore a topic from several perspectives.
                  </p>
                </div>
              </div>

              {/* Guided Bible Studies */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-300">
                    Guided Bible Studies
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Structured studies enhanced with character insights and lesson outlines.
                  </p>
                </div>
              </div>

              {/* Conversation Sharing */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-300">
                    Conversation Sharing
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Share conversations with others via unique links for group reflection.
                  </p>
                </div>
              </div>

              {/* Favorites & History */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-300">
                    Favorites &amp; History
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Save favorites and revisit previous conversations anytime.
                  </p>
                </div>
              </div>

              {/* Scripture References */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-300">
                    Scripture References
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Each response includes biblical references for deeper study.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Note */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">About Our AI</h2>
            <p className="text-blue-100 mb-4">
              While our AI strives to accurately represent biblical characters based on scripture and historical context, 
              please note that these are AI-generated conversations and not direct biblical teachings. 
            </p>
            <p className="text-blue-100">
              We've worked diligently to ensure responses align with biblical accounts and theology, but these conversations 
              are meant to supplement, not replace, scripture study or pastoral guidance. Always refer to the Bible as the 
              authoritative source of truth.
            </p>
          </div>
          
          {/* CTA Section */}
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-6">Ready to Start Your Journey?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors"
              >
                Sign Up Now
              </Link>
              <Link 
                to="/" 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
              >
                Browse Characters
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
