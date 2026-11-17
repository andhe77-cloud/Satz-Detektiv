import { DeclensionType, Gender, LexiconData, NounEntry, VerbEntry } from '../core/types';

const VALID_DECLENSIONS: DeclensionType[] = ['a', 'o-masc', 'o-er', 'o-neut', 'cons', 'cons-i'];
const VALID_GENDERS: Gender[] = ['m', 'f', 'n'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateNounEntry(entry: unknown, index: number): string[] {
  const errors: string[] = [];
  if (!entry || typeof entry !== 'object') {
    return [`Nomen[${index}]: Kein gültiges Objekt.`];
  }
  const n = entry as Partial<NounEntry>;
  if (!n.id || typeof n.id !== 'string') errors.push(`Nomen[${index}]: Feld "id" fehlt.`);
  if (!n.lemma || typeof n.lemma !== 'string') errors.push(`Nomen[${index}]: Feld "lemma" fehlt.`);
  if (!n.genitive || typeof n.genitive !== 'string') errors.push(`Nomen[${index}]: Feld "genitive" fehlt.`);
  if (!n.stem || typeof n.stem !== 'string') errors.push(`Nomen[${index}]: Feld "stem" fehlt.`);
  if (!n.declension || !VALID_DECLENSIONS.includes(n.declension)) {
    errors.push(`Nomen[${index}] (${n.id ?? '?'}): Ungültige Deklination "${String(n.declension)}".`);
  }
  if (!n.gender || !VALID_GENDERS.includes(n.gender)) {
    errors.push(`Nomen[${index}] (${n.id ?? '?'}): Ungültiges Genus "${String(n.gender)}".`);
  }
  if (!n.meaningDe || typeof n.meaningDe !== 'string') {
    errors.push(`Nomen[${index}] (${n.id ?? '?'}): Feld "meaningDe" fehlt.`);
  }
  return errors;
}

export function validateVerbEntry(entry: unknown, index: number): string[] {
  const errors: string[] = [];
  if (!entry || typeof entry !== 'object') {
    return [`Verb[${index}]: Kein gültiges Objekt.`];
  }
  const v = entry as Partial<VerbEntry>;
  if (!v.id || typeof v.id !== 'string') errors.push(`Verb[${index}]: Feld "id" fehlt.`);
  if (!v.infinitive || typeof v.infinitive !== 'string') errors.push(`Verb[${index}]: Feld "infinitive" fehlt.`);
  if (!v.present3Sg || typeof v.present3Sg !== 'string') errors.push(`Verb[${index}]: Feld "present3Sg" fehlt.`);
  if (!v.perfect3Sg || typeof v.perfect3Sg !== 'string') errors.push(`Verb[${index}]: Feld "perfect3Sg" fehlt.`);
  if (!v.meaningDeInf || typeof v.meaningDeInf !== 'string') errors.push(`Verb[${index}]: Feld "meaningDeInf" fehlt.`);
  return errors;
}

export function validateLexicon(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Lexikon ist kein Objekt.'] };
  }
  const lex = data as Partial<LexiconData>;
  if (!Array.isArray(lex.nouns)) {
    errors.push('Feld "nouns" muss ein Array sein.');
  } else {
    const ids = new Set<string>();
    lex.nouns.forEach((n, i) => {
      errors.push(...validateNounEntry(n, i));
      if (n?.id) {
        if (ids.has(n.id)) errors.push(`Doppelte Nomen-ID: ${n.id}`);
        ids.add(n.id);
      }
    });
  }

  if (!Array.isArray(lex.verbs)) {
    errors.push('Feld "verbs" muss ein Array sein.');
  } else {
    const ids = new Set<string>();
    lex.verbs.forEach((v, i) => {
      errors.push(...validateVerbEntry(v, i));
      if (v?.id) {
        if (ids.has(v.id)) errors.push(`Doppelte Verb-ID: ${v.id}`);
        ids.add(v.id);
      }
    });
  }

  if (!Array.isArray(lex.particles)) {
    errors.push('Feld "particles" muss ein Array sein.');
  }

  return { valid: errors.length === 0, errors };
}
