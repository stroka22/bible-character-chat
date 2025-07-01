import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Copyright and app info */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Bible Characters Chat. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness."
              <span className="italic ml-1">- 2 Timothy 3:16</span>
            </p>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <Link to="/about" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
