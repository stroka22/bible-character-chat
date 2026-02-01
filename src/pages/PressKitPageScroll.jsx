import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const PressKitPageScroll = () => {
  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Press Kit
            </h1>
            <p className="text-amber-700 text-lg">Media resources and company information</p>
          </div>

          <ScrollDivider />

          {/* About Section */}
          <section className="mt-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>About FaithTalkAI</h2>
            <div className="bg-white/80 rounded-xl border border-amber-200 p-6">
              <p className="text-amber-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                FaithTalkAI is an innovative platform that brings Biblical characters to life through AI-powered conversations. 
                Our mission is to make Scripture more accessible and engaging by allowing users to have meaningful dialogues 
                with figures from the Bible.
              </p>
              <p className="text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>
                Founded in 2024, FaithTalkAI combines cutting-edge artificial intelligence with deep respect for Biblical 
                scholarship and historical accuracy. Our platform serves individuals, churches, and educational institutions 
                seeking innovative ways to explore faith.
              </p>
            </div>
          </section>

          {/* Key Facts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Key Facts</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Characters', value: '30+ Biblical Figures' },
                { label: 'Bible Studies', value: '90+ Guided Studies' },
                { label: 'Reading Plans', value: '140+ Curated Plans' },
                { label: 'Translations', value: '9 Bible Versions' },
              ].map((fact, i) => (
                <div key={i} className="bg-white/80 rounded-xl border border-amber-200 p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">{fact.value}</div>
                  <div className="text-amber-700 text-sm">{fact.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Core Features</h2>
            <div className="bg-white/80 rounded-xl border border-amber-200 p-6">
              <ul className="space-y-3 text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Character Conversations:</strong> One-on-one chats with AI-powered Biblical characters</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Roundtable Discussions:</strong> Multi-character discussions on faith topics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Guided Bible Studies:</strong> Character-narrated Scripture exploration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Reading Plans:</strong> Structured daily Scripture reading</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact for Press */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Media Contact</h2>
            <div className="bg-amber-100/50 rounded-xl border border-amber-200 p-6 text-center">
              <p className="text-amber-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                For press inquiries, interviews, or media assets, please contact:
              </p>
              <a href="mailto:press@faithtalkai.com" className="text-amber-600 hover:text-amber-800 font-medium text-lg">
                press@faithtalkai.com
              </a>
            </div>
          </section>

          {/* Brand Guidelines */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Brand Guidelines</h2>
            <div className="bg-white/80 rounded-xl border border-amber-200 p-6">
              <p className="text-amber-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                When referencing FaithTalkAI in publications, please use the following guidelines:
              </p>
              <ul className="space-y-2 text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>
                <li>• Company name: <strong>FaithTalkAI</strong> (one word, camelCase)</li>
                <li>• Website: faithtalkai.com</li>
                <li>• Tagline: "Bringing Biblical wisdom to life through AI"</li>
              </ul>
            </div>
          </section>

          <div className="mt-10 text-center">
            <Link to="/contact/preview" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Contact Us</Link>
          </div>

          <div className="mt-8 text-center">
            <Link to="/preview" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default PressKitPageScroll;
