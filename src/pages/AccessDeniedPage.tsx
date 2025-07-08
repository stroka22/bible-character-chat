import React from 'react';
import { Link } from 'react-router-dom';

const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg 
                className="h-6 w-6 text-red-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            
            <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto mb-6">
              You don't have permission to access this page. This area is restricted to administrators and pastors.
            </p>
            
            <div className="space-y-4">
              <Link
                to="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Return to Home Page
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Need Access?
                </h3>
                <p className="text-xs text-gray-500">
                  If you are a pastor or administrator who needs access to this area, please contact your system administrator or email <a href="mailto:support@biblechat.org" className="text-primary-600 hover:text-primary-500">support@biblechat.org</a> with your request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
