import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-8">Careers at FaithTalkAI</h1>
          
          {/* Main Content */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Join Our Mission</h2>
            <p className="text-blue-100 mb-4">
              At FaithTalkAI, we're bringing scripture to life through innovative AI technology. While we don't have any open positions at the moment, we're always interested in connecting with talented individuals who are passionate about faith and technology.
            </p>
            <p className="text-blue-100 mb-6">
              If you're interested in future opportunities, please send your resume and a brief introduction to <a href="mailto:careers@faithtalkai.com" className="text-yellow-300 hover:text-yellow-200">careers@faithtalkai.com</a>. We'll keep your information on file and reach out when positions that match your skills become available.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/contact" 
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg font-semibold transition-colors text-center"
              >
                Contact Us
              </Link>
              <Link 
                to="/press-kit" 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors text-center"
              >
                View Press Kit
              </Link>
            </div>
          </div>
          
          {/* Values Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Our Values</h2>
            <p className="text-blue-100 mb-4">
              We're looking for team members who share our commitment to:
            </p>
            <ul className="text-blue-100 space-y-3">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Biblical Fidelity:</strong> Representing scripture accurately and respectfully</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Innovation:</strong> Using technology to make faith more accessible</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Excellence:</strong> Pursuing the highest quality in everything we do</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong className="text-yellow-200">Community:</strong> Building meaningful connections through our platform</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CareersPage;
