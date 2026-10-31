import React, { useState, useEffect } from 'react';
import { X, Upload, Palette, User, Briefcase, FileText, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Person } from '../types/broadcast';
import { COLOR_PALETTES } from '../utils/themePresets';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personData: Omit<Person, 'id' | 'createdAt'> | Person) => void;
  personToEdit?: Person | null;
}

const PRESET_AVATARS = [
  { label: 'Academic Speaker', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'News Anchor', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { label: 'Engineer Guest', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Producer VIP', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Studio Expert', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
];

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  personToEdit,
}) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [themeColor, setThemeColor] = useState('#8B5CF6');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [errors, setErrors] = useState<{ name?: string; position?: string }>({});

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setPosition(personToEdit.position);
      setDescription(personToEdit.description || '');
      setCategory(personToEdit.category || 'แขกรับเชิญ');
      setProfileImage(personToEdit.profileImage || '');
      setThemeColor(personToEdit.themeColor || '#8B5CF6');
      setTextColor(personToEdit.textColor || '#FFFFFF');
    } else {
      setName('');
      setPosition('');
      setDescription('');
      setCategory('แขกรับเชิญ');
      setProfileImage('');
      setThemeColor('#8B5CF6');
      setTextColor('#FFFFFF');
    }
    setErrors({});
  }, [personToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('รูปภาพมีขนาดใหญ่เกิน 5MB กรุณาเลือกรูปขนาดเล็กลง');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProfileImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; position?: string } = {};

    if (!name.trim()) newErrors.name = 'กรุณากรอกชื่อบุคคล';
    if (!position.trim()) newErrors.position = 'กรุณากรอกตำแหน่ง';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (personToEdit) {
      onSave({
        ...personToEdit,
        name: name.trim(),
        position: position.trim(),
        description: description.trim(),
        category: category.trim(),
        profileImage,
        themeColor,
        textColor,
      });
    } else {
      onSave({
        name: name.trim(),
        position: position.trim(),
        description: description.trim(),
        category: category.trim(),
        profileImage,
        themeColor,
        textColor,
        order: 0,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {personToEdit ? 'แก้ไขข้อมูลบุคคล (Edit Person)' : 'เพิ่มรายชื่อบุคคลใหม่ (Add Person)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Real-time mini preview */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              ตัวอย่างป้ายชื่อ (Live Preview)
            </span>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-700/60 shadow-lg">
              <div
                className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-bold shadow"
                style={{ border: `2px solid ${themeColor}`, backgroundColor: '#0F172A' }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ color: themeColor }}>{(name || 'ชื่อ').substring(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {category && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                  >
                    {category}
                  </span>
                )}
                <div className="text-sm font-bold text-white truncate" style={{ color: textColor }}>
                  {name || 'ชื่อบุคคลจะแสดงที่นี่'}
                </div>
                <div className="text-xs truncate" style={{ color: themeColor }}>
                  {position || 'ตำแหน่งงาน / องค์กร'}
                </div>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>ชื่อ-นามสกุล หรือ ฉายา (รองรับ ไทย / ลาว / อังกฤษ) *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="เช่น ดร. สมชาย ใจดี หรือ Mr. John Doe หรือ ທ່ານ ສົມສັກ"
              className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 ${
                errors.name ? 'border-red-500' : 'border-slate-800'
              }`}
            />
            {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
          </div>

          {/* Position Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>ตำแหน่ง / สังกัด / หน่วยงาน *</span>
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                if (errors.position) setErrors((prev) => ({ ...prev, position: undefined }));
              }}
              placeholder="เช่น ผู้อำนวยการฝ่ายวิจัย / Lead Audio Engineer"
              className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 ${
                errors.position ? 'border-red-500' : 'border-slate-800'
              }`}
            />
            {errors.position && <p className="text-[11px] text-red-400">{errors.position}</p>}
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>คำอธิบายเพิ่มเติม / หัวข้อสนทนา (ไม่บังคับ)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น หัวข้อ: เทคโนโลยีปัญญาประดิษฐ์เพื่อการแพร่ภาพและเสียง"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">หมวดหมู่ (Category)</label>
            <div className="flex flex-wrap gap-1.5">
              {['ผู้ดำเนินรายการ', 'วิทยากรพิเศษ', 'แขกรับเชิญ', 'ผู้เชี่ยวชาญ', 'VIP Guest', 'ฝ่ายเทคนิค'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition cursor-pointer ${
                    category === cat
                      ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="หรือพิมพ์หมวดหมู่เอง..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 mt-1"
            />
          </div>

          {/* Profile Image / Logo Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>รูปภาพโปรไฟล์ หรือ โลโก้</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-dashed border-slate-700 hover:border-purple-500 rounded-lg text-xs text-slate-300 cursor-pointer transition">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>อัปโหลดจากเครื่อง (ไฟล์ PNG/JPG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="หรือวาง Image URL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Quick Preset Avatars */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">หรือเลือกรูปตัวอย่างด่วน:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setProfileImage(av.url)}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-700 hover:border-purple-400 shrink-0 transition"
                    title={av.label}
                  >
                    <img src={av.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileImage('')}
                    className="text-[11px] text-red-400 hover:text-red-300 ml-2"
                  >
                    ลบรูป
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Color Palettes for Person */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>สีประจำบุคคล (Person Accent Color)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PALETTES.map((color) => (
                <button
                  type="button"
                  key={color.hex}
                  onClick={() => setThemeColor(color.hex)}
                  className={`w-7 h-7 rounded-full border transition cursor-pointer ${
                    themeColor === color.hex
                      ? 'ring-2 ring-white scale-110 border-white'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              ))}
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                title="เลือกสีเอง"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950 transition active:scale-95"
            >
              {personToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มรายชื่อ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
