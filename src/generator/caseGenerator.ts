import {
  countSolutionsAfterSingleTrueStatement,
  evaluateStatement,
  hasNoRedundantStatement,
  solveCase,
  buildSearchSpace,
} from '../core/solver';
import {
  CampusLessonRange,
  CaseAssignment,
  CaseDefinition,
  DifficultyStage,
  GrammarFocus,
  ScenarioTemplate,
  StatementAST,
  TruthRuleId,
  WitnessStatement,
} from '../core/types';
import { buildCampusScenarios, getCampusLexicon } from '../latin/campusLexicon';
import { LatinLexicon, defaultLexicon } from '../latin/inflector';
import { buildSolutionSpec, renderStatement } from '../latin/renderer';
import { SeededRandom } from './prng';
import { ALL_WITNESSES, SCENARIOS } from './scenarios';

export interface GenerateCaseOptions {
  seed: string;
  stage: DifficultyStage;
  scenarioId?: string;
  preferredRule?: TruthRuleId;
  grammarBias?: GrammarFocus;
  chapterId?: string;
  lexicon?: LatinLexicon;
  campusLessonRange?: CampusLessonRange;
}

const STAGE_RULES: Record<DifficultyStage, TruthRuleId[]> = {
  1: ['EXACTLY_ONE_FALSE', 'EXACTLY_ONE_TRUE'],
  2: ['EXACTLY_ONE_FALSE', 'EXACTLY_ONE_TRUE'],
  3: ['EXACTLY_ONE_FALSE', 'EXACTLY_TWO_FALSE', 'CULPRIT_LIES_OTHERS_TRUTH'],
  4: ['EXACTLY_TWO_FALSE', 'EXACTLY_TWO_TRUE', 'CULPRIT_LIES_OTHERS_TRUTH'],
};

interface ScoredCandidate {
  ast: StatementAST;
  score: number;
  coversCulprit: boolean;
  coversObject: boolean;
  coversGiver: boolean;
  coversLocation: boolean;
}

function astCoverage(ast: StatementAST): {
  coversCulprit: boolean;
  coversObject: boolean;
  coversGiver: boolean;
  coversLocation: boolean;
} {
  switch (ast.kind) {
    case 'CULPRIT_IS':
      return { coversCulprit: true, coversObject: false, coversGiver: false, coversLocation: false };
    case 'OBJECT_IS':
      return { coversCulprit: false, coversObject: true, coversGiver: false, coversLocation: false };
    case 'PERSON_ACTED_WITH':
      return { coversCulprit: true, coversObject: true, coversGiver: false, coversLocation: false };
    case 'GIVER_IS':
      return { coversCulprit: false, coversObject: false, coversGiver: true, coversLocation: false };
    case 'GAVE_TO':
      return { coversCulprit: true, coversObject: true, coversGiver: true, coversLocation: false };
    case 'IN_LOCATION':
      return { coversCulprit: true, coversObject: false, coversGiver: false, coversLocation: true };
    case 'WITNESS_TRUTH':
      return { coversCulprit: false, coversObject: false, coversGiver: false, coversLocation: false };
    case 'CONJUNCTION': {
      const l = astCoverage(ast.left);
      const r = astCoverage(ast.right);
      return {
        coversCulprit: l.coversCulprit || r.coversCulprit,
        coversObject: l.coversObject || r.coversObject,
        coversGiver: l.coversGiver || r.coversGiver,
        coversLocation: l.coversLocation || r.coversLocation,
      };
    }
  }
}

function buildCandidatePool(params: {
  stage: DifficultyStage;
  suspects: string[];
  items: string[];
  locations: string[];
  target: CaseAssignment;
  requireGiver: boolean;
  requireLocation: boolean;
}): StatementAST[] {
  const { stage, suspects, items, locations, target, requireGiver, requireLocation } = params;
  const pool: StatementAST[] = [];

  for (const p of suspects) {
    pool.push({ kind: 'CULPRIT_IS', person: p, negated: false });
    if (stage >= 2) {
      pool.push({ kind: 'CULPRIT_IS', person: p, negated: true });
    }
  }

  if (stage >= 2) {
    for (const it of items) {
      pool.push({ kind: 'OBJECT_IS', item: it, negated: false });
      pool.push({ kind: 'OBJECT_IS', item: it, negated: true });
    }
  }

  for (const p of suspects) {
    for (const it of items) {
      if (stage === 1) {
        pool.push({ kind: 'PERSON_ACTED_WITH', person: p, item: it, negated: false });
      } else {
        pool.push({ kind: 'PERSON_ACTED_WITH', person: p, item: it, negated: true });
      }
    }
  }

  if (requireGiver) {
    for (const g of suspects) {
      pool.push({ kind: 'GIVER_IS', giver: g, negated: false });
      pool.push({ kind: 'GIVER_IS', giver: g, negated: true });
    }
    // Include targeted GAVE_TO facts (true and near-miss false)
    for (const g of suspects) {
      if (g === target.culprit) continue;
      pool.push({ kind: 'GAVE_TO', giver: g, recipient: target.culprit, item: target.object, negated: false });
    }
  }

  if (requireLocation) {
    for (const p of suspects) {
      for (const loc of locations) {
        pool.push({ kind: 'IN_LOCATION', person: p, location: loc, negated: false });
        if (p === target.culprit) {
          pool.push({ kind: 'IN_LOCATION', person: p, location: loc, negated: true });
        }
      }
    }
  }

  // Informative conjunctions tying culprit/object/giver/location together cleanly
  if (stage >= 3) {
    for (const p of suspects) {
      for (const it of items) {
        pool.push({
          kind: 'CONJUNCTION',
          connector: 'et',
          left: { kind: 'CULPRIT_IS', person: p, negated: false },
          right: { kind: 'OBJECT_IS', item: it, negated: false },
        });
      }
    }
    if (requireGiver && target.giver) {
      for (const g of suspects) {
        for (const it of items) {
          pool.push({
            kind: 'CONJUNCTION',
            connector: 'sed',
            left: { kind: 'GIVER_IS', giver: g, negated: false },
            right: { kind: 'OBJECT_IS', item: it, negated: true },
          });
        }
      }
    }
    if (requireLocation && target.location && target.giver) {
      for (const loc of locations) {
        for (const g of suspects) {
          pool.push({
            kind: 'CONJUNCTION',
            connector: 'et',
            left: { kind: 'GIVER_IS', giver: g, negated: false },
            right: { kind: 'IN_LOCATION', person: target.culprit, location: loc, negated: false },
          });
        }
      }
    }
  }

  return pool;
}

/**
 * Guarantees a mathematically unique, non-redundant puzzle for any stage & rule
 * via deterministic seeded search + constructive fallback.
 */
export function generateCase(options: GenerateCaseOptions): CaseDefinition {
  const {
    seed,
    stage,
    scenarioId,
    preferredRule,
    grammarBias,
    chapterId,
    campusLessonRange,
    lexicon = campusLessonRange ? getCampusLexicon(campusLessonRange) : defaultLexicon,
  } = options;

  const rng = new SeededRandom(seed);
  const scenarioPool = campusLessonRange ? buildCampusScenarios(campusLessonRange) : SCENARIOS;
  const baseScenario = scenarioId
    ? scenarioPool.find((s) => s.id === scenarioId) ?? rng.pick(scenarioPool)
    : rng.pick(scenarioPool);

  const scenario: ScenarioTemplate = {
    ...baseScenario,
    preferredTense: stage === 1 ? 'present' : 'perfect',
  };

  const witnessCount = stage === 1 ? 3 : 5;
  const witnessIds = rng.shuffle([...ALL_WITNESSES]).slice(0, witnessCount);
  const candidateItems =
    stage === 1 ? scenario.candidateItems.slice(0, 1) : scenario.candidateItems.slice(0, 3);
  const requireGiver = stage >= 3;
  const requireLocation = stage === 4;
  const candidateLocations = requireLocation ? scenario.candidateLocations.slice(0, 3) : [];

  const truthRule = preferredRule ?? rng.pick(STAGE_RULES[stage]);

  const searchSpace = buildSearchSpace({
    suspects: witnessIds,
    items: candidateItems,
    requireGiver,
    locations: candidateLocations,
  });

  const target = rng.pick(searchSpace);

  const rawPool = buildCandidatePool({
    stage,
    suspects: witnessIds,
    items: candidateItems,
    locations: candidateLocations,
    target,
    requireGiver,
    requireLocation,
  });

  const trueCandidates: ScoredCandidate[] = [];
  const falseCandidates: ScoredCandidate[] = [];

  for (const ast of rawPool) {
    // Prevent single-statement full giveaway when multiple variables exist
    if (searchSpace.length > 3 && countSolutionsAfterSingleTrueStatement(ast, searchSpace) === 1) {
      continue;
    }
    const cov = astCoverage(ast);
    const isStrong =
      ast.kind === 'CULPRIT_IS' ||
      ast.kind === 'OBJECT_IS' ||
      ast.kind === 'GIVER_IS' ||
      ast.kind === 'IN_LOCATION' ||
      ast.kind === 'CONJUNCTION';

    let score = isStrong ? 5 : 1;
    if (ast.kind === 'CONJUNCTION') score += 3;
    if (stage === 4 && cov.coversLocation) score += 3;
    if (stage === 3 && cov.coversGiver) score += 3;
    if (grammarBias === 'negation' && 'negated' in ast && ast.negated) score += 4;
    if (grammarBias === 'conjunction' && ast.kind === 'CONJUNCTION') score += 5;
    if (grammarBias === 'dative' && cov.coversGiver) score += 4;
    if (grammarBias === 'ablative' && cov.coversLocation) score += 4;

    const item: ScoredCandidate = { ast, score, ...cov };
    if (evaluateStatement(ast, target)) {
      trueCandidates.push(item);
    } else {
      falseCandidates.push(item);
    }
  }

  const pickWeighted = (
    list: ScoredCandidate[],
    usedKeys: Set<string>,
    filterFn?: (c: ScoredCandidate) => boolean
  ): StatementAST => {
    let avail = list.filter((item) => !usedKeys.has(JSON.stringify(item.ast)) && (!filterFn || filterFn(item)));
    if (avail.length === 0) {
      avail = list.filter((item) => !usedKeys.has(JSON.stringify(item.ast)));
    }
    if (avail.length === 0) avail = list;
    const total = avail.reduce((acc, x) => acc + x.score, 0);
    let r = rng.next() * total;
    for (const item of avail) {
      r -= item.score;
      if (r <= 0) return item.ast;
    }
    return avail[0].ast;
  };

  const makeTruthMask = (): boolean[] => {
    const mask = new Array(witnessCount).fill(true);
    switch (truthRule) {
      case 'EXACTLY_ONE_FALSE': {
        mask[rng.int(0, witnessCount)] = false;
        return mask;
      }
      case 'EXACTLY_ONE_TRUE': {
        mask.fill(false);
        mask[rng.int(0, witnessCount)] = true;
        return mask;
      }
      case 'EXACTLY_TWO_FALSE': {
        rng.shuffle(witnessIds.map((_, i) => i)).slice(0, 2).forEach((i) => (mask[i] = false));
        return mask;
      }
      case 'EXACTLY_TWO_TRUE': {
        mask.fill(false);
        rng.shuffle(witnessIds.map((_, i) => i)).slice(0, 2).forEach((i) => (mask[i] = true));
        return mask;
      }
      case 'CULPRIT_LIES_OTHERS_TRUTH':
        return witnessIds.map((w) => w !== target.culprit);
    }
  };

  let chosenAsts: StatementAST[] | null = null;
  const MAX_ATTEMPTS = 75;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const truthMask = makeTruthMask();
    const usedKeys = new Set<string>();
    const candidateStmts: Array<{ speakerId: string; ast: StatementAST }> = [];

    // Assign role targets for true statements so all variables are covered cleanly
    const trueIndices = truthMask.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    const neededRoles: Array<(c: ScoredCandidate) => boolean> = [];
    if (requireLocation) neededRoles.push((c) => c.coversLocation);
    if (requireGiver) neededRoles.push((c) => c.coversGiver);
    if (stage >= 2) neededRoles.push((c) => c.coversObject);
    neededRoles.push((c) => c.coversCulprit);

    for (let i = 0; i < witnessCount; i++) {
      const wantTrue = truthMask[i];
      let ast: StatementAST;
      if (wantTrue) {
        const trueRank = trueIndices.indexOf(i);
        const roleFilter = trueRank >= 0 && trueRank < neededRoles.length ? neededRoles[trueRank] : undefined;
        ast = pickWeighted(trueCandidates, usedKeys, roleFilter);
      } else if (
        stage >= 3 &&
        i === witnessCount - 1 &&
        attempt % 4 === 0 &&
        truthRule !== 'CULPRIT_LIES_OTHERS_TRUTH'
      ) {
        const refIdx = rng.int(0, i);
        ast = { kind: 'WITNESS_TRUTH', witnessIndex: refIdx, speaksTruth: !truthMask[refIdx] };
      } else {
        // When truthRule has few true statements (e.g. EXACTLY_ONE_TRUE / EXACTLY_TWO_TRUE),
        // false statements must also cover missing roles (via negation of true facts)!
        const roleFilter =
          truthRule === 'EXACTLY_ONE_TRUE' || truthRule === 'EXACTLY_TWO_TRUE'
            ? (c: ScoredCandidate) =>
                (!requireLocation || c.coversLocation || c.coversGiver || c.coversObject || c.coversCulprit)
            : undefined;
        ast = pickWeighted(falseCandidates, usedKeys, roleFilter);
      }
      usedKeys.add(JSON.stringify(ast));
      candidateStmts.push({ speakerId: witnessIds[i], ast });
    }

    const solve = solveCase({ statements: candidateStmts, truthRule, searchSpace });
    if (!solve.isUnique) continue;

    if (stage >= 2 && attempt < 45 && !hasNoRedundantStatement({ statements: candidateStmts, truthRule, searchSpace })) {
      continue;
    }

    chosenAsts = candidateStmts.map((s) => s.ast);
    break;
  }

  if (!chosenAsts) {
    chosenAsts = buildConstructiveFallback(
      witnessIds,
      candidateItems,
      candidateLocations,
      target,
      truthRule,
      requireGiver,
      requireLocation,
      rng
    );
    const fallbackSolve = solveCase({
      statements: chosenAsts.map((ast, i) => ({ speakerId: witnessIds[i], ast })),
      truthRule,
      searchSpace,
    });
    if (!fallbackSolve.isUnique) {
      return generateCase({
        ...options,
        seed: `${seed}-fb`,
        preferredRule: 'CULPRIT_LIES_OTHERS_TRUTH',
      });
    }
  }

  const statements: WitnessStatement[] = chosenAsts.map((ast, idx) => {
    const rendered = renderStatement(ast, scenario, witnessIds, lexicon);
    return {
      witnessIndex: idx,
      speakerId: witnessIds[idx],
      ast,
      tokens: rendered.tokens,
      latinText: rendered.latinText,
      germanText: rendered.germanText,
      hasAmbiguousForm: rendered.hasAmbiguousForm,
      grammarTags: rendered.grammarTags,
    };
  });

  const allTags = new Set<GrammarFocus>();
  statements.forEach((s) => s.grammarTags.forEach((t) => allTags.add(t)));
  if (requireGiver) allTags.add('dative');
  if (requireLocation) allTags.add('ablative');

  const questionDe =
    stage === 1
      ? scenario.question1De
      : stage === 2
      ? scenario.question2De
      : stage === 3
      ? scenario.question3De
      : scenario.question4De;

  const solutionSpec = buildSolutionSpec(
    stage,
    scenario,
    target,
    witnessIds,
    candidateItems,
    candidateLocations,
    lexicon
  );

  return {
    id: `gen-${stage}-${seed}`,
    seed,
    stage,
    chapterId,
    campusLessonRange,
    titleDe: scenario.titleDe,
    questionDe,
    scenario,
    witnessIds,
    candidateItems,
    candidateLocations,
    truthRule,
    statements,
    solution: target,
    solutionSpec,
    difficultyMetrics: {
      initialCandidates: searchSpace.length,
      deductionSteps: stage + (truthRule === 'EXACTLY_ONE_FALSE' ? 1 : 2),
      requiresGiver: requireGiver,
      requiresLocation: requireLocation,
      grammarTags: [...allTags],
    },
  };
}

function buildConstructiveFallback(
  witnessIds: string[],
  items: string[],
  locations: string[],
  target: CaseAssignment,
  truthRule: TruthRuleId,
  requireGiver: boolean,
  requireLocation: boolean,
  rng: SeededRandom
): StatementAST[] {
  const otherPerson = witnessIds.find((w) => w !== target.culprit)!;
  const thirdPerson = witnessIds.find((w) => w !== target.culprit && w !== otherPerson) ?? otherPerson;
  const otherItem = items.find((i) => i !== target.object) ?? items[0];
  const thirdItem = items.find((i) => i !== target.object && i !== otherItem) ?? otherItem;
  const otherLoc = locations.find((l) => l !== target.location) ?? locations[0];
  const otherGiver = witnessIds.find((w) => w !== target.culprit && w !== target.giver) ?? otherPerson;

  if (witnessIds.length === 3) {
    if (truthRule === 'EXACTLY_ONE_TRUE') {
      return [
        { kind: 'CULPRIT_IS', person: target.culprit, negated: false },
        { kind: 'CULPRIT_IS', person: otherPerson, negated: false },
        { kind: 'CULPRIT_IS', person: thirdPerson, negated: false },
      ];
    }
    return [
      { kind: 'CULPRIT_IS', person: target.culprit, negated: false },
      { kind: 'CULPRIT_IS', person: otherPerson, negated: false },
      { kind: 'PERSON_ACTED_WITH', person: target.culprit, item: target.object, negated: false },
    ];
  }

  // Construct 5 strong statements that together uniquely pinpoint all variables even under lies
  const culpritAndObjTrue: StatementAST = {
    kind: 'CONJUNCTION',
    connector: 'et',
    left: { kind: 'CULPRIT_IS', person: target.culprit, negated: false },
    right: { kind: 'OBJECT_IS', item: target.object, negated: false },
  };
  const giverAndLocTrue: StatementAST =
    requireLocation && target.location && target.giver
      ? {
          kind: 'CONJUNCTION',
          connector: 'et',
          left: { kind: 'GIVER_IS', giver: target.giver, negated: false },
          right: { kind: 'IN_LOCATION', person: target.culprit, location: target.location, negated: false },
        }
      : requireGiver && target.giver
      ? { kind: 'GIVER_IS', giver: target.giver, negated: false }
      : { kind: 'OBJECT_IS', item: otherItem, negated: true };

  const truePool: StatementAST[] = [
    culpritAndObjTrue,
    { kind: 'CULPRIT_IS', person: target.culprit, negated: false },
    { kind: 'OBJECT_IS', item: target.object, negated: false },
    giverAndLocTrue,
    requireLocation && target.location
      ? { kind: 'IN_LOCATION', person: target.culprit, location: target.location, negated: false }
      : requireGiver && target.giver
      ? { kind: 'GIVER_IS', giver: target.giver, negated: false }
      : { kind: 'OBJECT_IS', item: thirdItem, negated: true },
  ];

  // False statements that when negated uniquely reinforce target!
  const falsePool: StatementAST[] = [
    { kind: 'CULPRIT_IS', person: target.culprit, negated: true },
    { kind: 'OBJECT_IS', item: target.object, negated: true },
    requireGiver && target.giver
      ? { kind: 'GIVER_IS', giver: target.giver, negated: true }
      : { kind: 'CULPRIT_IS', person: otherPerson, negated: false },
    requireLocation && target.location
      ? { kind: 'IN_LOCATION', person: target.culprit, location: target.location, negated: true }
      : { kind: 'OBJECT_IS', item: otherItem, negated: false },
    requireGiver && target.giver
      ? { kind: 'GIVER_IS', giver: otherGiver, negated: false }
      : requireLocation && otherLoc
      ? { kind: 'IN_LOCATION', person: otherPerson, location: otherLoc, negated: false }
      : { kind: 'PERSON_ACTED_WITH', person: otherPerson, item: otherItem, negated: false },
  ];

  if (truthRule === 'CULPRIT_LIES_OTHERS_TRUTH') {
    return witnessIds.map((w, i) => (w === target.culprit ? falsePool[i] : truePool[i]));
  }
  if (truthRule === 'EXACTLY_ONE_FALSE') {
    const lieIdx = rng.int(0, 5);
    return truePool.map((s, i) => (i === lieIdx ? falsePool[i] : s));
  }
  if (truthRule === 'EXACTLY_TWO_FALSE') {
    // Keep culpritAndObjTrue & giverAndLocTrue true + 1 more true; 2 false
    return [truePool[0], falsePool[1], falsePool[2], truePool[3], truePool[4]];
  }
  if (truthRule === 'EXACTLY_TWO_TRUE') {
    // 2 strong true conjunctions + 3 negated-truth false statements -> unique!
    return [truePool[0], truePool[3], falsePool[0], falsePool[1], falsePool[2]];
  }
  // EXACTLY_ONE_TRUE
  return [truePool[0], falsePool[0], falsePool[1], falsePool[2], falsePool[3]];
}
