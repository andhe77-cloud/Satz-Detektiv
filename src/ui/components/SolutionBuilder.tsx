import React, { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Star, TriangleAlert } from 'lucide-react';
import { CaseDefinition, GrammarFocus } from '../../core/types';
import { CorneliusAvatarSvg } from './Illustrations';

interface SolutionBuilderProps {
  caseData: CaseDefinition;
  slots: Array<string | null>;
  onUpdateSlot: (slotIndex: number, word: string | null) => void;
  onClearSlots: () => void;
  badSlots: number[];
  feedback: { type: 'error' | 'success' | 'info'; messages: string[] } | null;
  solvedStats: { stars: number; attempts: number } | null;
  onCheckSolution: () => void;
  onNextCase: () => void;
  hasNextCase: boolean;
  onRecordGrammarError?: (tags: GrammarFocus[]) => void;
}

export const SolutionBuilder: React.FC<SolutionBuilderProps> = ({
  caseData,
  slots,
  onUpdateSlot,
  onClearSlots,
  badSlots,
  feedback,
  solvedStats,
  onCheckSolution,
  onNextCase,
  hasNextCase,
}) => {
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{
    word: string;
    x: number;
    y: number;
  } | null>(null);

  const slotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const usedWords = new Set(slots.filter((w): w is string => Boolean(w)));
  const availableTiles = caseData.solutionSpec.tilePool.filter((t) => !usedWords.has(t));

  const placeWord = (word: string, explicitSlot?: number) => {
    if (solvedStats) return;
    if (typeof explicitSlot === 'number' && explicitSlot >= 0) {
      onUpdateSlot(explicitSlot, word);
      setSelectedSlotIdx(null);
      return;
    }
    if (selectedSlotIdx !== null) {
      onUpdateSlot(selectedSlotIdx, word);
      setSelectedSlotIdx(null);
      return;
    }
    const firstEmpty = slots.findIndex((s) => s === null);
    if (firstEmpty >= 0) {
      onUpdateSlot(firstEmpty, word);
    }
  };

  const handleTilePointerDown = (e: React.PointerEvent<HTMLButtonElement>, word: string) => {
    if (solvedStats) return;
    // Allow normal keyboard Enter/Space without pointer interference
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = 0;

    const onMove = (ev: PointerEvent) => {
      moved = Math.max(moved, Math.hypot(ev.clientX - startX, ev.clientY - startY));
      if (moved >= 8) {
        setDragState({ word, x: ev.clientX, y: ev.clientY });
      }
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      setDragState(null);

      if (moved < 8) {
        // Treated as tap!
        placeWord(word);
        return;
      }

      // Check which slot element lies under drop coordinates
      const hitIdx = slotRefs.current.findIndex((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
          ev.clientX >= rect.left - 8 &&
          ev.clientX <= rect.right + 8 &&
          ev.clientY >= rect.top - 8 &&
          ev.clientY <= rect.bottom + 8
        );
      });
      if (hitIdx >= 0) {
        placeWord(word, hitIdx);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <section
      aria-label="Lösungssatz zusammenbauen"
      className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 sm:p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-[#241C16] dark:text-[#F2ECE1]">
            Lösungssatz auf Latein
          </h3>
          <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            Ziehe die passenden Wortbausteine in die Lücken oder tippe sie an. Achte auf die Endungen!
          </p>
        </div>
        {!solvedStats && usedWords.size > 0 && (
          <button
            type="button"
            onClick={onClearSlots}
            className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-[#EFE8DA] dark:hover:bg-[#2B241F] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Zurücksetzen</span>
          </button>
        )}
      </div>

      {/* Sentence Template with Slots */}
      <div className="rounded-xl bg-[#F7F3EA] dark:bg-[#191512] border border-[#DED4C3] dark:border-[#3A312A] p-4 flex flex-wrap items-center gap-2.5 font-display text-xl sm:text-2xl italic text-[#241C16] dark:text-[#F2ECE1]">
        {caseData.solutionSpec.parts.map((part, idx) => {
          if (part.type === 'text') {
            return (
              <span key={`t-${idx}`} className="leading-relaxed">
                {part.value}
              </span>
            );
          }

          const slotIdx = part.slotIndex;
          const slotMeta = caseData.solutionSpec.slots[slotIdx];
          const val = slots[slotIdx];
          const isBad = badSlots.includes(slotIdx);
          const isSelected = selectedSlotIdx === slotIdx;

          return (
            <button
              key={`s-${slotIdx}`}
              ref={(el) => {
                slotRefs.current[slotIdx] = el;
              }}
              type="button"
              disabled={Boolean(solvedStats)}
              onClick={() => {
                if (val) {
                  onUpdateSlot(slotIdx, null);
                } else {
                  setSelectedSlotIdx(isSelected ? null : slotIdx);
                }
              }}
              aria-label={
                val
                  ? `${slotMeta.roleLabelDe}: ${val} (zum Entfernen antippen)`
                  : `Leere Lücke für ${slotMeta.roleLabelDe}`
              }
              className={`min-w-[104px] min-h-[44px] px-3 py-1.5 rounded-xl font-sans not-italic text-base font-bold border-2 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                solvedStats
                  ? 'border-[#266B47] bg-[#EAF5EE] dark:bg-[#193325] text-[#1E5B3A] dark:text-[#7CD3A2]'
                  : isBad
                  ? 'border-[#9B2C2C] bg-[#FBEAEA] dark:bg-[#3A1B1A] text-[#9B2C2C] dark:text-[#F2918B]'
                  : isSelected
                  ? 'border-[#9B2C2C] bg-[#FFFDF8] dark:bg-[#2B241F] ring-2 ring-[#9B2C2C]/30 text-[#241C16] dark:text-[#F2ECE1]'
                  : val
                  ? 'border-[#B47B2B] bg-[#FFFDF8] dark:bg-[#2B241F] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                  : 'border-dashed border-[#B47B2B]/80 bg-[#FFFDF8]/60 dark:bg-[#221D19]/60 text-[#7A695A] dark:text-[#A49483]'
              }`}
            >
              {isBad && <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{val ?? slotMeta.roleLabelDe.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Tile Pool */}
      {!solvedStats && (
        <div aria-label="Wortbausteine" className="flex flex-wrap gap-2">
          {availableTiles.map((word) => (
            <button
              key={word}
              type="button"
              onPointerDown={(e) => handleTilePointerDown(e, word)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  placeWord(word);
                }
              }}
              className="touch-none select-none min-h-[44px] px-4 py-2 rounded-xl bg-[#2A2018] dark:bg-[#EFE8DA] text-[#FFF8EA] dark:text-[#241C16] font-display font-semibold text-base shadow-sm hover:bg-[#9B2C2C] dark:hover:bg-[#D99341] hover:text-white dark:hover:text-[#161311] active:scale-95 transition-all cursor-grab"
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Floating Ghost Tile during Pointer Drag */}
      {dragState && (
        <div
          style={{ left: dragState.x, top: dragState.y }}
          className="fixed z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-4 py-2 rounded-xl bg-[#9B2C2C] text-white font-display font-semibold text-base shadow-xl"
        >
          {dragState.word}
        </div>
      )}

      {/* Grammatical Error Hints / Feedback */}
      {feedback && !solvedStats && (
        <div
          role="alert"
          className={`rounded-xl border p-3.5 text-sm space-y-1 ${
            feedback.type === 'error'
              ? 'border-[#9B2C2C]/45 bg-[#FBEAEA] dark:bg-[#3A1B1A]/70 text-[#7D1E1E] dark:text-[#F6B4B0]'
              : 'border-[#C89342]/50 bg-[#FBF4E6] dark:bg-[#2F261A] text-[#5E4014] dark:text-[#F0CF9B]'
          }`}
        >
          {feedback.messages.map((msg, i) => (
            <p key={i} className="flex items-start gap-2">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{msg}</span>
            </p>
          ))}
        </div>
      )}

      {/* Check Button or Solved Epilogue */}
      {!solvedStats ? (
        <button
          type="button"
          onClick={onCheckSolution}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white font-semibold text-base shadow-sm active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          <span>Lösung prüfen</span>
        </button>
      ) : (
        <div className="rounded-2xl border border-[#266B47]/45 bg-[#EAF5EE] dark:bg-[#193325] p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CorneliusAvatarSvg className="w-12 h-12 shrink-0" />
              <div>
                <h4 className="font-display text-lg font-bold text-[#1E5B3A] dark:text-[#8BE0B0]">
                  Fall gelöst in {solvedStats.attempts} {solvedStats.attempts === 1 ? 'Versuch' : 'Versuchen'}!
                </h4>
                <p className="text-sm text-[#234E36] dark:text-[#C5EBD4]">
                  {caseData.solutionSpec.germanTranslation}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1" aria-label={`${solvedStats.stars} von 3 Sternen`}>
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-6 h-6 ${
                    n <= solvedStats.stars
                      ? 'fill-[#D99341] text-[#B47B2B]'
                      : 'text-[#A3B8AB] dark:text-[#3D5949]'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-[#234E36] dark:text-[#D1F2DE]">
            {caseData.scenario.epilogueTemplateDe}
          </p>

          <button
            type="button"
            onClick={onNextCase}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#266B47] hover:bg-[#1E5638] text-white font-semibold text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>{hasNextCase ? 'Nächster Fall' : 'Neuen Zufallsfall ermitteln'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
};
