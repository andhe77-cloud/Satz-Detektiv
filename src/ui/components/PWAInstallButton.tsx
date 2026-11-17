import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-lg border border-[#C89342]/50 bg-[#EFE8DA] dark:bg-[#2B241F] px-3 py-2 text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#E5DBC7] dark:hover:bg-[#382F28] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
      >
        <Download className="w-4 h-4 text-[#9B2C2C] dark:text-[#E06C65]" aria-hidden="true" />
        <span>App installieren</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#DED4C3] dark:border-[#3A312A] bg-[#EFE8DA] dark:bg-[#2B241F] px-3 py-2 text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#E5DBC7] dark:hover:bg-[#382F28] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
        >
          <Download className="w-4 h-4 text-[#9B2C2C] dark:text-[#E06C65]" aria-hidden="true" />
          <span>Zum Home-Bildschirm</span>
        </button>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#221D19] border border-[#DED4C3] dark:border-[#3A312A] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-[#241C16] dark:text-[#F2ECE1]">
                  Auf iPhone / iPad installieren
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Schließen"
                  className="p-2 rounded-lg text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-[#4A3D33] dark:text-[#D5C9BA] list-decimal pl-5">
                <li>Tippe unten in Safari auf das <strong>Teilen</strong>-Symbol.</li>
                <li>Scrolle nach unten und wähle <strong>Zum Home-Bildschirm</strong>.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#9B2C2C] py-2.5 text-sm font-semibold text-white hover:bg-[#822424] transition-colors cursor-pointer"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
