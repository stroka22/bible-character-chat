import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const AboutPageScroll = () => {
  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              About FaithTalkAI
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Bringing ancient wisdom to modern seekers through the power of AI
            </p>
          </div>

          <ScrollDivider />

          {/* Our Mission */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Our Mission</h2>
            <p className="text-amber-800 leading-relaxed mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              FaithTalkAI was created with a simple yet profound mission: to help people connect with the timeless wisdom of the Bible in a new and engaging way. We believe that the stories, lessons, and characters of Scripture have transformative power that is just as relevant today as it was thousands of years ago.
            </p>
            <p className="text-amber-800 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              By using advanced AI technology, we've created a unique platform where you can have meaningful conversations with biblical characters, explore Scripture through guided studies, and engage in roundtable discussions on faith topics that matter to you.
            </p>
          </section>

          {/* How It Works */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/80 rounded-xl border border-amber-200 p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-bold text-amber-900 mb-2">Character Chat</h3>
                <p className="text-amber-700 text-sm">Have one-on-one conversations with over 30 biblical characters</p>
              </div>
              <div className="bg-white/80 rounded-xl border border-amber-200 p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-amber-900 mb-2">Roundtable</h3>
                <p className="text-amber-700 text-sm">Discuss topics with multiple characters sharing their perspectives</p>
              </div>
              <div className="bg-white/80 rounded-xl border border-amber-200 p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <h3 className="font-bold text-amber-900 mb-2">Bible Studies</h3>
                <p className="text-amber-700 text-sm">Guided studies with character narrators taking you through Scripture</p>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Our Values</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Biblical Accuracy</h3>
                  <p className="text-amber-700 text-sm">Our AI responses are grounded in Scripture and historical context</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Accessibility</h3>
                  <p className="text-amber-700 text-sm">Making Bible study engaging for everyone, regardless of background</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Privacy</h3>
                  <p className="text-amber-700 text-sm">Your spiritual journey is personal - we protect your conversations</p>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-amber-100/50 rounded-xl border border-amber-200 p-6 mb-10">
            <h3 className="font-bold text-amber-900 mb-2">Important Note</h3>
            <p className="text-amber-700 text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
              FaithTalkAI is designed for educational and devotional purposes. While our AI strives for biblical accuracy, it should not replace personal Bible study, pastoral counsel, or church community. Always verify AI responses against Scripture.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Ready to Begin?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/chat/preview" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors">
                Start Chatting
              </Link>
              <Link to="/preview" className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg transition-colors border border-amber-300">
                Back to Home
              </Link>
            </div>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default AboutPageScroll;
