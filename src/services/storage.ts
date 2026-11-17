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
];

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
