import React from 'react';
import { BookMarked, CalendarDays, Dumbbell, FolderSearch, SlidersHorizontal } from 'lucide-react';

export type AppView = 'cases' | 'play' | 'daily' | 'practice' | 'archive';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate, onOpenSettings }) => {
  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'cases', label: 'Fälle' },
    { id: 'daily', label: 'Tagesfall' },
    { id: 'practice', label: 'Üben' },
    { id: 'archive', label: 'Akte' },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/95 dark:bg-[#161311]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('cases')}
          className="font-display text-xl font-bold tracking-tight text-[#241C16] dark:text-[#F2ECE1] whitespace-nowrap shrink-0 cursor-pointer hover:text-[#9B2C2C] dark:hover:text-[#E06C65] transition-colors"
        >
          Satz-Detektiv
        </button>

        {/* Zone 2: 4 concise single-line nav links (desktop/tablet) */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Hauptnavigation">
          {navItems.map((item) => {
            const isActive =
              activeView === item.id || (activeView === 'play' && item.id === 'cases');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#9B2C2C] dark:border-[#E06C65] text-[#241C16] dark:text-[#F2ECE1]'
                    : 'border-transparent text-[#6A5A4C] dark:text-[#B9AA98] hover:text-[#241C16] dark:hover:text-[#F2ECE1]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary utility action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="min-h-[40px] px-3.5 py-2 rounded-lg border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#EFE8DA] dark:hover:bg-[#2B241F] inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#9B2C2C] dark:text-[#E06C65]" aria-hidden="true" />
            <span>Optionen</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const MobileBottomNav: React.FC<{
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}> = ({ activeView, onNavigate }) => {
  const items: Array<{ id: AppView; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'cases', label: 'Fälle', Icon: FolderSearch },
    { id: 'daily', label: 'Tagesfall', Icon: CalendarDays },
    { id: 'practice', label: 'Üben', Icon: Dumbbell },
    { id: 'archive', label: 'Akte', Icon: BookMarked },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 border-t border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/95 dark:bg-[#161311]/95 backdrop-blur-md grid grid-cols-4 items-center"
    >
      {items.map(({ id, label, Icon }) => {
        const isActive = activeView === id || (activeView === 'play' && id === 'cases');
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${
              isActive
                ? 'text-[#9B2C2C] dark:text-[#E06C65]'
                : 'text-[#6A5A4C] dark:text-[#B9AA98]'
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
