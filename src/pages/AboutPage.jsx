import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-8">About FaithTalkAI</h1>
          
          {/* Mission Statement */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Our Mission</h2>
            <p className="text-blue-100 text-lg mb-4">
              FaithTalkAI exists to bring scripture to life through meaningful conversations with biblical characters, 
              helping believers and seekers alike deepen their understanding of God's Word in a personal and engaging way.
            </p>
            <p className="text-blue-100">
              We believe that by making biblical figures accessible through modern technology, we can help bridge the gap 
              between ancient scripture and contemporary faith journeys, making the wisdom of the Bible more relatable 
              and applicable to everyday life.
            </p>
          </div>
          
          {/* Our Story */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Our Story</h2>
            <p className="text-blue-100 mb-4">
              FaithTalkAI began with a simple question: "What if we could talk to biblical characters and learn from their experiences directly?"
            </p>
            <p className="text-blue-100 mb-4">
              Founded by a team of believers passionate about both faith and technology, we set out to create a platform 
              that would make scripture more accessible and engaging. We recognized that while the Bible contains timeless 
              wisdom, many people struggle to connect with its characters and stories across the cultural and historical distance.
            </p>
            <p className="text-blue-100">
              By combining advanced AI with careful theological research, we've created conversations that remain faithful 
              to biblical accounts while bringing these figures to life in a new way. Our team works closely with biblical 
              scholars to ensure that all character responses are grounded in scripture and historical context.
            </p>
          </div>
          
          {/* Values */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Our Values</h2>
            <ul className="text-blue-100 space-y-3">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Biblical Fidelity:</strong> We are committed to representing biblical characters and teachings accurately.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Accessibility:</strong> We strive to make biblical wisdom accessible to everyone, regardless of their background.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Innovation:</strong> We thoughtfully apply new technology to enhance spiritual growth and biblical understanding.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Community:</strong> We believe faith flourishes in community and aim to foster meaningful connections.</span>
              </li>
            </ul>
          </div>
          
          {/* Contact CTA */}
          <div className="text-center py-6">
            <p className="text-blue-100 mb-4">
              Have questions or want to learn more about our mission? We'd love to hear from you.
            </p>
            <Link 
              to="/contact" 
              className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
