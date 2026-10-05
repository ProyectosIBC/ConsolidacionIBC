import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { KanbanView } from './components/kanban/KanbanView';
import { CounselingView } from './components/counseling/CounselingView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { DonationsView } from './components/donations/DonationsView';
import { PublicPortalView } from './components/publicForms/PublicPortalView';
import { DatabaseSetupView } from './components/database/DatabaseSetupView';
import { TelegramAutomationView } from './components/telegram/TelegramAutomationView';
import { SettingsView } from './components/settings/SettingsView';
import { DiscipleshipView } from './components/discipleship/DiscipleshipView';
import { MinistryConsolidationView } from './components/ministry/MinistryConsolidationView';
import { ConsolidatorsView } from './components/consolidators/ConsolidatorsView';
import { CounselingCalendarView } from './components/counseling/CounselingCalendarView';
import { AlertsConfigView } from './components/alerts/AlertsConfigView';
import { NotificationToast } from './components/common/NotificationToast';
import { NewMemberModal } from './components/common/NewMemberModal';
import { NewCounselingModal } from './components/common/NewCounselingModal';
import { NewDonationModal } from './components/common/NewDonationModal';
import { LoginView } from './components/auth/LoginView';

const AppContent: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCounselingModalOpen, setIsCounselingModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated && currentView !== 'public-portal') {
    return (
      <>
        <LoginView />
        <NotificationToast />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation for Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar Drawer for Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative z-10 w-64 bg-slate-900 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenNewMemberModal={() => setIsMemberModalOpen(true)}
          onOpenNewCounselingModal={() => setIsCounselingModalOpen(true)}
          onOpenNewDonationModal={() => setIsDonationModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'kanban' && (
            <KanbanView onOpenNewMemberModal={() => setIsMemberModalOpen(true)} />
          )}
          {currentView === 'consolidators' && <ConsolidatorsView />}
          {currentView === 'counseling' && (
            <CounselingView onOpenNewCounselingModal={() => setIsCounselingModalOpen(true)} />
          )}
          {currentView === 'counseling-calendar' && (
            <CounselingCalendarView onOpenNewCounselingModal={() => setIsCounselingModalOpen(true)} />
          )}
          {(currentView === 'schedule' || currentView === 'generator') && <ScheduleView />}
          {currentView === 'donations' && (
            <DonationsView onOpenNewDonationModal={() => setIsDonationModalOpen(true)} />
          )}
          {currentView === 'public-portal' && <PublicPortalView />}
          {currentView === 'discipleship' && <DiscipleshipView />}
          {currentView === 'ministry-consolidation' && <MinistryConsolidationView />}
          {currentView === 'telegram-automation' && <TelegramAutomationView />}
          {currentView === 'alerts-config' && <AlertsConfigView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Alerts */}
      <NotificationToast />

      {/* Quick Action Modals */}
      <NewMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />
      <NewCounselingModal
        isOpen={isCounselingModalOpen}
        onClose={() => setIsCounselingModalOpen(false)}
      />
      <NewDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
