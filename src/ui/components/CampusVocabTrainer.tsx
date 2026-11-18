import React, { useMemo, useState } from 'react';
import { Award, BookOpen, RotateCcw, Search, Star } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine';
import {
  CampusCard,
  CampusLessonRange,
  CaseForm,
  NounEntry,
  PlayerProgress,
} from '../../core/types';
import { CAMPUS_CARDS } from '../../latin/campusLexicon';
import { inflectNounSingular } from '../../latin/inflector';
import {
  BADGES,
  applyCampusOutcome,
  getCampusCareerStars,
  getNextCampusMilestone,
} from '../../services/storage';
import {
  BureaucracyStage,
  PassierscheinOutcomeCard,
  RomanDoorButton,
} from './BureaucracyStage';
import { LessonRangeSlider } from './LessonRangeSlider';

interface CampusVocabTrainerProps {
  progress: PlayerProgress;
  lessonRange: CampusLessonRange;
  onChangeLessonRange: (range: CampusLessonRange) => void;
  onRecordResult: (cardId: string, correct: boolean, kind: 'meaning' | 'cases') => void;
  onResetCampusProgress: () => void;
}

type TrainerMode = 'meaning' | 'cases' | 'browse';
type PosFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'other';
type QuizDirection = 'lat-de' | 'de-lat' | 'mixed';

const CASE_QUIZ_TARGETS: Array<{ caseForm: CaseForm; labelDe: string; questionHintDe: string }> = [
  { caseForm: 'acc', labelDe: 'Akkusativ Singular', questionHintDe: 'Wen oder was?' },
  { caseForm: 'dat', labelDe: 'Dativ Singular', questionHintDe: 'Wem?' },
  { caseForm: 'abl', labelDe: 'Ablativ Singular', questionHintDe: 'Wovon / womit / wo?' },
];

const POS_LABELS: Record<CampusCard['pos'], string> = {
  noun: 'Nomen',
  verb: 'Verb',
  adjective: 'Adjektiv',
  other: 'Wort / Wendung',
};

const PERSON_STEMS = [
  'amic',
  'av',
  'captiv',
  'civ',
  'consul',
  'de',
  'discipul',
  'domin',
  'equit',
  'fili',
  'fratr',
  'hom',
  'host',
  'imperator',
  'iuven',
  'libert',
  'magistr',
  'matr',
  'mercator',
  'milit',
  'nunt',
  'patr',
  'poet',
  'princip',
  'puell',
  'puer',
  'reg',
  'regin',
  'sacerdot',
  'senator',
  'serv',
  'soci',
  'soror',
  'uxor',
  'vir',
];

const PLACE_STEMS = [
  'agr',
  'aren',
  'camp',
  'cas',
  'castell',
  'dom',
  'for',
  'hort',
  'insul',
  'itali',
  'litor',
  'loc',
  'lud',
  'mar',
  'mont',
  'oppid',
  'port',
  'provinc',
  'rom',
  'silv',
  'templ',
  'terr',
  'urb',
  'vi',
  'vill',
];

interface CaseContextSentence {
  beforeBlank: string;
  afterBlank: string;
  germanFrameDe: string;
}

function matchesAnyStem(lemma: string, stem: string, candidates: string[]): boolean {
  const lowLemma = lemma.toLowerCase();
  const lowStem = stem.toLowerCase();
  return candidates.some((c) => lowLemma.startsWith(c) || lowStem.startsWith(c));
}

function buildCaseContextSentence(
  noun: NounEntry,
  targetCase: CaseForm,
  seed: number
): CaseContextSentence {
  if (targetCase === 'acc') {
    const templates: CaseContextSentence[] = [
      { beforeBlank: 'Marcus', afterBlank: 'videt.', germanFrameDe: 'Marcus sieht …' },
      { beforeBlank: 'Claudia', afterBlank: 'quaerit.', germanFrameDe: 'Claudia sucht …' },
      { beforeBlank: 'Lucius', afterBlank: 'spectat.', germanFrameDe: 'Lucius betrachtet …' },
      { beforeBlank: 'Gaius', afterBlank: 'invenit.', germanFrameDe: 'Gaius hat … gefunden.' },
    ];
    return templates[seed % templates.length];
  }

  if (targetCase === 'dat') {
    const isPerson = matchesAnyStem(noun.lemma, noun.stem, PERSON_STEMS);
    if (isPerson) {
      const personTemplates: CaseContextSentence[] = [
        {
          beforeBlank: 'Cornelia',
          afterBlank: 'epistulam dedit.',
          germanFrameDe: 'Cornelia hat … den Brief gegeben.',
        },
        {
          beforeBlank: 'Marcus',
          afterBlank: 'auxilium tulit.',
          germanFrameDe: 'Marcus hat … Hilfe gebracht.',
        },
        {
          beforeBlank: 'Lucius',
          afterBlank: 'confidit.',
          germanFrameDe: 'Lucius vertraut …',
        },
      ];
      return personTemplates[seed % personTemplates.length];
    }
    const generalDatTemplates: CaseContextSentence[] = [
      {
        beforeBlank: 'Gaius',
        afterBlank: 'appropinquat.',
        germanFrameDe: 'Gaius nähert sich …',
      },
      {
        beforeBlank: 'Claudia',
        afterBlank: 'studet.',
        germanFrameDe: 'Claudia bemüht sich um …',
      },
      {
        beforeBlank: 'Marcus',
        afterBlank: 'non nocuit.',
        germanFrameDe: 'Marcus hat … nicht geschadet.',
      },
    ];
    return generalDatTemplates[seed % generalDatTemplates.length];
  }

  // Ablative singular
  const isPlace = matchesAnyStem(noun.lemma, noun.stem, PLACE_STEMS);
  if (isPlace) {
    return {
      beforeBlank: 'Lucius in',
      afterBlank: 'manet.',
      germanFrameDe: 'Lucius bleibt in / auf …',
    };
  }
  const generalAblTemplates: CaseContextSentence[] = [
    {
      beforeBlank: 'Claudia de',
      afterBlank: 'narrat.',
      germanFrameDe: 'Claudia erzählt über / von …',
    },
    {
      beforeBlank: 'Marcus sine',
      afterBlank: 'venit.',
      germanFrameDe: 'Marcus kommt ohne …',
    },
  ];
  return generalAblTemplates[seed % generalAblTemplates.length];
}

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

  (['nom', 'gen', 'dat', 'acc', 'abl'] as CaseForm[]).forEach((c) => {
    const f = inflectNounSingular(noun, c);
    if (f !== correct) candidates.add(f);
  });

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

export interface PickNextCardParams {
  pool: CampusCard[];
  masteredSet: Set<string>;
  wrongSet: Set<string>;
  sessionHistory: string[];
  sessionDeferredWrong: string[];
  onlyWrong: boolean;
  seed: number;
}

/**
 * Selects the next card while ensuring recently missed cards are deferred to the end
 * rather than reappearing immediately after an error.
 */
export function pickNextCampusCard({
  pool,
  masteredSet,
  wrongSet,
  sessionHistory,
  sessionDeferredWrong,
  onlyWrong,
  seed,
}: PickNextCardParams): CampusCard | null {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  const lastCardId = sessionHistory[sessionHistory.length - 1];
  const candidates = pool.filter((c) => c.id !== lastCardId);
  const effectiveCandidates = candidates.length > 0 ? candidates : pool;

  const historySet = new Set(sessionHistory);
  const deferredSet = new Set(sessionDeferredWrong);
  const pickSeeded = (list: CampusCard[]) =>
    list[Math.abs(seed * 2654435761) % list.length] ?? list[0];

  if (onlyWrong) {
    const unplayedWrong = effectiveCandidates.filter((c) => !historySet.has(c.id));
    if (unplayedWrong.length > 0) {
      return pickSeeded(unplayedWrong);
    }
    // All wrong cards were already seen this session -> pick the oldest seen (never the latest)
    const byOldest = [...effectiveCandidates].sort((a, b) => {
      const ia = sessionHistory.indexOf(a.id);
      const ib = sessionHistory.indexOf(b.id);
      return ia - ib;
    });
    return byOldest[0] ?? effectiveCandidates[0];
  }

  // 1. New unseen cards first (not mastered, not wrong, not yet played this session)
  const freshUnseen = effectiveCandidates.filter(
    (c) =>
      !masteredSet.has(c.id) &&
      !wrongSet.has(c.id) &&
      !historySet.has(c.id) &&
      !deferredSet.has(c.id)
  );
  if (freshUnseen.length > 0) return pickSeeded(freshUnseen);

  // 2. Older wrong cards from previous sessions not yet played or deferred in this session
  const olderWrong = effectiveCandidates.filter(
    (c) => wrongSet.has(c.id) && !deferredSet.has(c.id) && !historySet.has(c.id)
  );
  if (olderWrong.length > 0) return pickSeeded(olderWrong);

  // 3. Previously mastered cards not yet reviewed in this session
  const masteredUnplayed = effectiveCandidates.filter(
    (c) => masteredSet.has(c.id) && !deferredSet.has(c.id) && !historySet.has(c.id)
  );
  if (masteredUnplayed.length > 0) return pickSeeded(masteredUnplayed);

  // 4. Deferred wrong cards from THIS session come last (oldest error first, newest at the very end)
  const deferredCards = effectiveCandidates.filter((c) => deferredSet.has(c.id));
  if (deferredCards.length > 0) {
    deferredCards.sort(
      (a, b) => sessionDeferredWrong.indexOf(a.id) - sessionDeferredWrong.indexOf(b.id)
    );
    return deferredCards[0];
  }

  // 5. Fallback: least recently played card in the pool
  const byOldest = [...effectiveCandidates].sort((a, b) => {
    const ia = sessionHistory.indexOf(a.id);
    const ib = sessionHistory.indexOf(b.id);
    return ia - ib;
  });
  return byOldest[0] ?? effectiveCandidates[0];
}

export const CampusVocabTrainer: React.FC<CampusVocabTrainerProps> = ({
  progress,
  lessonRange,
  onChangeLessonRange,
  onRecordResult,
  onResetCampusProgress,
}) => {
  const [posFilter, setPosFilter] = useState<PosFilter>('all');
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [mode, setMode] = useState<TrainerMode>('meaning');
  const [quizDirection, setQuizDirection] = useState<QuizDirection>('lat-de');
  const [showSentenceContext, setShowSentenceContext] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [browseLimit, setBrowseLimit] = useState(50);

  const [questionSeed, setQuestionSeed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [rewardBanner, setRewardBanner] = useState<{
    badgeTitles: string[];
    earnedBonusStar: boolean;
  } | null>(null);

  // Snapshot card ID when answered so queue updates don't yank the card before clicking Next
  const [frozenCardId, setFrozenCardId] = useState<string | null>(null);
  const [meaningHistory, setMeaningHistory] = useState<string[]>([]);
  const [meaningDeferredWrong, setMeaningDeferredWrong] = useState<string[]>([]);
  const [caseHistory, setCaseHistory] = useState<string[]>([]);
  const [caseDeferredWrong, setCaseDeferredWrong] = useState<string[]>([]);

  // Bureaucracy tower minigame state (starts at floor 1, 10 = Passierschein, 0 = Game Over)
  const [floor, setFloor] = useState(1);
  const [lastMove, setLastMove] = useState<'none' | 'up' | 'down' | 'grace'>('none');
  const [curseSeed, setCurseSeed] = useState(0);
  const [passierscheinCount, setPassierscheinCount] = useState(0);
  const [runQuestionCount, setRunQuestionCount] = useState(0);

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

  const wrongInScopeCount = useMemo(() => {
    return rangeCards.filter((card) => {
      if (!wrongSet.has(card.id)) return false;
      if (mode === 'cases') return Boolean(card.nounMeta);
      if (posFilter !== 'all' && card.pos !== posFilter) return false;
      return true;
    }).length;
  }, [rangeCards, wrongSet, mode, posFilter]);

  const filteredCards = useMemo(() => {
    return rangeCards.filter((card) => {
      if (posFilter !== 'all' && card.pos !== posFilter) return false;
      if (onlyWrong && !wrongSet.has(card.id) && card.id !== frozenCardId) return false;
      return true;
    });
  }, [rangeCards, posFilter, onlyWrong, wrongSet, frozenCardId]);

  const declinableCards = useMemo(() => {
    return rangeCards.filter((card) => {
      if (!card.nounMeta) return false;
      if (onlyWrong && !wrongSet.has(card.id) && card.id !== frozenCardId) return false;
      return true;
    });
  }, [rangeCards, onlyWrong, wrongSet, frozenCardId]);

  const handleRangeChange = (next: CampusLessonRange) => {
    onChangeLessonRange(next);
    setSelectedAnswer(null);
    setFrozenCardId(null);
    setRewardBanner(null);
    setBrowseLimit(50);
  };

  // Pick next Meaning quiz card (unseen & other cards first; wrong cards deferred to the end)
  const currentMeaningQuestion = useMemo(() => {
    if (filteredCards.length === 0) return null;

    let targetCard: CampusCard | undefined;
    if (frozenCardId) {
      targetCard = filteredCards.find((c) => c.id === frozenCardId);
    }

    if (!targetCard) {
      targetCard =
        pickNextCampusCard({
          pool: filteredCards,
          masteredSet,
          wrongSet,
          sessionHistory: meaningHistory,
          sessionDeferredWrong: meaningDeferredWrong,
          onlyWrong,
          seed: questionSeed,
        }) ?? undefined;
    }
    if (!targetCard) return null;

    const effectiveDir: 'lat-de' | 'de-lat' =
      quizDirection === 'mixed'
        ? questionSeed % 2 === 0
          ? 'lat-de'
          : 'de-lat'
        : quizDirection;

    const promptText = effectiveDir === 'lat-de' ? targetCard.front : targetCard.back;
    const expectedAnswer = effectiveDir === 'lat-de' ? targetCard.back : targetCard.front;

    const samePos = CAMPUS_CARDS.filter((c) => {
      if (c.id === targetCard!.id || c.pos !== targetCard!.pos) return false;
      const candVal = effectiveDir === 'lat-de' ? c.back : c.front;
      return candVal !== expectedAnswer;
    });
    const fallbackPool = CAMPUS_CARDS.filter((c) => {
      if (c.id === targetCard!.id) return false;
      const candVal = effectiveDir === 'lat-de' ? c.back : c.front;
      return candVal !== expectedAnswer;
    });

    const distractorSource = samePos.length >= 3 ? samePos : fallbackPool;
    const distractors: string[] = [];
    const step = Math.max(1, Math.floor(distractorSource.length / 7));
    let idx = (questionSeed * 13 + 5) % distractorSource.length;
    let guard = 0;
    while (distractors.length < 3 && guard < distractorSource.length) {
      const candCard = distractorSource[idx % distractorSource.length];
      const candidate = effectiveDir === 'lat-de' ? candCard.back : candCard.front;
      if (!distractors.includes(candidate) && candidate !== expectedAnswer) {
        distractors.push(candidate);
      }
      idx += step;
      guard++;
    }

    const options = shuffleArray([expectedAnswer, ...distractors]);
    return {
      card: targetCard,
      effectiveDir,
      promptText,
      expectedAnswer,
      options,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCards, questionSeed, quizDirection, frozenCardId, onlyWrong]);

  // Pick next Case-ending quiz card (unseen & other nouns first; missed ones deferred to the end)
  const currentCaseQuestion = useMemo(() => {
    if (declinableCards.length === 0) return null;

    let card: CampusCard | undefined;
    if (frozenCardId) {
      card = declinableCards.find((c) => c.id === frozenCardId);
    }

    if (!card) {
      card =
        pickNextCampusCard({
          pool: declinableCards,
          masteredSet,
          wrongSet,
          sessionHistory: caseHistory,
          sessionDeferredWrong: caseDeferredWrong,
          onlyWrong,
          seed: questionSeed,
        }) ?? undefined;
    }
    if (!card) return null;

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
    const contextSentence = buildCaseContextSentence(noun, targetInfo.caseForm, questionSeed);
    return { card, noun, targetInfo, expected, options, contextSentence };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [declinableCards, questionSeed, frozenCardId, onlyWrong]);

  const browseResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredCards;
    return filteredCards.filter(
      (c) => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
    );
  }, [filteredCards, searchQuery]);

  const triggerOutcomeFeedback = (cardId: string, isCorrect: boolean, kind: 'meaning' | 'cases') => {
    const preview = applyCampusOutcome(progress, cardId, isCorrect, kind);
    if (preview.newlyUnlockedBadges.length > 0 || preview.earnedBonusStar) {
      const badgeTitles = preview.newlyUnlockedBadges
        .map((id) => BADGES.find((b) => b.id === id)?.titleDe)
        .filter((t): t is string => Boolean(t));
      setRewardBanner({ badgeTitles, earnedBonusStar: preview.earnedBonusStar });
    } else {
      setRewardBanner(null);
    }
    onRecordResult(cardId, isCorrect, kind);
  };

  const handleSelectMeaning = (choice: string) => {
    if (!currentMeaningQuestion || selectedAnswer !== null || floor <= 0 || floor >= 10) return;
    const cardId = currentMeaningQuestion.card.id;
    const isCorrect = choice === currentMeaningQuestion.expectedAnswer;
    setFrozenCardId(cardId);
    setSelectedAnswer(choice);
    setMeaningHistory((prev) => [...prev.filter((id) => id !== cardId), cardId]);
    setMeaningDeferredWrong((prev) =>
      isCorrect ? prev.filter((id) => id !== cardId) : [...prev.filter((id) => id !== cardId), cardId]
    );
    if (isCorrect) {
      const nextFloor = Math.min(10, floor + 1);
      setFloor(nextFloor);
      setLastMove('up');
      if (nextFloor === 10) {
        setPassierscheinCount((c) => c + 1);
      }
      soundEngine.playSolved();
      setSessionStreak((s) => s + 1);
    } else {
      const isFirstQuestionBonus = floor === 1 && runQuestionCount === 0;
      if (isFirstQuestionBonus) {
        setFloor(1);
        setLastMove('grace');
      } else {
        const nextFloor = Math.max(0, floor - 1);
        setFloor(nextFloor);
        setLastMove('down');
      }
      setCurseSeed((s) => s + 1);
      soundEngine.playError();
      setSessionStreak(0);
    }
    setRunQuestionCount((c) => c + 1);
    triggerOutcomeFeedback(cardId, isCorrect, 'meaning');
  };

  const handleSelectCase = (choice: string) => {
    if (!currentCaseQuestion || selectedAnswer !== null || floor <= 0 || floor >= 10) return;
    const cardId = currentCaseQuestion.card.id;
    const isCorrect = choice === currentCaseQuestion.expected;
    setFrozenCardId(cardId);
    setSelectedAnswer(choice);
    setCaseHistory((prev) => [...prev.filter((id) => id !== cardId), cardId]);
    setCaseDeferredWrong((prev) =>
      isCorrect ? prev.filter((id) => id !== cardId) : [...prev.filter((id) => id !== cardId), cardId]
    );
    if (isCorrect) {
      const nextFloor = Math.min(10, floor + 1);
      setFloor(nextFloor);
      setLastMove('up');
      if (nextFloor === 10) {
        setPassierscheinCount((c) => c + 1);
      }
      soundEngine.playSolved();
      setSessionStreak((s) => s + 1);
    } else {
      const isFirstQuestionBonus = floor === 1 && runQuestionCount === 0;
      if (isFirstQuestionBonus) {
        setFloor(1);
        setLastMove('grace');
      } else {
        const nextFloor = Math.max(0, floor - 1);
        setFloor(nextFloor);
        setLastMove('down');
      }
      setCurseSeed((s) => s + 1);
      soundEngine.playError();
      setSessionStreak(0);
    }
    setRunQuestionCount((c) => c + 1);
    triggerOutcomeFeedback(cardId, isCorrect, 'cases');
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setFrozenCardId(null);
    setRewardBanner(null);
    setLastMove('none');
    setQuestionSeed((n) => n + 1 + Math.floor(Math.random() * 7));
  };

  const handleRestartTower = () => {
    setFloor(1);
    setLastMove('none');
    setRunQuestionCount(0);
    setSelectedAnswer(null);
    setFrozenCardId(null);
    setRewardBanner(null);
    setQuestionSeed((n) => n + 1 + Math.floor(Math.random() * 7));
  };

  const masteredInRange = rangeCards.filter((c) => masteredSet.has(c.id)).length;
  const rangePct = rangeCards.length > 0 ? Math.round((masteredInRange / rangeCards.length) * 100) : 0;

  const totalMasteredCount = progress.campusStats?.masteredIds.length ?? 0;
  const campusCareerStars = getCampusCareerStars(totalMasteredCount);
  const nextMilestone = getNextCampusMilestone(totalMasteredCount);
  const bestStreak = Math.max(progress.campusStats?.bestStreak ?? 0, sessionStreak);
  const effectiveStart = lessonRange.from === 0 ? 1 : lessonRange.from + 1;

  return (
    <div className="space-y-6">
      {/* Header & Summary Stats */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
            Campus C1&2 Vokabel- & Formen-Check
          </h2>
          <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA] mt-1">
            Trainiere deinen Wortschatz im gewählten Lektionsbereich und sammle Sterne & Abzeichen für deine Ermittler-Karriere.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6A5A4C] dark:text-[#B9AA98] font-mono-tab">
          <span>
            Auswahl: <strong className="text-[#241C16] dark:text-[#F2ECE1]">{filteredCards.length}</strong> Karten
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Sicher gesamt: <strong className="text-[#1E5B3A] dark:text-[#7CD3A2]">{totalMasteredCount}</strong>
          </span>
          {bestStreak > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Serie: <strong className="text-[#9B2C2C] dark:text-[#E06C65]">{sessionStreak}</strong> (Bestwert {bestStreak})
              </span>
            </>
          )}
        </div>
      </div>

      {/* Controls: Dual-Thumb Range Slider + Span Progress Bar + Mode Tabs */}
      <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 sm:p-5 space-y-4">
        <LessonRangeSlider
          value={lessonRange}
          onChange={handleRangeChange}
          cardCount={rangeCards.length}
        />

        {/* Progress Bar for Selected Lesson Range & Career Milestone */}
        <div className="pt-2 space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <span className="font-semibold text-[#241C16] dark:text-[#F2ECE1]">
              Bereichs-Fortschritt (Lektion {effectiveStart}–{lessonRange.to}):{' '}
              <span className="font-mono-tab text-[#1E5B3A] dark:text-[#7CD3A2]">
                {masteredInRange} / {rangeCards.length} ({rangePct}%)
              </span>
            </span>
            <span className="font-mono-tab text-[#6A5A4C] dark:text-[#B9AA98] inline-flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-[#D99341] text-[#B47B2B]" aria-hidden="true" />
              <span>
                {campusCareerStars} Karriere-Stern{campusCareerStars === 1 ? '' : 'e'} durch Üben
                {nextMilestone !== null
                  ? ` · Nächster ab ${nextMilestone} sicheren Karten`
                  : ' · Alle Meilensteine erreicht'}
              </span>
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#EFE8DA] dark:bg-[#161311] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#266B47] dark:bg-[#7CD3A2] transition-all duration-200"
              style={{ width: `${rangePct}%` }}
            />
          </div>
        </div>

        {/* Mode, Stolpersteine & POS Filters */}
        <div className="pt-3 border-t border-[#EFE8DA] dark:border-[#322A23] flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#161311]">
            <button
              type="button"
              onClick={() => {
                setMode('meaning');
                setSelectedAnswer(null);
                setFrozenCardId(null);
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
                setFrozenCardId(null);
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
              onClick={() => {
                setMode('browse');
                setFrozenCardId(null);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'browse'
                  ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                  : 'text-[#4A3D33] dark:text-[#B9AA98]'
              }`}
            >
              Wortschatzliste
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {mode !== 'cases' &&
              (
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
                    setFrozenCardId(null);
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

            <button
              type="button"
              aria-pressed={onlyWrong}
              onClick={() => {
                setOnlyWrong((w) => !w);
                setSelectedAnswer(null);
                setFrozenCardId(null);
              }}
              className={`min-h-[34px] px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                onlyWrong
                  ? 'border-[#9B2C2C] bg-[#9B2C2C] text-white'
                  : wrongInScopeCount > 0
                  ? 'border-[#9B2C2C]/45 bg-[#FBEAEA]/70 dark:bg-[#3A1B1A]/60 text-[#9B2C2C] dark:text-[#F2918B] hover:border-[#9B2C2C]'
                  : 'border-[#DED4C3] dark:border-[#3A312A] text-[#6A5A4C] dark:text-[#B9AA98] hover:border-[#9B2C2C]'
              }`}
            >
              Nur Stolpersteine (<span className="font-mono-tab">{wrongInScopeCount}</span>)
            </button>
          </div>
        </div>
      </div>

      {/* Career Reward Banner when new badge or star is unlocked */}
      {rewardBanner && (
        <div
          role="status"
          className="rounded-2xl border border-[#C89342] bg-[#FFFDF8] dark:bg-[#221D19] px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm"
        >
          <Award className="w-5 h-5 text-[#B47B2B] dark:text-[#D99341] shrink-0" aria-hidden="true" />
          <div className="text-sm text-[#241C16] dark:text-[#F2ECE1]">
            {rewardBanner.earnedBonusStar && (
              <span className="font-bold text-[#9B2C2C] dark:text-[#E06C65] mr-2">
                +1 Karriere-Stern für deine Akte!
              </span>
            )}
            {rewardBanner.badgeTitles.length > 0 && (
              <span>
                Neues Abzeichen freigeschaltet:{' '}
                <strong>{rewardBanner.badgeTitles.join(', ')}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mode 1: Meaning Quiz inside Bureaucracy Minigame */}
      {mode === 'meaning' && (
        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 sm:p-6 shadow-sm space-y-5">
          {/* Minigame Intro & Direction Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE8DA] dark:border-[#322A23]">
            <p className="text-xs sm:text-sm text-[#4A3D33] dark:text-[#D5C9BA] flex-1 min-w-[240px]">
              <strong className="text-[#9B2C2C] dark:text-[#E06C65]">Passierschein-Jagd:</strong>{' '}
              Passierscheine gibt es im Amt nur für echte Römer – deshalb wird auf jeder Etage Latein geprüft! Wählt die richtige Tür bis Etage 10; ein Fehler kostet Cornelius &amp; Magnus eine Etage (bei 0 ist Schluss).
            </p>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#161311]">
              {(
                [
                  { id: 'lat-de', label: 'Latein → Deutsch' },
                  { id: 'de-lat', label: 'Deutsch → Latein' },
                  { id: 'mixed', label: 'Gemischt' },
                ] as Array<{ id: QuizDirection; label: string }>
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setQuizDirection(d.id);
                    setSelectedAnswer(null);
                    setFrozenCardId(null);
                  }}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    quizDirection === d.id
                      ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                      : 'text-[#4A3D33] dark:text-[#B9AA98]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {!currentMeaningQuestion ? (
            <div className="py-4 space-y-3">
              <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
                {onlyWrong
                  ? 'Keine offenen Stolpersteine in dieser Auswahl – starke Leistung!'
                  : 'Für diesen Filter wurden keine Karten gefunden. Wähle eine andere Wortart oder Lektion.'}
              </p>
              {onlyWrong && (
                <button
                  type="button"
                  onClick={() => setOnlyWrong(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-xs font-semibold cursor-pointer"
                >
                  Wieder alle Karten üben
                </button>
              )}
            </div>
          ) : (
            <>
              <BureaucracyStage
                floor={floor}
                lastMove={lastMove}
                curseSeed={curseSeed}
                passierscheinCount={passierscheinCount}
                modeLabel="Vokabel-Prüfung"
              >
                <div className="rounded-2xl border-2 border-[#3B2B1F] dark:border-[#C89342] bg-[#FFFDF8] dark:bg-[#26201B] p-4 shadow-md space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                    <span>Lektion {currentMeaningQuestion.card.band}</span>
                    <span aria-hidden="true">·</span>
                    <span>{POS_LABELS[currentMeaningQuestion.card.pos]}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {currentMeaningQuestion.effectiveDir === 'lat-de'
                        ? 'Latein → Deutsch'
                        : 'Deutsch → Latein'}
                    </span>
                    {wrongSet.has(currentMeaningQuestion.card.id) && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#9B2C2C] dark:text-[#E06C65] font-semibold">
                          Stolperstein
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`font-display text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1] ${
                      currentMeaningQuestion.effectiveDir === 'lat-de' ? 'italic' : ''
                    }`}
                  >
                    {currentMeaningQuestion.promptText}
                  </div>
                  <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                    {currentMeaningQuestion.effectiveDir === 'lat-de'
                      ? 'Wähle die passende Tür mit der deutschen Übersetzung:'
                      : 'Wähle die passende Tür mit dem lateinischen Wort:'}
                  </p>
                </div>
              </BureaucracyStage>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMeaningQuestion.options.map((opt, idx) => (
                  <RomanDoorButton
                    key={opt}
                    doorIndex={idx}
                    label={opt}
                    italic={currentMeaningQuestion.effectiveDir === 'de-lat'}
                    disabled={selectedAnswer !== null || floor <= 0 || floor >= 10}
                    isSelected={selectedAnswer === opt}
                    isCorrect={opt === currentMeaningQuestion.expectedAnswer}
                    revealed={selectedAnswer !== null}
                    onClick={() => handleSelectMeaning(opt)}
                  />
                ))}
              </div>

              {selectedAnswer !== null && (
                <div className="pt-3 border-t border-[#EFE8DA] dark:border-[#322A23] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    {selectedAnswer === currentMeaningQuestion.expectedAnswer ? (
                      <span className="font-semibold text-[#1E5B3A] dark:text-[#7CD3A2]">
                        Richtig! Tür öffnet sich – weiter nach oben!
                      </span>
                    ) : (
                      <span className="text-[#9B2C2C] dark:text-[#F2918B]">
                        Falsche Tür! Richtig wäre:{' '}
                        <strong
                          className={
                            currentMeaningQuestion.effectiveDir === 'de-lat'
                              ? 'font-display italic'
                              : ''
                          }
                        >
                          {currentMeaningQuestion.expectedAnswer}
                        </strong>
                      </span>
                    )}
                  </div>
                  {floor > 0 && floor < 10 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold cursor-pointer"
                    >
                      Nächste Karte
                    </button>
                  )}
                </div>
              )}

              {(floor === 0 || floor === 10) && (
                <PassierscheinOutcomeCard
                  floor={floor as 0 | 10}
                  passierscheinCount={passierscheinCount}
                  onRestart={handleRestartTower}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Mode 2: Case Forms Quiz inside Bureaucracy Minigame */}
      {mode === 'cases' && (
        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 sm:p-6 shadow-sm space-y-5">
          {/* Minigame Intro & Sentence context toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE8DA] dark:border-[#322A23]">
            <p className="text-xs sm:text-sm text-[#4A3D33] dark:text-[#D5C9BA] flex-1 min-w-[240px]">
              <strong className="text-[#9B2C2C] dark:text-[#E06C65]">Passierschein-Jagd:</strong>{' '}
              Passierscheine gibt es im Amt nur für echte Römer – deshalb wird auf jeder Etage Latein geprüft! Wählt die richtige Tür bis Etage 10; ein Fehler kostet Cornelius &amp; Magnus eine Etage (bei 0 ist Schluss).
            </p>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#161311]">
              <button
                type="button"
                onClick={() => setShowSentenceContext(true)}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  showSentenceContext
                    ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                    : 'text-[#4A3D33] dark:text-[#B9AA98]'
                }`}
              >
                Im Satz-Kontext
              </button>
              <button
                type="button"
                onClick={() => setShowSentenceContext(false)}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  !showSentenceContext
                    ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                    : 'text-[#4A3D33] dark:text-[#B9AA98]'
                }`}
              >
                Nur Kasus-Name
              </button>
            </div>
          </div>

          {!currentCaseQuestion ? (
            <div className="py-4 space-y-3">
              <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
                {onlyWrong
                  ? 'Keine offenen Nomen-Stolpersteine in diesem Bereich – großartig!'
                  : 'In diesem Bereich gibt es keine deklinierbaren Nomen.'}
              </p>
              {onlyWrong && (
                <button
                  type="button"
                  onClick={() => setOnlyWrong(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-xs font-semibold cursor-pointer"
                >
                  Wieder alle Nomen üben
                </button>
              )}
            </div>
          ) : (
            <>
              <BureaucracyStage
                floor={floor}
                lastMove={lastMove}
                curseSeed={curseSeed}
                passierscheinCount={passierscheinCount}
                modeLabel="Kasus-Prüfung"
              >
                <div className="rounded-2xl border-2 border-[#3B2B1F] dark:border-[#C89342] bg-[#FFFDF8] dark:bg-[#26201B] p-4 shadow-md space-y-2.5">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                    <span>Lektion {currentCaseQuestion.card.band}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Gesucht:{' '}
                      <strong className="text-[#9B2C2C] dark:text-[#E06C65]">
                        {currentCaseQuestion.targetInfo.labelDe}
                      </strong>{' '}
                      ({currentCaseQuestion.targetInfo.questionHintDe})
                    </span>
                  </div>

                  <div className="font-display text-xl sm:text-2xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
                    <span className="italic">{currentCaseQuestion.noun.lemma}</span>,{' '}
                    <span className="italic font-medium text-[#6A5A4C] dark:text-[#B9AA98]">
                      {currentCaseQuestion.noun.genitive}
                    </span>{' '}
                    <span className="text-sm sm:text-base font-normal text-[#6A5A4C] dark:text-[#B9AA98]">
                      ({currentCaseQuestion.noun.gender}.) — {currentCaseQuestion.card.back}
                    </span>
                  </div>

                  {showSentenceContext && (
                    <div className="rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/80 dark:bg-[#161311] p-3 space-y-1">
                      <div className="font-display italic text-base sm:text-lg text-[#241C16] dark:text-[#F2ECE1]">
                        „{currentCaseQuestion.contextSentence.beforeBlank}{' '}
                        <span
                          className={`not-italic font-bold px-2 py-0.5 rounded-md ${
                            selectedAnswer !== null
                              ? 'bg-[#EAF5EE] dark:bg-[#193325] text-[#1E5B3A] dark:text-[#7CD3A2] font-display italic'
                              : 'border-b-2 border-[#9B2C2C] dark:border-[#E06C65] text-[#9B2C2C] dark:text-[#E06C65]'
                          }`}
                        >
                          {selectedAnswer !== null ? currentCaseQuestion.expected : '_____'}
                        </span>{' '}
                        {currentCaseQuestion.contextSentence.afterBlank}“
                      </div>
                      <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                        Kontext: {currentCaseQuestion.contextSentence.germanFrameDe} (
                        {currentCaseQuestion.targetInfo.questionHintDe})
                      </div>
                    </div>
                  )}
                </div>
              </BureaucracyStage>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCaseQuestion.options.map((opt, idx) => (
                  <RomanDoorButton
                    key={opt}
                    doorIndex={idx}
                    label={opt}
                    italic
                    disabled={selectedAnswer !== null || floor <= 0 || floor >= 10}
                    isSelected={selectedAnswer === opt}
                    isCorrect={opt === currentCaseQuestion.expected}
                    revealed={selectedAnswer !== null}
                    onClick={() => handleSelectCase(opt)}
                  />
                ))}
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
                      {selectedAnswer === currentCaseQuestion.expected ? 'Genau richtig!' : 'Falsche Tür!'}
                    </span>
                    {getCaseExplanation(currentCaseQuestion.noun, currentCaseQuestion.targetInfo.caseForm)}
                  </div>
                  {floor > 0 && floor < 10 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold cursor-pointer"
                    >
                      Nächstes Nomen
                    </button>
                  )}
                </div>
              )}

              {(floor === 0 || floor === 10) && (
                <PassierscheinOutcomeCard
                  floor={floor as 0 | 10}
                  passierscheinCount={passierscheinCount}
                  onRestart={handleRestartTower}
                />
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
                placeholder="Latein oder Deutsch suchen (z. B. gladius, Schwert)..."
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
                    {wrongSet.has(c.id) ? ' · Stolperstein' : masteredSet.has(c.id) ? ' · Sicher' : ''}
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
            onClick={() => {
              setRewardBanner(null);
              setMeaningHistory([]);
              setMeaningDeferredWrong([]);
              setCaseHistory([]);
              setCaseDeferredWrong([]);
              setFloor(1);
              setLastMove('none');
              setRunQuestionCount(0);
              setPassierscheinCount(0);
              onResetCampusProgress();
            }}
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
