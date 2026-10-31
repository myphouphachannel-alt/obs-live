import { AnimationType, ExitAnimationType, StylePreset, FontFamily } from '../types/broadcast';

export interface StylePresetConfig {
  id: StylePreset;
  name: string;
  description: string;
  previewBg: string;
}

export const STYLE_PRESETS: StylePresetConfig[] = [
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    description: 'แถบสีไล่เฉดระดับโปรดักชันพร้อมเงาแบบพรีเมียม',
    previewBg: 'from-violet-600 via-indigo-700 to-slate-900',
  },
  {
    id: 'broadcast-glass',
    name: 'Broadcast Glass',
    description: 'กระจกฝ้าโปร่งแสงโมเดิร์น สไตล์ช่องข่าวต่างประเทศ',
    previewBg: 'from-slate-800/80 via-slate-900/90 to-purple-950/80',
  },
  {
    id: 'news-ribbon',
    name: 'News Ribbon',
    description: 'ริบบิ้นข่าวสด 2 แถบซ้อน สไตล์ Breaking News',
    previewBg: 'from-blue-700 to-slate-900',
  },
  {
    id: 'minimal-solid',
    name: 'Minimal Solid',
    description: 'มินิมอลโมเดิร์น คมชัด อ่านง่าย เหมาะกับการประชุม/สัมมนา',
    previewBg: 'from-slate-900 to-slate-950',
  },
  {
    id: 'neon-cyber',
    name: 'Cyber Neon',
    description: 'ขอบไฟนีออนเรืองแสง สไตล์ eSports และ Gaming Stream',
    previewBg: 'from-fuchsia-900 via-purple-900 to-black',
  },
];

export const FONT_OPTIONS: { id: FontFamily; label: string; sample: string }[] = [
  { id: 'Prompt', label: 'Prompt (โมเดิร์น สะอาด)', sample: 'ดร. นภาพร ศรีสวัสดิ์' },
  { id: 'Kanit', label: 'Kanit (หนักแน่น เด่นชัด)', sample: 'นาย วรวิทย์ เกียรติสกุล' },
  { id: 'Sarabun', label: 'Sarabun (ทางการ ชัดเจน)', sample: 'ดร. กิตติศักดิ์ พัฒนพงศ์' },
  { id: 'Inter', label: 'Inter (International Pro)', sample: 'Dr. James Richardson' },
  { id: 'Noto Sans Lao', label: 'Noto Sans Lao (ພາສາລາວ)', sample: 'ທ່ານ ສົມສັກ ວົງສາ' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Code/Tech)', sample: 'BROADCAST_SYS // 1080P' },
];

export const COLOR_PALETTES = [
  { label: 'Royal Purple', hex: '#8B5CF6' },
  { label: 'Broadcast Indigo', hex: '#6366F1' },
  { label: 'Live Red', hex: '#EF4444' },
  { label: 'Breaking Amber', hex: '#F59E0B' },
  { label: 'Studio Emerald', hex: '#10B981' },
  { label: 'Electric Cyan', hex: '#06B6D4' },
  { label: 'Sky Blue', hex: '#3B82F6' },
  { label: 'Hot Pink', hex: '#EC4899' },
  { label: 'Slate Titanium', hex: '#64748B' },
];

export function getAnimationVariants(
  enterType: AnimationType,
  exitType: ExitAnimationType,
  durationMs: number
) {
  const durationSec = durationMs / 1000;
  const ease = [0.16, 1, 0.3, 1]; // Smooth broadcast cubic-bezier easeOut

  // Enter definitions
  let initial: any = { opacity: 0 };
  let animate: any = { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 };

  switch (enterType) {
    case 'slide-left':
      initial = { opacity: 0, x: -120 };
      break;
    case 'slide-right':
      initial = { opacity: 0, x: 120 };
      break;
    case 'slide-up':
      initial = { opacity: 0, y: 80 };
      break;
    case 'zoom':
      initial = { opacity: 0, scale: 0.85 };
      break;
    case 'flip':
      initial = { opacity: 0, rotateX: -60, y: 30 };
      break;
    case 'fade':
    default:
      initial = { opacity: 0 };
      break;
  }

  // Exit definitions
  let exit: any = { opacity: 0 };
  switch (exitType) {
    case 'slide-left':
      exit = { opacity: 0, x: -120, transition: { duration: durationSec * 0.7, ease: [0.7, 0, 0.84, 0] } };
      break;
    case 'slide-right':
      exit = { opacity: 0, x: 120, transition: { duration: durationSec * 0.7, ease: [0.7, 0, 0.84, 0] } };
      break;
    case 'slide-down':
      exit = { opacity: 0, y: 80, transition: { duration: durationSec * 0.7, ease: [0.7, 0, 0.84, 0] } };
      break;
    case 'zoom':
      exit = { opacity: 0, scale: 0.8, transition: { duration: durationSec * 0.6 } };
      break;
    case 'fade':
    default:
      exit = { opacity: 0, transition: { duration: durationSec * 0.7 } };
      break;
  }

  return {
    initial,
    animate: {
      ...animate,
      transition: {
        duration: durationSec,
        ease,
      },
    },
    exit,
  };
}
