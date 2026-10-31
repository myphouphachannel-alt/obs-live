import React, { useState } from 'react';
import { useBroadcastSocket } from '../hooks/useBroadcastSocket';
import { Header } from './Header';
import { PeopleManager } from './PeopleManager';
import { ControlSidebar } from './ControlSidebar';
import { PersonModal } from './PersonModal';
import { SettingsModal } from './SettingsModal';
import { Person, BroadcastSettings } from '../types/broadcast';
import { DEFAULT_SETTINGS } from '../constants/broadcastDefaults';

export const ControlPanel: React.FC = () => {
  const {
    state,
    isConnected,
    isConnecting,
    connectedClients,
    lastPingMs,
    showLowerThird,
    hideLowerThird,
    addPerson,
    updatePerson,
    deletePerson,
    reorderPeople,
    updateSettings,
    resetToDefaults,
    importBackup,
  } = useBroadcastSocket();

  // Modals state
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Fallback defaults if initial state is still loading
  const currentSettings = state?.settings || DEFAULT_SETTINGS;
  const currentPeople = state?.people || [];
  const currentActive = state?.activeLowerThird || {
    person: null,
    visible: false,
    timestamp: 0,
  };

  const handleOpenAdd = () => {
    setPersonToEdit(null);
    setIsPersonModalOpen(true);
  };

  const handleOpenEdit = (person: Person) => {
    setPersonToEdit(person);
    setIsPersonModalOpen(true);
  };

  const handleSavePerson = async (
    personData: Omit<Person, 'id' | 'createdAt'> | Person
  ) => {
    if ('id' in personData) {
      await updatePerson(personData as Person);
    } else {
      await addPerson(personData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Broadcast Bar / Header */}
      <Header
        state={state}
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectedClients={connectedClients}
        lastPingMs={lastPingMs}
        onHideAll={hideLowerThird}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddPerson={handleOpenAdd}
        isCompactMode={isCompactMode}
        onToggleCompactMode={() => setIsCompactMode(!isCompactMode)}
      />

      {/* Main Studio Console Layout */}
      <main className="flex-1 p-2 sm:p-4 max-w-[1920px] w-full mx-auto overflow-hidden">
        <div
          className={`h-[calc(100vh-68px)] sm:h-[calc(100vh-76px)] gap-3 sm:gap-4 transition-all ${
            isCompactMode
              ? 'flex flex-col'
              : 'grid grid-cols-1 lg:grid-cols-12'
          }`}
        >
          {/* Main Content: People List (Col 1 to 7 on desktop) */}
          <section
            className={`h-full min-h-0 ${
              isCompactMode ? 'flex-1' : 'lg:col-span-7 xl:col-span-7'
            }`}
          >
            <PeopleManager
              people={currentPeople}
              activeLowerThird={currentActive}
              onPlay={showLowerThird}
              onHide={hideLowerThird}
              onEdit={handleOpenEdit}
              onDelete={deletePerson}
              onReorder={reorderPeople}
              onAddNew={handleOpenAdd}
              isCompactMode={isCompactMode}
            />
          </section>

          {/* Right Control Sidebar: Live Monitor & Editor (Col 8 to 12 on desktop) */}
          <aside
            className={`h-full min-h-0 ${
              isCompactMode ? 'hidden' : 'lg:col-span-5 xl:col-span-5'
            }`}
          >
            <ControlSidebar
              settings={currentSettings}
              activeLowerThird={currentActive}
              people={currentPeople}
              onUpdateSettings={updateSettings}
              onHideAll={hideLowerThird}
              onPlay={showLowerThird}
              onResetSettings={() => updateSettings(DEFAULT_SETTINGS)}
            />
          </aside>
        </div>
      </main>

      {/* Add / Edit Person Modal */}
      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        onSave={handleSavePerson}
        personToEdit={personToEdit}
      />

      {/* Settings & OBS Studio Integration Guide Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={currentSettings}
        onUpdateSettings={updateSettings}
        onResetToDefaults={resetToDefaults}
        onImportBackup={importBackup}
      />
    </div>
  );
};
