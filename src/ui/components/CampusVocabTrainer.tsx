import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, RotateCcw, Search, XCircle } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine';
import { CampusCard, CampusLessonRange, CaseForm, NounEntry, PlayerProgress } from '../../core/types';
import { CAMPUS_CARDS } from '../../latin/campusLexicon';
import { inflectNounSingular } from '../../latin/inflector';
import { LessonRangeSlider } from './LessonRangeSlider';

interface CampusVocabTrainerProps {
  progress: PlayerProgress;
  lessonRange: CampusLessonRange;
  onChangeLessonRange: (range: CampusLessonRange) => void;
  onRecordResult: (cardId: string, correct: boolean) => void;
  onResetCampusProgress: () => void;
}

type TrainerMode = 'meaning' | 'cases' | 'browse';
type PosFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'other';

const CASE_QUIZ_TARGETS: Array<{ caseForm: CaseForm; labelDe: string; questionHintDe: string }> = [
  { caseForm: 'acc', labelDe: 'Akkusativ Singular', questionHintDe: 'Wen oder was?' },
  { caseForm: 'dat', labelDe: 'Dativ Singular', questionHintDe: 'Wem?' },
  { caseForm: 'abl', labelDe: 'Ablativ Singular', questionHintDe: 'Wo / womit? (z. B. nach in/cum)' },
];

const POS_LABELS: Record<CampusCard['pos'], string> = {
  noun: 'Nomen',
  verb: 'Verb',
  adjective: 'Adjektiv',
  other: 'Wort / Wendung',
};

function getCaseExplanation(noun: NounEntry, targetCase: CaseForm): string {
  const form = inflectNounSingular(noun, targetCase);
  const declName: Record<NounEntry['declension'], string> = {
    a: 'a-Deklination',
    'o-masc': 'o-Deklination (m.)',
    'o-er': 'o-Deklination auf -er',
    'o-neut': 'o-Deklination (n.)',
    cons: 'konsonantische Deklination (3.)',
    'cons-i': 'i-Stamm (3. Deklination)',
  };
  const caseName: Record<CaseForm, string> = {
    nom: 'Nominativ',
    gen: 'Genitiv',
    dat: 'Dativ',
    acc: 'Akkusativ',
    abl: 'Ablativ',
  };
  return `${declName[noun.declension]} · ${caseName[targetCase]} Singular lautet „${form}“.`;
}

function buildCaseDistractors(noun: NounEntry, targetCase: CaseForm): string[] {
  const correct = inflectNounSingular(noun, targetCase);
  const candidates = new Set<string>([correct]);

  // Add real other cases of the same noun
  (['nom', 'gen', 'dat', 'acc', 'abl'] as CaseForm[]).forEach((c) => {
    const f = inflectNounSingular(noun, c);
    if (f !== correct) candidates.add(f);
  });

  // Add plausible wrong-declension stem traps
  const s = noun.stem;
  const traps = [
    `${s}am`,
    `${s}um`,
    `${s}em`,
    `${s}ae`,
    `${s}o`,
    `${s}i`,
    `${s}e`,
    `${s}is`,
    `${s}a`,
  ];
  for (const t of traps) {
    if (candidates.size >= 4) break;
    if (t !== correct) candidates.add(t);
  }

  const distractors = [...candidates].filter((x) => x !== correct).slice(0, 3);
  return [correct, ...distractors];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const CampusVocabTrainer: React.FC<CampusVocabTrainerProps> = ({
  progress,
  lessonRange,
  onChangeLessonRange,
  onRecordResult,
  onResetCampusProgress,
}) => {
  const [posFilter, setPosFilter] = useState<PosFilter>('all');
  const [mode, setMode] = useState<TrainerMode>('meaning');
  const [searchQuery, setSearchQuery] = useState('');
  const [browseLimit, setBrowseLimit] = useState(50);

  const [questionSeed, setQuestionSeed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sessionStreak, setSessionStreak] = useState(0);

  const masteredSet = useMemo(
    () => new Set(progress.campusStats?.masteredIds ?? []),
    [progress.campusStats?.masteredIds]
  );
  const wrongSet = useMemo(
    () => new Set(progress.campusStats?.wrongIds ?? []),
    [progress.campusStats?.wrongIds]
  );

  const rangeCards = useMemo(() => {
    return CAMPUS_CARDS.filter(
      (card) => card.maxLesson > lessonRange.from && card.maxLesson <= lessonRange.to
    );
  }, [lessonRange.from, lessonRange.to]);

  const filteredCards = useMemo(() => {
    if (posFilter === 'all') return rangeCards;
    return rangeCards.filter((card) => card.pos === posFilter);
  }, [rangeCards, posFilter]);

  const handleRangeChange = (next: CampusLessonRange) => {
    onChangeLessonRange(next);
    setSelectedAnswer(null);
    setBrowseLimit(50);
  };

  const declinableCards = useMemo(
    () => filteredCards.filter((c) => Boolean(c.nounMeta)),
    [filteredCards]
  );

  // Pick next Meaning quiz card (prioritize wrongSet, then unseen, then mastered)
  const currentMeaningQuestion = useMemo(() => {
    if (filteredCards.length === 0) return null;
    const poolWrong = filteredCards.filter((c) => wrongSet.has(c.id));
    const poolUnseen = filteredCards.filter((c) => !masteredSet.has(c.id) && !wrongSet.has(c.id));
    const activePool =
      poolWrong.length > 0 ? poolWrong : poolUnseen.length > 0 ? poolUnseen : filteredCards;

    const card = activePool[Math.floor((questionSeed * 7 + activePool.length * 3) % activePool.length) % activePool.length]
      ?? activePool[0];
    // Randomize card pick nicely using questionSeed + Math.random when advancing
    const picked =
      activePool[
        Math.abs(questionSeed * 2654435761) % activePool.length
      ];
    const targetCard = picked ?? card;

    // Pick 3 distractors preferably with same POS
    const samePos = CAMPUS_CARDS.filter(
      (c) => c.id !== targetCard.id && c.pos === targetCard.pos && c.back !== targetCard.back
    );
    const fallbackPool = CAMPUS_CARDS.filter(
      (c) => c.id !== targetCard.id && c.back !== targetCard.back
    );
    const distractorSource = samePos.length >= 3 ? samePos : fallbackPool;
    const distractors: string[] = [];
    const step = Math.max(1, Math.floor(distractorSource.length / 7));
    let idx = (questionSeed * 13 + 5) % distractorSource.length;
    let guard = 0;
    while (distractors.length < 3 && guard < distractorSource.length) {
      const candidate = distractorSource[idx % distractorSource.length].back;
      if (!distractors.includes(candidate) && candidate !== targetCard.back) {
        distractors.push(candidate);
      }
      idx += step;
      guard++;
    }

    const options = shuffleArray([targetCard.back, ...distractors]);
    return { card: targetCard, options };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCards, questionSeed]);

  // Pick next Case-ending quiz card
  const currentCaseQuestion = useMemo(() => {
    if (declinableCards.length === 0) return null;
    const poolWrong = declinableCards.filter((c) => wrongSet.has(c.id));
    const poolUnseen = declinableCards.filter((c) => !masteredSet.has(c.id) && !wrongSet.has(c.id));
    const activePool =
      poolWrong.length > 0 ? poolWrong : poolUnseen.length > 0 ? poolUnseen : declinableCards;

    const card = activePool[Math.abs(questionSeed * 2654435761) % activePool.length];
    const targetInfo = CASE_QUIZ_TARGETS[questionSeed % CASE_QUIZ_TARGETS.length];
    const meta = card.nounMeta!;
    const noun: NounEntry = {
      id: card.id,
      lemma: meta.lemma,
      genitive: meta.genitive,
      stem: meta.stem,
      declension: meta.declension,
      gender: meta.gender,
      meaningDe: card.back,
      category: 'item',
      lesson: card.maxLesson,
    };
    const expected = inflectNounSingular(noun, targetInfo.caseForm);
    const options = shuffleArray(buildCaseDistractors(noun, targetInfo.caseForm));
    return { card, noun, targetInfo, expected, options };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [declinableCards, questionSeed]);

  const browseResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredCards;
    return filteredCards.filter(
      (c) => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
    );
  }, [filteredCards, searchQuery]);

  const handleSelectMeaning = (choice: string) => {
    if (!currentMeaningQuestion || selectedAnswer !== null) return;
    const isCorrect = choice === currentMeaningQuestion.card.back;
    setSelectedAnswer(choice);
    if (isCorrect) {
      soundEngine.playSolved();
      setSessionStreak((s) => s + 1);
    } else {
      soundEngine.playError();
      setSessionStreak(0);
    }
    onRecordResult(currentMeaningQuestion.card.id, isCorrect);
  };

  const handleSelectCase = (choice: string) => {
    if (!currentCaseQuestion || selectedAnswer !== null) return;
    const isCorrect = choice === currentCaseQuestion.expected;
    setSelectedAnswer(choice);
    if (isCorrect) {
      soundEngine.playSolved();
      setSessionStreak((s) => s + 1);
    } else {
      soundEngine.playError();
      setSessionStreak(0);
    }
    onRecordResult(currentCaseQuestion.card.id, isCorrect);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setQuestionSeed((n) => n + 1 + Math.floor(Math.random() * 7));
  };

  const masteredInScope = filteredCards.filter((c) => masteredSet.has(c.id)).length;

  return (
    <div className="space-y-6">
      {/* Header & Summary Stats */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
            Campus C1&2 Vokabel- & Formen-Check
          </h2>
          <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA] mt-1">
            Alle {CAMPUS_CARDS.length} Vokabeln aus Lektion 1–68 nachschlagen, übersetzen oder im Kasus beugen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6A5A4C] dark:text-[#B9AA98] font-mono-tab">
          <span>
            Auswahl: <strong className="text-[#241C16] dark:text-[#F2ECE1]">{filteredCards.length}</strong> Karten
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Sicher: <strong className="text-[#1E5B3A] dark:text-[#7CD3A2]">{masteredInScope}</strong>
          </span>
          {sessionStreak > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Serie: <strong className="text-[#9B2C2C] dark:text-[#E06C65]">{sessionStreak}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Controls: Dual-Thumb Range Slider + Mode Tabs */}
      <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 sm:p-5 space-y-4">
        <LessonRangeSlider
          value={lessonRange}
          onChange={handleRangeChange}
          cardCount={rangeCards.length}
        />

        {/* Mode & POS Filters */}
        <div className="pt-3 border-t border-[#EFE8DA] dark:border-[#322A23] flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#161311]">
            <button
              type="button"
              onClick={() => {
                setMode('meaning');
                setSelectedAnswer(null);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'meaning'
                  ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                  : 'text-[#4A3D33] dark:text-[#B9AA98]'
              }`}
            >
              Vokabel-Quiz
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('cases');
                setSelectedAnswer(null);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'cases'
                  ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                  : 'text-[#4A3D33] dark:text-[#B9AA98]'
              }`}
            >
              Kasus-Formen ({declinableCards.length} Nomen)
            </button>
            <button
              type="button"
              onClick={() => setMode('browse')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'browse'
                  ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                  : 'text-[#4A3D33] dark:text-[#B9AA98]'
              }`}
            >
              Wortschatzliste
            </button>
          </div>

          {mode !== 'cases' && (
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'all', label: 'Alle' },
                  { id: 'noun', label: 'Nomen' },
                  { id: 'verb', label: 'Verben' },
                  { id: 'adjective', label: 'Adjektive' },
                  { id: 'other', label: 'Sonstige' },
                ] as Array<{ id: PosFilter; label: string }>
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPosFilter(p.id);
                    setSelectedAnswer(null);
                  }}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    posFilter === p.id
                      ? 'bg-[#241C16] text-white dark:bg-[#F2ECE1] dark:text-[#161311]'
                      : 'text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-[#EFE8DA] dark:hover:bg-[#2B241F]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mode 1: Meaning Quiz */}
      {mode === 'meaning' && (
        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 sm:p-6 shadow-sm space-y-5">
          {!currentMeaningQuestion ? (
            <p className="text-sm text-[#6A5A4C] dark:text-[#B9AA98]">
              Für diesen Filter wurden keine Karten gefunden. Wähle eine andere Wortart oder Lektion.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                  <span>Lektion {currentMeaningQuestion.card.band}</span>
                  <span aria-hidden="true">·</span>
                  <span>{POS_LABELS[currentMeaningQuestion.card.pos]}</span>
                  {wrongSet.has(currentMeaningQuestion.card.id) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#9B2C2C] dark:text-[#E06C65] font-semibold">
                        Wiederholung empfohlen
                      </span>
                    </>
                  )}
                </div>
                <div className="font-display italic text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
                  {currentMeaningQuestion.card.front}
                </div>
                <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                  Wähle die passende deutsche Übersetzung:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMeaningQuestion.options.map((opt) => {
                  const isCorrectOpt = opt === currentMeaningQuestion.card.back;
                  const isChosen = selectedAnswer === opt;
                  let style =
                    'border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/70 dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] hover:border-[#9B2C2C]';
                  if (selectedAnswer !== null) {
                    if (isCorrectOpt) {
                      style =
                        'border-[#266B47] bg-[#EAF5EE] dark:bg-[#193325] text-[#1E5B3A] dark:text-[#7CD3A2]';
                    } else if (isChosen) {
                      style =
                        'border-[#9B2C2C] bg-[#FBEAEA] dark:bg-[#3A1B1A] text-[#9B2C2C] dark:text-[#F2918B]';
                    } else {
                      style =
                        'border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/40 dark:bg-[#161311]/60 text-[#6A5A4C] dark:text-[#8B7B6B] opacity-70';
                    }
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={selectedAnswer !== null}
                      onClick={() => handleSelectMeaning(opt)}
                      className={`min-h-[52px] px-4 py-3 rounded-xl border text-left text-sm font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${style}`}
                    >
                      <span>{opt}</span>
                      {selectedAnswer !== null && isCorrectOpt && (
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      )}
                      {selectedAnswer !== null && isChosen && !isCorrectOpt && (
                        <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="pt-3 border-t border-[#EFE8DA] dark:border-[#322A23] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    {selectedAnswer === currentMeaningQuestion.card.back ? (
                      <span className="font-semibold text-[#1E5B3A] dark:text-[#7CD3A2]">
                        Richtig! Karte als sicher gemerkt.
                      </span>
                    ) : (
                      <span className="text-[#9B2C2C] dark:text-[#F2918B]">
                        Richtig wäre: <strong>{currentMeaningQuestion.card.back}</strong>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold cursor-pointer"
                  >
                    Nächste Karte
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Mode 2: Case Forms Quiz */}
      {mode === 'cases' && (
        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 sm:p-6 shadow-sm space-y-5">
          {!currentCaseQuestion ? (
            <p className="text-sm text-[#6A5A4C] dark:text-[#B9AA98]">
              In diesem Bereich gibt es keine deklinierbaren Nomen.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                  <span>Lektion {currentCaseQuestion.card.band}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Gesucht: <strong className="text-[#9B2C2C] dark:text-[#E06C65]">{currentCaseQuestion.targetInfo.labelDe}</strong> ({currentCaseQuestion.targetInfo.questionHintDe})
                  </span>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
                  <span className="italic">{currentCaseQuestion.noun.lemma}</span>,{' '}
                  <span className="italic font-medium text-[#6A5A4C] dark:text-[#B9AA98]">
                    {currentCaseQuestion.noun.genitive}
                  </span>{' '}
                  <span className="text-base font-normal text-[#6A5A4C] dark:text-[#B9AA98]">
                    ({currentCaseQuestion.noun.gender}.) — {currentCaseQuestion.card.back}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentCaseQuestion.options.map((opt) => {
                  const isCorrectOpt = opt === currentCaseQuestion.expected;
                  const isChosen = selectedAnswer === opt;
                  let style =
                    'border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/70 dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] hover:border-[#9B2C2C]';
                  if (selectedAnswer !== null) {
                    if (isCorrectOpt) {
                      style =
                        'border-[#266B47] bg-[#EAF5EE] dark:bg-[#193325] text-[#1E5B3A] dark:text-[#7CD3A2]';
                    } else if (isChosen) {
                      style =
                        'border-[#9B2C2C] bg-[#FBEAEA] dark:bg-[#3A1B1A] text-[#9B2C2C] dark:text-[#F2918B]';
                    } else {
                      style =
                        'border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/40 dark:bg-[#161311]/60 text-[#6A5A4C] opacity-70';
                    }
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={selectedAnswer !== null}
                      onClick={() => handleSelectCase(opt)}
                      className={`min-h-[52px] px-4 py-3 rounded-xl border font-display italic text-base font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-default ${style}`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="pt-3 border-t border-[#EFE8DA] dark:border-[#322A23] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
                    <span
                      className={`font-semibold mr-2 ${
                        selectedAnswer === currentCaseQuestion.expected
                          ? 'text-[#1E5B3A] dark:text-[#7CD3A2]'
                          : 'text-[#9B2C2C] dark:text-[#F2918B]'
                      }`}
                    >
                      {selectedAnswer === currentCaseQuestion.expected ? 'Genau richtig!' : 'Knapp daneben!'}
                    </span>
                    {getCaseExplanation(currentCaseQuestion.noun, currentCaseQuestion.targetInfo.caseForm)}
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold cursor-pointer"
                  >
                    Nächstes Nomen
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Mode 3: Browse & Search */}
      {mode === 'browse' && (
        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                className="w-4 h-4 text-[#8B7B6B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setBrowseLimit(50);
                }}
                placeholder="Latein oder Deutsch suchen (z. B. gladius, Schwert, 1-10)..."
                aria-label="Campus-Wortschatz durchsuchen"
                className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] text-sm text-[#241C16] dark:text-[#F2ECE1]"
              />
            </div>
            <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] font-mono-tab">
              {browseResults.length} Treffer
            </div>
          </div>

          <div className="divide-y divide-[#EFE8DA] dark:divide-[#2E2721]">
            {browseResults.slice(0, browseLimit).map((c) => (
              <div
                key={c.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4"
              >
                <div className="min-w-0">
                  <span className="font-display italic font-semibold text-[#9B2C2C] dark:text-[#E06C65] text-sm sm:text-base">
                    {c.front}
                  </span>
                  <span className="ml-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                    {c.band} · {POS_LABELS[c.pos]}
                  </span>
                </div>
                <div className="text-sm text-[#241C16] dark:text-[#F2ECE1] sm:text-right">
                  {c.back}
                </div>
              </div>
            ))}
          </div>

          {browseResults.length > browseLimit && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setBrowseLimit((n) => n + 80)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:border-[#9B2C2C] cursor-pointer"
              >
                Weitere Vokabeln laden ({browseResults.length - browseLimit} verbleibend)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subtle footer utility to reset Campus vocab mastery if needed */}
      {(progress.campusStats?.practicedCount ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {progress.campusStats.practicedCount} Campus-Abfragen absolviert ·{' '}
              {progress.campusStats.masteredIds.length} sicher beherrscht
            </span>
          </span>
          <button
            type="button"
            onClick={onResetCampusProgress}
            className="inline-flex items-center gap-1 text-xs font-semibold hover:text-[#9B2C2C] dark:hover:text-[#E06C65] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Campus-Lernstand zurücksetzen</span>
          </button>
        </div>
      )}
    </div>
  );
};
