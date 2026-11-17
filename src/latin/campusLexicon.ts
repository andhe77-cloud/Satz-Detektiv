import rawLexicon from './lexicon.json';
import rawCampusDeck from './campusDeck.json';
import {
  CampusBand,
  CampusCard,
  CampusLessonRange,
  CampusMaxLesson,
  LexiconData,
  NounEntry,
  ScenarioTemplate,
  VerbEntry,
} from '../core/types';
import { LatinLexicon } from './inflector';

export const CAMPUS_BANDS: Array<{
  band: CampusBand;
  maxLesson: CampusMaxLesson;
  labelDe: string;
  shortLabelDe: string;
}> = [
  { band: '1-10', maxLesson: 10, labelDe: 'Lektion 1–10', shortLabelDe: 'bis 10' },
  { band: '11-20', maxLesson: 20, labelDe: 'Lektion 11–20', shortLabelDe: 'bis 20' },
  { band: '21-30', maxLesson: 30, labelDe: 'Lektion 21–30', shortLabelDe: 'bis 30' },
  { band: '31-40', maxLesson: 40, labelDe: 'Lektion 31–40', shortLabelDe: 'bis 40' },
  { band: '41-50', maxLesson: 50, labelDe: 'Lektion 41–50', shortLabelDe: 'bis 50' },
  { band: '51-60', maxLesson: 60, labelDe: 'Lektion 51–60', shortLabelDe: 'bis 60' },
  { band: '61-68', maxLesson: 68, labelDe: 'Lektion 61–68', shortLabelDe: 'alle (1–68)' },
];

export const CAMPUS_CARDS: CampusCard[] = (rawCampusDeck as { cards: CampusCard[] }).cards;

export const CAMPUS_DETECTIVE_NOUNS: NounEntry[] = [
  // Lektion 1–10
  { id: 'c_tabula', lemma: 'tabula', genitive: 'tabulae', stem: 'tabul', declension: 'a', gender: 'f', meaningDe: 'die Schreibtafel', category: 'target', lesson: 10 },
  { id: 'c_mensa', lemma: 'mensa', genitive: 'mensae', stem: 'mens', declension: 'a', gender: 'f', meaningDe: 'der Tisch', category: 'target', lesson: 10 },
  { id: 'c_cena', lemma: 'cena', genitive: 'cenae', stem: 'cen', declension: 'a', gender: 'f', meaningDe: 'die Mahlzeit', category: 'target', lesson: 10 },
  { id: 'c_gladius', lemma: 'gladius', genitive: 'gladii', stem: 'gladi', declension: 'o-masc', gender: 'm', meaningDe: 'das Schwert', category: 'item', lesson: 10 },
  { id: 'c_toga', lemma: 'toga', genitive: 'togae', stem: 'tog', declension: 'a', gender: 'f', meaningDe: 'die Toga', category: 'item', lesson: 10 },
  { id: 'c_tunica', lemma: 'tunica', genitive: 'tunicae', stem: 'tunic', declension: 'a', gender: 'f', meaningDe: 'die Tunika', category: 'item', lesson: 10 },
  { id: 'c_cibus', lemma: 'cibus', genitive: 'cibi', stem: 'cib', declension: 'o-masc', gender: 'm', meaningDe: 'die Speise', category: 'item', lesson: 10 },
  { id: 'c_aqua', lemma: 'aqua', genitive: 'aquae', stem: 'aqu', declension: 'a', gender: 'f', meaningDe: 'das Wasser', category: 'item', lesson: 10 },
  { id: 'c_villa', lemma: 'villa', genitive: 'villae', stem: 'vill', declension: 'a', gender: 'f', meaningDe: 'das Landhaus', category: 'location', lesson: 10 },
  { id: 'c_campus', lemma: 'campus', genitive: 'campi', stem: 'camp', declension: 'o-masc', gender: 'm', meaningDe: 'der Platz', category: 'location', lesson: 10 },
  { id: 'c_silva', lemma: 'silva', genitive: 'silvae', stem: 'silv', declension: 'a', gender: 'f', meaningDe: 'der Wald', category: 'location', lesson: 10 },
  { id: 'c_ludus', lemma: 'ludus', genitive: 'ludi', stem: 'lud', declension: 'o-masc', gender: 'm', meaningDe: 'die Schule', category: 'location', lesson: 10 },

  // Lektion 11–20
  { id: 'c_statua', lemma: 'statua', genitive: 'statuae', stem: 'statu', declension: 'a', gender: 'f', meaningDe: 'die Statue', category: 'target', lesson: 20 },
  { id: 'c_donum', lemma: 'donum', genitive: 'doni', stem: 'don', declension: 'o-neut', gender: 'n', meaningDe: 'das Geschenk', category: 'target', lesson: 20 },
  { id: 'c_ornamentum', lemma: 'ornamentum', genitive: 'ornamenti', stem: 'ornament', declension: 'o-neut', gender: 'n', meaningDe: 'das Schmuckstück', category: 'target', lesson: 20 },
  { id: 'c_pecunia', lemma: 'pecunia', genitive: 'pecuniae', stem: 'pecuni', declension: 'a', gender: 'f', meaningDe: 'das Geld', category: 'item', lesson: 20 },
  { id: 'c_vinum', lemma: 'vinum', genitive: 'vini', stem: 'vin', declension: 'o-neut', gender: 'n', meaningDe: 'der Wein', category: 'item', lesson: 20 },
  { id: 'c_carrus', lemma: 'carrus', genitive: 'carri', stem: 'carr', declension: 'o-masc', gender: 'm', meaningDe: 'der Wagen', category: 'item', lesson: 20 },
  { id: 'c_templum', lemma: 'templum', genitive: 'templi', stem: 'templ', declension: 'o-neut', gender: 'n', meaningDe: 'der Tempel', category: 'location', lesson: 20 },
  { id: 'c_forum', lemma: 'forum', genitive: 'fori', stem: 'for', declension: 'o-neut', gender: 'n', meaningDe: 'das Forum', category: 'location', lesson: 20 },
  { id: 'c_basilica', lemma: 'basilica', genitive: 'basilicae', stem: 'basilic', declension: 'a', gender: 'f', meaningDe: 'die Markthalle', category: 'location', lesson: 20 },

  // Lektion 21–30
  { id: 'c_monumentum', lemma: 'monumentum', genitive: 'monumenti', stem: 'monument', declension: 'o-neut', gender: 'n', meaningDe: 'das Denkmal', category: 'target', lesson: 30 },
  { id: 'c_tectum', lemma: 'tectum', genitive: 'tecti', stem: 'tect', declension: 'o-neut', gender: 'n', meaningDe: 'das Haus', category: 'location', lesson: 30 },
  { id: 'c_fons', lemma: 'fons', genitive: 'fontis', stem: 'font', declension: 'cons-i', gender: 'm', meaningDe: 'der Brunnen', category: 'location', lesson: 30 },
  { id: 'c_amphiteatrum', lemma: 'amphiteatrum', genitive: 'amphiteatri', stem: 'amphiteatr', declension: 'o-neut', gender: 'n', meaningDe: 'das Amphitheater', category: 'location', lesson: 30 },

  // Lektion 31–40
  { id: 'c_signum', lemma: 'signum', genitive: 'signi', stem: 'sign', declension: 'o-neut', gender: 'n', meaningDe: 'das Standbild', category: 'target', lesson: 40 },
  { id: 'c_libellus', lemma: 'libellus', genitive: 'libelli', stem: 'libell', declension: 'o-masc', gender: 'm', meaningDe: 'das Heft', category: 'item', lesson: 40 },
  { id: 'c_ferrum', lemma: 'ferrum', genitive: 'ferri', stem: 'ferr', declension: 'o-neut', gender: 'n', meaningDe: 'das Eisen', category: 'item', lesson: 40 },
  { id: 'c_arena', lemma: 'arena', genitive: 'arenae', stem: 'aren', declension: 'a', gender: 'f', meaningDe: 'die Arena', category: 'location', lesson: 40 },

  // Lektion 41–50
  { id: 'c_ara', lemma: 'ara', genitive: 'arae', stem: 'ar', declension: 'a', gender: 'f', meaningDe: 'der Altar', category: 'target', lesson: 50 },
  { id: 'c_argentum', lemma: 'argentum', genitive: 'argenti', stem: 'argent', declension: 'o-neut', gender: 'n', meaningDe: 'das Silber', category: 'item', lesson: 50 },
  { id: 'c_praeda', lemma: 'praeda', genitive: 'praedae', stem: 'praed', declension: 'a', gender: 'f', meaningDe: 'die Beute', category: 'item', lesson: 50 },
  { id: 'c_arx', lemma: 'arx', genitive: 'arcis', stem: 'arc', declension: 'cons-i', gender: 'f', meaningDe: 'die Burg', category: 'location', lesson: 50 },

  // Lektion 51–60
  { id: 'c_oraculum', lemma: 'oraculum', genitive: 'oraculi', stem: 'oracul', declension: 'o-neut', gender: 'n', meaningDe: 'das Orakel', category: 'target', lesson: 60 },
  { id: 'c_saxum', lemma: 'saxum', genitive: 'saxi', stem: 'sax', declension: 'o-neut', gender: 'n', meaningDe: 'der Fels', category: 'item', lesson: 60 },
  { id: 'c_litus', lemma: 'litus', genitive: 'litoris', stem: 'litor', declension: 'cons', gender: 'n', meaningDe: 'der Strand', category: 'location', lesson: 60 },

  // Lektion 61–68
  { id: 'c_liber', lemma: 'liber', genitive: 'libri', stem: 'libr', declension: 'o-er', gender: 'm', meaningDe: 'das Buch', category: 'target', lesson: 68 },
  { id: 'c_aurum', lemma: 'aurum', genitive: 'auri', stem: 'aur', declension: 'o-neut', gender: 'n', meaningDe: 'das Gold', category: 'item', lesson: 68 },
  { id: 'c_taberna', lemma: 'taberna', genitive: 'tabernae', stem: 'tabern', declension: 'a', gender: 'f', meaningDe: 'der Laden', category: 'location', lesson: 68 },
  { id: 'c_rus', lemma: 'rus', genitive: 'ruris', stem: 'rur', declension: 'cons', gender: 'n', meaningDe: 'das Landgut', category: 'location', lesson: 68 },
];

export const CAMPUS_DETECTIVE_VERBS: VerbEntry[] = [
  // Lektion 1–10
  { id: 'c_delere', infinitive: 'delere', conjugation: 'e', present3Sg: 'delet', perfect3Sg: 'delevit', meaningDeInf: 'zerstören', meaningDePres3Sg: 'zerstört', meaningDePerfPart: 'zerstört', meaningDePerfAux: 'hat', lesson: 10 },
  { id: 'c_movere', infinitive: 'movere', conjugation: 'e', present3Sg: 'movet', perfect3Sg: 'movit', meaningDeInf: 'bewegen', meaningDePres3Sg: 'bewegt', meaningDePerfPart: 'bewegt', meaningDePerfAux: 'hat', lesson: 10 },
  { id: 'c_tenere', infinitive: 'tenere', conjugation: 'e', present3Sg: 'tenet', perfect3Sg: 'tenuit', meaningDeInf: 'halten', meaningDePres3Sg: 'hält', meaningDePerfPart: 'gehalten', meaningDePerfAux: 'hat', lesson: 10 },
  { id: 'c_spectare', infinitive: 'spectare', conjugation: 'a', present3Sg: 'spectat', perfect3Sg: 'spectavit', meaningDeInf: 'betrachten', meaningDePres3Sg: 'betrachtet', meaningDePerfPart: 'betrachtet', meaningDePerfAux: 'hat', lesson: 10 },
  { id: 'c_videre', infinitive: 'videre', conjugation: 'e', present3Sg: 'videt', perfect3Sg: 'vidit', meaningDeInf: 'sehen', meaningDePres3Sg: 'sieht', meaningDePerfPart: 'gesehen', meaningDePerfAux: 'hat', lesson: 10 },
  { id: 'c_ornare', infinitive: 'ornare', conjugation: 'a', present3Sg: 'ornat', perfect3Sg: 'ornavit', meaningDeInf: 'schmücken', meaningDePres3Sg: 'schmückt', meaningDePerfPart: 'geschmückt', meaningDePerfAux: 'hat', lesson: 10 },

  // Lektion 11–20
  { id: 'c_capere', infinitive: 'capere', conjugation: 'mixed', present3Sg: 'capit', perfect3Sg: 'cepit', meaningDeInf: 'nehmen', meaningDePres3Sg: 'nimmt', meaningDePerfPart: 'genommen', meaningDePerfAux: 'hat', lesson: 20 },
  { id: 'c_invenire', infinitive: 'invenire', conjugation: 'i', present3Sg: 'invenit', perfect3Sg: 'invenit', meaningDeInf: 'finden', meaningDePres3Sg: 'findet', meaningDePerfPart: 'gefunden', meaningDePerfAux: 'hat', lesson: 20 },
  { id: 'c_vendere', infinitive: 'vendere', conjugation: 'cons', present3Sg: 'vendit', perfect3Sg: 'vendidit', meaningDeInf: 'verkaufen', meaningDePres3Sg: 'verkauft', meaningDePerfPart: 'verkauft', meaningDePerfAux: 'hat', lesson: 20 },
  { id: 'c_trahere', infinitive: 'trahere', conjugation: 'cons', present3Sg: 'trahit', perfect3Sg: 'traxit', meaningDeInf: 'schleppen', meaningDePres3Sg: 'schleppt', meaningDePerfPart: 'geschleppt', meaningDePerfAux: 'hat', lesson: 20 },
  { id: 'c_servare', infinitive: 'servare', conjugation: 'a', present3Sg: 'servat', perfect3Sg: 'servavit', meaningDeInf: 'bewahren', meaningDePres3Sg: 'bewahrt', meaningDePerfPart: 'bewahrt', meaningDePerfAux: 'hat', lesson: 20 },

  // Lektion 21–30
  { id: 'c_quaerere', infinitive: 'quaerere', conjugation: 'cons', present3Sg: 'quaerit', perfect3Sg: 'quaesivit', meaningDeInf: 'suchen', meaningDePres3Sg: 'sucht', meaningDePerfPart: 'gesucht', meaningDePerfAux: 'hat', lesson: 30 },
  { id: 'c_comprehendere', infinitive: 'comprehendere', conjugation: 'cons', present3Sg: 'comprehendit', perfect3Sg: 'comprehendit', meaningDeInf: 'ergreifen', meaningDePres3Sg: 'ergreift', meaningDePerfPart: 'ergriffen', meaningDePerfAux: 'hat', lesson: 30 },

  // Lektion 31–40
  { id: 'c_aperire', infinitive: 'aperire', conjugation: 'i', present3Sg: 'aperit', perfect3Sg: 'aperuit', meaningDeInf: 'öffnen', meaningDePres3Sg: 'öffnet', meaningDePerfPart: 'geöffnet', meaningDePerfAux: 'hat', lesson: 40 },
  { id: 'c_condere', infinitive: 'condere', conjugation: 'cons', present3Sg: 'condit', perfect3Sg: 'condidit', meaningDeInf: 'verbergen', meaningDePres3Sg: 'verbirgt', meaningDePerfPart: 'verborgen', meaningDePerfAux: 'hat', lesson: 40 },
  { id: 'c_conicere', infinitive: 'conicere', conjugation: 'mixed', present3Sg: 'conicit', perfect3Sg: 'coniecit', meaningDeInf: 'werfen', meaningDePres3Sg: 'wirft', meaningDePerfPart: 'geworfen', meaningDePerfAux: 'hat', lesson: 40 },

  // Lektion 41–50
  { id: 'c_frangere', infinitive: 'frangere', conjugation: 'cons', present3Sg: 'frangit', perfect3Sg: 'fregit', meaningDeInf: 'zerbrechen', meaningDePres3Sg: 'zerbricht', meaningDePerfPart: 'zerbrochen', meaningDePerfAux: 'hat', lesson: 50 },
  { id: 'c_laedere', infinitive: 'laedere', conjugation: 'cons', present3Sg: 'laedit', perfect3Sg: 'laesit', meaningDeInf: 'beschädigen', meaningDePres3Sg: 'beschädigt', meaningDePerfPart: 'beschädigt', meaningDePerfAux: 'hat', lesson: 50 },

  // Lektion 51–60
  { id: 'c_accipere', infinitive: 'accipere', conjugation: 'mixed', present3Sg: 'accipit', perfect3Sg: 'accepit', meaningDeInf: 'erhalten', meaningDePres3Sg: 'erhält', meaningDePerfPart: 'erhalten', meaningDePerfAux: 'hat', lesson: 60 },
  { id: 'c_commovere', infinitive: 'commovere', conjugation: 'e', present3Sg: 'commovet', perfect3Sg: 'commovit', meaningDeInf: 'verrücken', meaningDePres3Sg: 'verrückt', meaningDePerfPart: 'verrückt', meaningDePerfAux: 'hat', lesson: 60 },

  // Lektion 61–68
  { id: 'c_corripere', infinitive: 'corripere', conjugation: 'mixed', present3Sg: 'corripit', perfect3Sg: 'corripuit', meaningDeInf: 'ergreifen', meaningDePres3Sg: 'ergreift', meaningDePerfPart: 'ergriffen', meaningDePerfAux: 'hat', lesson: 68 },
  { id: 'c_legere', infinitive: 'legere', conjugation: 'cons', present3Sg: 'legit', perfect3Sg: 'legit', meaningDeInf: 'lesen', meaningDePres3Sg: 'liest', meaningDePerfPart: 'gelesen', meaningDePerfAux: 'hat', lesson: 68 },
];

const BASE_DATA = rawLexicon as LexiconData;
const PERSON_NOUNS = BASE_DATA.nouns.filter((n) => n.category === 'person');
const CORE_VERBS = BASE_DATA.verbs.filter((v) => ['dare', 'esse', 'dicere'].includes(v.id));

const COMBINED_DATA: LexiconData = {
  version: 1,
  nouns: [...BASE_DATA.nouns, ...CAMPUS_DETECTIVE_NOUNS],
  verbs: [...BASE_DATA.verbs, ...CAMPUS_DETECTIVE_VERBS],
  particles: BASE_DATA.particles,
};

export const combinedLexicon = new LatinLexicon(COMBINED_DATA);

export function getCampusLexicon(range: CampusLessonRange): LatinLexicon {
  const nouns = [
    ...PERSON_NOUNS,
    ...CAMPUS_DETECTIVE_NOUNS.filter((n) => n.lesson <= range.to),
  ];
  const verbs = [
    ...CORE_VERBS,
    ...CAMPUS_DETECTIVE_VERBS.filter((v) => v.lesson <= range.to),
  ];
  return new LatinLexicon({
    version: 1,
    nouns,
    verbs,
    particles: BASE_DATA.particles,
  });
}

function selectByRange(
  category: 'item' | 'location',
  range: CampusLessonRange,
  offset: number
): string[] {
  const inRange = CAMPUS_DETECTIVE_NOUNS.filter(
    (n) => n.category === category && n.lesson > range.from && n.lesson <= range.to
  ).map((n) => n.id);
  const earlier = CAMPUS_DETECTIVE_NOUNS.filter(
    (n) => n.category === category && n.lesson <= range.from
  ).map((n) => n.id);

  // Prioritize words directly inside [from+1, to], backfill from <= from if narrow band has < 3
  const pool = inRange.length >= 3 ? inRange : [...inRange, ...earlier];
  if (pool.length <= 3) return pool;

  const picked: string[] = [];
  for (let i = 0; i < 3; i++) {
    const id = pool[(offset + i) % pool.length];
    if (!picked.includes(id)) picked.push(id);
  }
  return picked;
}

export function buildCampusScenarios(range: CampusLessonRange): ScenarioTemplate[] {
  const candidates: Array<{ minLesson: number; scenario: ScenarioTemplate }> = [
    {
      minLesson: 10,
      scenario: {
        id: 'campus-villa-tabula',
        room: 'villa',
        titleDe: 'Die verschwundene Schreibtafel',
        sceneDe: 'Im Landhaus fehlt die wertvolle Schreibtafel – die Zeugen widersprechen sich bei ihren Beobachtungen.',
        targetNounId: 'c_tabula',
        crimeVerbId: range.to >= 20 ? 'c_capere' : 'c_delere',
        actionVerbId: range.to >= 20 ? 'c_servare' : 'c_tenere',
        preferredTense: 'perfect',
        question1De:
          range.to >= 20
            ? 'Wer hat die Schreibtafel an sich genommen?'
            : 'Wer hat die Schreibtafel zerstört?',
        question2De: 'Wer war der Täter und welchen Gegenstand hat er gehalten oder verwahrt?',
        question3De: 'Wer war es, welcher Gegenstand spielte mit und wer hat ihn gegeben?',
        question4De: 'Wer war es, was wurde gehalten, wer half und an welchem Ort geschah es?',
        candidateItems: selectByRange('item', range, 0),
        candidateLocations: selectByRange('location', range, 0),
        introCorneliusDe:
          '„Eine wertvolle Schreibtafel ist verschwunden! Achte scharf auf Nominativ und Akkusativ in den Aussagen, dann verrät sich der Täter von selbst.“',
        epilogueTemplateDe:
          '„Hervorragend ermittelt! Wer die Endungen genau liest, lässt sich von keinem falschen Alibi täuschen.“',
        props: [
          {
            id: 'wax-tablet',
            labelDe: 'Wachsreste',
            latinClue: 'tabula',
            commentDe: 'Auf dem Tisch blieben frische Wachssplitter zurück.',
            xPercent: 34,
            yPercent: 60,
          },
          {
            id: 'stylus',
            labelDe: 'Griffel',
            latinClue: 'stilus',
            commentDe: 'Ein hölzerner Schreibgriffel zeigt zur Tür.',
            xPercent: 68,
            yPercent: 56,
          },
        ],
      },
    },
    {
      minLesson: 10,
      scenario: {
        id: 'campus-cena-mensa',
        room: 'atrium',
        titleDe: 'Aufregung um das Festmahl',
        sceneDe: 'Im Speisebereich herrscht Verwirrung: Die vorbereitete Mahlzeit wurde verschoben und angerührt.',
        targetNounId: 'c_cena',
        crimeVerbId: 'c_movere',
        actionVerbId: 'c_spectare',
        preferredTense: 'perfect',
        question1De: 'Wer hat die Mahlzeit bewegt?',
        question2De: 'Wer hat das Festmahl bewegt und was hat der Täter betrachtet?',
        question3De: 'Wer war es, was wurde betrachtet und wer hat es weitergereicht?',
        question4De: 'Wer war es, was wurde betrachtet, wer gab es und wo spielte sich alles ab?',
        candidateItems: selectByRange('item', range, 2),
        candidateLocations: selectByRange('location', range, 1),
        introCorneliusDe:
          '„Wer hat sich hier an der Mahlzeit zu schaffen gemacht? Prüfe die Verben und Kasus-Endungen ganz genau!“',
        epilogueTemplateDe:
          '„Mahlzeit gerettet, Täter überführt! So sieht echte Ermittlungsarbeit in Rom aus.“',
        props: [
          {
            id: 'plate',
            labelDe: 'Speiseteller',
            latinClue: 'cena',
            commentDe: 'Der Bronzeteller wurde hastig zur Seite geschoben.',
            xPercent: 48,
            yPercent: 64,
          },
        ],
      },
    },
    {
      minLesson: 10,
      scenario: {
        id: 'campus-mensa-ornare',
        room: 'hortus',
        titleDe: 'Der verrückte Tisch',
        sceneDe: 'Jemand hat den großen Tisch umgestoßen und heimlich etwas mitgenommen.',
        targetNounId: 'c_mensa',
        crimeVerbId: range.to >= 50 ? 'c_frangere' : 'c_delere',
        actionVerbId: range.to >= 30 ? 'c_quaerere' : 'c_videre',
        preferredTense: 'perfect',
        question1De: range.to >= 50 ? 'Wer hat den Tisch zerbrochen?' : 'Wer hat den Tisch zerstört?',
        question2De: 'Wer war der Täter und welcher Gegenstand wurde gesehen oder gesucht?',
        question3De: 'Wer war es, was wurde gesucht/gesehen und wer hat es gegeben?',
        question4De: 'Wer war es, was wurde gesucht/gesehen, wer gab es und an welchem Ort?',
        candidateItems: selectByRange('item', range, 1),
        candidateLocations: selectByRange('location', range, 2),
        introCorneliusDe:
          '„Eine zerstörte Spur und fünf verdächtige Aussagen! Mit kühlem Kopf und klaren Endungen findest du den richtigen Täter.“',
        epilogueTemplateDe:
          '„Treffer! Wer Kasus sicher unterscheidet, lässt sich von keinem Zeugen blenden.“',
        props: [
          {
            id: 'table-leg',
            labelDe: 'Tischkante',
            latinClue: 'mensa',
            commentDe: 'Eine deutliche Schramme zieht sich über das Holz.',
            xPercent: 50,
            yPercent: 58,
          },
        ],
      },
    },
    {
      minLesson: 20,
      scenario: {
        id: 'campus-forum-statua',
        room: 'forum',
        titleDe: 'Die Statue am Forum',
        sceneDe: 'Auf dem Forum ist die neue Statue verschwunden – Zeugen berichten von seltsamen Geschäften.',
        targetNounId: 'c_statua',
        crimeVerbId: range.to >= 40 ? 'c_condere' : 'c_invenire',
        actionVerbId: 'c_vendere',
        preferredTense: 'perfect',
        question1De: range.to >= 40 ? 'Wer hat die Statue verborgen?' : 'Wer hat die Statue zuerst gefunden?',
        question2De: 'Wer war es und welches Stück wurde dabei verkauft?',
        question3De: 'Wer war es, was wurde verkauft und wer hat es ihm oder ihr gegeben?',
        question4De: 'Wer war es, was wurde verkauft, wer half und an welchem Ort geschah es?',
        candidateItems: selectByRange('item', range, 0),
        candidateLocations: selectByRange('location', range, 1),
        introCorneliusDe:
          '„Auf dem Forum kursieren Gerüchte! Vergleiche jede Aussage sorgfältig mit der Wahrheitsregel.“',
        epilogueTemplateDe:
          '„Die Statue steht wieder auf dem Forum – brillant kombiniert!“',
        props: [
          {
            id: 'pedestal',
            labelDe: 'Sockel',
            latinClue: 'statua',
            commentDe: 'Am leeren Marmorsockel liegen Münzspuren.',
            xPercent: 48,
            yPercent: 52,
          },
        ],
      },
    },
    {
      minLesson: 30,
      scenario: {
        id: 'campus-templum-donum',
        room: 'templum',
        titleDe: 'Das verschwundene Geschenk',
        sceneDe: 'Am Tempel vermisst der Wächter ein geweihtes Stück.',
        targetNounId: range.to >= 40 ? 'c_signum' : 'c_monumentum',
        crimeVerbId: range.to >= 68 ? 'c_corripere' : 'c_comprehendere',
        actionVerbId: range.to >= 40 ? 'c_conicere' : 'c_quaerere',
        preferredTense: 'perfect',
        question1De:
          range.to >= 40
            ? 'Wer hat das Standbild an sich gerissen?'
            : 'Wer hat das Denkmal berührt?',
        question2De: 'Wer war der Täter und was wurde dabei gesucht oder geworfen?',
        question3De: 'Wer war es, was wurde genutzt und wer hat es gegeben?',
        question4De: 'Wer war es, was wurde genutzt, wer gab es und wo spielte es sich ab?',
        candidateItems: selectByRange('item', range, 1),
        candidateLocations: selectByRange('location', range, 2),
        introCorneliusDe:
          '„Selbst ein geweihtes Stück ist nicht sicher! Prüfe jede Aussage genau auf Subjekt und Objekt.“',
        epilogueTemplateDe:
          '„Das Opfergeschenk ist wieder an seinem Platz – meisterhafte Arbeit!“',
        props: [
          {
            id: 'altar-stone',
            labelDe: 'Altarstein',
            latinClue: range.to >= 40 ? 'signum' : 'monumentum',
            commentDe: 'Hier stand das verschwundene Stück bis heute Morgen.',
            xPercent: 52,
            yPercent: 58,
          },
        ],
      },
    },
    {
      minLesson: 50,
      scenario: {
        id: 'campus-arx-ara',
        room: 'officina',
        titleDe: 'Der beschädigte Altar',
        sceneDe: 'Am Stein-Altar wurde ein Teil abgeschlagen – wertvolles Silber war im Spiel.',
        targetNounId: 'c_ara',
        crimeVerbId: 'c_laedere',
        actionVerbId: range.to >= 60 ? 'c_accipere' : 'c_frangere',
        preferredTense: 'perfect',
        question1De: 'Wer hat den Altar beschädigt?',
        question2De: 'Wer hat den Altar beschädigt und welches Stück wurde angenommen oder zerbrochen?',
        question3De: 'Wer war es, was wurde benutzt und wer hat es gegeben?',
        question4De: 'Wer war es, was wurde benutzt, wer gab es und an welchem Ort geschah es?',
        candidateItems: selectByRange('item', range, 0),
        candidateLocations: selectByRange('location', range, 0),
        introCorneliusDe:
          '„Ein kniffliger Fall! Achte besonders auf Konsonantenstämme und Neutra in den Aussagen.“',
        epilogueTemplateDe:
          '„Der Altar wird restauriert – dein Scharfsinn ist unbestechlich!“',
        props: [
          {
            id: 'altar-chip',
            labelDe: 'Steinsplitter',
            latinClue: 'ara',
            commentDe: 'Ein frischer Bruch am rechten Rand des Altars.',
            xPercent: 48,
            yPercent: 60,
          },
        ],
      },
    },
    {
      minLesson: 68,
      scenario: {
        id: 'campus-taberna-liber',
        room: 'forum',
        titleDe: 'Das entwendete Buch',
        sceneDe: 'In der Taberna fehlt eine wertvolle Buchrolle neben dem Goldbeutel.',
        targetNounId: 'c_liber',
        crimeVerbId: 'c_corripere',
        actionVerbId: 'c_legere',
        preferredTense: 'perfect',
        question1De: 'Wer hat das Buch an sich gerissen?',
        question2De: 'Wer hat das Buch ergriffen und was war dabei im Spiel?',
        question3De: 'Wer war es, was wurde genutzt und wer hat es gegeben?',
        question4De: 'Wer war es, was wurde genutzt, wer gab es und wo befand sich der Täter?',
        candidateItems: selectByRange('item', range, 0),
        candidateLocations: selectByRange('location', range, 0),
        introCorneliusDe:
          '„Ein rätselhafter Diebstahl! Wer hat das wertvolle Buch aus der Taberna entwendet?“',
        epilogueTemplateDe:
          '„Buch gefunden, Gold gesichert – reif für die Oberstufe!“',
        props: [
          {
            id: 'scroll',
            labelDe: 'Buchband',
            latinClue: 'liber',
            commentDe: 'Das lederne Verschlussband blieb liegen.',
            xPercent: 52,
            yPercent: 56,
          },
        ],
      },
    },
  ];

  const eligible = candidates.filter((c) => c.minLesson <= range.to);
  const strictlyInRange = eligible.filter((c) => c.minLesson > range.from);
  const backfill = eligible
    .filter((c) => c.minLesson <= range.from)
    .sort((a, b) => b.minLesson - a.minLesson);
  const chosen =
    strictlyInRange.length >= 3
      ? strictlyInRange
      : [...strictlyInRange, ...backfill.slice(0, Math.max(0, 3 - strictlyInRange.length))];
  return chosen.map((c) => c.scenario);
}
