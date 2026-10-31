import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { OverlayView } from './components/OverlayView';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // OBS Overlay route
  if (currentPath.startsWith('/overlay')) {
    return <OverlayView />;
  }

  // Main OBS Control Panel / Browser Dock
  return <ControlPanel />;
}
