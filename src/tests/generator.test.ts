import { describe, expect, it } from 'vitest';
import { getDailyCase, getStoryChapters } from '../content/storyCases';
import { buildSearchSpace, solveCase } from '../core/solver';
import { DifficultyStage } from '../core/types';
import { generateCase } from '../generator/caseGenerator';
import { importNounsFromCsv, exportNounsToCsv } from '../latin/csvImporter';
import {
  defaultLexicon,
  detectNounAmbiguities,
  inflectNounSingular,
} from '../latin/inflector';
import rawLexicon from '../latin/lexicon.json';
import { validateLexicon } from '../latin/schema';

describe('Latin Lexicon & Inflector', () => {
  it('validates the built-in JSON lexicon schema', () => {
    const res = validateLexicon(rawLexicon);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it('inflects nouns accurately across all declensions', () => {
    const lapis = defaultLexicon.getNoun('lapis');
    expect(inflectNounSingular(lapis, 'nom')).toBe('lapis');
    expect(inflectNounSingular(lapis, 'acc')).toBe('lapidem');
    expect(inflectNounSingular(lapis, 'abl')).toBe('lapide');

    const pila = defaultLexicon.getNoun('pila');
    expect(inflectNounSingular(pila, 'nom')).toBe('pila');
    expect(inflectNounSingular(pila, 'acc')).toBe('pilam');
    expect(inflectNounSingular(pila, 'dat')).toBe('pilae');

    const lucius = defaultLexicon.getNoun('lucius');
    expect(inflectNounSingular(lucius, 'nom')).toBe('Lucius');
    expect(inflectNounSingular(lucius, 'dat')).toBe('Lucio');
    expect(inflectNounSingular(lucius, 'acc')).toBe('Lucium');
  });

  it('detects ambiguous Latin surface forms accurately', () => {
    const claudia = defaultLexicon.getNoun('claudia');
    expect(detectNounAmbiguities(claudia, 'dat')).toEqual(['gen', 'dat']);
    const atrium = defaultLexicon.getNoun('atrium');
    expect(detectNounAmbiguities(atrium, 'nom')).toEqual(['nom', 'acc']);
  });

  it('supports CSV export and re-import roundtrip', () => {
    const sample = [defaultLexicon.getNoun('lapis'), defaultLexicon.getNoun('pila')];
    const csv = exportNounsToCsv(sample);
    const parsed = importNounsFromCsv(csv);
    expect(parsed.errors).toEqual([]);
    expect(parsed.nouns.length).toBe(2);
    expect(parsed.nouns[0].lemma).toBe('lapis');
  });
});

describe('Curated Story Chapters & Daily Case', () => {
  it('verifies every story chapter case has exactly one mathematical solution', () => {
    const chapters = getStoryChapters();
    for (const ch of chapters) {
      for (const c of ch.cases) {
        const space = buildSearchSpace({
          suspects: c.witnessIds,
          items: c.candidateItems,
          requireGiver: Boolean(c.solution.giver),
          locations: c.candidateLocations,
        });
        const solve = solveCase({
          statements: c.statements.map((s) => ({ speakerId: s.speakerId, ast: s.ast })),
          truthRule: c.truthRule,
          searchSpace: space,
        });
        expect(solve.solutions).toHaveLength(1);
        expect(solve.solutions[0]).toEqual(c.solution);
      }
    }
  });

  it('generates deterministic daily cases for the same date seed', () => {
    const a = getDailyCase('2026-11-17');
    const b = getDailyCase('2026-11-17');
    expect(a.solution).toEqual(b.solution);
    expect(a.statements.map((s) => s.latinText)).toEqual(b.statements.map((s) => s.latinText));
  });
});

describe('Procedural Puzzle Generator Property Tests', () => {
  it('generates 1,000 random cases across stages 1-4, each with exactly one valid solution', () => {
    const stages: DifficultyStage[] = [1, 2, 3, 4];
    const totalPerStage = 250; // 4 * 250 = 1,000 cases

    for (const stage of stages) {
      for (let i = 0; i < totalPerStage; i++) {
        const c = generateCase({ seed: `prop-s${stage}-${i}`, stage });
        const space = buildSearchSpace({
          suspects: c.witnessIds,
          items: c.candidateItems,
          requireGiver: Boolean(c.solution.giver),
          locations: c.candidateLocations,
        });
        const solve = solveCase({
          statements: c.statements.map((s) => ({ speakerId: s.speakerId, ast: s.ast })),
          truthRule: c.truthRule,
          searchSpace: space,
        });

        expect(solve.solutions).toHaveLength(1);
        expect(solve.solutions[0]).toEqual(c.solution);
        expect(c.solutionSpec.slots.length).toBeGreaterThanOrEqual(2);
        // Ensure every slot expectedWord is present in tilePool
        for (const slot of c.solutionSpec.slots) {
          expect(c.solutionSpec.tilePool).toContain(slot.expectedWord);
        }
      }
    }
  }, 20000);
});
