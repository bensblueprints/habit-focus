import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';

interface TrialData {
  startDate: string;
  isActive: boolean;
  daysRemaining: number;
  hasRegistered: boolean;
}

const Registration: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check trial status on component mount
    if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
      window.chrome.runtime.sendMessage({ action: 'checkTrialStatus' }, (response: TrialData | undefined) => {
        if (response) {
          setTrialData(response);
          
          // If already registered, redirect to dashboard
          if (response.hasRegistered) {
            navigate('/');
          }
        }
      });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsRegistering(true);
    setError('');

    // Register user in Chrome extension
    if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
      window.chrome.runtime.sendMessage({ 
        action: 'register',
        email: email,
        name: name 
      }, (response) => {
        setIsRegistering(false);
        if (response && response.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError('Registration failed. Please try again.');
        }
      });
    } else {
      // Mock successful registration in development environment
      setTimeout(() => {
        setIsRegistering(false);
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Register for Full Access
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {trialData && trialData.daysRemaining <= 0 
              ? 'Your free trial has ended. Register now for unlimited access.'
              : 'Register now to continue using Habit Focus after your trial.'}
          </p>
        </div>
        
        {success ? (
          <div className="mt-8 rounded-md bg-green-50 p-6 text-center dark:bg-green-900/20">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 dark:text-green-400" />
            <h2 className="mt-4 text-xl font-medium text-green-800 dark:text-green-300">
              Registration Successful!
            </h2>
            <p className="mt-2 text-green-700 dark:text-green-400">
              Thank you for registering. You now have full access to all features.
            </p>
            <p className="mt-4 text-sm text-green-600 dark:text-green-500">
              Redirecting to the dashboard...
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
            
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                    placeholder="Your name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-primary-500 sm:text-sm sm:leading-6"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isRegistering}
                className="group relative flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-400"
              >
                {isRegistering ? 'Registering...' : 'Register Now'}
              </button>
            </div>
            
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Registration; 