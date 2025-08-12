import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
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
