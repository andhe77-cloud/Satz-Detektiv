import React from 'react';
import { X } from 'lucide-react';

export type LegalTab = 'privacy' | 'imprint';

export const LegalModal: React.FC<{
  open: boolean;
  tab: LegalTab;
  onChangeTab: (tab: LegalTab) => void;
  onClose: () => void;
}> = ({ open, tab, onChangeTab, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[#FFFDF8] dark:bg-[#221D19] border border-[#DED4C3] dark:border-[#3A312A] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#DED4C3] dark:border-[#3A312A] pb-3">
          <h2 id="legal-title" className="font-display text-xl font-semibold text-[#241C16] dark:text-[#F2ECE1]">
            {tab === 'privacy' ? 'Datenschutzerklärung (Vorlage)' : 'Impressum (Vorlage)'}
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

        <div className="flex gap-2 mt-4 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#2B241F]">
          <button
            type="button"
            onClick={() => onChangeTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'privacy'
                ? 'bg-white dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                : 'text-[#6A5A4C] dark:text-[#B9AA98]'
            }`}
          >
            Datenschutz (DSGVO)
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('imprint')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'imprint'
                ? 'bg-white dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                : 'text-[#6A5A4C] dark:text-[#B9AA98]'
            }`}
          >
            Impressum
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#4A3D33] dark:text-[#D5C9BA]">
          {tab === 'privacy' ? (
            <>
              <p>
                <strong>Kinder- und Jugenddatenschutz (DSGVO):</strong> Satz-Detektiv ist werbefrei, nutzt keine
                Drittanbieter-Tracker, keine Analyse-Cookies und erfordert keine Registrierung oder Angabe
                personenbezogener Daten.
              </p>
              <p>
                <strong>Lokale Speicherung:</strong> Spielfortschritt, Sterne, Abzeichen, Grammatik-Übungsstatistik und
                Einstellungen (Hell-/Dunkelmodus, Lautstärke) werden ausschließlich lokal im Browser (<code>localStorage</code>)
                auf dem eigenen Gerät gespeichert.
              </p>
              <p>
                <strong>Datenkontrolle:</strong> In den Einstellungen der Ermittlungsakte können Sie Ihren gesamten
                Speicherstand jederzeit als JSON-Datei exportieren oder vollständig löschen.
              </p>
              <p className="text-xs text-[#7A695A] dark:text-[#A49483]">
                Hinweis: Diese Seite ist eine rechtliche Platzhalter-Vorlage und wird vor Veröffentlichung vom
                Betreiber / Auftraggeber mit den konkreten Kontaktdaten ergänzt.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Angaben gemäß § 5 DDG (Platzhalter für Auftraggeber):</strong>
              </p>
              <p>
                [Name / Organisation des Betreibers]<br />
                [Straße und Hausnummer]<br />
                [PLZ und Ort, Deutschland]<br />
                E-Mail: [kontakt@beispiel.de]
              </p>
              <p className="text-xs text-[#7A695A] dark:text-[#A49483]">
                Alle Illustrationen, Spieltexte und die prozedurale Rätsel-Engine wurden speziell für Satz-Detektiv
                erstellt (Details in <code>CREDITS.md</code>).
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
