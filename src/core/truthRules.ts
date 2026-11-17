import { CaseAssignment, TruthRuleId } from './types';

export interface TruthRuleInfo {
  id: TruthRuleId;
  titleDe: string;
  descriptionDe: string;
  shortRuleDe: string;
}

export const TRUTH_RULES: Record<TruthRuleId, TruthRuleInfo> = {
  EXACTLY_ONE_FALSE: {
    id: 'EXACTLY_ONE_FALSE',
    titleDe: 'Genau eine Lüge',
    descriptionDe: 'Alle Zeugen bis auf einen sagen die Wahrheit. Genau eine Aussage ist falsch.',
    shortRuleDe: 'Genau eine Aussage ist falsch.',
  },
  EXACTLY_ONE_TRUE: {
    id: 'EXACTLY_ONE_TRUE',
    titleDe: 'Genau eine Wahrheit',
    descriptionDe: 'Fast alle irren sich oder flunkern: Genau eine Aussage ist wahr.',
    shortRuleDe: 'Genau eine Aussage ist wahr.',
  },
  EXACTLY_TWO_FALSE: {
    id: 'EXACTLY_TWO_FALSE',
    titleDe: 'Zwei Lügen im Raum',
    descriptionDe: 'Genau zwei Aussagen sind falsch, die übrigen sind wahr.',
    shortRuleDe: 'Genau zwei Aussagen sind falsch.',
  },
  EXACTLY_TWO_TRUE: {
    id: 'EXACTLY_TWO_TRUE',
    titleDe: 'Zwei wahre Spuren',
    descriptionDe: 'Genau zwei Aussagen sind wahr, alle anderen sind falsch.',
    shortRuleDe: 'Genau zwei Aussagen sind wahr.',
  },
  CULPRIT_LIES_OTHERS_TRUTH: {
    id: 'CULPRIT_LIES_OTHERS_TRUTH',
    titleDe: 'Nur der Täter lügt',
    descriptionDe: 'Der wahre Täter sagt die Unwahrheit; alle unschuldigen Zeugen sagen die Wahrheit.',
    shortRuleDe: 'Der Täter lügt, alle anderen sagen die Wahrheit.',
  },
};

export function evaluateTruthRule(
  rule: TruthRuleId,
  truthValues: boolean[],
  speakerIds: string[],
  assignment: CaseAssignment
): boolean {
  const trueCount = truthValues.filter(Boolean).length;
  const falseCount = truthValues.length - trueCount;

  switch (rule) {
    case 'EXACTLY_ONE_FALSE':
      return falseCount === 1;
    case 'EXACTLY_ONE_TRUE':
      return trueCount === 1;
    case 'EXACTLY_TWO_FALSE':
      return falseCount === 2;
    case 'EXACTLY_TWO_TRUE':
      return trueCount === 2;
    case 'CULPRIT_LIES_OTHERS_TRUTH':
      return truthValues.every((isTrue, idx) => {
        const isCulprit = speakerIds[idx] === assignment.culprit;
        return isCulprit ? !isTrue : isTrue;
      });
  }
}
