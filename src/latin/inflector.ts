import rawLexicon from './lexicon.json';
import { CaseForm, GrammarFocus, LexiconData, NounEntry, VerbEntry, WordToken } from '../core/types';
import { validateLexicon } from './schema';

const CASE_LABEL_DE: Record<CaseForm, string> = {
  nom: 'Nominativ Singular',
  gen: 'Genitiv Singular',
  dat: 'Dativ Singular',
  acc: 'Akkusativ Singular',
  abl: 'Ablativ Singular',
};

const CASE_TO_FOCUS: Partial<Record<CaseForm, GrammarFocus>> = {
  nom: 'nominative',
  dat: 'dative',
  acc: 'accusative',
  abl: 'ablative',
};

export class LatinLexicon {
  public readonly nouns: Map<string, NounEntry> = new Map();
  public readonly verbs: Map<string, VerbEntry> = new Map();
  public readonly particles: Map<string, LexiconData['particles'][number]> = new Map();

  constructor(data: LexiconData = rawLexicon as LexiconData) {
    const validation = validateLexicon(data);
    if (!validation.valid) {
      throw new Error(`Ungültiges Lexikon: ${validation.errors.join('; ')}`);
    }
    for (const n of data.nouns) this.nouns.set(n.id, n);
    for (const v of data.verbs) this.verbs.set(v.id, v);
    for (const p of data.particles) this.particles.set(p.id, p);
  }

  getNoun(id: string): NounEntry {
    const entry = this.nouns.get(id);
    if (!entry) throw new Error(`Unbekanntes Nomen: ${id}`);
    return entry;
  }

  getVerb(id: string): VerbEntry {
    const entry = this.verbs.get(id);
    if (!entry) throw new Error(`Unbekanntes Verb: ${id}`);
    return entry;
  }

  getParticle(id: string) {
    const entry = this.particles.get(id);
    if (!entry) throw new Error(`Unbekannte Partikel: ${id}`);
    return entry;
  }
}

export const defaultLexicon = new LatinLexicon();

/**
 * Computes exact singular case forms for a noun strictly from its stem,
 * declension, and gender (or explicit irregular override).
 */
export function inflectNounSingular(noun: NounEntry, targetCase: CaseForm): string {
  if (noun.forms && noun.forms[targetCase]) {
    return noun.forms[targetCase]!;
  }
  if (targetCase === 'nom') {
    return noun.lemma;
  }
  if (targetCase === 'gen') {
    return noun.genitive;
  }

  const s = noun.stem;
  switch (noun.declension) {
    case 'a':
      // a-Declension: -a, -ae, -ae, -am, -a
      switch (targetCase) {
        case 'dat': return `${s}ae`;
        case 'acc': return `${s}am`;
        case 'abl': return `${s}a`;
      }
      break;
    case 'o-masc':
    case 'o-er':
      // o-Declension masc (-us / -er): -, -i, -o, -um, -o
      switch (targetCase) {
        case 'dat': return `${s}o`;
        case 'acc': return `${s}um`;
        case 'abl': return `${s}o`;
      }
      break;
    case 'o-neut':
      // o-Declension neut (-um): -um, -i, -o, -um, -o
      switch (targetCase) {
        case 'dat': return `${s}o`;
        case 'acc': return noun.lemma;
        case 'abl': return `${s}o`;
      }
      break;
    case 'cons':
    case 'cons-i':
      // 3rd Declension: -, -is, -i, -em (or lemma if neut), -e
      switch (targetCase) {
        case 'dat': return `${s}i`;
        case 'acc': return noun.gender === 'n' ? noun.lemma : `${s}em`;
        case 'abl': return `${s}e`;
      }
      break;
  }
  return noun.lemma;
}

/**
 * Returns all singular cases that share the exact surface form of `targetCase`
 * for this noun (e.g., `Claudiae` -> ['gen', 'dat'], `Marco` -> ['dat', 'abl'], `baculum` -> ['nom', 'acc']).
 */
export function detectNounAmbiguities(noun: NounEntry, targetCase: CaseForm): CaseForm[] {
  const surface = inflectNounSingular(noun, targetCase);
  const allCases: CaseForm[] = ['nom', 'gen', 'dat', 'acc', 'abl'];
  return allCases.filter((c) => inflectNounSingular(noun, c) === surface);
}

/**
 * Checks whether a noun form could be confused between subject (nom) and direct object (acc),
 * or between any two syntactically critical roles in our sentence templates.
 */
export function isCaseFormStructurallyAmbiguous(noun: NounEntry, targetCase: CaseForm): boolean {
  const matching = detectNounAmbiguities(noun, targetCase);
  if (matching.length <= 1) return false;
  // Critical ambiguity: Nom vs Acc (neuter words like atrium/forum/templum in Nom/Acc),
  // or Nom vs Abl in a-declension WITHOUT preposition (e.g., `pila` Nom vs `pila` Abl;
  // note in our templates Ablative only appears after `in`, while Nom has no `in`).
  if (matching.includes('nom') && matching.includes('acc')) return true;
  return false;
}

export function createNounToken(noun: NounEntry, targetCase: CaseForm): WordToken {
  const text = inflectNounSingular(noun, targetCase);
  const matching = detectNounAmbiguities(noun, targetCase);
  const ambiguities = matching
    .filter((c) => c !== targetCase)
    .map((c) => `Formgleich mit ${CASE_LABEL_DE[c]}`);

  return {
    text,
    lemma: `${noun.lemma}, ${noun.genitive} (${noun.gender}.)`,
    pos: noun.category === 'person' ? 'Name' : 'Nomen',
    grammarLabel: CASE_LABEL_DE[targetCase],
    meaningDe: noun.meaningDe,
    ambiguities: ambiguities.length > 0 ? ambiguities : undefined,
    grammarFocus: CASE_TO_FOCUS[targetCase],
  };
}

export function createVerbToken(verb: VerbEntry, tense: 'present' | 'perfect' | 'imperfect'): WordToken {
  const text =
    tense === 'present'
      ? verb.present3Sg
      : tense === 'imperfect' && verb.imperfect3Sg
      ? verb.imperfect3Sg
      : verb.perfect3Sg;

  const tenseLabel =
    tense === 'present'
      ? '3. Person Singular Präsens'
      : tense === 'imperfect'
      ? '3. Person Singular Imperfekt'
      : '3. Person Singular Perfekt';

  return {
    text,
    lemma: `${verb.infinitive} (${verb.present3Sg}, ${verb.perfect3Sg})`,
    pos: 'Verb',
    grammarLabel: tenseLabel,
    meaningDe: verb.meaningDeInf,
    grammarFocus: tense === 'perfect' ? 'perfect' : undefined,
  };
}

export function createParticleToken(
  lexicon: LatinLexicon,
  particleId: string,
  grammarFocus?: GrammarFocus
): WordToken {
  const p = lexicon.getParticle(particleId);
  const posMap: Record<typeof p.pos, WordToken['pos']> = {
    adverb: 'Adverb',
    preposition: 'Präposition',
    conjunction: 'Konjunktion',
    pronoun: 'Pronomen',
  };
  return {
    text: p.latin,
    lemma: p.latin,
    pos: posMap[p.pos],
    grammarLabel: p.grammarNote,
    meaningDe: p.meaningDe,
    grammarFocus,
  };
}
