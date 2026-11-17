import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-[#C89342] bg-[#241C16] px-3.5 py-2 text-xs font-medium text-[#F7F3EA] shadow-lg"
    >
      <WifiOff className="w-4 h-4 text-[#D99341]" aria-hidden="true" />
      <span>Offline-Modus · Alle Fälle und Speicherstände bleiben lokal verfügbar</span>
    </div>
  );
};
