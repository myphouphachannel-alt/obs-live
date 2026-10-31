import React, { useState } from 'react';
import {
  Sliders,
  Tv,
  Eye,
  EyeOff,
  Sparkles,
  Palette,
  Maximize2,
  Clock,
  Layers,
  RotateCcw,
  Check,
  Radio,
} from 'lucide-react';
import {
  BroadcastSettings,
  ActiveLowerThird,
  Person,
  StylePreset,
  FontFamily,
  AnimationType,
  ExitAnimationType,
} from '../types/broadcast';
import { LowerThirdGraphic } from './LowerThirdGraphic';
import { STYLE_PRESETS, FONT_OPTIONS, COLOR_PALETTES } from '../utils/themePresets';

interface ControlSidebarProps {
  settings: BroadcastSettings;
  activeLowerThird: ActiveLowerThird;
  people: Person[];
  onUpdateSettings: (updates: Partial<BroadcastSettings>) => void;
  onHideAll: () => void;
  onPlay: (personId: string) => void;
  onResetSettings: () => void;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  settings,
  activeLowerThird,
  people,
  onUpdateSettings,
  onHideAll,
  onPlay,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'style' | 'animation' | 'position'>('preview');
  const [previewPersonId, setPreviewPersonId] = useState<string>('');

  // Determine person to show in preview monitor:
  // If Lower Third is currently live, preview the live person!
  // If not live, preview the manually selected preview person or the first person in list
  const livePerson = activeLowerThird.visible ? activeLowerThird.person : null;
  const activePreviewPerson =
    livePerson ||
    people.find((p) => p.id === previewPersonId) ||
    people[0] ||
    null;

  const isLive = Boolean(activeLowerThird.visible && livePerson);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/80 shadow-lg overflow-hidden">
      {/* Sidebar Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/90 px-2 pt-2 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-slate-800 text-purple-300 border-t-2 border-purple-500 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>จอ Monitor สด</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer whitespace-nowrap ${
            activeTab === 'style'
              ? 'bg-slate-800 text-purple-300 border-t-2 border-purple-500 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>สไตล์ & สี</span>
        </button>

        <button
          onClick={() => setActiveTab('animation')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer whitespace-nowrap ${
            activeTab === 'animation'
              ? 'bg-slate-800 text-purple-300 border-t-2 border-purple-500 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Animation</span>
        </button>

        <button
          onClick={() => setActiveTab('position')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer whitespace-nowrap ${
            activeTab === 'position'
              ? 'bg-slate-800 text-purple-300 border-t-2 border-purple-500 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>ตำแหน่ง & ขนาด</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* TAB 1: LIVE BROADCAST MONITOR & PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* 16:9 Broadcast Simulator Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isLive ? 'bg-red-500 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                  <span>{isLive ? '🔴 PROGRAM ON-AIR (สด)' : '⚪ PREVIEW MONITOR (ตัวอย่าง)'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">1920x1080 (16:9)</span>
              </div>

              {/* Monitor Frame */}
              <div
                className={`relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl transition-all border-2 ${
                  isLive
                    ? 'border-red-500 ring-2 ring-red-500/40 shadow-red-950/80'
                    : 'border-slate-700 bg-slate-950 shadow-black'
                }`}
                style={{
                  backgroundImage:
                    'radial-gradient(circle at center, #1e1b4b 0%, #09090b 80%)',
                }}
              >
                {/* Simulated studio lighting grid / safe frame */}
                <div className="absolute inset-0 pointer-events-none opacity-20 border border-slate-500/30 m-4 rounded-xs" />
                <div className="absolute inset-0 pointer-events-none opacity-10 border border-slate-500/20 m-8" />

                {/* Simulated Anchor silhouette or camera placeholder */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <div className="w-32 h-32 rounded-full border border-dashed border-white flex items-center justify-center">
                    <span className="text-xs font-mono text-white">CAMERA 1</span>
                  </div>
                </div>

                {/* On-air corner badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white z-20">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLive ? 'bg-red-500' : 'bg-emerald-400'
                    }`}
                  />
                  <span>{isLive ? 'LIVE OBS' : 'PREVIEW'}</span>
                </div>

                {/* Render Lower Third Graphic inside monitor (scaled down to fit 16:9 container) */}
                <div className="absolute inset-0 overflow-hidden">
                  <LowerThirdGraphic
                    person={activePreviewPerson}
                    settings={settings}
                    visible={true}
                    isLive={isLive}
                    scaleOverride={settings.scale * 0.72}
                  />
                </div>
              </div>
            </div>

            {/* Quick Preview Switcher Dropdown */}
            <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">
                เลือกบุคคลเพื่อทดสอบ Preview:
              </label>
              <select
                value={previewPersonId || (activePreviewPerson?.id ?? '')}
                onChange={(e) => setPreviewPersonId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.position}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Broadcast Controls */}
            <div className="grid grid-cols-2 gap-2">
              {activePreviewPerson && (
                <button
                  onClick={() => onPlay(activePreviewPerson.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-950 transition active:scale-95 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>TAKE LIVE (สด)</span>
                </button>
              )}

              <button
                onClick={onHideAll}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition active:scale-95 cursor-pointer border border-slate-700"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>HIDE ALL (ซ่อน)</span>
              </button>
            </div>

            {/* Auto Hide Setting Card */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">ระบบ Auto-Hide อัตโนมัติ</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ autoHide: !settings.autoHide })}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    settings.autoHide ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.autoHide ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.autoHide && (
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>ระยะเวลาแสดงผล:</span>
                    <span className="text-purple-300 font-bold">{settings.autoHideDuration} วินาที</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={settings.autoHideDuration}
                    onChange={(e) =>
                      onUpdateSettings({ autoHideDuration: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>3s</span>
                    <span>15s</span>
                    <span>30s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STYLE & COLOR CUSTOMIZER */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>รูปแบบป้ายชื่อ (Broadcast Presets)</span>
              </label>

              <div className="grid grid-cols-1 gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onUpdateSettings({ stylePreset: preset.id })}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
                      settings.stylePreset === preset.id
                        ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{preset.name}</div>
                      <div className="text-[11px] text-slate-400">{preset.description}</div>
                    </div>
                    {settings.stylePreset === preset.id && (
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                ฟอนต์ (Font Family)
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) =>
                  onUpdateSettings({ fontFamily: e.target.value as FontFamily })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Accent Color Palette */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                สีธีมหลัก (Theme Accent Color)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTES.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => onUpdateSettings({ primaryAccentColor: color.hex })}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer border ${
                      settings.primaryAccentColor === color.hex
                        ? 'ring-2 ring-white scale-110 border-white'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Opacity & Border Radius */}
            <div className="space-y-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>ความทึบแสง (Opacity):</span>
                  <span className="text-purple-300 font-bold">{settings.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.opacity}
                  onChange={(e) =>
                    onUpdateSettings({ opacity: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>ความโค้งมนขอบ (Border Radius):</span>
                  <span className="text-purple-300 font-bold">{settings.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="28"
                  value={settings.borderRadius}
                  onChange={(e) =>
                    onUpdateSettings({ borderRadius: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Show/Hide Toggles */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                <span>แสดงคำอธิบายเพิ่มเติม (Description)</span>
                <input
                  type="checkbox"
                  checked={settings.showDescription}
                  onChange={(e) =>
                    onUpdateSettings({ showDescription: e.target.checked })
                  }
                  className="rounded text-purple-600 focus:ring-purple-500 accent-purple-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                <span>แสดงจุดสัญญาณไฟสด (Live Tally Dot)</span>
                <input
                  type="checkbox"
                  checked={settings.showLiveTallyBadge}
                  onChange={(e) =>
                    onUpdateSettings({ showLiveTallyBadge: e.target.checked })
                  }
                  className="rounded text-purple-600 focus:ring-purple-500 accent-purple-600 w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: ANIMATION CONFIG */}
        {activeTab === 'animation' && (
          <div className="space-y-4">
            {/* Entrance Animation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Animation ขาเข้า (Entrance Animation)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'slide-left', label: 'Slide In Left' },
                  { id: 'slide-right', label: 'Slide In Right' },
                  { id: 'slide-up', label: 'Slide Up' },
                  { id: 'fade', label: 'Fade In' },
                  { id: 'zoom', label: 'Zoom In' },
                  { id: 'flip', label: '3D Flip In' },
                ].map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() =>
                      onUpdateSettings({ defaultAnimation: anim.id as AnimationType })
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      settings.defaultAnimation === anim.id
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exit Animation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Animation ขาออก (Exit Animation)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'slide-left', label: 'Slide Out Left' },
                  { id: 'slide-right', label: 'Slide Out Right' },
                  { id: 'slide-down', label: 'Slide Down' },
                  { id: 'fade', label: 'Fade Out' },
                  { id: 'zoom', label: 'Zoom Out' },
                ].map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() =>
                      onUpdateSettings({ exitAnimation: anim.id as ExitAnimationType })
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      settings.exitAnimation === anim.id
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed / Duration */}
            <div className="space-y-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400">
                <span>ความเร็ว Animation (Speed):</span>
                <span className="text-purple-300 font-bold">{settings.animationDuration} ms</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 300, label: 'เร็ว (300ms)' },
                  { val: 500, label: 'มาตรฐาน (500ms)' },
                  { val: 800, label: 'นุ่มนวล (800ms)' },
                ].map((spd) => (
                  <button
                    key={spd.val}
                    onClick={() => onUpdateSettings({ animationDuration: spd.val })}
                    className={`py-1.5 text-[11px] rounded font-semibold transition border ${
                      settings.animationDuration === spd.val
                        ? 'bg-purple-950 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: POSITION & SCALING */}
        {activeTab === 'position' && (
          <div className="space-y-4">
            {/* Horizontal Alignment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                ตำแหน่งแนวนอน (Horizontal Align)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'left', label: 'ซ้าย (Left)' },
                  { id: 'center', label: 'กึ่งกลาง (Center)' },
                  { id: 'right', label: 'ขวา (Right)' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() =>
                      onUpdateSettings({ horizontalAlign: pos.id as any })
                    }
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      settings.horizontalAlign === pos.id
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Alignment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                ตำแหน่งแนวตั้ง (Vertical Align)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bottom', label: 'ด้านล่าง (Bottom)' },
                  { id: 'top', label: 'ด้านบน (Top)' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() =>
                      onUpdateSettings({ verticalAlign: pos.id as any })
                    }
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      settings.verticalAlign === pos.id
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Scale, OffsetX, OffsetY */}
            <div className="space-y-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>ขนาดรวม (Scale):</span>
                  <span className="text-purple-300 font-bold">{Math.round(settings.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={settings.scale}
                  onChange={(e) =>
                    onUpdateSettings({ scale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>ระยะห่างขอบแนวนอน (Offset X):</span>
                  <span className="text-purple-300 font-bold">{settings.offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  value={settings.offsetX}
                  onChange={(e) =>
                    onUpdateSettings({ offsetX: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>ระยะห่างขอบแนวตั้ง (Offset Y):</span>
                  <span className="text-purple-300 font-bold">{settings.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  value={settings.offsetY}
                  onChange={(e) =>
                    onUpdateSettings({ offsetY: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Logo Settings */}
            <div className="space-y-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                ตำแหน่งโลโก้ / รูปประจำตัว
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'left', label: 'ซ้าย (Left)' },
                  { id: 'right', label: 'ขวา (Right)' },
                  { id: 'none', label: 'ไม่แสดง' },
                ].map((lp) => (
                  <button
                    key={lp.id}
                    onClick={() => onUpdateSettings({ logoPosition: lp.id as any })}
                    className={`py-1.5 text-xs font-semibold rounded border transition ${
                      settings.logoPosition === lp.id
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {lp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Reset & Hide All */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
        <button
          onClick={onResetSettings}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          title="รีเซ็ตการตั้งค่าสไตล์กลับเป็นค่าเริ่มต้น"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ตสไตล์</span>
        </button>

        <button
          onClick={onHideAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-700 text-white text-xs font-bold transition shadow"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>HIDE ALL</span>
        </button>
      </div>
    </div>
  );
};
