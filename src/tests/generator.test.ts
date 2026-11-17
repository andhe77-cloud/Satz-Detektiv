import { describe, expect, it } from 'vitest';
import { getDailyCase, getStoryChapters } from '../content/storyCases';
import { buildSearchSpace, solveCase } from '../core/solver';
import { CampusLessonRange, DifficultyStage } from '../core/types';
import { generateCase } from '../generator/caseGenerator';
import {
  CAMPUS_CARDS,
  buildCampusScenarios,
  combinedLexicon,
  getCampusLexicon,
} from '../latin/campusLexicon';
import { importNounsFromCsv, exportNounsToCsv } from '../latin/csvImporter';
import {
  defaultLexicon,
  detectNounAmbiguities,
  inflectNounSingular,
} from '../latin/inflector';
import { GRAMMAR_GLOSSARY, getUnlockedGlossaryCount, isGlossaryEntryUnlocked } from '../latin/grammarGlossary';
import rawLexicon from '../latin/lexicon.json';
import { validateLexicon } from '../latin/schema';
import { createDefaultProgress, recordGrammarOutcome } from '../services/storage';

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

describe('Campus C1&2 Integration', () => {
  it('loads all extracted Campus vocabulary cards and declinable nouns', () => {
    expect(CAMPUS_CARDS.length).toBeGreaterThan(1000);
    const nouns = CAMPUS_CARDS.filter((c) => c.nounMeta);
    expect(nouns.length).toBeGreaterThan(200);
    for (const n of nouns) {
      const acc = inflectNounSingular(
        {
          id: n.id,
          lemma: n.nounMeta!.lemma,
          genitive: n.nounMeta!.genitive,
          stem: n.nounMeta!.stem,
          declension: n.nounMeta!.declension,
          gender: n.nounMeta!.gender,
          meaningDe: n.back,
          category: 'item',
          lesson: n.maxLesson,
        },
        'acc'
      );
      expect(acc.length).toBeGreaterThan(1);
    }
  });

  it('generates uniquely solvable Campus cases across lesson ranges (from-to) and stages 1-4', () => {
    const ranges: CampusLessonRange[] = [
      { from: 0, to: 10 },
      { from: 0, to: 40 },
      { from: 20, to: 40 },
      { from: 40, to: 68 },
      { from: 50, to: 60 },
      { from: 0, to: 68 },
    ];
    const stages: DifficultyStage[] = [1, 2, 3, 4];

    for (const range of ranges) {
      const lex = getCampusLexicon(range);
      const scenarios = buildCampusScenarios(range);
      expect(scenarios.length).toBeGreaterThanOrEqual(3);

      for (const stage of stages) {
        const c = generateCase({
          seed: `campus-test-${range.from}-${range.to}-s${stage}`,
          stage,
          campusLessonRange: range,
        });
        expect(c.campusLessonRange).toEqual(range);
        expect(lex.getNoun(c.scenario.targetNounId)).toBeDefined();
        expect(combinedLexicon.getVerb(c.scenario.crimeVerbId)).toBeDefined();

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
});

describe('Grammar Glossary & Unlock Progression', () => {
  it('covers every GrammarFocus tag and unlocks entries as story chapters are solved', () => {
    const allFocuses = [
      'nominative',
      'accusative',
      'negation',
      'perfect',
      'dative',
      'conjunction',
      'ablative',
    ] as const;

    expect(GRAMMAR_GLOSSARY.map((e) => e.focus).sort()).toEqual([...allFocuses].sort());

    let progress = createDefaultProgress();
    expect(getUnlockedGlossaryCount(progress)).toBe(0);

    const chapters = getStoryChapters();
    for (const ch of chapters) {
      for (const c of ch.cases) {
        progress = recordGrammarOutcome(progress, c.difficultyMetrics.grammarTags, false);
      }
    }

    for (const focus of allFocuses) {
      expect(isGlossaryEntryUnlocked(progress, focus)).toBe(true);
    }
    expect(getUnlockedGlossaryCount(progress)).toBe(allFocuses.length);
  });
});

