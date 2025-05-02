import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleCalendarCallback, CalendarProvider } from '../utils/calendarSync';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const CalendarCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your request...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        
        // Get provider from the state parameter or pathname
        // In a real app, you might store this information in localStorage or the state
        const provider = 'google' as CalendarProvider; // Default to Google for now
        
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }
        
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing required parameters');
          return;
        }
        
        // Process the OAuth callback
        const result = await handleCalendarCallback(code, state, provider);
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          
          // Redirect to user dashboard after 3 seconds
          setTimeout(() => {
            navigate('/user-dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        console.error('Error processing callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };
    
    processCallback();
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <Loader className="h-12 w-12 animate-spin text-primary-500" />
          )}
          
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
          
          {status === 'error' && (
            <AlertTriangle className="h-12 w-12 text-red-500" />
          )}
          
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            {status === 'loading' && 'Connecting Calendar'}
            {status === 'success' && 'Calendar Connected'}
            {status === 'error' && 'Connection Failed'}
          </h1>
          
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {message}
          </p>
          
          {status === 'success' && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              Redirecting to dashboard...
            </p>
          )}
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/user-dashboard')}
              className="mt-6 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-800"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarCallback; 