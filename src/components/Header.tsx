import React, { useState } from 'react';
import {
  Radio,
  Tv,
  Settings,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  WifiOff,
  Plus,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { BroadcastState } from '../types/broadcast';

interface HeaderProps {
  state: BroadcastState | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectedClients: number;
  lastPingMs: number;
  onHideAll: () => void;
  onOpenSettings: () => void;
  onOpenAddPerson: () => void;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  isConnected,
  isConnecting,
  connectedClients,
  lastPingMs,
  onHideAll,
  onOpenSettings,
  onOpenAddPerson,
  isCompactMode,
  onToggleCompactMode,
}) => {
  const [copied, setCopied] = useState(false);

  const active = state?.activeLowerThird;
  const isLive = Boolean(active?.visible && active?.person);
  const activePersonName = active?.person?.name || '';

  const overlayUrl = `${window.location.origin}/overlay`;

  const handleCopyOverlayUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-slate-900/90 border-b border-purple-900/30 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xl transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Program Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 shadow-md shadow-purple-950/60 ring-1 ring-purple-400/40">
            <Tv className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                OBS LOWER THIRD
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-500/30">
                  DOCK PRO
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px] md:max-w-none">
              {state?.settings.programTitle || 'Live Studio Broadcast Control'}
            </p>
          </div>

          {/* On-Air Live Tally Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wider transition-all shadow-sm ${
              isLive
                ? 'bg-red-600/90 text-white shadow-red-900/60 animate-pulse border border-red-400/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-spin' : ''}`} />
            <span>{isLive ? 'LIVE' : 'STANDBY'}</span>
            {isLive && activePersonName && (
              <span className="hidden md:inline font-semibold text-red-100 max-w-[140px] truncate border-l border-red-400/40 pl-1.5">
                {activePersonName}
              </span>
            )}
          </div>
        </div>

        {/* Center: OBS Overlay Quick Copy & External Preview */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">OBS Overlay URL:</span>
          <code className="text-purple-300 font-mono text-[11px] max-w-[170px] truncate select-all">
            {overlayUrl}
          </code>
          <button
            onClick={handleCopyOverlayUrl}
            title="คัดลอก URL สำหรับใส่ใน OBS Browser Source"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white transition text-[11px] font-medium border border-purple-500/30"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'คัดลอกแล้ว!' : 'Copy'}</span>
          </button>
          <a
            href="/overlay"
            target="_blank"
            rel="noreferrer"
            title="เปิดหน้า Overlay ในแท็บใหม่เพื่อทดสอบ"
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Right: WebSocket Connection, Hide All, Add Person & Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* WebSocket Status Indicator */}
          <div
            title={`WebSocket: ${isConnected ? 'Connected' : 'Disconnected'} | Connected Clients: ${connectedClients} | Ping: ${lastPingMs}ms`}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border ${
              isConnected
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                : isConnecting
                ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                : 'bg-red-950/50 text-red-400 border-red-800/60'
            }`}
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
                <span className="hidden sm:inline">SYNC</span>
                <span className="text-[10px] text-emerald-400/70">({connectedClients})</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
                <span className="hidden sm:inline">OFFLINE</span>
              </>
            )}
          </div>

          {/* Quick Add Person Button */}
          <button
            onClick={onOpenAddPerson}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/40 transition active:scale-95 cursor-pointer"
            title="เพิ่มรายชื่อบุคคลใหม่"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เพิ่มบุคคล</span>
          </button>

          {/* Emergency Hide All Button */}
          <button
            onClick={onHideAll}
            disabled={!isLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 shadow-md cursor-pointer ${
              isLive
                ? 'bg-slate-700 hover:bg-red-700 text-white shadow-red-950/50 border border-slate-500'
                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
            title="ซ่อนป้ายชื่อทั้งหมดบน OBS ทันที (Hide All)"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>HIDE ALL</span>
          </button>

          {/* Compact View Toggle (for OBS Browser Dock) */}
          <button
            onClick={onToggleCompactMode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title={isCompactMode ? 'ขยายเป็นโหมดเต็มจอ' : 'ย่อเป็นโหมด OBS Dock กะทัดรัด'}
          >
            {isCompactMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="ตั้งค่าระบบ และวิธีเชื่อมต่อ OBS"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
