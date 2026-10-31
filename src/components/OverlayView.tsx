import React, { useEffect, useState } from 'react';
import { useBroadcastSocket } from '../hooks/useBroadcastSocket';
import { LowerThirdGraphic } from './LowerThirdGraphic';
import { Radio, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const OverlayView: React.FC = () => {
  const { state, isConnected, showLowerThird } = useBroadcastSocket();
  const [isTestPreviewActive, setIsTestPreviewActive] = useState(false);

  // Detect whether running inside OBS Studio Browser Source
  const isInsideOBS = typeof navigator !== 'undefined' && (
    navigator.userAgent.includes('OBS/') ||
    window.location.search.includes('obs=1')
  );

  // Enforce transparent background on root html/body for OBS Browser Source
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      document.body.style.overflow = '';
    };
  }, []);

  const activeLowerThird = state?.activeLowerThird || {
    person: null,
    visible: false,
    timestamp: 0,
  };
  const settings = state?.settings;
  const isLive = activeLowerThird.visible && Boolean(activeLowerThird.person);

  // Test trigger
  const handleTriggerTest = () => {
    if (state?.people && state.people.length > 0) {
      showLowerThird(state.people[0].id);
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-transparent select-none"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Lower Third on-air graphic */}
      {settings && (
        <LowerThirdGraphic
          person={activeLowerThird.person}
          settings={settings}
          visible={isLive}
          isLive={true}
        />
      )}

      {/* When running inside regular browser outside OBS and nothing is LIVE:
          Display a helpful standby banner so user doesn't see a completely blank black screen! */}
      {!isLive && !isInsideOBS && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm pointer-events-auto">
          <div className="max-w-lg w-full bg-slate-900 border border-purple-900/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-300">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-purple-950 border border-purple-800 text-purple-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>OBS BROWSER SOURCE OVERLAY (STANDBY)</span>
              </div>
              <h2 className="text-lg font-black text-white">หน้าจอแสดงผลป้ายชื่อ (OBS Overlay)</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                หน้านี้คือหน้าสำหรับใส่ใน <strong className="text-purple-300">OBS Browser Source</strong> (พื้นหลังโปร่งใส 100%)
                ขณะนี้อยู่ในโหมดสแตนด์บาย ยังไม่มีป้ายชื่อขึ้นจอสด
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>WebSocket เชื่อมต่อสำเร็จ: {isConnected ? 'ออนไลน์พร้อมรับคำสั่ง' : 'กำลังเชื่อมต่อ...'}</span>
              </div>
              <p className="text-slate-400 text-[11px] pl-6">
                เปิดหน้าต่าง Control Panel แล้วคลิกปุ่ม <strong className="text-emerald-400">PLAY</strong> ป้ายชื่อจะแสดงที่หน้านี้แบบ Real-time ทันที
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleTriggerTest}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ทดสอบกด PLAY (สด)</span>
              </button>

              <a
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950 transition active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดหน้า Control Panel</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Subtle connection warning indicator if offline */}
      {!isConnected && (
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/80 text-[10px] font-mono text-red-400 border border-red-500/40 z-50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>OBS OVERLAY RECONNECTING...</span>
        </div>
      )}
    </div>
  );
};
