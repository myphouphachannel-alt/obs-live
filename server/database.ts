import fs from 'fs';
import path from 'path';
import { BroadcastState, Person, BroadcastSettings } from '../src/types/broadcast.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'database.backup.json');

export const DEFAULT_SETTINGS: BroadcastSettings = {
  programTitle: 'OBS LIVE BROADCAST',
  programLogo: '',
  defaultAnimation: 'slide-left',
  exitAnimation: 'slide-left',
  animationDuration: 500,
  autoHide: false,
  autoHideDuration: 8,
  fontFamily: 'Prompt',
  stylePreset: 'modern-gradient',
  horizontalAlign: 'left',
  verticalAlign: 'bottom',
  offsetX: 64,
  offsetY: 64,
  scale: 1.0,
  logoSize: 68,
  logoPosition: 'left',
  borderRadius: 14,
  opacity: 95,
  showDescription: true,
  showLiveTallyBadge: true,
  primaryAccentColor: '#8B5CF6',
  secondaryColor: '#0F172A',
};

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'p-1',
    name: 'ดร. กิตติศักดิ์ พัฒนพงศ์',
    position: 'ผู้อำนวยการสถาบันนวัตกรรมสื่อดิจิทัล',
    description: 'ผู้เชี่ยวชาญด้านเทคโนโลยีปัญญาประดิษฐ์และการสื่อสารมวลชน',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    themeColor: '#8B5CF6',
    textColor: '#FFFFFF',
    bgColor: '#0F172A',
    category: 'วิทยากรพิเศษ',
    order: 0,
    createdAt: Date.now() - 400000,
  },
  {
    id: 'p-2',
    name: 'นภาพร ศรีสวัสดิ์',
    position: 'ผู้ประกาศข่าวภาคค่ำอาวุโส',
    description: 'สถานีข่าวสารการถ่ายทอดสดและสารสนเทศแห่งชาติ',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    themeColor: '#EC4899',
    textColor: '#FFFFFF',
    bgColor: '#1E1B4B',
    category: 'ผู้ดำเนินรายการ',
    order: 1,
    createdAt: Date.now() - 300000,
  },
  {
    id: 'p-3',
    name: 'Dr. James Richardson, Ph.D.',
    position: 'Lead Broadcast Systems Engineer',
    description: 'OBS Studio Integration & Live Media Streaming Specialist',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    themeColor: '#3B82F6',
    textColor: '#FFFFFF',
    bgColor: '#0284C7',
    category: 'International Guest',
    order: 2,
    createdAt: Date.now() - 200000,
  },
  {
    id: 'p-4',
    name: 'ທ່ານ ສົມສັກ ວົງສາ (Somsack Vongsa)',
    position: 'ຫົວໜ້າພະແນກສື່ມວນຊົນດິຈິຕອນ',
    description: 'ສະຖານີໂທລະພາບ ແລະ ການກະຈາຍສຽງແຫ່ງຊາດ',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    themeColor: '#10B981',
    textColor: '#FFFFFF',
    bgColor: '#064E3B',
    category: 'ແຂກຮັບເຊີນພິເສດ',
    order: 3,
    createdAt: Date.now() - 100000,
  },
  {
    id: 'p-5',
    name: 'วรวิทย์ เกียรติสกุล',
    position: 'Executive Streaming Producer',
    description: 'ควบคุมระบบภาพและเสียง Multitrack Live Stream',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    themeColor: '#F59E0B',
    textColor: '#FFFFFF',
    bgColor: '#78350F',
    category: 'ฝ่ายเทคนิค',
    order: 4,
    createdAt: Date.now(),
  },
];

export class Database {
  private state: BroadcastState;

  constructor() {
    this.ensureDataDir();
    this.state = this.loadFromFile();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromFile(): BroadcastState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.people) && data.settings) {
          return {
            people: data.people,
            settings: { ...DEFAULT_SETTINGS, ...data.settings },
            activeLowerThird: data.activeLowerThird || {
              person: null,
              visible: false,
              timestamp: 0,
            },
          };
        }
      }
    } catch (err) {
      console.error('[DB] Error loading database file, falling back to initial data:', err);
    }

    // Default initial state
    const initialState: BroadcastState = {
      people: INITIAL_PEOPLE,
      settings: DEFAULT_SETTINGS,
      activeLowerThird: {
        person: null,
        visible: false,
        timestamp: 0,
      },
    };
    this.saveToFile(initialState);
    return initialState;
  }

  private saveToFile(stateToSave: BroadcastState): void {
    try {
      this.ensureDataDir();
      const json = JSON.stringify(
        {
          people: stateToSave.people,
          settings: stateToSave.settings,
          activeLowerThird: stateToSave.activeLowerThird,
          lastUpdated: Date.now(),
        },
        null,
        2
      );
      fs.writeFileSync(DB_FILE, json, 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  public getState(): BroadcastState {
    return {
      people: [...this.state.people],
      settings: { ...this.state.settings },
      activeLowerThird: { ...this.state.activeLowerThird },
    };
  }

  public getPeople(): Person[] {
    return [...this.state.people].sort((a, b) => a.order - b.order);
  }

  public getPersonById(id: string): Person | undefined {
    return this.state.people.find((p) => p.id === id);
  }

  public addPerson(data: Omit<Person, 'id' | 'createdAt'>): Person {
    const newPerson: Person = {
      ...data,
      id: `person-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      order: this.state.people.length,
      createdAt: Date.now(),
      themeColor: data.themeColor || '#8B5CF6',
      textColor: data.textColor || '#FFFFFF',
    };
    this.state.people.push(newPerson);
    this.saveToFile(this.state);
    return newPerson;
  }

  public updatePerson(id: string, updates: Partial<Person>): Person | null {
    const idx = this.state.people.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const updated: Person = {
      ...this.state.people[idx],
      ...updates,
      id, // Preserve id
    };
    this.state.people[idx] = updated;

    // If currently live, update active lower third as well for seamless live update!
    if (this.state.activeLowerThird.person?.id === id) {
      this.state.activeLowerThird.person = updated;
    }

    this.saveToFile(this.state);
    return updated;
  }

  public deletePerson(id: string): boolean {
    const prevLen = this.state.people.length;
    this.state.people = this.state.people.filter((p) => p.id !== id);
    
    // Reindex order
    this.state.people.forEach((p, idx) => {
      p.order = idx;
    });

    // If deleted person was active on air, hide lower third
    if (this.state.activeLowerThird.person?.id === id) {
      this.state.activeLowerThird = {
        person: null,
        visible: false,
        timestamp: Date.now(),
      };
    }

    this.saveToFile(this.state);
    return this.state.people.length < prevLen;
  }

  public reorderPeople(orderedIds: string[]): Person[] {
    const idMap = new Map(this.state.people.map((p) => [p.id, p]));
    const reordered: Person[] = [];

    orderedIds.forEach((id, idx) => {
      const p = idMap.get(id);
      if (p) {
        p.order = idx;
        reordered.push(p);
        idMap.delete(id);
      }
    });

    // Append any not included in orderedIds
    idMap.forEach((p) => {
      p.order = reordered.length;
      reordered.push(p);
    });

    this.state.people = reordered;
    this.saveToFile(this.state);
    return this.getPeople();
  }

  public getSettings(): BroadcastSettings {
    return { ...this.state.settings };
  }

  public updateSettings(updates: Partial<BroadcastSettings>): BroadcastSettings {
    this.state.settings = {
      ...this.state.settings,
      ...updates,
    };
    this.saveToFile(this.state);
    return { ...this.state.settings };
  }

  public showLowerThird(personId: string): BroadcastState['activeLowerThird'] {
    const person = this.getPersonById(personId);
    if (!person) {
      throw new Error(`Person with id ${personId} not found`);
    }

    this.state.activeLowerThird = {
      person,
      visible: true,
      timestamp: Date.now(),
    };
    this.saveToFile(this.state);
    return { ...this.state.activeLowerThird };
  }

  public hideLowerThird(): BroadcastState['activeLowerThird'] {
    this.state.activeLowerThird = {
      ...this.state.activeLowerThird,
      visible: false,
      timestamp: Date.now(),
    };
    this.saveToFile(this.state);
    return { ...this.state.activeLowerThird };
  }

  public exportBackup(): string {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        people: this.state.people,
        settings: this.state.settings,
      },
      null,
      2
    );
  }

  public importBackup(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed.people)) {
        throw new Error('Invalid JSON: missing people array');
      }

      // Save backup of current before replacing
      try {
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
      } catch (e) {
        console.warn('[DB] Could not write backup file before import:', e);
      }

      this.state.people = parsed.people.map((p: any, idx: number) => ({
        id: p.id || `p-${Date.now()}-${idx}`,
        name: String(p.name || ''),
        position: String(p.position || ''),
        description: p.description ? String(p.description) : '',
        profileImage: p.profileImage ? String(p.profileImage) : '',
        themeColor: p.themeColor || '#8B5CF6',
        textColor: p.textColor || '#FFFFFF',
        bgColor: p.bgColor || '#0F172A',
        category: p.category || 'General',
        order: typeof p.order === 'number' ? p.order : idx,
        createdAt: p.createdAt || Date.now(),
      }));

      if (parsed.settings && typeof parsed.settings === 'object') {
        this.state.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
        };
      }

      this.state.activeLowerThird = {
        person: null,
        visible: false,
        timestamp: Date.now(),
      };

      this.saveToFile(this.state);
      return true;
    } catch (err) {
      console.error('[DB] Import error:', err);
      return false;
    }
  }

  public resetToDefaults(): BroadcastState {
    this.state = {
      people: INITIAL_PEOPLE,
      settings: DEFAULT_SETTINGS,
      activeLowerThird: {
        person: null,
        visible: false,
        timestamp: Date.now(),
      },
    };
    this.saveToFile(this.state);
    return this.getState();
  }
}

export const db = new Database();
