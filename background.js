// Initialize the extension
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Set up initial trial data
    const trialData = {
      startDate: new Date().toISOString(),
      isActive: true,
      daysRemaining: 7,
      hasRegistered: false
    };
    
    // Store trial data
    chrome.storage.local.set({ trialData }, () => {
      console.log('Trial period started:', trialData);
    });
    
    // Set up a daily alarm to check trial status
    chrome.alarms.create('checkTrialStatus', {
      delayInMinutes: 60 * 24, // Check once every 24 hours
      periodInMinutes: 60 * 24
    });
    
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Welcome to Habit Focus!',
      message: 'Your 7-day free trial has started. Enjoy building better habits!',
      priority: 2
    });
  }
});

// Check trial status daily
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkTrialStatus') {
    chrome.storage.local.get('trialData', ({ trialData }) => {
      if (!trialData) return;
      
      // Calculate days elapsed
      const startDate = new Date(trialData.startDate);
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Update days remaining
      const daysRemaining = Math.max(0, 7 - daysDifference);
      
      // Update trial status
      const isActive = daysRemaining > 0 || trialData.hasRegistered;
      
      const updatedTrialData = {
        ...trialData,
        daysRemaining,
        isActive
      };
      
      chrome.storage.local.set({ trialData: updatedTrialData }, () => {
        console.log('Trial status updated:', updatedTrialData);
      });
      
      // Show notification if trial is ending soon and user hasn't registered
      if (daysRemaining <= 2 && daysRemaining > 0 && !trialData.hasRegistered) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Trial Ending Soon',
          message: `You have ${daysRemaining} days left in your free trial. Register now to continue using Habit Focus!`,
          priority: 2
        });
      }
      
      // Show notification if trial has ended
      if (daysRemaining === 0 && !trialData.hasRegistered) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Trial Ended',
          message: 'Your free trial has ended. Please register to continue using Habit Focus.',
          priority: 2
        });
      }
    });
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkTrialStatus') {
    chrome.storage.local.get('trialData', (data) => {
      sendResponse(data.trialData || { isActive: false, daysRemaining: 0 });
    });
    return true; // Required for async response
  }
  
  if (message.action === 'register') {
    chrome.storage.local.get('trialData', ({ trialData }) => {
      const updatedTrialData = {
        ...trialData,
        hasRegistered: true,
        isActive: true
      };
      
      chrome.storage.local.set({ trialData: updatedTrialData }, () => {
        console.log('User registered successfully');
        sendResponse({ success: true });
      });
    });
    return true; // Required for async response
  }
}); 