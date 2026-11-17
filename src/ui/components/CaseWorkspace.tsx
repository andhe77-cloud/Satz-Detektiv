import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, HelpCircle, Info, X } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine';
import { solveCase, buildSearchSpace } from '../../core/solver';
import { TRUTH_RULES } from '../../core/truthRules';
import { CaseDefinition, GrammarFocus } from '../../core/types';
import { defaultLexicon, detectNounAmbiguities, inflectNounSingular } from '../../latin/inflector';
import { DeductionGrid, GridMark } from './DeductionGrid';
import { CHARACTERS, CorneliusAvatarSvg, WitnessMark } from './Illustrations';
import { SolutionBuilder } from './SolutionBuilder';
import { StageScene } from './StageScene';
import { VocabularyPanel } from './VocabularyPanel';

interface CaseWorkspaceProps {
  caseData: CaseDefinition;
  hasNextCase: boolean;
  onBack: () => void;
  onNextCase: () => void;
  onSolved: (result: {
    caseId: string;
    stars: number;
    attempts: number;
    grammarTags: GrammarFocus[];
  }) => void;
  onGrammarOutcome: (tags: GrammarFocus[], hadError: boolean) => void;
}

export const CaseWorkspace: React.FC<CaseWorkspaceProps> = ({
  caseData,
  hasNextCase,
  onBack,
  onNextCase,
  onSolved,
  onGrammarOutcome,
}) => {
  const [selectedWitness, setSelectedWitness] = useState(0);
  const [marks, setMarks] = useState<WitnessMark[]>(() =>
    new Array(caseData.witnessIds.length).fill('')
  );
  const [gridState, setGridState] = useState<Record<string, GridMark>>({});
  const [slots, setSlots] = useState<Array<string | null>>(() =>
    new Array(caseData.solutionSpec.slots.length).fill(null)
  );
  const [badSlots, setBadSlots] = useState<number[]>([]);
  const [translatedIndices, setTranslatedIndices] = useState<Record<number, boolean>>({});
  const [translationJokersLeft, setTranslationJokersLeft] = useState(2);
  const [revealedTruthIndices, setRevealedTruthIndices] = useState<Record<number, boolean>>({});
  const [truthJokersLeft, setTruthJokersLeft] = useState(1);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [jokersUsed, setJokersUsed] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success' | 'info';
    messages: string[];
  } | null>(null);
  const [solvedStats, setSolvedStats] = useState<{ stars: number; attempts: number } | null>(null);

  // Reset local workspace state whenever the active case changes
  useEffect(() => {
    setSelectedWitness(0);
    setMarks(new Array(caseData.witnessIds.length).fill(''));
    setGridState({});
    setSlots(new Array(caseData.solutionSpec.slots.length).fill(null));
    setBadSlots([]);
    setTranslatedIndices({});
    setTranslationJokersLeft(2);
    setRevealedTruthIndices({});
    setTruthJokersLeft(1);
    setVocabOpen(false);
    setShowIntro(true);
    setAttempts(0);
    setJokersUsed(0);
    setFeedback(null);
    setSolvedStats(null);
  }, [caseData.id, caseData.witnessIds.length, caseData.solutionSpec.slots.length]);

  const ruleInfo = TRUTH_RULES[caseData.truthRule];

  const handleSelectWitness = (idx: number) => {
    soundEngine.unlockAndMaybeStartMusic();
    soundEngine.playWitnessSelect();
    setSelectedWitness(idx);
  };

  const handleSetMark = (idx: number, mark: WitnessMark) => {
    soundEngine.unlockAndMaybeStartMusic();
    soundEngine.playMark(mark);
    setMarks((prev) => {
      const next = [...prev];
      next[idx] = mark;
      return next;
    });
  };

  const handleUseTranslationJoker = (idx: number) => {
    if (translatedIndices[idx] || translationJokersLeft <= 0) return;
    soundEngine.playHint();
    setTranslatedIndices((prev) => ({ ...prev, [idx]: true }));
    setTranslationJokersLeft((n) => n - 1);
    setJokersUsed((j) => j + 1);
  };

  const handleUseTruthJoker = (idx: number) => {
    if (revealedTruthIndices[idx] || truthJokersLeft <= 0) return;
    soundEngine.playHint();
    // Compute ground truth of statement `idx` on the unique solution
    const space = buildSearchSpace({
      suspects: caseData.witnessIds,
      items: caseData.candidateItems,
      requireGiver: Boolean(caseData.solution.giver),
      locations: caseData.candidateLocations,
    });
    // Evaluate statement directly using truth rule check on solution
    const stmt = caseData.statements[idx];
    const isActuallyTrue = (() => {
      // Quick solver evaluation on single assignment
      const res = solveCase({
        statements: [
          { speakerId: stmt.speakerId, ast: stmt.ast },
        ],
        truthRule: 'EXACTLY_ONE_TRUE',
        searchSpace: [caseData.solution],
      });
      return res.solutions.length === 1;
    })();

    setRevealedTruthIndices((prev) => ({ ...prev, [idx]: true }));
    setMarks((prev) => {
      const next = [...prev];
      next[idx] = isActuallyTrue ? 'true' : 'false';
      return next;
    });
    setTruthJokersLeft((n) => n - 1);
    setJokersUsed((j) => j + 2);
  };

  const handleToggleGridCell = (key: string) => {
    soundEngine.playWitnessSelect();
    const order: GridMark[] = ['', 'x', 'ok'];
    setGridState((prev) => {
      const curr = prev[key] ?? '';
      return { ...prev, [key]: order[(order.indexOf(curr) + 1) % 3] };
    });
  };

  const handleUpdateSlot = (slotIndex: number, word: string | null) => {
    if (word === null) soundEngine.playTileRemove();
    else soundEngine.playTilePlace();
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = word;
      return next;
    });
    setBadSlots([]);
    setFeedback(null);
  };

  const diagnoseWordMismatch = (placedWord: string, slotIndex: number): string => {
    const slot = caseData.solutionSpec.slots[slotIndex];
    // Check if placedWord is a different case form of the expected word or another lexicon noun
    for (const noun of defaultLexicon.nouns.values()) {
      for (const c of ['nom', 'acc', 'dat', 'abl'] as const) {
        if (inflectNounSingular(noun, c) === placedWord) {
          const detectedCases = detectNounAmbiguities(noun, c);
          if (placedWord !== slot.expectedWord) {
            // Check if the stem matches the expected word (pure case-ending mistake!)
            const expectedNoun = [...defaultLexicon.nouns.values()].find(
              (n) => inflectNounSingular(n, slot.expectedRole === 'accusative' ? 'acc' : slot.expectedRole === 'ablative' ? 'abl' : 'nom') === slot.expectedWord
            );
            if (expectedNoun && expectedNoun.id === noun.id) {
              const caseNames = detectedCases
                .map((cc) => ({ nom: 'Nominativ', gen: 'Genitiv', dat: 'Dativ', acc: 'Akkusativ', abl: 'Ablativ' }[cc]))
                .join('/');
              return `Lücke ${slotIndex + 1} (${slot.roleLabelDe}): „${placedWord}“ hat die richtige Vokabel, aber die falsche Endung (${caseNames})! ${slot.hintDe}`;
            }
          }
        }
      }
    }
    return `Lücke ${slotIndex + 1} (${slot.roleLabelDe}): Prüfe hier noch einmal Logik und Kasus-Endung. ${slot.hintDe}`;
  };

  const handleCheckSolution = () => {
    soundEngine.unlockAndMaybeStartMusic();
    if (slots.some((s) => s === null)) {
      soundEngine.playError();
      setFeedback({
        type: 'info',
        messages: ['Bitte fülle zuerst alle Lücken im Lösungssatz aus.'],
      });
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    const wrongIndices: number[] = [];
    const errorMessages: string[] = [];
    const errorTags: GrammarFocus[] = [];

    caseData.solutionSpec.slots.forEach((slot, idx) => {
      const placed = slots[idx]!;
      if (placed !== slot.expectedWord) {
        wrongIndices.push(idx);
        errorMessages.push(diagnoseWordMismatch(placed, idx));
        errorTags.push(slot.expectedRole);
      }
    });

    if (wrongIndices.length > 0) {
      soundEngine.playError();
      setBadSlots(wrongIndices);
      setFeedback({ type: 'error', messages: errorMessages });
      onGrammarOutcome(errorTags, true);
      return;
    }

    // Solved! Calculate 1-3 stars based on attempts and jokers used
    const penalty = (nextAttempts - 1) + Math.floor(jokersUsed / 2);
    const stars = penalty === 0 ? 3 : penalty <= 2 ? 2 : 1;

    soundEngine.playSolved();
    setBadSlots([]);
    setFeedback(null);
    setSolvedStats({ stars, attempts: nextAttempts });
    onGrammarOutcome(caseData.difficultyMetrics.grammarTags, false);
    onSolved({
      caseId: caseData.id,
      stars,
      attempts: nextAttempts,
      grammarTags: caseData.difficultyMetrics.grammarTags,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Case Bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98] hover:text-[#9B2C2C] dark:hover:text-[#E06C65] mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Zurück zur Fallübersicht</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1] text-balance">
            {caseData.titleDe}
          </h1>
          <p className="mt-1 text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
            {caseData.questionDe}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            <span className="font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
              Stufe {caseData.stage}
            </span>
            <span aria-hidden="true">·</span>
            <span>Wahrheitsregel: <strong className="text-[#241C16] dark:text-[#F2ECE1]">{ruleInfo.shortRuleDe}</strong></span>
          </div>
        </div>
      </div>

      {/* Dismissible Kommissar Cornelius Intro */}
      {showIntro && (
        <div className="rounded-2xl border border-[#C89342]/55 bg-[#FFFDF8] dark:bg-[#221D19] p-3.5 sm:p-4 flex items-start gap-3 shadow-sm">
          <CorneliusAvatarSvg className="w-12 h-12 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#9B2C2C] dark:text-[#E06C65]">
              Kommissar Cornelius
            </div>
            <p className="text-sm text-[#241C16] dark:text-[#F2ECE1] mt-0.5 leading-relaxed">
              {caseData.scenario.introCorneliusDe}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            aria-label="Intro-Hinweis ausblenden"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Responsive 2-Column Desktop Layout / Stacked Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Primary Column: Stage + Solution Builder */}
        <div className="lg:col-span-7 space-y-5">
          <StageScene
            caseData={caseData}
            selectedWitness={selectedWitness}
            onSelectWitness={handleSelectWitness}
            marks={marks}
            onSetMark={handleSetMark}
            translatedIndices={translatedIndices}
            translationJokersLeft={translationJokersLeft}
            onUseTranslationJoker={handleUseTranslationJoker}
            revealedTruthIndices={revealedTruthIndices}
            truthJokersLeft={truthJokersLeft}
            onUseTruthJoker={handleUseTruthJoker}
            onToggleVocab={() => {
              soundEngine.playWitnessSelect();
              setVocabOpen((o) => !o);
            }}
            vocabOpen={vocabOpen}
          />

          {vocabOpen && (
            <VocabularyPanel caseData={caseData} onClose={() => setVocabOpen(false)} />
          )}

          <SolutionBuilder
            caseData={caseData}
            slots={slots}
            onUpdateSlot={handleUpdateSlot}
            onClearSlots={() => {
              soundEngine.playTileRemove();
              setSlots(new Array(caseData.solutionSpec.slots.length).fill(null));
              setBadSlots([]);
              setFeedback(null);
            }}
            badSlots={badSlots}
            feedback={feedback}
            solvedStats={solvedStats}
            onCheckSolution={handleCheckSolution}
            onNextCase={onNextCase}
            hasNextCase={hasNextCase}
          />
        </div>

        {/* Right/Secondary Column: Rule Reminder, Witness Summary, Deduction Grid */}
        <div className="lg:col-span-5 space-y-4">
          {/* Truth Rule Card */}
          <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#9B2C2C] dark:text-[#E06C65] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-[#241C16] dark:text-[#F2ECE1]">
                  Wahrheitsregel: {ruleInfo.titleDe}
                </h2>
                <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] mt-0.5 leading-relaxed">
                  {ruleInfo.descriptionDe} Tippe in der Sprechblase auf jedes beliebige lateinische Wort, um Grammatik und Bedeutung anzuzeigen.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Witness Statements Overview */}
          <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 shadow-sm">
            <h3 className="font-display text-base font-semibold text-[#241C16] dark:text-[#F2ECE1] mb-2.5">
              Alle Zeugenaussagen im Überblick
            </h3>
            <ul className="space-y-1.5">
              {caseData.statements.map((stmt, idx) => {
                const ch = CHARACTERS[stmt.speakerId];
                const m = marks[idx];
                const active = idx === selectedWitness;
                return (
                  <li key={stmt.speakerId}>
                    <button
                      type="button"
                      onClick={() => handleSelectWitness(idx)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 border transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                        active
                          ? 'border-[#9B2C2C] bg-[#EFE8DA]/70 dark:bg-[#2B241F]'
                          : 'border-transparent hover:bg-[#F7F3EA] dark:hover:bg-[#1C1815]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#9B2C2C] dark:text-[#E06C65]">
                          {ch?.name ?? stmt.speakerId}
                        </div>
                        <div className="font-display italic text-sm text-[#241C16] dark:text-[#F2ECE1]">
                          „{stmt.latinText}“
                        </div>
                        {translatedIndices[idx] && (
                          <div className="text-xs text-[#2A4B7C] dark:text-[#89B0E6] mt-0.5">
                            {stmt.germanText}
                          </div>
                        )}
                      </div>
                      <span
                        className={`shrink-0 mt-0.5 inline-flex items-center gap-1 text-xs font-semibold ${
                          m === 'true'
                            ? 'text-[#1E5B3A] dark:text-[#7CD3A2]'
                            : m === 'false'
                            ? 'text-[#9B2C2C] dark:text-[#F2918B]'
                            : 'text-[#8B7B6B]'
                        }`}
                      >
                        {m === 'true' ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Wahr</span>
                          </>
                        ) : m === 'false' ? (
                          <>
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Falsch</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Offen</span>
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Interactive Deduction Grid */}
          <DeductionGrid
            caseData={caseData}
            gridState={gridState}
            onToggleCell={handleToggleGridCell}
            onResetGrid={() => setGridState({})}
          />
        </div>
      </div>
    </div>
  );
};
