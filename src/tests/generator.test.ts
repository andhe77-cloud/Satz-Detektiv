import { describe, expect, it } from 'vitest';
import { getDailyCase, getStoryChapters } from '../content/storyCases';
import { buildSearchSpace, solveCase } from '../core/solver';
import { CampusCard, CampusLessonRange, DifficultyStage } from '../core/types';
import { generateCase } from '../generator/caseGenerator';
import { pickNextCampusCard } from '../ui/components/CampusVocabTrainer';
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
import {
  BADGES,
  applyCampusOutcome,
  applyCaseSolved,
  applyTowerEvent,
  createDefaultProgress,
  getCampusCareerStars,
  recordGrammarOutcome,
} from '../services/storage';

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

  it('awards Campus career stars, tracks streaks, and unlocks training achievements', () => {
    let progress = createDefaultProgress();
    // 1 wrong answer adds card to wrongIds, then fixing it clears wrongIds
    progress = applyCampusOutcome(progress, 'c-0', false, 'meaning').nextProgress;
    expect(progress.campusStats.wrongIds).toEqual(['c-0']);

    for (let i = 0; i < 20; i++) {
      const kind = i < 15 ? 'cases' : 'meaning';
      const res = applyCampusOutcome(progress, `c-${i}`, true, kind);
      progress = res.nextProgress;
    }

    expect(getCampusCareerStars(progress.campusStats.masteredIds.length)).toBe(1);
    expect(progress.totalStars).toBe(1);
    expect(progress.campusStats.bestStreak).toBe(20);
    expect(progress.unlockedBadges).toContain('campus-first-10');
    expect(progress.unlockedBadges).toContain('campus-streak-10');
    expect(progress.unlockedBadges).toContain('campus-case-15');
    expect(progress.unlockedBadges).toContain('campus-mistakes-cleared');
  });

  it('defers newly missed Campus cards to the end instead of repeating them immediately', () => {
    const mkCard = (id: string): CampusCard => ({
      id,
      front: id,
      back: `de-${id}`,
      band: '1-10',
      maxLesson: 10,
      pos: 'noun',
    });
    const pool = [mkCard('a'), mkCard('b'), mkCard('c'), mkCard('d')];

    // User just answered 'a' wrong: it is in wrongSet, sessionHistory, and sessionDeferredWrong
    const afterMissA = pickNextCampusCard({
      pool,
      masteredSet: new Set(),
      wrongSet: new Set(['a']),
      sessionHistory: ['a'],
      sessionDeferredWrong: ['a'],
      onlyWrong: false,
      seed: 1,
    });
    expect(afterMissA?.id).not.toBe('a');

    // User misses 'b' next and masters 'c' and 'd' -> now only deferred cards remain, oldest error ('a') first
    const endOfSession = pickNextCampusCard({
      pool,
      masteredSet: new Set(['c', 'd']),
      wrongSet: new Set(['a', 'b']),
      sessionHistory: ['a', 'b', 'c', 'd'],
      sessionDeferredWrong: ['a', 'b'],
      onlyWrong: false,
      seed: 4,
    });
    expect(endOfSession?.id).toBe('a');

    // In onlyWrong mode with multiple wrong cards, never repeat the last card back-to-back
    const wrongOnlyPool = [mkCard('a'), mkCard('b'), mkCard('c')];
    const nextWrongOnly = pickNextCampusCard({
      pool: wrongOnlyPool,
      masteredSet: new Set(),
      wrongSet: new Set(['a', 'b', 'c']),
      sessionHistory: ['a'],
      sessionDeferredWrong: ['a'],
      onlyWrong: true,
      seed: 0,
    });
    expect(nextWrongOnly?.id).not.toBe('a');
  });
});

describe('Achievements & Long-Term Progression', () => {
  it('defines unique badges across all 4 categories including 79 long-term & chaos achievements', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(BADGES.length).toBe(79);

    const categories = new Set(BADGES.map((b) => b.category));
    expect(categories).toEqual(new Set(['cases', 'tower', 'vocab', 'chaos']));
  });

  it('unlocks case mastery, story completion, joker-junkie, daily-ace, grammar-all-7, and clock achievements', () => {
    const weekdayAfternoon = new Date(2026, 10, 18, 14, 0, 0); // Wednesday 14:00 local
    const saturdayMidnight = new Date(2026, 10, 21, 1, 30, 0); // Saturday 01:30 local
    const mondayLunch = new Date(2026, 10, 16, 12, 15, 0); // Monday 12:15 local
    const mondayMorning = new Date(2026, 10, 16, 6, 30, 0); // Monday 06:30 local

    let p = createDefaultProgress();

    // Stage 4, 1st attempt, 0 jokers -> first-case, perfect-deduction, dative-master, master-of-rome, no-joker-ace
    const first = applyCaseSolved(
      p,
      {
        caseId: 'gen-s4-1',
        stars: 3,
        attempts: 1,
        jokersUsed: 0,
        stage: 4,
        isDaily: false,
        todayStr: '2026-11-18',
      },
      weekdayAfternoon
    );
    p = first.nextProgress;
    expect(first.newlyUnlockedBadges).toEqual(
      expect.arrayContaining([
        'first-case',
        'perfect-deduction',
        'dative-master',
        'master-of-rome',
        'no-joker-ace',
      ])
    );
    expect(p.unlockedBadges).not.toContain('dcc-night-owl');
    expect(p.unlockedBadges).not.toContain('dcc-weekend-hero');

    // Daily ace (1st attempt, 3 stars, 0 jokers) during lunch
    const dailyAce = applyCaseSolved(
      p,
      {
        caseId: 'gen-daily-1',
        stars: 3,
        attempts: 1,
        jokersUsed: 0,
        stage: 2,
        isDaily: true,
        todayStr: '2026-11-16',
      },
      mondayLunch
    );
    p = dailyAce.nextProgress;
    expect(dailyAce.newlyUnlockedBadges).toEqual(
      expect.arrayContaining(['daily-sleuth', 'dcc-daily-ace', 'dcc-lunch-break'])
    );

    // Stubborn case (4+ attempts) + 3 jokers on Saturday at 01:30 -> dcc-stubborn-case, dcc-joker-junkie, dcc-night-owl, dcc-midnight-madness, dcc-weekend-hero
    const nightSolve = applyCaseSolved(
      p,
      {
        caseId: 'gen-s2-1',
        stars: 1,
        attempts: 4,
        jokersUsed: 3,
        stage: 2,
        isDaily: false,
        todayStr: '2026-11-21',
      },
      saturdayMidnight
    );
    p = nightSolve.nextProgress;
    expect(nightSolve.newlyUnlockedBadges).toEqual(
      expect.arrayContaining([
        'dcc-stubborn-case',
        'dcc-joker-junkie',
        'dcc-night-owl',
        'dcc-midnight-madness',
        'dcc-weekend-hero',
      ])
    );

    // Unlock all 7 grammar topics + solve all 12 story cases -> grammar-all-7, story-complete, cases-10, perfect-10, dcc-early-bird, dcc-meta-badges-15
    p = recordGrammarOutcome(
      p,
      ['nominative', 'accusative', 'dative', 'ablative', 'negation', 'perfect', 'conjunction'],
      false
    );
    const allStoryCaseIds = getStoryChapters().flatMap((ch) => ch.cases.map((c) => c.id));
    expect(allStoryCaseIds).toHaveLength(12);
    for (const storyId of allStoryCaseIds) {
      p = applyCaseSolved(
        p,
        {
          caseId: storyId,
          stars: 3,
          attempts: 1,
          jokersUsed: 0,
          stage: 2,
          isDaily: false,
          todayStr: '2026-11-16',
          allStoryCaseIds,
        },
        mondayMorning
      ).nextProgress;
    }
    expect(p.unlockedBadges).toContain('grammar-all-7');
    expect(p.unlockedBadges).toContain('story-complete');
    expect(p.unlockedBadges).toContain('cases-10');
    expect(p.unlockedBadges).toContain('dcc-early-bird');
    expect(p.unlockedBadges).toContain('perfect-10');
    expect(p.unlockedBadges).toContain('five-stars');
    expect(p.unlockedBadges).toContain('dcc-meta-badges-15');
  });

  it('tracks Bureaucracy Tower climbs, near-miss-9 drops, phoenix comebacks, modes, and game overs', () => {
    let p = createDefaultProgress();

    for (let i = 0; i < 3; i++) {
      p = applyTowerEvent(p, { type: 'grace_saved' }).nextProgress;
    }
    expect(p.unlockedBadges).toContain('dcc-grace-saved');
    expect(p.unlockedBadges).toContain('dcc-grace-3');

    // Near miss on floor 9 -> dcc-near-miss-9
    p = applyTowerEvent(p, { type: 'drop', fromFloor: 9, toFloor: 8 }).nextProgress;
    expect(p.unlockedBadges).toContain('dcc-near-miss-9');

    // Climb 50 floors -> tower-floors-50
    for (let i = 0; i < 50; i++) {
      p = applyTowerEvent(p, { type: 'climb' }).nextProgress;
    }
    expect(p.unlockedBadges).toContain('tower-floors-50');

    // Game over then immediate victory -> tower-gameover-1 + dcc-phoenix
    p = applyTowerEvent(p, { type: 'drop', fromFloor: 1, toFloor: 0 }).nextProgress;
    expect(p.unlockedBadges).toContain('tower-gameover-1');
    expect(p.careerMeta?.lastTowerWasGameOver).toBe(true);

    p = applyTowerEvent(p, {
      type: 'victory',
      hadErrors: false,
      hadComeback: false,
      onlyWrongFilter: false,
      quizMode: 'meaning',
      quizDirection: 'de-lat',
    }).nextProgress;
    expect(p.unlockedBadges).toContain('tower-pass-1');
    expect(p.unlockedBadges).toContain('tower-perfect');
    expect(p.unlockedBadges).toContain('tower-de-lat-win');
    expect(p.unlockedBadges).toContain('dcc-phoenix');
    expect(p.careerMeta?.lastTowerWasGameOver).toBe(false);

    p = applyTowerEvent(p, {
      type: 'victory',
      hadErrors: true,
      hadComeback: true,
      onlyWrongFilter: true,
      quizMode: 'cases',
    }).nextProgress;
    expect(p.unlockedBadges).toContain('tower-comeback');
    expect(p.unlockedBadges).toContain('tower-stolpersteine-win');
    expect(p.unlockedBadges).toContain('tower-case-win');
    expect(p.careerMeta?.passierscheineEarned).toBe(2);

    for (let i = 0; i < 4; i++) {
      p = applyTowerEvent(p, { type: 'game_over' }).nextProgress;
    }
    expect(p.careerMeta?.towerGameOvers).toBe(5);
    expect(p.unlockedBadges).toContain('tower-gameover-5');
  });

  it('unlocks 5-wrong chaos badge, 25 wrong-pile badge, and 100-streak in Campus training', () => {
    const weekdayAfternoon = new Date(2026, 10, 18, 15, 0, 0);
    let p = createDefaultProgress();

    for (let i = 0; i < 5; i++) {
      p = applyCampusOutcome(p, `w-${i}`, false, 'meaning', weekdayAfternoon).nextProgress;
    }
    expect(p.unlockedBadges).toContain('dcc-triple-wrong');
    expect(p.unlockedBadges).toContain('dcc-five-wrong');
    expect(p.careerMeta?.currentErrorStreak).toBe(5);

    for (let i = 5; i < 25; i++) {
      p = applyCampusOutcome(p, `w-${i}`, false, 'meaning', weekdayAfternoon).nextProgress;
    }
    expect(p.unlockedBadges).toContain('dcc-wrong-pile-25');

    for (let i = 0; i < 100; i++) {
      p = applyCampusOutcome(p, `s-${i}`, true, 'meaning', weekdayAfternoon).nextProgress;
    }
    expect(p.careerMeta?.currentErrorStreak).toBe(0);
    expect(p.unlockedBadges).toContain('campus-streak-25');
    expect(p.unlockedBadges).toContain('campus-streak-50');
    expect(p.unlockedBadges).toContain('campus-streak-100');
    expect(p.unlockedBadges).toContain('campus-100');
    expect(p.unlockedBadges).toContain('campus-practiced-100');
  });
});


