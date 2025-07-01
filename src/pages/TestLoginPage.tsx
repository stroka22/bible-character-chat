import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

/**
 * TestLoginPage provides quick access options for testing the application
 * with different user roles or bypassing authentication entirely.
 */
const TestLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  
  // State for admin login
  const [adminEmail] = useState('admin@example.com');
  const [adminPassword] = useState('adminpassword');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  
  // State for regular user login
  const [userEmail] = useState('test@example.com');
  const [userPassword] = useState('password123');
  const [isUserLoading, setIsUserLoading] = useState(false);
  
  // State for error and success messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle bypass authentication
  const handleBypassAuth = () => {
    localStorage.setItem('bypass_auth', 'true');
    window.location.reload(); // Reload to apply bypass
  };

  // Handle admin login
  const handleAdminLogin = async () => {
    setIsAdminLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await signIn(adminEmail, adminPassword);
      setSuccess('Admin login successful!');
      navigate('/admin'); // Redirect to admin page
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login as admin');
    } finally {
      setIsAdminLoading(false);
    }
  };

  // Handle regular user login
  const handleUserLogin = async () => {
    setIsUserLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await signIn(userEmail, userPassword);
      setSuccess('User login successful!');
      navigate('/'); // Redirect to home page
    } catch (err) {
      console.error('User login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login as user');
    } finally {
      setIsUserLoading(false);
    }
  };

  // Create test user function
  const createTestUser = async (email: string, password: string) => {
    setError(null);
    setSuccess(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setSuccess(`User created! ID: ${data.user.id}. You can now try to sign in.`);
      }
    } catch (err: any) {
      if (err.message?.includes('User already registered')) {
        setSuccess('This email is already registered. Try signing in instead.');
      } else {
        setError(`Failed to create user: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // If user is already logged in, show a different message
  if (user) {
    return (
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-2 text-lg font-medium text-gray-900">Already logged in</h2>
              <p className="mt-1 text-sm text-gray-500">
                You are already logged in as {user.email}.
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Test Login Page
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Quick access options for testing the application
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {success}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Bypass Authentication Button - MOST PROMINENT */}
          <div className="mb-8">
            <button
              onClick={handleBypassAuth}
              className="w-full bg-yellow-500 text-white py-4 px-4 rounded-md font-bold text-lg shadow-lg hover:bg-yellow-600 transition-colors"
            >
              BYPASS AUTHENTICATION (TESTING ONLY)
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              This will enable bypass mode and reload the page
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or login as</span>
            </div>
          </div>

          {/* Admin Login Section */}
          <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-2">Admin User</h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="text-gray-500">Email:</div>
              <div className="font-mono">{adminEmail}</div>
              <div className="text-gray-500">Password:</div>
              <div className="font-mono">{adminPassword}</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAdminLogin}
                disabled={isAdminLoading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300"
              >
                {isAdminLoading ? 'Signing in...' : 'Sign in as Admin'}
              </button>
              <button
                onClick={() => createTestUser(adminEmail, adminPassword)}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Create Admin
              </button>
            </div>
          </div>

          {/* Regular User Login Section */}
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-2">Regular User</h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="text-gray-500">Email:</div>
              <div className="font-mono">{userEmail}</div>
              <div className="text-gray-500">Password:</div>
              <div className="font-mono">{userPassword}</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleUserLogin}
                disabled={isUserLoading}
                className="flex-1 bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:bg-secondary-300"
              >
                {isUserLoading ? 'Signing in...' : 'Sign in as User'}
              </button>
              <button
                onClick={() => createTestUser(userEmail, userPassword)}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Create User
              </button>
            </div>
          </div>

          {/* Back to main app link */}
          <div className="mt-6 text-center">
            <Link to="/" className="font-medium text-primary-600 hover:text-primary-500">
              Go back to main app
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLoginPage;
