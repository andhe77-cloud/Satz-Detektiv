export type DifficultyStage = 1 | 2 | 3 | 4;

export type GrammarFocus =
  | 'nominative'
  | 'accusative'
  | 'dative'
  | 'ablative'
  | 'negation'
  | 'perfect'
  | 'conjunction';

export type TruthRuleId =
  | 'EXACTLY_ONE_FALSE'
  | 'EXACTLY_ONE_TRUE'
  | 'EXACTLY_TWO_FALSE'
  | 'CULPRIT_LIES_OTHERS_TRUTH'
  | 'EXACTLY_TWO_TRUE';

export type CaseForm = 'nom' | 'gen' | 'dat' | 'acc' | 'abl';
export type NumberForm = 'sg' | 'pl';
export type TenseForm = 'present' | 'perfect' | 'imperfect';
export type DeclensionType = 'a' | 'o-masc' | 'o-er' | 'o-neut' | 'cons' | 'cons-i';
export type ConjugationType = 'a' | 'e' | 'i' | 'cons' | 'mixed' | 'irreg';
export type Gender = 'm' | 'f' | 'n';

export interface NounEntry {
  id: string;
  lemma: string;
  genitive: string;
  stem: string;
  declension: DeclensionType;
  gender: Gender;
  meaningDe: string;
  category: 'person' | 'item' | 'target' | 'location' | 'abstract';
  lesson: number;
  /** Optional explicit overrides for irregular or exact school forms */
  forms?: Partial<Record<CaseForm, string>>;
}

export interface VerbEntry {
  id: string;
  infinitive: string;
  conjugation: ConjugationType;
  present3Sg: string;
  perfect3Sg: string;
  imperfect3Sg?: string;
  meaningDeInf: string;
  meaningDePres3Sg: string;
  meaningDePerfPart: string; // e.g. "zerbrochen" -> "hat ... zerbrochen"
  meaningDePerfAux?: 'hat' | 'ist';
  lesson: number;
}

export interface LexiconData {
  version: number;
  nouns: NounEntry[];
  verbs: VerbEntry[];
  particles: {
    id: string;
    latin: string;
    pos: 'adverb' | 'preposition' | 'conjunction' | 'pronoun';
    grammarNote: string;
    meaningDe: string;
    lesson: number;
  }[];
}

export interface WordToken {
  text: string;
  lemma: string;
  pos: 'Nomen' | 'Name' | 'Verb' | 'Adverb' | 'Präposition' | 'Konjunktion' | 'Pronomen' | 'Satzzeichen';
  grammarLabel: string;
  meaningDe: string;
  ambiguities?: string[];
  /** Used by spaced-repetition / hints */
  grammarFocus?: GrammarFocus;
}

export type StatementAST =
  | { kind: 'CULPRIT_IS'; person: string; negated?: boolean }
  | { kind: 'OBJECT_IS'; item: string; negated?: boolean }
  | { kind: 'PERSON_ACTED_WITH'; person: string; item: string; negated?: boolean }
  | { kind: 'GIVER_IS'; giver: string; negated?: boolean }
  | { kind: 'GAVE_TO'; giver: string; recipient: string; item: string; negated?: boolean }
  | { kind: 'IN_LOCATION'; person: string; location: string; negated?: boolean }
  | { kind: 'WITNESS_TRUTH'; witnessIndex: number; speaksTruth: boolean }
  | { kind: 'CONJUNCTION'; connector: 'et' | 'sed'; left: StatementAST; right: StatementAST };

export interface WitnessStatement {
  witnessIndex: number;
  speakerId: string;
  ast: StatementAST;
  /** Primary tokens in Latin (default word order) */
  tokens: WordToken[];
  latinText: string;
  germanText: string;
  /** Whether any noun in the sentence has case ambiguity that could affect interpretation */
  hasAmbiguousForm: boolean;
  grammarTags: GrammarFocus[];
}

export interface CaseAssignment {
  culprit: string;
  object: string;
  giver?: string;
  location?: string;
}

export interface SolutionSlot {
  id: string;
  expectedWord: string;
  expectedRole: GrammarFocus;
  hintDe: string;
  roleLabelDe: string;
}

export interface SolutionSpec {
  /** Array of literal text chunks or slot references `{slot:0}` */
  parts: Array<{ type: 'text'; value: string } | { type: 'slot'; slotIndex: number }>;
  slots: SolutionSlot[];
  /** Shuffled word tiles including inflected grammatical traps */
  tilePool: string[];
  germanTranslation: string;
}

export interface ScenarioProp {
  id: string;
  labelDe: string;
  latinClue: string;
  commentDe: string;
  xPercent: number;
  yPercent: number;
}

export type RoomThemeId = 'atrium' | 'hortus' | 'officina' | 'forum' | 'villa' | 'templum';

export interface ScenarioTemplate {
  id: string;
  room: RoomThemeId;
  titleDe: string;
  sceneDe: string;
  /** e.g. 'fenestra' or 'placenta' */
  targetNounId: string;
  /** Verb ID for primary offense (e.g., 'frangere', 'rapere') */
  crimeVerbId: string;
  /** Verb ID for action with object (e.g., 'iacere', 'celare', 'portare', 'tangere') */
  actionVerbId: string;
  /** Tense used for action in this scenario */
  preferredTense: 'present' | 'perfect';
  /** Question phrasing templates based on number of questions (1, 2, or 3) */
  question1De: string;
  question2De: string;
  question3De: string;
  question4De: string;
  /** Available object ids fitting this room */
  candidateItems: string[];
  candidateLocations: string[];
  introCorneliusDe: string;
  epilogueTemplateDe: string;
  props: ScenarioProp[];
}

export type CampusMaxLesson = 10 | 20 | 30 | 40 | 50 | 60 | 68;

export type CampusLessonStop = 0 | CampusMaxLesson;

export interface CampusLessonRange {
  from: CampusLessonStop;
  to: CampusMaxLesson;
}

export type CampusBand = '1-10' | '11-20' | '21-30' | '31-40' | '41-50' | '51-60' | '61-68';

export interface CampusCard {
  id: string;
  band: CampusBand;
  maxLesson: CampusMaxLesson;
  front: string;
  back: string;
  pos: 'noun' | 'verb' | 'adjective' | 'other';
  nounMeta?: {
    lemma: string;
    genitive: string;
    stem: string;
    declension: DeclensionType;
    gender: Gender;
  };
}

export interface CaseDefinition {
  id: string;
  seed: string;
  stage: DifficultyStage;
  isCurated?: boolean;
  chapterId?: string;
  campusLessonRange?: CampusLessonRange;
  titleDe: string;
  questionDe: string;
  scenario: ScenarioTemplate;
  witnessIds: string[];
  candidateItems: string[];
  candidateLocations?: string[];
  truthRule: TruthRuleId;
  statements: WitnessStatement[];
  solution: CaseAssignment;
  solutionSpec: SolutionSpec;
  difficultyMetrics: {
    initialCandidates: number;
    deductionSteps: number;
    requiresGiver: boolean;
    requiresLocation: boolean;
    grammarTags: GrammarFocus[];
  };
}

export interface CareerMetaStats {
  passierscheineEarned: number;
  perfectTowers: number;
  towerGameOvers: number;
  comebackTowers: number;
  stolpersteinTowers: number;
  noJokerMasterCases: number;
  currentErrorStreak: number;
  graceSavesCount?: number;
  floorsClimbedTotal?: number;
  lastTowerWasGameOver?: boolean;
}

export interface PlayerProgress {
  solvedCaseIds: Record<string, { stars: number; attempts: number; solvedAt: string }>;
  dailySolvedDates: Record<string, { stars: number; attempts: number }>;
  totalStars: number;
  unlockedBadges: string[];
  grammarStats: Record<GrammarFocus, { errors: number; successes: number; lastPracticed?: string }>;
  campusStats: {
    masteredIds: string[];
    wrongIds: string[];
    practicedCount: number;
    currentStreak?: number;
    bestStreak?: number;
    caseMasteredCount?: number;
    meaningMasteredCount?: number;
  };
  careerMeta?: CareerMetaStats;
  settings: {
    theme: 'light' | 'dark';
    reducedMotion: boolean;
    musicVolume: number;
    sfxVolume: number;
    musicEnabled: boolean;
    vocabularySource: 'standard' | 'campus';
    campusLessonFrom: CampusLessonStop;
    campusLessonTo: CampusMaxLesson;
  };
}
