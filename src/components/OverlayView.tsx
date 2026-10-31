import React, { useEffect } from 'react';
import { useBroadcastSocket } from '../hooks/useBroadcastSocket';
import { LowerThirdGraphic } from './LowerThirdGraphic';

export const OverlayView: React.FC = () => {
  const { state, isConnected } = useBroadcastSocket();

  // Enforce transparent background on root html/body for OBS Browser Source
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      document.body.style.overflow = '';
    };
  }, []);

  if (!state) {
    return <div className="w-screen h-screen bg-transparent pointer-events-none" />;
  }

  const { activeLowerThird, settings } = state;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-transparent pointer-events-none select-none"
      style={{
        backgroundColor: 'transparent',
      }}
    >
      {/* Lower Third on-air graphic */}
      <LowerThirdGraphic
        person={activeLowerThird.person}
        settings={settings}
        visible={activeLowerThird.visible && Boolean(activeLowerThird.person)}
        isLive={true}
      />

      {/* Tiny subtle connection indicator for OBS operator when first configuring source (fades away or top-left) */}
      {!isConnected && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[9px] font-mono text-red-400 border border-red-500/30 z-50">
          ● OBS OVERLAY RECONNECTING...
        </div>
      )}
    </div>
  );
};
