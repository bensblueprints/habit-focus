import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface TrialData {
  startDate: string;
  isActive: boolean;
  daysRemaining: number;
  hasRegistered: boolean;
}

interface ChromeResponse {
  success?: boolean;
}

// Add Chrome namespace declaration for TypeScript
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage?: (
          message: any,
          callback?: (response?: any) => void
        ) => void;
      };
    };
  }
}

const TrialBanner: React.FC = () => {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if we're running in a Chrome extension environment
    if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
      window.chrome.runtime.sendMessage({ action: 'checkTrialStatus' }, (response: TrialData | undefined) => {
        if (response) {
          setTrialData(response);
        }
      });
    } else {
      // Mock data for development environment
      setTrialData({
        startDate: new Date().toISOString(),
        isActive: true,
        daysRemaining: 7,
        hasRegistered: false
      });
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsRegistering(true);
    setError('');

    // Check if we're running in a Chrome extension environment
    if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
      window.chrome.runtime.sendMessage({ 
        action: 'register',
        email: email 
      }, (response: ChromeResponse | undefined) => {
        setIsRegistering(false);
        if (response && response.success) {
          setSuccess('Registration successful! Enjoy the full version.');
          setTrialData(prev => prev ? { ...prev, hasRegistered: true } : null);
          setTimeout(() => {
            setIsVisible(false);
          }, 3000);
        } else {
          setError('Registration failed. Please try again.');
        }
      });
    } else {
      // Mock successful registration in development environment
      setTimeout(() => {
        setIsRegistering(false);
        setSuccess('Registration successful! Enjoy the full version.');
        setTrialData(prev => prev ? { ...prev, hasRegistered: true } : null);
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }, 1000);
    }
  };

  if (!trialData || !isVisible || trialData.hasRegistered) {
    return null;
  }

  if (trialData.daysRemaining <= 0 && !trialData.hasRegistered) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-500 p-4 text-white shadow-lg">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span className="font-medium">Your free trial has ended. Please register to continue using the app.</span>
          </div>
          
          <form onSubmit={handleRegister} className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="rounded border border-red-400 bg-red-100 px-3 py-1 text-black"
              required
            />
            <button
              type="submit"
              disabled={isRegistering}
              className="rounded bg-white px-4 py-1 font-medium text-red-500 hover:bg-red-50"
            >
              {isRegistering ? 'Registering...' : 'Register Now'}
            </button>
          </form>
          
          {error && <p className="text-sm text-red-200">{error}</p>}
          {success && <p className="text-sm text-green-200">{success}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 p-2 text-white shadow-lg">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          <span className="font-medium">
            {trialData.daysRemaining === 1 
              ? 'Last day of your free trial!' 
              : `${trialData.daysRemaining} days left in your free trial.`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVisible(false)}
            className="rounded bg-white px-2 py-1 text-xs font-medium text-amber-500 hover:bg-amber-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner; 