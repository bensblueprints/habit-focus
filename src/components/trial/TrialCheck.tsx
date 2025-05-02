import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface TrialData {
  startDate: string;
  isActive: boolean;
  daysRemaining: number;
  hasRegistered: boolean;
}

interface TrialCheckProps {
  children: React.ReactNode;
}

const TrialCheck: React.FC<TrialCheckProps> = ({ children }) => {
  const [trialActive, setTrialActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkTrialStatus = async () => {
      // If in Chrome extension environment
      if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
        window.chrome.runtime.sendMessage({ action: 'checkTrialStatus' }, (response: TrialData | undefined) => {
          if (response) {
            // Trial is active if there are days remaining or the user has registered
            setTrialActive(response.daysRemaining > 0 || response.hasRegistered);
          } else {
            // If unable to get trial status, default to inactive
            setTrialActive(false);
          }
          setLoading(false);
        });
      } else {
        // In development environment, always active
        setTrialActive(true);
        setLoading(false);
      }
    };

    checkTrialStatus();
  }, []);

  if (loading) {
    // Loading indicator while checking trial status
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  // If trial is active, render children; otherwise, redirect to registration
  return trialActive ? (
    <>{children}</>
  ) : (
    <Navigate 
      to="/register" 
      state={{ from: location }} 
      replace 
    />
  );
};

export default TrialCheck; 