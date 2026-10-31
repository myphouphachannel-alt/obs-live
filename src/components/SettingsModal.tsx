import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Tv,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Shield,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { BroadcastSettings } from '../types/broadcast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BroadcastSettings;
  onUpdateSettings: (settings: Partial<BroadcastSettings>) => void;
  onResetToDefaults: () => void;
  onImportBackup: (jsonStr: string) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetToDefaults,
  onImportBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'obs-guide' | 'backup'>('settings');
  const [copiedDock, setCopiedDock] = useState(false);
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const controlPanelUrl = `${window.location.origin}/`;
  const overlayUrl = `${window.location.origin}/overlay`;

  const handleCopyDock = () => {
    navigator.clipboard.writeText(controlPanelUrl);
    setCopiedDock(true);
    setTimeout(() => setCopiedDock(false), 2000);
  };

  const handleCopyOverlay = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2000);
  };

  const handleExportBackup = () => {
    window.location.href = '/api/export';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      const success = await onImportBackup(text);
      if (success) {
        setImportStatus('นำเข้าข้อมูลสำเร็จเรียบร้อยแล้ว!');
      } else {
        setImportStatus('เกิดข้อผิดพลาดในการนำเข้าไฟล์ ตรวจสอบรูปแบบ JSON');
      }
      setTimeout(() => setImportStatus(null), 3500);
    }
  };

  const handleProgramLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateSettings({ programLogo: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ตั้งค่าระบบ & OBS Studio Guide</h3>
              <p className="text-xs text-slate-400">กำหนดค่าการถ่ายทอดสดและคำแนะนำติดตั้งบน OBS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/70 px-6 gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ตั้งค่าทั่วไป
          </button>
          <button
            onClick={() => setActiveTab('obs-guide')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'obs-guide'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>วิธีเชื่อมต่อ OBS Studio (คู่มือ)</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>สำรอง / กู้คืนข้อมูล (Backup)</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: General Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Program Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  ชื่อสถานี หรือ ชื่อรายการถ่ายทอดสด (Program Title)
                </label>
                <input
                  type="text"
                  value={settings.programTitle}
                  onChange={(e) => onUpdateSettings({ programTitle: e.target.value })}
                  placeholder="เช่น TECH BROADCAST LIVE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Station Logo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  โลโก้ประจำรายการ (Station Logo)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {settings.programLogo ? (
                      <img
                        src={settings.programLogo}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Tv className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>อัปโหลดไฟล์ภาพโลโก้</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProgramLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={settings.programLogo || ''}
                      onChange={(e) => onUpdateSettings({ programLogo: e.target.value })}
                      placeholder="หรือวาง Direct Image URL..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Default Animation Speed */}
              <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>การแสดงผลเริ่มต้น (Defaults)</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Animation ขาเข้าเริ่มต้น</label>
                    <select
                      value={settings.defaultAnimation}
                      onChange={(e) =>
                        onUpdateSettings({ defaultAnimation: e.target.value as any })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="slide-left">Slide In Left</option>
                      <option value="slide-right">Slide In Right</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="fade">Fade In</option>
                      <option value="zoom">Zoom In</option>
                      <option value="flip">3D Flip In</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Animation ขาออกเริ่มต้น</label>
                    <select
                      value={settings.exitAnimation}
                      onChange={(e) =>
                        onUpdateSettings({ exitAnimation: e.target.value as any })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="slide-left">Slide Out Left</option>
                      <option value="slide-right">Slide Out Right</option>
                      <option value="slide-down">Slide Down</option>
                      <option value="fade">Fade Out</option>
                      <option value="zoom">Zoom Out</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OBS STUDIO SETUP GUIDE */}
          {activeTab === 'obs-guide' && (
            <div className="space-y-5 text-slate-300 text-xs sm:text-sm">
              <div className="p-3.5 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-1">
                <h4 className="font-bold text-purple-200 text-sm flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-purple-400" />
                  <span>วิธีเชื่อมต่อกับ OBS Studio แบบ 100% Real-Time</span>
                </h4>
                <p className="text-xs text-purple-300/90 leading-relaxed">
                  สามารถเปิดใช้งาน Control Panel เป็นหน้าต่าง Dock ใน OBS และใส่ Overlay เป็น Browser Source ได้โดยตรงโดยไม่ต้องสลับจอ!
                </p>
              </div>

              {/* STEP 1: Custom Browser Dock */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    เปิดหน้าควบคุมภายใน OBS (Custom Browser Dock)
                  </h4>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs pl-2">
                  <li>เปิดโปรแกรม OBS Studio บนเครื่องของคุณ</li>
                  <li>คลิกเมนูด้านบน <strong className="text-slate-200">Docks</strong> &gt; <strong className="text-slate-200">Custom Browser Docks...</strong></li>
                  <li>ช่อง <strong className="text-slate-200">Dock Name</strong>: พิมพ์ชื่อ เช่น <code className="text-purple-300">LOWER THIRD CONTROL</code></li>
                  <li>ช่อง <strong className="text-slate-200">URL</strong>: วาง URL ด้านล่างนี้:</li>
                </ol>

                <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <code className="text-purple-300 font-mono text-xs select-all flex-1 truncate">
                    {controlPanelUrl}
                  </code>
                  <button
                    onClick={handleCopyDock}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {copiedDock ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDock ? 'คัดลอกแล้ว' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  * เมื่อกด Apply หน้าต่าง Dock จะปรากฏใน OBS คุณสามารถลากไปยึดติดกับแถบข้างของ OBS ได้ทันที!
                </p>
              </div>

              {/* STEP 2: Browser Source Overlay */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    เพิ่มป้ายชื่อลงบนหน้าจอถ่ายทอดสด (Browser Source)
                  </h4>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs pl-2">
                  <li>ในช่อง <strong className="text-slate-200">Sources</strong> ของ OBS คลิกปุ่ม <strong className="text-purple-300">+</strong> แล้วเลือก <strong className="text-slate-200">Browser</strong></li>
                  <li>ตั้งชื่อ เช่น <code className="text-purple-300">Lower Third Overlay</code> แล้วกด OK</li>
                  <li>ช่อง <strong className="text-slate-200">URL</strong>: วาง URL สำหรับ Overlay ด้านล่าง:</li>
                </ol>

                <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <code className="text-purple-300 font-mono text-xs select-all flex-1 truncate">
                    {overlayUrl}
                  </code>
                  <button
                    onClick={handleCopyOverlay}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {copiedOverlay ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOverlay ? 'คัดลอกแล้ว' : 'Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">WIDTH:</span>
                    <strong className="text-purple-300">1920</strong> (หรือ 1280)
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">HEIGHT:</span>
                    <strong className="text-purple-300">1080</strong> (หรือ 720)
                  </div>
                </div>

                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>หน้า Overlay โปร่งแสง 100% (Transparent) อัตโนมัติ ไม่มีพื้นหลังดำหรือปุ่มบังหน้าจอ</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>ส่งออกไฟล์สำรองข้อมูล (Export JSON Backup)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ดาวน์โหลดรายชื่อบุคคลทั้งหมดและการตั้งค่ารูปแบบป้ายชื่อเป็นไฟล์ JSON เก็บไว้สำรองหรือนำไปใช้ในเครื่องอื่น
                </p>
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ JSON (Export)</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>นำเข้าไฟล์สำรองข้อมูล (Import JSON Backup)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  เลือกไฟล์ JSON ที่เคยบันทึกไว้ เพื่อกู้คืนรายชื่อบุคคลและการตั้งค่าทั้งหมด
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>เลือกไฟล์ JSON จากเครื่อง (Import)</span>
                </button>

                {importStatus && (
                  <p className="text-xs font-bold text-emerald-400 mt-1">
                    {importStatus}
                  </p>
                )}
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-4 bg-red-950/20 rounded-xl border border-red-900/40 space-y-2">
                <h4 className="font-bold text-red-300 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span>รีเซ็ตระบบเป็นค่าเริ่มต้นจากโรงงาน (Factory Reset)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ล้างการตั้งค่าทั้งหมดและโหลดรายชื่อบุคคลเริ่มต้นสำหรับทดสอบระบบ
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น?')) {
                      onResetToDefaults();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold border border-red-700/60 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ยืนยันรีเซ็ตค่าเริ่มต้น</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
