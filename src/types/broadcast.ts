/**
 * OBS Lower Third Control Panel - Types & Schema
 */

export type AnimationType = 
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'fade'
  | 'zoom'
  | 'flip';

export type ExitAnimationType = 
  | 'slide-left'
  | 'slide-right'
  | 'slide-down'
  | 'fade'
  | 'zoom';

export type StylePreset = 
  | 'modern-gradient'
  | 'broadcast-glass'
  | 'news-ribbon'
  | 'minimal-solid'
  | 'neon-cyber';

export type FontFamily = 
  | 'Prompt'
  | 'Kanit'
  | 'Sarabun'
  | 'Inter'
  | 'Noto Sans Lao'
  | 'JetBrains Mono';

export interface Person {
  id: string;
  name: string;
  position: string;
  description?: string;
  profileImage?: string;
  themeColor: string; // Hex color for accents/badges
  textColor: string;  // Hex color
  bgColor?: string;   // Optional custom background override
  category?: string;  // Host, Guest, Speaker, Expert, etc.
  order: number;
  createdAt: number;
}

export interface BroadcastSettings {
  programTitle: string;
  programLogo?: string;
  defaultAnimation: AnimationType;
  exitAnimation: ExitAnimationType;
  animationDuration: number; // in milliseconds (300, 500, 800, etc.)
  autoHide: boolean;
  autoHideDuration: number; // in seconds (3 to 60)
  fontFamily: FontFamily;
  stylePreset: StylePreset;
  horizontalAlign: 'left' | 'center' | 'right';
  verticalAlign: 'bottom' | 'top';
  offsetX: number; // in pixels (e.g. 60)
  offsetY: number; // in pixels (e.g. 60)
  scale: number; // 0.7 to 1.5
  logoSize: number; // 40 to 120 px
  logoPosition: 'left' | 'right' | 'none';
  borderRadius: number; // 0 to 32 px
  opacity: number; // 0 to 100%
  showDescription: boolean;
  showLiveTallyBadge: boolean;
  primaryAccentColor: string; // broadcast theme accent
  secondaryColor: string;
}

export interface ActiveLowerThird {
  person: Person | null;
  visible: boolean;
  timestamp: number;
}

export interface BroadcastState {
  people: Person[];
  settings: BroadcastSettings;
  activeLowerThird: ActiveLowerThird;
  connectedClients?: number;
}

export type WSClientAction =
  | { type: 'SHOW_LOWER_THIRD'; payload: { personId: string } }
  | { type: 'HIDE_LOWER_THIRD' }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'ADD_PERSON'; payload: Omit<Person, 'id' | 'createdAt'> }
  | { type: 'DELETE_PERSON'; payload: { id: string } }
  | { type: 'REORDER_PEOPLE'; payload: { orderedIds: string[] } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<BroadcastSettings> }
  | { type: 'PING' };

export type WSServerMessage =
  | { type: 'STATE_SYNC'; payload: BroadcastState }
  | { type: 'LOWER_THIRD_CHANGED'; payload: ActiveLowerThird }
  | { type: 'SETTINGS_CHANGED'; payload: BroadcastSettings }
  | { type: 'PEOPLE_CHANGED'; payload: Person[] }
  | { type: 'CLIENT_COUNT'; payload: { count: number } }
  | { type: 'PONG'; payload: { timestamp: number } }
  | { type: 'ERROR'; payload: { message: string } };
