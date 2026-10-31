import React, { useState, useMemo } from 'react';
import {
  Play,
  EyeOff,
  Edit3,
  Trash2,
  Search,
  MoveUp,
  MoveDown,
  UserCheck,
  Radio,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Person, ActiveLowerThird } from '../types/broadcast';

interface PeopleManagerProps {
  people: Person[];
  activeLowerThird: ActiveLowerThird;
  onPlay: (personId: string) => void;
  onHide: () => void;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onAddNew: () => void;
  isCompactMode?: boolean;
}

export const PeopleManager: React.FC<PeopleManagerProps> = ({
  people,
  activeLowerThird,
  onPlay,
  onHide,
  onEdit,
  onDelete,
  onReorder,
  onAddNew,
  isCompactMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set<string>();
    people.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [people]);

  // Filtered people
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [people, searchTerm, selectedCategory]);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= people.length) return;

    const newOrder = [...people];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    onReorder(newOrder.map((p) => p.id));
  };

  const isLivePerson = (id: string) => {
    return activeLowerThird.visible && activeLowerThird.person?.id === id;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/80 shadow-lg overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-3 sm:p-4 border-b border-slate-800 space-y-3 bg-slate-900/90">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>รายชื่อบุคคลบนระบบ</span>
              <span className="text-xs font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800/60">
                {people.length}
              </span>
            </h2>
          </div>

          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-950 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มบุคคล</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, ตำแหน่ง, รายละเอียด..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md transition whitespace-nowrap font-medium ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-900'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'ทั้งหมด' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* People List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2.5">
        {filteredPeople.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-3">
            <UserCheck className="w-10 h-10 stroke-[1.5] text-slate-600" />
            <p className="text-sm">ไม่พบรายชื่อบุคคลตามเงื่อนไข</p>
            <button
              onClick={onAddNew}
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              + คลิกที่นี่เพื่อเพิ่มบุคคลใหม่
            </button>
          </div>
        ) : (
          filteredPeople.map((person, index) => {
            const isLive = isLivePerson(person.id);

            return (
              <div
                key={person.id}
                className={`relative group rounded-xl p-3 sm:p-3.5 transition-all border ${
                  isLive
                    ? 'bg-gradient-to-r from-red-950/40 via-slate-900 to-purple-950/30 border-red-500/80 shadow-lg shadow-red-950/40 ring-1 ring-red-500/50'
                    : 'bg-slate-950/70 hover:bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Person Item Flex Layout */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Avatar & Text info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar thumbnail */}
                    <div className="relative shrink-0">
                      <div
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex items-center justify-center font-bold text-sm shadow-md"
                        style={{
                          border: `2px solid ${person.themeColor || '#8B5CF6'}`,
                          backgroundColor: '#0F172A',
                        }}
                      >
                        {person.profileImage ? (
                          <img
                            src={person.profileImage}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className="text-white uppercase font-black"
                            style={{ color: person.themeColor || '#8B5CF6' }}
                          >
                            {person.name.substring(0, 2)}
                          </span>
                        )}
                      </div>

                      {/* Live Badge dot */}
                      {isLive && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-slate-950"></span>
                        </span>
                      )}
                    </div>

                    {/* Person Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                          {person.name}
                        </h3>

                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider text-white bg-red-600 px-2 py-0.5 rounded shadow-sm shadow-red-900 animate-pulse">
                            <Radio className="w-3 h-3" />
                            LIVE
                          </span>
                        )}

                        {person.category && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide uppercase truncate"
                            style={{
                              backgroundColor: `${person.themeColor || '#8B5CF6'}20`,
                              color: person.themeColor || '#C4B5FD',
                              border: `1px solid ${person.themeColor || '#8B5CF6'}50`,
                            }}
                          >
                            {person.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-slate-300 truncate mt-0.5">
                        {person.position}
                      </p>

                      {person.description && !isCompactMode && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 hidden sm:block">
                          {person.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: PLAY, HIDE, EDIT, DELETE, REORDER */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {/* Live Play / On Air Button */}
                    {isLive ? (
                      <button
                        onClick={onHide}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-950 tracking-wider transition active:scale-95 cursor-pointer ring-2 ring-red-400/40"
                        title="คลิกเพื่อซ่อนป้ายชื่อ (กำลังถ่ายทอดสดอยู่)"
                      >
                        <EyeOff className="w-4 h-4" />
                        <span className="hidden sm:inline">HIDE</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onPlay(person.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 tracking-wider transition active:scale-95 cursor-pointer ring-1 ring-emerald-400/30"
                        title="นำป้ายชื่อนี้ขึ้นจอ OBS สดทันที (PLAY)"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>PLAY</span>
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => onEdit(person)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="แก้ไขข้อมูลบุคคล"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Reorder Buttons (Up / Down) */}
                    <div className="hidden sm:flex flex-col">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                        title="เลื่อนขึ้น"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === people.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                        title="เลื่อนลง"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(person.id)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-950 hover:text-red-400 text-slate-400 transition cursor-pointer"
                      title="ลบรายชื่อนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
