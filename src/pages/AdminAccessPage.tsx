import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set the bypass_auth flag in localStorage
    localStorage.setItem('bypass_auth', 'true');
    console.log('bypass_auth set to true in localStorage. Redirecting to admin page...');

    // Redirect to the admin page
    navigate('/admin');
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 text-white">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20 text-center">
        <h1 className="text-3xl font-bold mb-4">Accessing Admin Panel...</h1>
        <p className="text-lg mb-6">
          Setting authentication bypass for testing purposes.
        </p>
        <p className="text-sm text-blue-100">
          You will be redirected to the admin page shortly.
        </p>
        <div className="mt-8">
          <div className="relative h-16 w-16 mx-auto animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessPage;
