import { GrammarFocus, PlayerProgress } from '../core/types';

const STORAGE_KEY = 'satz-detektiv-progress-v1';

export interface RankInfo {
  titleDe: string;
  minStars: number;
  nextTitleDe?: string;
  nextStars?: number;
}

export const RANKS: RankInfo[] = [
  { titleDe: 'Kanzlei-Praktikant', minStars: 0, nextTitleDe: 'Spürhund', nextStars: 6 },
  { titleDe: 'Spürhund', minStars: 6, nextTitleDe: 'Kasus-Ermittler', nextStars: 14 },
  { titleDe: 'Kasus-Ermittler', minStars: 14, nextTitleDe: 'Oberkommissar', nextStars: 24 },
  { titleDe: 'Oberkommissar', minStars: 24, nextTitleDe: 'Chefermittler in Rom', nextStars: 36 },
  { titleDe: 'Chefermittler in Rom', minStars: 36 },
];

export interface BadgeDefinition {
  id: string;
  titleDe: string;
  descriptionDe: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-case',
    titleDe: 'Erster Durchblick',
    descriptionDe: 'Den allerersten Fall erfolgreich gelöst.',
  },
  {
    id: 'perfect-deduction',
    titleDe: 'Adlerauge',
    descriptionDe: 'Einen Fall mit vollen 3 Sternen ohne Fehler gelöst.',
  },
  {
    id: 'daily-sleuth',
    titleDe: 'Tages-Chronist',
    descriptionDe: 'Einen Tagesfall geknackt.',
  },
  {
    id: 'dative-master',
    titleDe: 'Meister des Dativs',
    descriptionDe: 'Einen Fall der Stufe 3 mit Dativ-Spur gelöst.',
  },
  {
    id: 'master-of-rome',
    titleDe: 'Meisterdetektiv in Rom',
    descriptionDe: 'Einen Fall der Stufe 4 gelöst.',
  },
  {
    id: 'five-stars',
    titleDe: 'Schatzsammler',
    descriptionDe: 'Mindestens 10 Sterne gesammelt.',
  },
  {
    id: 'campus-first-10',
    titleDe: 'Wortschatz-Einstieg',
    descriptionDe: '10 Campus-Vokabeln sicher beherrscht (+1 Karriere-Stern).',
  },
  {
    id: 'campus-50',
    titleDe: 'Vokabel-Spürhund',
    descriptionDe: '50 Campus-Vokabeln sicher beherrscht.',
  },
  {
    id: 'campus-150',
    titleDe: 'Meister der Wörter',
    descriptionDe: '150 Campus-Vokabeln sicher beherrscht.',
  },
  {
    id: 'campus-streak-10',
    titleDe: 'Unbestechliche Serie',
    descriptionDe: '10 Campus-Aufgaben in Folge fehlerfrei gelöst.',
  },
  {
    id: 'campus-case-15',
    titleDe: 'Formen-Experte',
    descriptionDe: '15 Kasus-Formen im Campus-Training gemeistert.',
  },
  {
    id: 'campus-mistakes-cleared',
    titleDe: 'Stolperstein-Räumer',
    descriptionDe: 'Mindestens 20 Campus-Aufgaben absolviert und 0 offene Stolpersteine.',
  },
];

export const CAMPUS_STAR_MILESTONES = [10, 25, 50, 100, 200, 350, 500, 750, 1000] as const;

export function getCampusCareerStars(masteredCount: number): number {
  return CAMPUS_STAR_MILESTONES.filter((m) => masteredCount >= m).length;
}

export function getNextCampusMilestone(masteredCount: number): number | null {
  return CAMPUS_STAR_MILESTONES.find((m) => masteredCount < m) ?? null;
}

export function calculateTotalStars(
  progress: Pick<PlayerProgress, 'solvedCaseIds' | 'dailySolvedDates' | 'campusStats'>
): number {
  const caseStars =
    Object.values(progress.solvedCaseIds).reduce((sum, x) => sum + x.stars, 0) +
    Object.values(progress.dailySolvedDates).reduce((sum, x) => sum + x.stars, 0);
  const campusStars = getCampusCareerStars(progress.campusStats?.masteredIds.length ?? 0);
  return caseStars + campusStars;
}

export function createDefaultProgress(): PlayerProgress {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const emptyGrammar = (): PlayerProgress['grammarStats'] => ({
    nominative: { errors: 0, successes: 0 },
    accusative: { errors: 0, successes: 0 },
    dative: { errors: 0, successes: 0 },
    ablative: { errors: 0, successes: 0 },
    negation: { errors: 0, successes: 0 },
    perfect: { errors: 0, successes: 0 },
    conjunction: { errors: 0, successes: 0 },
  });

  return {
    solvedCaseIds: {},
    dailySolvedDates: {},
    totalStars: 0,
    unlockedBadges: [],
    grammarStats: emptyGrammar(),
    campusStats: {
      masteredIds: [],
      wrongIds: [],
      practicedCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      caseMasteredCount: 0,
      meaningMasteredCount: 0,
    },
    settings: {
      theme: prefersDark ? 'dark' : 'light',
      reducedMotion: prefersReduced,
      musicVolume: 0.25,
      sfxVolume: 0.55,
      musicEnabled: false,
      vocabularySource: 'standard',
      campusLessonFrom: 0,
      campusLessonTo: 40,
    },
  };
}

export function loadProgress(): PlayerProgress {
  const fallback = createDefaultProgress();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    const mergedSettings = {
      ...fallback.settings,
      ...(parsed.settings ?? {}),
    };
    const validFromStops = new Set([0, 10, 20, 30, 40, 50, 60]);
    const validToStops = new Set([10, 20, 30, 40, 50, 60, 68]);
    if (!validFromStops.has(mergedSettings.campusLessonFrom)) {
      mergedSettings.campusLessonFrom = 0;
    }
    if (!validToStops.has(mergedSettings.campusLessonTo)) {
      mergedSettings.campusLessonTo = 40;
    }
    if (mergedSettings.campusLessonFrom >= mergedSettings.campusLessonTo) {
      mergedSettings.campusLessonFrom = 0;
      mergedSettings.campusLessonTo = 40;
    }
    return {
      ...fallback,
      ...parsed,
      grammarStats: {
        ...fallback.grammarStats,
        ...(parsed.grammarStats ?? {}),
      },
      campusStats: {
        ...fallback.campusStats,
        ...(parsed.campusStats ?? {}),
      },
      settings: mergedSettings,
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

export function resetProgress(): PlayerProgress {
  const fresh = createDefaultProgress();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return fresh;
}

export function getCurrentRank(totalStars: number): RankInfo {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (totalStars >= r.minStars) current = r;
  }
  return current;
}

export function recordGrammarOutcome(
  progress: PlayerProgress,
  tags: GrammarFocus[],
  hadError: boolean
): PlayerProgress {
  const nextStats = { ...progress.grammarStats };
  const now = new Date().toISOString();
  for (const tag of tags) {
    const prev = nextStats[tag] ?? { errors: 0, successes: 0 };
    nextStats[tag] = {
      errors: prev.errors + (hadError ? 1 : 0),
      successes: prev.successes + (hadError ? 0 : 1),
      lastPracticed: now,
    };
  }
  return { ...progress, grammarStats: nextStats };
}

export function applyCampusOutcome(
  prev: PlayerProgress,
  cardId: string,
  correct: boolean,
  kind: 'meaning' | 'cases' = 'meaning'
): { nextProgress: PlayerProgress; newlyUnlockedBadges: string[]; earnedBonusStar: boolean } {
  const curr = prev.campusStats ?? {
    masteredIds: [],
    wrongIds: [],
    practicedCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    caseMasteredCount: 0,
    meaningMasteredCount: 0,
  };
  const mastered = new Set(curr.masteredIds);
  const wrong = new Set(curr.wrongIds);
  if (correct) {
    mastered.add(cardId);
    wrong.delete(cardId);
  } else {
    wrong.add(cardId);
    mastered.delete(cardId);
  }

  const prevCampusStars = getCampusCareerStars(curr.masteredIds.length);
  const nextCampusStars = getCampusCareerStars(mastered.size);
  const earnedBonusStar = nextCampusStars > prevCampusStars;

  const nextStreak = correct ? (curr.currentStreak ?? 0) + 1 : 0;
  const nextBestStreak = Math.max(curr.bestStreak ?? 0, nextStreak);
  const nextPracticed = curr.practicedCount + 1;
  const nextCaseMastered = (curr.caseMasteredCount ?? 0) + (correct && kind === 'cases' ? 1 : 0);
  const nextMeaningMastered = (curr.meaningMasteredCount ?? 0) + (correct && kind === 'meaning' ? 1 : 0);

  const nextCampusStats: PlayerProgress['campusStats'] = {
    masteredIds: [...mastered],
    wrongIds: [...wrong],
    practicedCount: nextPracticed,
    currentStreak: nextStreak,
    bestStreak: nextBestStreak,
    caseMasteredCount: nextCaseMastered,
    meaningMasteredCount: nextMeaningMastered,
  };

  const totalStars = calculateTotalStars({
    solvedCaseIds: prev.solvedCaseIds,
    dailySolvedDates: prev.dailySolvedDates,
    campusStats: nextCampusStats,
  });

  const badges = new Set(prev.unlockedBadges);
  if (totalStars >= 10) badges.add('five-stars');
  if (mastered.size >= 10) badges.add('campus-first-10');
  if (mastered.size >= 50) badges.add('campus-50');
  if (mastered.size >= 150) badges.add('campus-150');
  if (nextBestStreak >= 10) badges.add('campus-streak-10');
  if (nextCaseMastered >= 15) badges.add('campus-case-15');
  if (nextPracticed >= 20 && wrong.size === 0) badges.add('campus-mistakes-cleared');

  const newlyUnlockedBadges = [...badges].filter((b) => !prev.unlockedBadges.includes(b));

  return {
    nextProgress: {
      ...prev,
      campusStats: nextCampusStats,
      totalStars,
      unlockedBadges: [...badges],
    },
    newlyUnlockedBadges,
    earnedBonusStar,
  };
}
