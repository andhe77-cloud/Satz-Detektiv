import { DeclensionType, Gender, NounEntry } from '../core/types';
import { validateNounEntry } from './schema';

export interface CsvImportResult {
  nouns: NounEntry[];
  errors: string[];
}

/**
 * Parses a semicolon- or comma-separated CSV vocabulary list for nouns:
 * Header: id,lemma,genitive,stem,declension,gender,meaningDe,category,lesson
 */
export function importNounsFromCsv(csvText: string): CsvImportResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) {
    return { nouns: [], errors: ['CSV enthält keine Datenzeilen.'] };
  }

  const sep = lines[0].includes(';') ? ';' : ',';
  const startIdx = lines[0].toLowerCase().startsWith('id') ? 1 : 0;

  const nouns: NounEntry[] = [];
  const errors: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim());
    if (cols.length < 7) {
      errors.push(`Zeile ${i + 1}: Zu wenige Spalten (erwartet mindestens 7).`);
      continue;
    }
    const [id, lemma, genitive, stem, declension, gender, meaningDe, category = 'item', lessonStr = '1'] = cols;
    const entry: NounEntry = {
      id,
      lemma,
      genitive,
      stem,
      declension: declension as DeclensionType,
      gender: gender as Gender,
      meaningDe,
      category: (['person', 'item', 'target', 'location', 'abstract'].includes(category)
        ? category
        : 'item') as NounEntry['category'],
      lesson: Number.parseInt(lessonStr, 10) || 1,
    };

    const entryErrors = validateNounEntry(entry, i);
    if (entryErrors.length > 0) {
      errors.push(...entryErrors);
    } else {
      nouns.push(entry);
    }
  }

  return { nouns, errors };
}

export function exportNounsToCsv(nouns: NounEntry[]): string {
  const header = 'id;lemma;genitive;stem;declension;gender;meaningDe;category;lesson';
  const rows = nouns.map(
    (n) => `${n.id};${n.lemma};${n.genitive};${n.stem};${n.declension};${n.gender};${n.meaningDe};${n.category};${n.lesson}`
  );
  return [header, ...rows].join('\n');
}
