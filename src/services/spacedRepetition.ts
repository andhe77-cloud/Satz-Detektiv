import { DifficultyStage, GrammarFocus, PlayerProgress } from '../core/types';

export interface GrammarRecommendation {
  focus: GrammarFocus;
  labelDe: string;
  recommendedStage: DifficultyStage;
  reasonDe: string;
}

const GRAMMAR_META: Record<GrammarFocus, { labelDe: string; stage: DifficultyStage }> = {
  nominative: { labelDe: 'Nominativ (Wer handelt?)', stage: 1 },
  accusative: { labelDe: 'Akkusativ (Wen oder was?)', stage: 1 },
  negation: { labelDe: 'Verneinung mit „non“', stage: 2 },
  perfect: { labelDe: 'Perfektformen', stage: 2 },
  dative: { labelDe: 'Dativ (Wem?)', stage: 3 },
  conjunction: { labelDe: 'Satzverbindungen (et / sed)', stage: 3 },
  ablative: { labelDe: 'Ablativ mit „in“ (Wo?)', stage: 4 },
};

/**
 * Spaced-repetition prioritizer: selects the grammar area with the highest
 * error-to-success ratio (or least practiced) so weak areas surface more frequently.
 */
export function getRecommendedPracticeFocus(progress: PlayerProgress): GrammarRecommendation {
  const entries = Object.entries(progress.grammarStats) as Array<
    [GrammarFocus, { errors: number; successes: number; lastPracticed?: string }]
  >;

  let bestFocus: GrammarFocus = 'nominative';
  let bestPriority = -1;

  for (const [focus, stat] of entries) {
    const total = stat.errors + stat.successes;
    // Higher error rate and lower total attempts yield higher spaced-repetition weight
    const errorRatio = total === 0 ? 0.35 : (stat.errors + 0.5) / (total + 1);
    const freshnessBonus = total === 0 ? 0.15 : 0;
    const priority = errorRatio + freshnessBonus;
    if (priority > bestPriority) {
      bestPriority = priority;
      bestFocus = focus;
    }
  }

  const stat = progress.grammarStats[bestFocus];
  const meta = GRAMMAR_META[bestFocus];
  const reasonDe =
    stat.errors > 0
      ? `Hier gab es zuletzt ${stat.errors} Stolperstein(e) — wir trainieren gezielt ${meta.labelDe}.`
      : `Empfohlener Schwerpunkt zur Festigung: ${meta.labelDe}.`;

  return {
    focus: bestFocus,
    labelDe: meta.labelDe,
    recommendedStage: meta.stage,
    reasonDe,
  };
}
