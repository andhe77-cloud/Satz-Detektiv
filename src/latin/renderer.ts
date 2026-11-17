import {
  CaseAssignment,
  DifficultyStage,
  GrammarFocus,
  ScenarioTemplate,
  SolutionSlot,
  SolutionSpec,
  StatementAST,
  WordToken,
} from '../core/types';
import {
  LatinLexicon,
  createNounToken,
  createParticleToken,
  createVerbToken,
  defaultLexicon,
  inflectNounSingular,
  isCaseFormStructurallyAmbiguous,
} from './inflector';

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function capitalizeToken(token: WordToken): WordToken {
  return { ...token, text: capitalizeFirst(token.text) };
}

function appendPunctuation(tokens: WordToken[], punct: string): WordToken[] {
  return [
    ...tokens,
    {
      text: punct,
      lemma: punct,
      pos: 'Satzzeichen',
      grammarLabel: 'Satzzeichen',
      meaningDe: '',
    },
  ];
}

function tokensToLatinString(tokens: WordToken[]): string {
  let out = '';
  for (const t of tokens) {
    if (t.pos === 'Satzzeichen') {
      out += t.text;
    } else {
      out += (out.length > 0 ? ' ' : '') + t.text;
    }
  }
  return out;
}

interface ClauseRenderResult {
  tokens: WordToken[];
  german: string;
  hasAmbiguousForm: boolean;
  grammarTags: GrammarFocus[];
}

function renderSimpleClause(
  ast: Exclude<StatementAST, { kind: 'CONJUNCTION' }>,
  scenario: ScenarioTemplate,
  witnessIds: string[],
  lexicon: LatinLexicon
): ClauseRenderResult {
  const tense = scenario.preferredTense;
  const targetNoun = lexicon.getNoun(scenario.targetNounId);
  const crimeVerb = lexicon.getVerb(scenario.crimeVerbId);
  const actionVerb = lexicon.getVerb(scenario.actionVerbId);
  const dareVerb = lexicon.getVerb('dare');
  const esseVerb = lexicon.getVerb('esse');
  const dicereVerb = lexicon.getVerb('dicere');

  const tags = new Set<GrammarFocus>();
  if (tense === 'perfect') tags.add('perfect');

  const neg = Boolean('negated' in ast && ast.negated);
  if (neg) tags.add('negation');

  const negToken = neg ? createParticleToken(lexicon, 'non', 'negation') : null;

  switch (ast.kind) {
    case 'CULPRIT_IS': {
      const person = lexicon.getNoun(ast.person);
      tags.add('nominative');
      tags.add('accusative');
      const subjTok = createNounToken(person, 'nom');
      const objTok = createNounToken(targetNoun, 'acc');
      const verbTok = createVerbToken(crimeVerb, tense);

      const tokens = negToken ? [subjTok, objTok, negToken, verbTok] : [subjTok, objTok, verbTok];
      const amb =
        isCaseFormStructurallyAmbiguous(person, 'nom') ||
        isCaseFormStructurallyAmbiguous(targetNoun, 'acc');

      const german =
        tense === 'present'
          ? `${person.meaningDe} ${crimeVerb.meaningDePres3Sg} ${targetNoun.meaningDe.replace(/^(der|die|das) /, (m) => (m === 'der ' ? 'den ' : m))}${neg ? ' nicht' : ''}.`
          : `${person.meaningDe} ${crimeVerb.meaningDePerfAux ?? 'hat'} ${targetNoun.meaningDe.replace(/^(der|die|das) /, (m) => (m === 'der ' ? 'den ' : m))}${neg ? ' nicht' : ''} ${crimeVerb.meaningDePerfPart}.`;

      return { tokens, german, hasAmbiguousForm: amb, grammarTags: [...tags] };
    }

    case 'OBJECT_IS': {
      const item = lexicon.getNoun(ast.item);
      tags.add('nominative');
      tags.add('accusative');
      const subjTok = createNounToken(item, 'nom');
      const objTok = createNounToken(targetNoun, 'acc');
      const verbTok = createVerbToken(crimeVerb, tense);

      const tokens = negToken ? [subjTok, objTok, negToken, verbTok] : [subjTok, objTok, verbTok];
      const amb =
        isCaseFormStructurallyAmbiguous(item, 'nom') ||
        isCaseFormStructurallyAmbiguous(targetNoun, 'acc');

      const itemCap = capitalizeFirst(item.meaningDe);
      const targetAccDe = targetNoun.meaningDe.replace(/^der /, 'den ');
      const german =
        tense === 'present'
          ? `${itemCap} ${crimeVerb.meaningDePres3Sg} ${targetAccDe}${neg ? ' nicht' : ''}.`
          : `${itemCap} ${crimeVerb.meaningDePerfAux ?? 'hat'} ${targetAccDe}${neg ? ' nicht' : ''} ${crimeVerb.meaningDePerfPart}.`;

      return { tokens, german, hasAmbiguousForm: amb, grammarTags: [...tags] };
    }

    case 'PERSON_ACTED_WITH': {
      const person = lexicon.getNoun(ast.person);
      const item = lexicon.getNoun(ast.item);
      tags.add('nominative');
      tags.add('accusative');
      const subjTok = createNounToken(person, 'nom');
      const objTok = createNounToken(item, 'acc');
      const verbTok = createVerbToken(actionVerb, tense);

      const tokens = negToken ? [subjTok, objTok, negToken, verbTok] : [subjTok, objTok, verbTok];
      const amb =
        isCaseFormStructurallyAmbiguous(person, 'nom') ||
        isCaseFormStructurallyAmbiguous(item, 'acc');

      const itemAccDe = item.meaningDe.replace(/^der /, 'den ');
      const german =
        tense === 'present'
          ? `${person.meaningDe} ${actionVerb.meaningDePres3Sg} ${itemAccDe}${neg ? ' nicht' : ''}.`
          : `${person.meaningDe} ${actionVerb.meaningDePerfAux ?? 'hat'} ${itemAccDe}${neg ? ' nicht' : ''} ${actionVerb.meaningDePerfPart}.`;

      return { tokens, german, hasAmbiguousForm: amb, grammarTags: [...tags] };
    }

    case 'GIVER_IS': {
      const giver = lexicon.getNoun(ast.giver);
      tags.add('nominative');
      tags.add('dative');
      // e.g., "Cornelia donum dedit." -> better: "Cornelia rem dedit." or "Cornelia ei dedit."
      // "Cornelia ei dedit." uses "ei" (Dative of is/ea = "ihm/ihr")
      const subjTok = createNounToken(giver, 'nom');
      const datPron = createParticleToken(lexicon, 'ei', 'dative');
      const verbTok = createVerbToken(dareVerb, tense);
      const tokens = negToken ? [subjTok, datPron, negToken, verbTok] : [subjTok, datPron, verbTok];
      const amb = isCaseFormStructurallyAmbiguous(giver, 'nom');
      const german =
        tense === 'present'
          ? `${giver.meaningDe} gibt es ihm/ihr${neg ? ' nicht' : ''}.`
          : `${giver.meaningDe} hat es ihm/ihr${neg ? ' nicht' : ''} gegeben.`;
      return { tokens, german, hasAmbiguousForm: amb, grammarTags: [...tags] };
    }

    case 'GAVE_TO': {
      const giver = lexicon.getNoun(ast.giver);
      const rec = lexicon.getNoun(ast.recipient);
      const item = lexicon.getNoun(ast.item);
      tags.add('nominative');
      tags.add('dative');
      tags.add('accusative');

      const subjTok = createNounToken(giver, 'nom');
      const datTok = createNounToken(rec, 'dat');
      const accTok = createNounToken(item, 'acc');
      const verbTok = createVerbToken(dareVerb, tense);

      const tokens = negToken
        ? [subjTok, datTok, accTok, negToken, verbTok]
        : [subjTok, datTok, accTok, verbTok];

      const amb =
        isCaseFormStructurallyAmbiguous(giver, 'nom') ||
        isCaseFormStructurallyAmbiguous(item, 'acc');

      const itemAccDe = item.meaningDe.replace(/^der /, 'den ');
      const german =
        tense === 'present'
          ? `${giver.meaningDe} gibt ${rec.meaningDe} ${itemAccDe}${neg ? ' nicht' : ''}.`
          : `${giver.meaningDe} hat ${rec.meaningDe} ${itemAccDe}${neg ? ' nicht' : ''} gegeben.`;

      return { tokens, german, hasAmbiguousForm: amb, grammarTags: [...tags] };
    }

    case 'IN_LOCATION': {
      const person = lexicon.getNoun(ast.person);
      const loc = lexicon.getNoun(ast.location);
      tags.add('nominative');
      tags.add('ablative');
      tags.add('accusative');

      const subjTok = createNounToken(person, 'nom');
      const prepTok = createParticleToken(lexicon, 'in', 'ablative');
      const ablTok = createNounToken(loc, 'abl');
      const objTok = createNounToken(targetNoun, 'acc');
      const verbTok = createVerbToken(crimeVerb, tense);

      const tokens = negToken
        ? [subjTok, prepTok, ablTok, objTok, negToken, verbTok]
        : [subjTok, prepTok, ablTok, objTok, verbTok];

      const amb =
        isCaseFormStructurallyAmbiguous(person, 'nom') ||
        isCaseFormStructurallyAmbiguous(targetNoun, 'acc');
      const locDatDe = loc.meaningDe.replace(/^der /, 'dem ').replace(/^die /, 'der ').replace(/^das /, 'dem ');
      const targetAccDe = targetNoun.meaningDe.replace(/^der /, 'den ');
      const german =
        tense === 'present'
          ? `${person.meaningDe} ${crimeVerb.meaningDePres3Sg} ${targetAccDe} in ${locDatDe}${neg ? ' nicht' : ''}.`
          : `${person.meaningDe} ${crimeVerb.meaningDePerfAux ?? 'hat'} ${targetAccDe} in ${locDatDe}${neg ? ' nicht' : ''} ${crimeVerb.meaningDePerfPart}.`;

      return { tokens, german, hasAmbiguousForm: amb, grammarTags: [...tags] };
    }

    case 'WITNESS_TRUTH': {
      const targetPersonId = witnessIds[ast.witnessIndex];
      const person = lexicon.getNoun(targetPersonId);
      tags.add('nominative');
      const subjTok = createNounToken(person, 'nom');
      const verumTok = createParticleToken(lexicon, 'verum');
      const verbTok = createVerbToken(dicereVerb, 'present');

      const tokens = ast.speaksTruth
        ? [subjTok, verumTok, verbTok]
        : [subjTok, verumTok, createParticleToken(lexicon, 'non', 'negation'), verbTok];

      if (!ast.speaksTruth) tags.add('negation');

      const german = ast.speaksTruth
        ? `${person.meaningDe} sagt die Wahrheit.`
        : `${person.meaningDe} sagt nicht die Wahrheit.`;

      return {
        tokens,
        german,
        hasAmbiguousForm: isCaseFormStructurallyAmbiguous(person, 'nom'),
        grammarTags: [...tags],
      };
    }
  }
}

export function renderStatement(
  ast: StatementAST,
  scenario: ScenarioTemplate,
  witnessIds: string[],
  lexicon: LatinLexicon = defaultLexicon
): { tokens: WordToken[]; latinText: string; germanText: string; hasAmbiguousForm: boolean; grammarTags: GrammarFocus[] } {
  if (ast.kind === 'CONJUNCTION') {
    const left = renderSimpleClause(ast.left as Exclude<StatementAST, { kind: 'CONJUNCTION' }>, scenario, witnessIds, lexicon);
    const right = renderSimpleClause(ast.right as Exclude<StatementAST, { kind: 'CONJUNCTION' }>, scenario, witnessIds, lexicon);
    const connTok = createParticleToken(lexicon, ast.connector, 'conjunction');

    const rawTokens = [...left.tokens];
    if (ast.connector === 'sed') {
      rawTokens.push({
        text: ',',
        lemma: ',',
        pos: 'Satzzeichen',
        grammarLabel: 'Komma',
        meaningDe: '',
      });
    }
    rawTokens.push(connTok, ...right.tokens);
    rawTokens[0] = capitalizeToken(rawTokens[0]);

    const tokens = appendPunctuation(rawTokens, '.');
    const leftDe = left.german.replace(/\.$/, '');
    const rightDe = right.german;
    const connDe = ast.connector === 'sed' ? ', aber' : ' und';
    const germanText = `${leftDe}${connDe} ${rightDe}`;

    const tags = new Set<GrammarFocus>([...left.grammarTags, ...right.grammarTags, 'conjunction']);
    return {
      tokens,
      latinText: tokensToLatinString(tokens),
      germanText,
      hasAmbiguousForm: left.hasAmbiguousForm || right.hasAmbiguousForm,
      grammarTags: [...tags],
    };
  }

  const single = renderSimpleClause(ast, scenario, witnessIds, lexicon);
  const rawTokens = [...single.tokens];
  rawTokens[0] = capitalizeToken(rawTokens[0]);
  const tokens = appendPunctuation(rawTokens, '.');

  return {
    tokens,
    latinText: tokensToLatinString(tokens),
    germanText: single.german,
    hasAmbiguousForm: single.hasAmbiguousForm,
    grammarTags: single.grammarTags,
  };
}

/**
 * Builds the interactive Drag-and-Drop / Tap solution sentence and inflected trap tiles.
 * The sentence structure strictly tests case endings (Nominative vs Accusative vs Dative vs Ablative).
 */
export function buildSolutionSpec(
  stage: DifficultyStage,
  scenario: ScenarioTemplate,
  solution: CaseAssignment,
  witnessIds: string[],
  candidateItems: string[],
  candidateLocations: string[] = [],
  lexicon: LatinLexicon = defaultLexicon
): SolutionSpec {
  const culprit = lexicon.getNoun(solution.culprit);
  const targetNoun = lexicon.getNoun(scenario.targetNounId);
  const item = lexicon.getNoun(solution.object);
  const crimeVerb = lexicon.getVerb(scenario.crimeVerbId);
  const actionVerb = lexicon.getVerb(scenario.actionVerbId);
  const dareVerb = lexicon.getVerb('dare');
  const esseVerb = lexicon.getVerb('esse');
  const tense = stage === 1 ? 'present' : scenario.preferredTense;
  const crimeVerbForm = tense === 'present' ? crimeVerb.present3Sg : crimeVerb.perfect3Sg;
  const actionVerbForm = tense === 'present' ? actionVerb.present3Sg : actionVerb.perfect3Sg;
  const dareVerbForm = tense === 'present' ? dareVerb.present3Sg : dareVerb.perfect3Sg;
  const esseVerbForm = tense === 'present' ? esseVerb.present3Sg : esseVerb.imperfect3Sg ?? 'erat';

  const slots: SolutionSlot[] = [];
  const parts: SolutionSpec['parts'] = [];
  const tileSet = new Set<string>();

  // Slot 0: Culprit (Nominative)
  const culpritNom = inflectNounSingular(culprit, 'nom');
  slots.push({
    id: 'slot-culprit',
    expectedWord: culpritNom,
    expectedRole: 'nominative',
    roleLabelDe: 'Täter (Nominativ)',
    hintDe: 'Hier steht das Subjekt (Wer handelt?). Suche den Nominativ!',
  });
  parts.push({ type: 'slot', slotIndex: 0 });
  tileSet.add(culpritNom);

  if (stage === 1) {
    // Stage 1: 1 question ("Wer war es?") -> [Culprit (Nom)] [Target (Acc)] [CrimeVerb].
    const targetAcc = inflectNounSingular(targetNoun, 'acc');
    slots.push({
      id: 'slot-target',
      expectedWord: targetAcc,
      expectedRole: 'accusative',
      roleLabelDe: 'Objekt (Akkusativ)',
      hintDe: 'Wen oder was betrifft die Tat? Setze das Zielwort in den Akkusativ!',
    });
    parts.push({ type: 'slot', slotIndex: 1 });
    parts.push({ type: 'text', value: `${crimeVerbForm}.` });

    tileSet.add(targetAcc);
    tileSet.add(inflectNounSingular(targetNoun, 'nom'));
    for (const wId of witnessIds) {
      const p = lexicon.getNoun(wId);
      tileSet.add(inflectNounSingular(p, 'nom'));
      tileSet.add(inflectNounSingular(p, 'acc'));
    }

    const targetAccDe = targetNoun.meaningDe.replace(/^der /, 'den ');
    const germanTranslation = `${culprit.meaningDe} ${crimeVerb.meaningDePres3Sg} ${targetAccDe}.`;
    const tilePool = [...tileSet].sort((a, b) => a.localeCompare(b, 'de'));
    return { parts, slots, tilePool, germanTranslation };
  }

  // Stage 2–4: Slot 1 is the object/instrument (Accusative)
  const itemAcc = inflectNounSingular(item, 'acc');
  slots.push({
    id: 'slot-object',
    expectedWord: itemAcc,
    expectedRole: 'accusative',
    roleLabelDe: 'Gegenstand (Akkusativ)',
    hintDe: 'Wen oder was hat der Täter benutzt? Hier brauchst du den Akkusativ!',
  });
  parts.push({ type: 'slot', slotIndex: 1 });
  tileSet.add(itemAcc);

  // Action verb text
  const hasSecondClause = Boolean(solution.giver || solution.location);
  parts.push({ type: 'text', value: `${actionVerbForm}${hasSecondClause ? ';' : '.'}` });

  const itemAccDe = item.meaningDe.replace(/^der /, 'den ');
  let germanTranslation =
    tense === 'present'
      ? `${culprit.meaningDe} ${actionVerb.meaningDePres3Sg} ${itemAccDe}`
      : `${culprit.meaningDe} ${actionVerb.meaningDePerfAux ?? 'hat'} ${itemAccDe} ${actionVerb.meaningDePerfPart}`;

  // Optional Slot 2: Giver (Nominative in second clause + ei [Dativ] + dedit)
  if (solution.giver) {
    const giver = lexicon.getNoun(solution.giver);
    const giverNom = inflectNounSingular(giver, 'nom');
    const slotIdx = slots.length;
    slots.push({
      id: 'slot-giver',
      expectedWord: giverNom,
      expectedRole: 'nominative',
      roleLabelDe: 'Geber (Nominativ)',
      hintDe: 'Wer hat den Gegenstand gegeben? Das Subjekt des zweiten Satzes steht im Nominativ!',
    });
    parts.push({ type: 'slot', slotIndex: slotIdx });
    parts.push({ type: 'text', value: `ei ${dareVerbForm}${solution.location ? ';' : '.'}` });
    tileSet.add(giverNom);
    tileSet.add(inflectNounSingular(giver, 'acc'));
    tileSet.add(inflectNounSingular(giver, 'dat'));

    germanTranslation +=
      tense === 'present'
        ? `; ${giver.meaningDe} gibt ihn ihm/ihr`
        : `; ${giver.meaningDe} hat ihn ihm/ihr gegeben`;
  }

  // Optional Slot 3 (Stage 4): Location (in + Ablative)
  if (solution.location) {
    const loc = lexicon.getNoun(solution.location);
    const locAbl = inflectNounSingular(loc, 'abl');
    const slotIdx = slots.length;
    slots.push({
      id: 'slot-location',
      expectedWord: locAbl,
      expectedRole: 'ablative',
      roleLabelDe: 'Tatort (Ablativ)',
      hintDe: 'Nach der Präposition „in“ (auf die Frage „wo?“) steht der Ablativ!',
    });
    parts.push({ type: 'text', value: `${culpritNom} in` });
    parts.push({ type: 'slot', slotIndex: slotIdx });
    parts.push({ type: 'text', value: `${esseVerbForm}.` });
    tileSet.add(locAbl);

    for (const locId of candidateLocations) {
      const l = lexicon.getNoun(locId);
      tileSet.add(inflectNounSingular(l, 'abl'));
      tileSet.add(inflectNounSingular(l, 'nom'));
    }

    const locDatDe = loc.meaningDe.replace(/^der /, 'dem ').replace(/^die /, 'der ').replace(/^das /, 'dem ');
    germanTranslation += `; ${culprit.meaningDe} ${tense === 'present' ? 'ist' : 'war'} in ${locDatDe}`;
  }

  germanTranslation += '.';

  for (const wId of witnessIds) {
    const p = lexicon.getNoun(wId);
    tileSet.add(inflectNounSingular(p, 'nom'));
  }
  tileSet.add(inflectNounSingular(culprit, 'acc'));
  const otherWitnessId = witnessIds.find((w) => w !== solution.culprit && w !== solution.giver);
  if (otherWitnessId) {
    tileSet.add(inflectNounSingular(lexicon.getNoun(otherWitnessId), 'acc'));
  }

  for (const itemId of candidateItems) {
    const it = lexicon.getNoun(itemId);
    tileSet.add(inflectNounSingular(it, 'acc'));
    tileSet.add(inflectNounSingular(it, 'nom'));
  }

  const tilePool = [...tileSet].sort((a, b) => a.localeCompare(b, 'de'));

  return {
    parts,
    slots,
    tilePool,
    germanTranslation,
  };
}
