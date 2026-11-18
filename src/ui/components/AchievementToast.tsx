import React from 'react';
import { Award, Sparkles, X } from 'lucide-react';
import { BadgeDefinition } from '../../services/storage';

interface AchievementToastProps {
  queue: BadgeDefinition[];
  onDismissCurrent: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  queue,
  onDismissCurrent,
}) => {
  if (queue.length === 0) return null;
  const current = queue[0];
  const remaining = queue.length - 1;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-[400px] z-50 rounded-2xl border-2 border-[#C89342] bg-[#1E1713] text-[#F7F1E6] shadow-2xl overflow-hidden animate-climb-hop"
    >
      {/* Top DCC System Banner */}
      <div className="px-4 py-2 bg-[#9B2C2C] text-[#FFFDF8] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#F8DF9C]" aria-hidden="true" />
          <span>Neues Achievement!</span>
          {remaining > 0 && (
            <span className="ml-1 font-mono-tab opacity-85">(+{remaining} weitere)</span>
          )}
        </div>
        <button
          type="button"
          onClick={onDismissCurrent}
          aria-label="Achievement-Meldung schließen"
          className="p-1 rounded-md hover:bg-black/20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2D231C] border border-[#C89342] flex items-center justify-center shrink-0">
          <Award className="w-5 h-5 text-[#F0B465]" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="font-display text-base sm:text-lg font-bold text-[#F8DF9C] leading-snug">
            „{current.titleDe}“
          </div>
          <p className="text-xs sm:text-sm text-[#E5DAC8] leading-relaxed">
            {current.descriptionDe}
          </p>
          <div className="text-xs text-[#7CD3A2] font-semibold pt-0.5">
            Belohnung: <span className="font-normal text-[#CFEFD9]">{current.rewardDe}</span>
          </div>
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onDismissCurrent}
              className="px-3.5 py-1.5 rounded-lg bg-[#C89342] hover:bg-[#B47B2B] text-[#161311] text-xs font-bold cursor-pointer"
            >
              {remaining > 0 ? `OK (${remaining} weitere)` : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
