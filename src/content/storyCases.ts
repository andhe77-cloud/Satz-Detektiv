import { buildSearchSpace, solveCase } from '../core/solver';
import { CaseAssignment, CaseDefinition, DifficultyStage, StatementAST, TruthRuleId } from '../core/types';
import { generateCase } from '../generator/caseGenerator';
import { SCENARIOS } from '../generator/scenarios';
import { defaultLexicon } from '../latin/inflector';
import { buildSolutionSpec, renderStatement } from '../latin/renderer';

export interface StoryChapter {
  id: string;
  stage: DifficultyStage;
  numberLabel: string;
  titleDe: string;
  subtitleDe: string;
  grammarFocusDe: string;
  cases: CaseDefinition[];
}

function buildCuratedCase(params: {
  id: string;
  chapterId: string;
  stage: DifficultyStage;
  titleDe: string;
  scenarioId: string;
  witnessIds: string[];
  candidateItems: string[];
  candidateLocations?: string[];
  truthRule: TruthRuleId;
  solution: CaseAssignment;
  asts: StatementAST[];
}): CaseDefinition {
  const base = SCENARIOS.find((s) => s.id === params.scenarioId) ?? SCENARIOS[0];
  const scenario = {
    ...base,
    preferredTense: params.stage === 1 ? ('present' as const) : ('perfect' as const),
  };

  const rawStatements = params.asts.map((ast, i) => ({
    speakerId: params.witnessIds[i],
    ast,
  }));

  const searchSpace = buildSearchSpace({
    suspects: params.witnessIds,
    items: params.candidateItems,
    requireGiver: Boolean(params.solution.giver),
    locations: params.candidateLocations,
  });

  const check = solveCase({
    statements: rawStatements,
    truthRule: params.truthRule,
    searchSpace,
  });

  if (!check.isUnique) {
    throw new Error(`Kuratierter Fall ${params.id} ist nicht eindeutig (${check.solutions.length} Lösungen).`);
  }

  const statements = params.asts.map((ast, idx) => {
    const rendered = renderStatement(ast, scenario, params.witnessIds, defaultLexicon);
    return {
      witnessIndex: idx,
      speakerId: params.witnessIds[idx],
      ast,
      tokens: rendered.tokens,
      latinText: rendered.latinText,
      germanText: rendered.germanText,
      hasAmbiguousForm: rendered.hasAmbiguousForm,
      grammarTags: rendered.grammarTags,
    };
  });

  const questionDe =
    params.stage === 1
      ? scenario.question1De
      : params.stage === 2
      ? scenario.question2De
      : params.stage === 3
      ? scenario.question3De
      : scenario.question4De;

  const tags = new Set(statements.flatMap((s) => s.grammarTags));

  return {
    id: params.id,
    seed: params.id,
    stage: params.stage,
    isCurated: true,
    chapterId: params.chapterId,
    titleDe: params.titleDe,
    questionDe,
    scenario,
    witnessIds: params.witnessIds,
    candidateItems: params.candidateItems,
    candidateLocations: params.candidateLocations,
    truthRule: params.truthRule,
    statements,
    solution: params.solution,
    solutionSpec: buildSolutionSpec(
      params.stage,
      scenario,
      params.solution,
      params.witnessIds,
      params.candidateItems,
      params.candidateLocations ?? [],
      defaultLexicon
    ),
    difficultyMetrics: {
      initialCandidates: searchSpace.length,
      deductionSteps: params.stage + 1,
      requiresGiver: Boolean(params.solution.giver),
      requiresLocation: Boolean(params.solution.location),
      grammarTags: [...tags],
    },
  };
}

export function getStoryChapters(): StoryChapter[] {
  const ch1Tutorial = buildCuratedCase({
    id: 'story-1-1',
    chapterId: 'chapter-1',
    stage: 1,
    titleDe: 'Fall 1: Ein Riss im Atrium',
    scenarioId: 'atrium-window',
    witnessIds: ['marcus', 'gaius', 'lucius'],
    candidateItems: ['lapis'],
    truthRule: 'EXACTLY_ONE_FALSE',
    solution: { culprit: 'gaius', object: 'lapis' },
    asts: [
      { kind: 'CULPRIT_IS', person: 'gaius' },
      { kind: 'CULPRIT_IS', person: 'lucius' },
      { kind: 'PERSON_ACTED_WITH', person: 'gaius', item: 'lapis' },
    ],
  });

  const ch2Tutorial = buildCuratedCase({
    id: 'story-2-1',
    chapterId: 'chapter-2',
    stage: 2,
    titleDe: 'Fall 4: Honigspuren in der Villa',
    scenarioId: 'villa-cake',
    witnessIds: ['marcus', 'gaius', 'lucius', 'claudia', 'cornelia'],
    candidateItems: ['saccus', 'corbis', 'calix'],
    truthRule: 'EXACTLY_ONE_FALSE',
    solution: { culprit: 'claudia', object: 'corbis' },
    asts: [
      { kind: 'CULPRIT_IS', person: 'claudia' },
      { kind: 'CULPRIT_IS', person: 'marcus' },
      { kind: 'OBJECT_IS', item: 'saccus', negated: true },
      { kind: 'OBJECT_IS', item: 'calix', negated: true },
      { kind: 'PERSON_ACTED_WITH', person: 'marcus', item: 'corbis', negated: true },
    ],
  });

  const ch3Tutorial = buildCuratedCase({
    id: 'story-3-1',
    chapterId: 'chapter-3',
    stage: 3,
    titleDe: 'Fall 7: Der heimliche Helfer im Garten',
    scenarioId: 'hortus-statue',
    witnessIds: ['marcus', 'gaius', 'lucius', 'claudia', 'cornelia'],
    candidateItems: ['pila', 'calix', 'lapis'],
    truthRule: 'EXACTLY_ONE_FALSE',
    solution: { culprit: 'lucius', object: 'pila', giver: 'cornelia' },
    asts: [
      { kind: 'CULPRIT_IS', person: 'lucius' },
      { kind: 'CULPRIT_IS', person: 'gaius' },
      { kind: 'OBJECT_IS', item: 'calix', negated: true },
      { kind: 'OBJECT_IS', item: 'lapis', negated: true },
      { kind: 'GAVE_TO', giver: 'cornelia', recipient: 'lucius', item: 'pila' },
    ],
  });

  return [
    {
      id: 'chapter-1',
      stage: 1,
      numberLabel: 'Kapitel 1',
      titleDe: 'Erste Spuren im Haus',
      subtitleDe: '3 Zeugen · 1 Frage · Nominativ & Akkusativ im Präsens',
      grammarFocusDe: 'Subjekt (Nominativ) vs. direktes Objekt (Akkusativ)',
      cases: [
        ch1Tutorial,
        generateCase({ seed: 'story-1-2', stage: 1, scenarioId: 'villa-cake', chapterId: 'chapter-1' }),
        generateCase({ seed: 'story-1-3', stage: 1, scenarioId: 'hortus-statue', chapterId: 'chapter-1' }),
      ],
    },
    {
      id: 'chapter-2',
      stage: 2,
      numberLabel: 'Kapitel 2',
      titleDe: 'Verneinung und Perfekt',
      subtitleDe: '5 Zeugen · 2 Fragen · Verneinung (non) & Perfekt',
      grammarFocusDe: 'Perfektformen und verneinte Aussagen sicher trennen',
      cases: [
        ch2Tutorial,
        generateCase({ seed: 'story-2-2', stage: 2, scenarioId: 'atrium-window', chapterId: 'chapter-2' }),
        generateCase({ seed: 'story-2-3', stage: 2, scenarioId: 'forum-letter', chapterId: 'chapter-2' }),
      ],
    },
    {
      id: 'chapter-3',
      stage: 3,
      numberLabel: 'Kapitel 3',
      titleDe: 'Komplizen und Dativ-Spuren',
      subtitleDe: '5 Zeugen · 3 Fragen · Dativ, Konjunktionen & Zeugenverweise',
      grammarFocusDe: 'Wem wurde es gegeben? Dativ und verbundene Sätze (et / sed)',
      cases: [
        ch3Tutorial,
        generateCase({ seed: 'story-3-2', stage: 3, scenarioId: 'officina-amphora', chapterId: 'chapter-3' }),
        generateCase({ seed: 'story-3-3', stage: 3, scenarioId: 'templum-wreath', chapterId: 'chapter-3' }),
      ],
    },
    {
      id: 'chapter-4',
      stage: 4,
      numberLabel: 'Kapitel 4',
      titleDe: 'Meisterdetektiv in Rom',
      subtitleDe: '5 Zeugen · 4 Fragen · Ablativ mit „in“ & komplexe Wahrheitsregeln',
      grammarFocusDe: 'Wo geschah es? Präpositionen mit Ablativ & mehrstufige Logik',
      cases: [
        generateCase({ seed: 'story-4-1', stage: 4, scenarioId: 'templum-wreath', chapterId: 'chapter-4' }),
        generateCase({ seed: 'story-4-2', stage: 4, scenarioId: 'forum-letter', chapterId: 'chapter-4' }),
        generateCase({ seed: 'story-4-3', stage: 4, scenarioId: 'officina-amphora', chapterId: 'chapter-4' }),
      ],
    },
  ];
}

export function getDailyCase(dateStr: string): CaseDefinition {
  // Deterministic daily seed from YYYY-MM-DD
  const dayNum = Number.parseInt(dateStr.replace(/-/g, ''), 10) || 20261117;
  const stage = ((dayNum % 3) + 2) as DifficultyStage; // Stage 2, 3, or 4 for rich daily puzzle
  return generateCase({
    seed: `daily-${dateStr}`,
    stage,
  });
}
