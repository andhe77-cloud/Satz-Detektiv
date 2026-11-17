import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Dumbbell, Lock, Play } from 'lucide-react';
import { DifficultyStage, GrammarFocus, PlayerProgress } from '../../core/types';
import {
  CASE_ENDINGS_MATRIX,
  GRAMMAR_GLOSSARY,
  GlossaryEntry,
  getUnlockedGlossaryCount,
  isGlossaryEntryUnlocked,
} from '../../latin/grammarGlossary';

type GlossaryFilter = 'all' | 'unlocked' | 'locked';

interface GlossaryViewProps {
  progress: PlayerProgress;
  onNavigateToCases: () => void;
  onStartStage: (stage: DifficultyStage) => void;
  onStartFocusedPractice: (focus: GrammarFocus, stage: DifficultyStage) => void;
}

const CASE_COLUMNS: Array<{
  focus: 'nominative' | 'accusative' | 'dative' | 'ablative';
  labelDe: string;
  stage: DifficultyStage;
}> = [
  { focus: 'nominative', labelDe: 'Nominativ (Wer?)', stage: 1 },
  { focus: 'accusative', labelDe: 'Akkusativ (Wen?)', stage: 1 },
  { focus: 'dative', labelDe: 'Dativ (Wem?)', stage: 3 },
  { focus: 'ablative', labelDe: 'Ablativ (Wo?)', stage: 4 },
];

function renderHighlightedSentence(latin: string, highlight: string) {
  const idx = latin.indexOf(highlight);
  if (idx === -1) {
    return <span className="font-display italic">{latin}</span>;
  }
  const before = latin.slice(0, idx);
  const after = latin.slice(idx + highlight.length);
  return (
    <span className="font-display italic">
      {before}
      <strong className="not-italic font-bold text-[#9B2C2C] dark:text-[#E06C65] underline decoration-[#C89342]/60 underline-offset-4">
        {highlight}
      </strong>
      {after}
    </span>
  );
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  progress,
  onNavigateToCases,
  onStartStage,
  onStartFocusedPractice,
}) => {
  const [filter, setFilter] = useState<GlossaryFilter>('all');

  const unlockedCount = getUnlockedGlossaryCount(progress);
  const totalCount = GRAMMAR_GLOSSARY.length;

  const initialFocus = useMemo(() => {
    const firstUnlocked = GRAMMAR_GLOSSARY.find((e) => isGlossaryEntryUnlocked(progress, e.focus));
    return firstUnlocked?.focus ?? GRAMMAR_GLOSSARY[0].focus;
  }, [progress]);

  const [selectedFocus, setSelectedFocus] = useState<GrammarFocus>(initialFocus);

  const visibleEntries = useMemo(() => {
    return GRAMMAR_GLOSSARY.filter((entry) => {
      const unlocked = isGlossaryEntryUnlocked(progress, entry.focus);
      if (filter === 'unlocked') return unlocked;
      if (filter === 'locked') return !unlocked;
      return true;
    });
  }, [filter, progress]);

  const activeEntry: GlossaryEntry = useMemo(() => {
    return (
      visibleEntries.find((e) => e.focus === selectedFocus) ??
      visibleEntries[0] ??
      GRAMMAR_GLOSSARY.find((e) => e.focus === selectedFocus) ??
      GRAMMAR_GLOSSARY[0]
    );
  }, [visibleEntries, selectedFocus]);

  const activeUnlocked = isGlossaryEntryUnlocked(progress, activeEntry.focus);
  const activeStats = progress.grammarStats[activeEntry.focus];
  const pct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      {/* Header & Unlock Progress */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1] text-balance">
            Grammatik-Glossar & Endungen
          </h1>
          <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA] max-w-2xl">
            Jeder gelöste Fall schaltet die darin vorkommenden lateinischen Regeln, Signalwörter und Kasus-Endungen als Nachschlagewerk frei.
          </p>
        </div>

        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] px-4 py-3 min-w-[230px] space-y-1.5">
          <div className="flex items-baseline justify-between gap-4 text-xs">
            <span className="font-semibold text-[#6A5A4C] dark:text-[#B9AA98]">
              Freigeschaltet
            </span>
            <span className="font-mono-tab font-bold text-[#241C16] dark:text-[#F2ECE1]">
              {unlockedCount} / {totalCount} Regeln ({pct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#EFE8DA] dark:bg-[#161311] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#9B2C2C] dark:bg-[#E06C65] transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Empty-Progress Guidance when 0 rules are unlocked */}
      {unlockedCount === 0 && (
        <section className="rounded-2xl border border-[#C89342] bg-[#FFFDF8] dark:bg-[#221D19] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-[#241C16] dark:text-[#F2ECE1]">
              Dein Ermittler-Glossar ist noch leer
            </h2>
            <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
              Löse deinen ersten Fall in Kapitel 1 oder über den Tagesfall – direkt danach erscheinen hier automatisch die ersten Endungen für Nominativ und Akkusativ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartStage(1)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>Fall der Stufe 1 starten</span>
          </button>
        </section>
      )}

      {/* Two-Zone Grammar Explorer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Filter + Rule List */}
        <div className="lg:col-span-4 space-y-3">
          <div
            role="tablist"
            aria-label="Glossar-Filter"
            className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#221D19] border border-[#DED4C3] dark:border-[#3A312A]"
          >
            {(
              [
                { id: 'all', label: `Alle (${totalCount})` },
                { id: 'unlocked', label: `Offen (${unlockedCount})` },
                { id: 'locked', label: `Zu (${totalCount - unlockedCount})` },
              ] as Array<{ id: GlossaryFilter; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                    : 'text-[#4A3D33] dark:text-[#B9AA98] hover:text-[#241C16] dark:hover:text-[#F2ECE1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {visibleEntries.length === 0 ? (
            <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 text-sm text-[#6A5A4C] dark:text-[#B9AA98]">
              {filter === 'unlocked'
                ? 'Noch keine Regeln freigeschaltet. Löse zuerst einen Fall.'
                : 'Glückwunsch! Du hast bereits alle 7 Grammatik-Regeln freigeschaltet.'}
            </div>
          ) : (
            <div className="space-y-2">
              {visibleEntries.map((entry) => {
                const unlocked = isGlossaryEntryUnlocked(progress, entry.focus);
                const isSelected = activeEntry.focus === entry.focus;
                const stat = progress.grammarStats[entry.focus];

                return (
                  <button
                    key={entry.focus}
                    type="button"
                    onClick={() => setSelectedFocus(entry.focus)}
                    className={`w-full min-h-[60px] text-left rounded-xl border p-3.5 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#9B2C2C] dark:border-[#E06C65] bg-[#FFFDF8] dark:bg-[#221D19] shadow-sm'
                        : 'border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8]/70 dark:bg-[#1B1714] hover:border-[#9B2C2C]/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-[#6A5A4C] dark:text-[#B9AA98]">
                        Stufe {entry.stage} · {entry.questionWordDe}
                      </div>
                      <div
                        className={`font-display text-base font-bold truncate ${
                          unlocked
                            ? 'text-[#241C16] dark:text-[#F2ECE1]'
                            : 'text-[#6A5A4C] dark:text-[#B9AA98]'
                        }`}
                      >
                        {entry.titleDe}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold">
                      {unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[#1E5B3A] dark:text-[#7CD3A2]">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span className="font-mono-tab">{stat.successes}×</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#8B7B6B] dark:text-[#9A8B7A]">
                          <Lock className="w-4 h-4" aria-hidden="true" />
                          <span>Versiegelt</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Zone: Rule Detail Sheet */}
        <div className="lg:col-span-8 rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EFE8DA] dark:border-[#322A23] pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                <span className="font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
                  Stufe {activeEntry.stage}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeEntry.questionWordDe}</span>
                <span aria-hidden="true">·</span>
                {activeUnlocked ? (
                  <span className="font-mono-tab text-[#1E5B3A] dark:text-[#7CD3A2] font-semibold">
                    Freigeschaltet ({activeStats.successes}× in gelösten Fällen)
                  </span>
                ) : (
                  <span>Noch versiegelt</span>
                )}
              </div>
              <h2 className="font-display text-2xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
                {activeEntry.titleDe}
              </h2>
            </div>

            {activeUnlocked && (
              <button
                type="button"
                onClick={() => onStartFocusedPractice(activeEntry.focus, activeEntry.stage)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] hover:border-[#9B2C2C] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Dumbbell className="w-3.5 h-3.5 text-[#9B2C2C] dark:text-[#E06C65]" aria-hidden="true" />
                <span>Gezielt üben</span>
              </button>
            )}
          </div>

          {!activeUnlocked ? (
            <div className="py-6 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#6A5A4C] dark:text-[#B9AA98]" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg font-bold text-[#241C16] dark:text-[#F2ECE1]">
                    Eintrag noch nicht freigeschaltet
                  </h3>
                  <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA] leading-relaxed max-w-xl">
                    Die vollständige Endungs-Tabelle, Signalwörter und Detektiv-Beispiele zu{' '}
                    <strong>{activeEntry.titleDe}</strong> schaltest du frei, sobald du einen Fall
                    der <strong>Stufe {activeEntry.stage}</strong> (oder mit diesem Grammatik-Schwerpunkt) erfolgreich löst.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onStartStage(activeEntry.stage)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>Fall der Stufe {activeEntry.stage} starten</span>
                </button>
                <button
                  type="button"
                  onClick={onNavigateToCases}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] hover:border-[#9B2C2C] text-sm font-semibold text-[#241C16] dark:text-[#F2ECE1] cursor-pointer"
                >
                  Zur Fallübersicht
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rule Explanation & Detective Tip */}
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-[#241C16] dark:text-[#F2ECE1] leading-relaxed">
                  {activeEntry.summaryDe}
                </p>
                <div className="rounded-xl border border-[#C89342]/60 bg-[#F7F3EA]/80 dark:bg-[#161311] p-3.5 text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
                  <span className="font-bold text-[#9B2C2C] dark:text-[#E06C65] mr-1.5">
                    Detektiv-Hinweis:
                  </span>
                  {activeEntry.detectiveTipDe}
                </div>
              </div>

              {/* Endings Table (Cases) */}
              {activeEntry.endingsTable && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-[#6A5A4C] dark:text-[#B9AA98]">
                    Endungen nach Deklination
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-[#DED4C3] dark:border-[#3A312A]">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                          <th className="py-2.5 px-3.5 font-semibold">Deklination</th>
                          <th className="py-2.5 px-3.5 font-semibold">Endung</th>
                          <th className="py-2.5 px-3.5 font-semibold">Lateinisches Beispiel</th>
                          <th className="py-2.5 px-3.5 font-semibold">Bedeutung</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE8DA] dark:divide-[#2E2721]">
                        {activeEntry.endingsTable.map((row) => (
                          <tr key={row.declensionDe}>
                            <td className="py-2.5 px-3.5 font-medium text-[#241C16] dark:text-[#F2ECE1]">
                              {row.declensionDe}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono-tab font-bold text-[#9B2C2C] dark:text-[#E06C65]">
                              {row.ending}
                            </td>
                            <td className="py-2.5 px-3.5 font-display italic text-[#241C16] dark:text-[#F2ECE1]">
                              {row.exampleLatin}
                            </td>
                            <td className="py-2.5 px-3.5 text-[#4A3D33] dark:text-[#D5C9BA]">
                              {row.exampleDe}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pattern Rows (Verb forms / Particles) */}
              {activeEntry.patternRows && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-[#6A5A4C] dark:text-[#B9AA98]">
                    Erkennungsmerkmale & Muster
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-[#DED4C3] dark:border-[#3A312A]">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                          <th className="py-2.5 px-3.5 font-semibold">Signal / Endung</th>
                          <th className="py-2.5 px-3.5 font-semibold">Regel</th>
                          <th className="py-2.5 px-3.5 font-semibold">Beispiel</th>
                          <th className="py-2.5 px-3.5 font-semibold">Übersetzung</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE8DA] dark:divide-[#2E2721]">
                        {activeEntry.patternRows.map((row) => (
                          <tr key={row.marker}>
                            <td className="py-2.5 px-3.5 font-mono-tab font-bold text-[#9B2C2C] dark:text-[#E06C65] whitespace-nowrap">
                              {row.marker}
                            </td>
                            <td className="py-2.5 px-3.5 text-[#241C16] dark:text-[#F2ECE1]">
                              {row.patternDe}
                            </td>
                            <td className="py-2.5 px-3.5 font-display italic text-[#241C16] dark:text-[#F2ECE1]">
                              {row.exampleLatin}
                            </td>
                            <td className="py-2.5 px-3.5 text-[#4A3D33] dark:text-[#D5C9BA]">
                              {row.exampleDe}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Witness Sentence Examples */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-[#6A5A4C] dark:text-[#B9AA98]">
                  So begegnet dir diese Regel in Zeugenaussagen
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeEntry.examples.map((ex) => (
                    <div
                      key={ex.latin}
                      className="rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/70 dark:bg-[#161311] p-3.5 space-y-1"
                    >
                      <div className="text-base text-[#241C16] dark:text-[#F2ECE1]">
                        {renderHighlightedSentence(ex.latin, ex.highlight)}
                      </div>
                      <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                        {ex.german}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Unlocked Case-Ending Comparison Matrix */}
      <section className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#9B2C2C] dark:text-[#E06C65]" aria-hidden="true" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
              Kasus-Endungen im Überblick (Singular)
            </h2>
          </div>
          <span className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            Versiegelte Spalten öffnen sich automatisch nach einem gelösten Fall der jeweiligen Stufe.
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#DED4C3] dark:border-[#3A312A]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                <th className="py-3 px-3.5 font-semibold">Deklination</th>
                {CASE_COLUMNS.map((col) => {
                  const unlocked = isGlossaryEntryUnlocked(progress, col.focus);
                  return (
                    <th key={col.focus} className="py-3 px-3.5 font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        {unlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5B3A] dark:text-[#7CD3A2]" aria-hidden="true" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-[#8B7B6B]" aria-hidden="true" />
                        )}
                        <span>{col.labelDe}</span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DA] dark:divide-[#2E2721]">
              {CASE_ENDINGS_MATRIX.map((row) => (
                <tr key={row.declensionDe}>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-[#241C16] dark:text-[#F2ECE1]">
                      {row.declensionDe}
                    </div>
                    <div className="text-xs font-display italic text-[#6A5A4C] dark:text-[#B9AA98]">
                      {row.exampleLemma}
                    </div>
                  </td>
                  {CASE_COLUMNS.map((col) => {
                    const unlocked = isGlossaryEntryUnlocked(progress, col.focus);
                    return (
                      <td key={col.focus} className="py-3 px-3.5">
                        {unlocked ? (
                          <span className="font-mono-tab text-xs sm:text-sm font-semibold text-[#241C16] dark:text-[#F2ECE1]">
                            {row.cases[col.focus]}
                          </span>
                        ) : (
                          <span className="text-xs text-[#8B7B6B] dark:text-[#9A8B7A]">
                            Versiegelt (Stufe {col.stage})
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
