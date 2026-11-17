import { evaluateTruthRule } from './truthRules';
import { CaseAssignment, StatementAST, TruthRuleId } from './types';

/**
 * Evaluates a single AST against a candidate world assignment.
 * Non-referential statements ignore `priorTruths`; `WITNESS_TRUTH` reads from `priorTruths`.
 */
export function evaluateStatement(
  ast: StatementAST,
  assignment: CaseAssignment,
  priorTruths?: boolean[]
): boolean {
  const applyNeg = (val: boolean, negated?: boolean) => (negated ? !val : val);

  switch (ast.kind) {
    case 'CULPRIT_IS':
      return applyNeg(assignment.culprit === ast.person, ast.negated);

    case 'OBJECT_IS':
      return applyNeg(assignment.object === ast.item, ast.negated);

    case 'PERSON_ACTED_WITH': {
      const bothMatch = assignment.culprit === ast.person && assignment.object === ast.item;
      return applyNeg(bothMatch, ast.negated);
    }

    case 'GIVER_IS':
      return applyNeg(assignment.giver === ast.giver, ast.negated);

    case 'GAVE_TO': {
      const match =
        assignment.giver === ast.giver &&
        assignment.culprit === ast.recipient &&
        assignment.object === ast.item;
      return applyNeg(match, ast.negated);
    }

    case 'IN_LOCATION':
      // Meaning: culprit was in location if person === culprit, otherwise we model location of the crime/culprit!
      // More precisely: in our case world, `assignment.location` is where the culprit was when acting.
      // Wait: if a witness says "Marcus in horto erat" and Marcus is NOT the culprit, could Marcus have been in horto?
      // To keep world semantics 100% sound and unambiguous: we state "Culprit was in location" OR we explicitly evaluate
      // `IN_LOCATION(person, loc)` as: "person is the culprit AND the crime took place at loc" OR we only assign truth if
      // `location` belongs to culprit's alibi! Wait: let's make `IN_LOCATION` crystal clear:
      // In Latin: "Marcus in horto erat." If `assignment.location` is the crime scene / culprit's location, then:
      // Wait: if Marcus was in the garden, and the crime happened in the atrium, Marcus is NOT the culprit!
      // Better model: In Stage 4, the 4th variable `assignment.location` is "Where did the culprit act?" (Tatort).
      // Wait: if someone says "Gaius in horto erat", that doesn't by itself say Gaius is the culprit unless the rule or
      // statement links location to the crime. Even cleaner: in `IN_LOCATION`, if `person === assignment.culprit`, it's true iff
      // `loc === assignment.location`; what if `person !== assignment.culprit`? Then whether an innocent person was in `loc`
      // would be an unconstrained hidden variable!
      // CRITICAL INSIGHT for logical soundness: Every predicate evaluated by the solver MUST depend ONLY on the variables in `CaseAssignment`!
      // How do we express location cleanly in `CaseAssignment` without hidden variables?
      // Option A: `IN_LOCATION` means "Der Tatgegenstand / Täter war am Ort X" -> e.g. `Lapis in horto erat` (OBJECT_IN_LOCATION)!
      // Option B: `Gaius in horto erat` where `assignment.culpritLocation` is the ONLY person-location? No, innocent people can be anywhere.
      // Option A (`Lapis in horto erat` / `Pila in atrio erat` = "Der Gegenstand war im Garten") OR
      // Option C (`assignment.location` = where the CULPRIT was, and `IN_LOCATION` is phrased as:
      // `Marcus in horto non erat` when Marcus was seen elsewhere? Still ambiguous unless only 1 location exists).
      // Let's make `IN_LOCATION(item, location)` OR keep `person` only if we phrase it as `Gaius in horto non fregit`?
      // Wait: "Lapis in horto est/fuit" ("Der Stein war im Garten") or "Pila in atrio non fuit" — wait: what if `assignment.location` is the location of the stolen/used item or the scene where the culprit hid?
      // Even simpler and 100% logically watertight:
      // Make `CaseAssignment.location` = "Wo war der Täter / das Beweisstück?" — wait: if `IN_LOCATION` says `person` + `location`, e.g. `Gaius in horto erat`, if we define the case premise as:
      // "Alle verdächtigen Zeugen waren im [Tatort], nur einer kam von woanders" -> no, too contrived!
      // Instead: What if in `IN_LOCATION`, `person` is actually `culprit`? No, if `Gaius in horto erat` is FALSE when Gaius is NOT the culprit, that would mean nobody else could be in the garden.
      // Whereas if we say: "In atrio erat" -> `Pila in atrio erat` ("Der Ball war im Atrium")? Still, multiple items could be in the atrium unless `assignment.location` is specifically "Der Ort der Tat / Versteck"!
      // Wait: What if `IN_LOCATION` evaluates `culprit === ast.person && location === ast.location`? Then `Marcus in horto non erat` means "Es stimmt nicht, dass Marcus (als Täter) im Garten war". That could confuse a 12-year-old reading "Marcus war nicht im Garten"!
      // How do we make the Latin sentence match the logic 100% naturally for a 12-year-old?
      // Look at `Gaius lapidem in horto iecit.` ("Gaius hat den Stein im Garten geworfen.") -> that literally means `culprit === Gaius && object === lapis && location === hortus`! Or `Gaius in horto fregit` ("Gaius hat es im Garten zerbrochen") or `In horto fenestra fracta est` / `Culprit + in + Abl + crimeVerb`:
      // `Gaius in horto rapuit.` / `Marcus in foro non iecit.` / `In atrio lapis erat.`
      // YES! `Gaius in horto fenestram fregit` or `Gaius in horto rapuit` / `Aliquis in horto...` or even simpler:
      // `Gaius in horto iacit` ("Gaius wirft [es] im Garten") / `Gaius in horto non rapuit` ("Gaius hat [es] nicht im Garten geraubt")!
      // Wait: if `Gaius in horto non rapuit` is evaluated: if Gaius didn't commit the theft at all, then "Gaius hat es im Garten geraubt" is FALSE, so "Gaius hat es nicht im Garten geraubt" is TRUE! And if Gaius DID commit it in the forum, then "Gaius hat es im Garten geraubt" is also FALSE!
      // That matches German/Latin intuition 100% AND depends ONLY on `(culprit, location)`!
      return applyNeg(
        assignment.culprit === ast.person && assignment.location === ast.location,
        ast.negated
      );

    case 'WITNESS_TRUTH':
      if (!priorTruths) {
        throw new Error('WITNESS_TRUTH benötigt vorab berechnete Aussagenwerte.');
      }
      return ast.speaksTruth ? priorTruths[ast.witnessIndex] : !priorTruths[ast.witnessIndex];

    case 'CONJUNCTION': {
      const l = evaluateStatement(ast.left, assignment, priorTruths);
      const r = evaluateStatement(ast.right, assignment, priorTruths);
      return l && r;
    }
  }
}

/**
 * Generates the full finite search space of valid CaseAssignments.
 */
export function buildSearchSpace(params: {
  suspects: string[];
  items: string[];
  requireGiver: boolean;
  locations?: string[];
}): CaseAssignment[] {
  const { suspects, items, requireGiver, locations } = params;
  const givers: Array<string | undefined> = requireGiver ? suspects : [undefined];
  const locs: Array<string | undefined> = locations && locations.length > 0 ? locations : [undefined];

  const space: CaseAssignment[] = [];
  for (const culprit of suspects) {
    for (const object of items) {
      for (const giver of givers) {
        if (requireGiver && giver === culprit) {
          // The giver gives the item to the culprit (different person)
          continue;
        }
        for (const location of locs) {
          space.push({ culprit, object, giver, location });
        }
      }
    }
  }
  return space;
}

export interface SolveResult {
  solutions: CaseAssignment[];
  isUnique: boolean;
  totalSpaceSize: number;
}

export function solveCase(params: {
  statements: Array<{ speakerId: string; ast: StatementAST }>;
  truthRule: TruthRuleId;
  searchSpace: CaseAssignment[];
}): SolveResult {
  const { statements, truthRule, searchSpace } = params;
  const speakerIds = statements.map((s) => s.speakerId);
  const solutions: CaseAssignment[] = [];

  for (const candidate of searchSpace) {
    // Pass 1: evaluate non-referential statements
    const truths = statements.map((s) =>
      s.ast.kind === 'WITNESS_TRUTH' ? false : evaluateStatement(s.ast, candidate)
    );
    // Pass 2: evaluate referential statements (WITNESS_TRUTH)
    for (let i = 0; i < statements.length; i++) {
      if (statements[i].ast.kind === 'WITNESS_TRUTH') {
        truths[i] = evaluateStatement(statements[i].ast, candidate, truths);
      }
    }

    if (evaluateTruthRule(truthRule, truths, speakerIds, candidate)) {
      solutions.push(candidate);
    }
  }

  return {
    solutions,
    isUnique: solutions.length === 1,
    totalSpaceSize: searchSpace.length,
  };
}

/**
 * Checks whether every witness statement contributes to narrowing the solution space
 * (for rules where removing a witness makes sense, i.e., count-based rules if we adjust
 * or simply checking that no single statement alone isolates 1 solution under a truth assumption
 * without first proving its truth value, and checking how many candidates remain after subset queries).
 */
export function countSolutionsAfterSingleTrueStatement(
  ast: StatementAST,
  searchSpace: CaseAssignment[]
): number {
  if (ast.kind === 'WITNESS_TRUTH') return searchSpace.length;
  let count = 0;
  for (const c of searchSpace) {
    if (evaluateStatement(ast, c)) count++;
  }
  return count;
}

/**
 * Verifies that no statement is trivially redundant:
 * For every index i, if we hide/ignore statement i (meaning statement i could be either true or false
 * while remaining consistent with the rule's bounds), more than 1 candidate remains possible.
 */
export function hasNoRedundantStatement(params: {
  statements: Array<{ speakerId: string; ast: StatementAST }>;
  truthRule: TruthRuleId;
  searchSpace: CaseAssignment[];
}): boolean {
  const { statements, truthRule, searchSpace } = params;
  const speakerIds = statements.map((s) => s.speakerId);

  for (let omitted = 0; omitted < statements.length; omitted++) {
    // If any other statement references `omitted` via WITNESS_TRUTH, it's definitely needed
    const isReferenced = statements.some(
      (s) => s.ast.kind === 'WITNESS_TRUTH' && s.ast.witnessIndex === omitted
    );
    if (isReferenced) continue;

    let possibleWithoutOmitted = 0;
    for (const candidate of searchSpace) {
      const baseTruths = statements.map((s) =>
        s.ast.kind === 'WITNESS_TRUTH' ? false : evaluateStatement(s.ast, candidate)
      );
      for (let i = 0; i < statements.length; i++) {
        if (statements[i].ast.kind === 'WITNESS_TRUTH') {
          baseTruths[i] = evaluateStatement(statements[i].ast, candidate, baseTruths);
        }
      }

      // Test if candidate could satisfy the rule if omitted statement were true OR false
      const truthsIfTrue = [...baseTruths];
      truthsIfTrue[omitted] = true;
      const truthsIfFalse = [...baseTruths];
      truthsIfFalse[omitted] = false;

      if (
        evaluateTruthRule(truthRule, truthsIfTrue, speakerIds, candidate) ||
        evaluateTruthRule(truthRule, truthsIfFalse, speakerIds, candidate)
      ) {
        possibleWithoutOmitted++;
        if (possibleWithoutOmitted > 1) break;
      }
    }

    if (possibleWithoutOmitted <= 1) {
      return false; // Statement `omitted` was not needed for uniqueness!
    }
  }

  return true;
}
