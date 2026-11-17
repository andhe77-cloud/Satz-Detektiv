import React from 'react';
import { Moon, Sun, Volume2, VolumeX, X } from 'lucide-react';
import { PlayerProgress } from '../../core/types';
import { LegalTab } from './LegalModal';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  open: boolean;
  settings: PlayerProgress['settings'];
  onChangeSettings: (next: Partial<PlayerProgress['settings']>) => void;
  onOpenLegal: (tab: LegalTab) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  settings,
  onChangeSettings,
  onOpenLegal,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#FFFDF8] dark:bg-[#221D19] border border-[#DED4C3] dark:border-[#3A312A] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#DED4C3] dark:border-[#3A312A] pb-3">
          <h2 id="settings-title" className="font-display text-xl font-semibold text-[#241C16] dark:text-[#F2ECE1]">
            Einstellungen
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appearance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#241C16] dark:text-[#F2ECE1]">Darstellung</div>
              <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">Hell- oder Dunkelmodus wählen</div>
            </div>
            <div className="inline-flex rounded-xl bg-[#EFE8DA] dark:bg-[#2B241F] p-1 gap-1">
              <button
                type="button"
                onClick={() => onChangeSettings({ theme: 'light' })}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                  settings.theme === 'light'
                    ? 'bg-white text-[#241C16] shadow-sm'
                    : 'text-[#6A5A4C] dark:text-[#B9AA98]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hell</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeSettings({ theme: 'dark' })}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'bg-[#161311] text-[#F2ECE1] shadow-sm'
                    : 'text-[#6A5A4C] dark:text-[#B9AA98]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dunkel</span>
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-[#241C16] dark:text-[#F2ECE1]">
                Animationen reduzieren
              </div>
              <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                Deaktiviert Figuren-Bewegung für ruhiges Lesen
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => onChangeSettings({ reducedMotion: e.target.checked })}
              className="w-5 h-5 accent-[#9B2C2C] cursor-pointer"
            />
          </label>
        </div>

        {/* Audio Controls (separate music & SFX) */}
        <div className="space-y-3 pt-3 border-t border-[#DED4C3] dark:border-[#3A312A]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#241C16] dark:text-[#F2ECE1]">Kammermusik</div>
              <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">Ruhige Rätsel-Begleitung</div>
            </div>
            <button
              type="button"
              onClick={() => onChangeSettings({ musicEnabled: !settings.musicEnabled })}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                settings.musicEnabled
                  ? 'border-[#266B47] bg-[#EAF5EE] dark:bg-[#193325] text-[#1E5B3A] dark:text-[#7CD3A2]'
                  : 'border-[#DED4C3] dark:border-[#3A312A] bg-[#EFE8DA] dark:bg-[#2B241F] text-[#6A5A4C] dark:text-[#B9AA98]'
              }`}
            >
              {settings.musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{settings.musicEnabled ? 'Musik an' : 'Musik aus'}</span>
            </button>
          </div>

          <label className="block space-y-1">
            <div className="flex justify-between text-xs font-medium text-[#4A3D33] dark:text-[#D5C9BA]">
              <span>Musiklautstärke</span>
              <span className="font-mono-tab">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.musicVolume * 100)}
              onChange={(e) => onChangeSettings({ musicVolume: Number(e.target.value) / 100 })}
              className="w-full accent-[#9B2C2C] cursor-pointer"
            />
          </label>

          <label className="block space-y-1">
            <div className="flex justify-between text-xs font-medium text-[#4A3D33] dark:text-[#D5C9BA]">
              <span>Effektlautstärke (Klicks &amp; Lösung)</span>
              <span className="font-mono-tab">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.sfxVolume * 100)}
              onChange={(e) => onChangeSettings({ sfxVolume: Number(e.target.value) / 100 })}
              className="w-full accent-[#9B2C2C] cursor-pointer"
            />
          </label>
        </div>

        {/* PWA Install & Legal */}
        <div className="pt-3 border-t border-[#DED4C3] dark:border-[#3A312A] flex flex-wrap items-center justify-between gap-2">
          <PWAInstallButton />
          <div className="flex items-center gap-3 text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLegal('privacy');
              }}
              className="hover:underline cursor-pointer"
            >
              Datenschutz
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLegal('imprint');
              }}
              className="hover:underline cursor-pointer"
            >
              Impressum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
