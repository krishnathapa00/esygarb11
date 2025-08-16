import React from 'react';

const ClearCache = () => {
  // Force reload to clear cached components
  React.useEffect(() => {
    // Clear localStorage to remove any cached auth states
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('esygrab') || key.includes('auth') || key.includes('session')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('Cache cleared - redirecting to login');
    // Use window.location to force a complete reload
    window.location.href = '/auth';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Clearing cache and redirecting...</p>
      </div>
    </div>
  );
};

export default ClearCache;