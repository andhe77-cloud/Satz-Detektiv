import { DifficultyStage, GrammarFocus, PlayerProgress } from '../core/types';

export interface GlossaryEndingRow {
  declensionDe: string;
  ending: string;
  exampleLatin: string;
  exampleDe: string;
}

export interface GlossaryPatternRow {
  marker: string;
  patternDe: string;
  exampleLatin: string;
  exampleDe: string;
}

export interface GlossaryExample {
  latin: string;
  highlight: string;
  german: string;
}

export interface GlossaryEntry {
  focus: GrammarFocus;
  stage: DifficultyStage;
  titleDe: string;
  shortLabelDe: string;
  questionWordDe: string;
  summaryDe: string;
  detectiveTipDe: string;
  endingsTable?: GlossaryEndingRow[];
  patternRows?: GlossaryPatternRow[];
  examples: GlossaryExample[];
}

export const GRAMMAR_GLOSSARY: GlossaryEntry[] = [
  {
    focus: 'nominative',
    stage: 1,
    titleDe: 'Nominativ Singular',
    shortLabelDe: 'Nominativ',
    questionWordDe: 'Wer oder was?',
    summaryDe:
      'Der Nominativ nennt das Subjekt des Satzes – also die handelnde Person (den Täter oder Zeugen) bzw. bei „est“ die Gleichsetzung.',
    detectiveTipDe:
      'Achtung bei Neutra auf -um (z. B. atrium, forum, templum) und 3.-Deklinations-Neutra: Hier sehen Nominativ und Akkusativ gleich aus. Prüfe dann das Verb und die Wortstellung!',
    endingsTable: [
      {
        declensionDe: 'a-Deklination (f.)',
        ending: '-a',
        exampleLatin: 'Claudia / pila',
        exampleDe: 'Claudia / der Ball',
      },
      {
        declensionDe: 'o-Deklination (m. auf -us)',
        ending: '-us',
        exampleLatin: 'Marcus / anulus',
        exampleDe: 'Marcus / der Ring',
      },
      {
        declensionDe: 'o-Deklination (m. auf -er)',
        ending: '-er (Grundform)',
        exampleLatin: 'liber / culter',
        exampleDe: 'das Buch / das Messer',
      },
      {
        declensionDe: 'o-Deklination (n. auf -um)',
        ending: '-um',
        exampleLatin: 'atrium / donum',
        exampleDe: 'das Atrium / das Geschenk',
      },
      {
        declensionDe: '3. Deklination (kons. / i-Stamm)',
        ending: 'Grundform (wechselnd)',
        exampleLatin: 'lapis / clavis',
        exampleDe: 'der Stein / der Schlüssel',
      },
    ],
    examples: [
      {
        latin: 'Marcus lapidem iecit.',
        highlight: 'Marcus',
        german: 'Marcus hat den Stein geworfen.',
      },
      {
        latin: 'Claudia culpam habet.',
        highlight: 'Claudia',
        german: 'Claudia trägt die Schuld.',
      },
    ],
  },
  {
    focus: 'accusative',
    stage: 1,
    titleDe: 'Akkusativ Singular',
    shortLabelDe: 'Akkusativ',
    questionWordDe: 'Wen oder was?',
    summaryDe:
      'Der Akkusativ bezeichnet das direkte Objekt einer Handlung – also den Gegenstand, der genommen, versteckt, geworfen oder benutzt wurde.',
    detectiveTipDe:
      'Das typische Erkennungszeichen im Singular ist das Schluss-m (-am, -um, -em). Nur Neutra behalten im Akkusativ ihre Nominativform bei!',
    endingsTable: [
      {
        declensionDe: 'a-Deklination (f.)',
        ending: '-am',
        exampleLatin: 'pilam / tabulam',
        exampleDe: 'den Ball / die Schreibtafel',
      },
      {
        declensionDe: 'o-Deklination (m. auf -us / -er)',
        ending: '-um',
        exampleLatin: 'anulum / librum',
        exampleDe: 'den Ring / das Buch',
      },
      {
        declensionDe: 'o-Deklination (n. auf -um)',
        ending: '-um (= Nominativ)',
        exampleLatin: 'donum / vinum',
        exampleDe: 'das Geschenk / den Wein',
      },
      {
        declensionDe: '3. Deklination (m. / f.)',
        ending: '-em',
        exampleLatin: 'lapidem / clavem',
        exampleDe: 'den Stein / den Schlüssel',
      },
    ],
    examples: [
      {
        latin: 'Gaius pilam celavit.',
        highlight: 'pilam',
        german: 'Gaius hat den Ball versteckt.',
      },
      {
        latin: 'Lucius calicem portat.',
        highlight: 'calicem',
        german: 'Lucius trägt den Becher.',
      },
    ],
  },
  {
    focus: 'negation',
    stage: 2,
    titleDe: 'Verneinung mit „non“',
    shortLabelDe: 'Verneinung',
    questionWordDe: 'Aussage umkehren',
    summaryDe:
      'Das Adverb „non“ („nicht“) steht vor dem verneinten Wort oder dem Verb und kehrt die Aussage ins Gegenteil um.',
    detectiveTipDe:
      'Doppelte Verneinung im Kopf vermeiden: Wenn ein Lügner sagt „Marcus non culpabilis est“ (Marcus ist nicht schuldig), bedeutet das in Wahrheit: Marcus IST schuldig!',
    patternRows: [
      {
        marker: 'non + Verb',
        patternDe: 'Verneint die gesamte Handlung',
        exampleLatin: 'Lucius lapidem non iecit.',
        exampleDe: 'Lucius hat den Stein nicht geworfen.',
      },
      {
        marker: 'non + Nomen / Name',
        patternDe: 'Schließt eine Person oder Sache aus',
        exampleLatin: 'Non Gaius, sed Marcus aderat.',
        exampleDe: 'Nicht Gaius, sondern Marcus war da.',
      },
    ],
    examples: [
      {
        latin: 'Claudia anulum non cepit.',
        highlight: 'non',
        german: 'Claudia hat den Ring nicht genommen.',
      },
      {
        latin: 'Non saccus in horto erat.',
        highlight: 'Non',
        german: 'Nicht der Sack war im Garten.',
      },
    ],
  },
  {
    focus: 'perfect',
    stage: 2,
    titleDe: 'Perfekt (3. Person Singular)',
    shortLabelDe: 'Perfekt',
    questionWordDe: 'Was ist geschehen?',
    summaryDe:
      'Das Perfekt beschreibt die abgeschlossene Tat in der Vergangenheit. Du erkennst es an speziellen Perfektstämmen und der Endung -it.',
    detectiveTipDe:
      'Unterscheide genau zwischen Präsens (-at / -et / -it am Präsensstamm) und Perfekt (-vit, -uit, -sit/-xit oder veränderter Stamm + -it): Bei „fecit“ oder „cepit“ verrät der Stammwechsel die Vergangenheit.',
    patternRows: [
      {
        marker: '-avit / -ivit',
        patternDe: 'v-Perfekt (a- und i-Konjugation)',
        exampleLatin: 'celavit / spectavit',
        exampleDe: 'hat versteckt / hat betrachtet',
      },
      {
        marker: '-uit',
        patternDe: 'u-Perfekt (häufig e-Konjugation)',
        exampleLatin: 'tenuit / habuit',
        exampleDe: 'hat gehalten / hat gehabt',
      },
      {
        marker: '-sit / -xit',
        patternDe: 's-Perfekt',
        exampleLatin: 'scripsit / dixit',
        exampleDe: 'hat geschrieben / hat gesagt',
      },
      {
        marker: 'Stammwechsel + -it',
        patternDe: 'Dehnungs- oder Reduplikationsperfekt',
        exampleLatin: 'cepit / fecit / vendidit',
        exampleDe: 'hat genommen / hat gemacht / hat verkauft',
      },
    ],
    examples: [
      {
        latin: 'Cornelia epistulam scripsit.',
        highlight: 'scripsit',
        german: 'Cornelia hat den Brief geschrieben.',
      },
      {
        latin: 'Marcus tabulam cepit.',
        highlight: 'cepit',
        german: 'Marcus hat die Schreibtafel genommen.',
      },
    ],
  },
  {
    focus: 'dative',
    stage: 3,
    titleDe: 'Dativ Singular',
    shortLabelDe: 'Dativ',
    questionWordDe: 'Wem?',
    summaryDe:
      'Der Dativ nennt den Empfänger oder Nutznießer (z. B. bei „dedit“ = „hat gegeben“) – also wer den Gegenstand vom Komplizen erhalten hat.',
    detectiveTipDe:
      'Achtung bei Formgleichheit: „Claudiae“ kann Genitiv oder Dativ sein, „Marco“ Dativ oder Ablativ! Bei „dedit“ (gab) folgt der Empfänger immer im Dativ – niemals im Genitiv oder Ablativ.',
    endingsTable: [
      {
        declensionDe: 'a-Deklination (f.)',
        ending: '-ae',
        exampleLatin: 'Claudiae / Corneliae',
        exampleDe: 'der Claudia / der Cornelia',
      },
      {
        declensionDe: 'o-Deklination (m. & n.)',
        ending: '-o',
        exampleLatin: 'Marco / Lucio',
        exampleDe: 'dem Marcus / dem Lucius',
      },
      {
        declensionDe: '3. Deklination (alle Genera)',
        ending: '-i',
        exampleLatin: 'fratri / regi',
        exampleDe: 'dem Bruder / dem König',
      },
    ],
    examples: [
      {
        latin: 'Cornelia Lucio pilam dedit.',
        highlight: 'Lucio',
        german: 'Cornelia hat dem Lucius den Ball gegeben.',
      },
      {
        latin: 'Marcus Claudiae anulum dedit.',
        highlight: 'Claudiae',
        german: 'Marcus hat der Claudia den Ring gegeben.',
      },
    ],
  },
  {
    focus: 'conjunction',
    stage: 3,
    titleDe: 'Satzverbindungen (et / sed)',
    shortLabelDe: 'et & sed',
    questionWordDe: 'Zwei Teilsätze prüfen',
    summaryDe:
      'Die Konjunktionen „et“ („und“) und „sed“ („aber“) verknüpfen zwei Aussagen zu einem einzigen Gesamturteil.',
    detectiveTipDe:
      'Entscheidend für die Wahrheitsregel: Eine Verbindung mit „et“ oder „sed“ ist NUR dann wahr, wenn BEIDE Teilsätze stimmen! Sobald auch nur ein Teil falsch ist, zählt die gesamte Zeugenaussage als gelogen.',
    patternRows: [
      {
        marker: 'et',
        patternDe: '„und“ — verbindet zwei Aussagen gleichrangig',
        exampleLatin: 'Marcus aderat et pilam cepit.',
        exampleDe: 'Marcus war anwesend und hat den Ball genommen.',
      },
      {
        marker: 'sed',
        patternDe: '„aber / jedoch“ — betont einen Gegensatz',
        exampleLatin: 'Gaius non iecit, sed lapidem tenuit.',
        exampleDe: 'Gaius hat nicht geworfen, aber den Stein gehalten.',
      },
    ],
    examples: [
      {
        latin: 'Lucius in atrio erat et calicem vidit.',
        highlight: 'et',
        german: 'Lucius war im Atrium und hat den Becher gesehen.',
      },
      {
        latin: 'Claudia non fugit, sed clavem celavit.',
        highlight: 'sed',
        german: 'Claudia ist nicht geflohen, aber sie hat den Schlüssel versteckt.',
      },
    ],
  },
  {
    focus: 'ablative',
    stage: 4,
    titleDe: 'Ablativ Singular mit „in“',
    shortLabelDe: 'Ablativ',
    questionWordDe: 'Wo? (Ruheort)',
    summaryDe:
      'Nach der Präposition „in“ auf die Frage „Wo?“ steht der Ort im Ablativ Singular. So verraten Zeugen den genauen Tatort.',
    detectiveTipDe:
      'In der a-Deklination endet der Ablativ wie der Nominativ auf -a (z. B. „villa“). Das Signalwort „in“ davor zeigt dir eindeutig: Hier ist der Ort (Ablativ) gemeint, kein Subjekt!',
    endingsTable: [
      {
        declensionDe: 'a-Deklination (f.)',
        ending: '-a (nach in)',
        exampleLatin: 'in villa / in arena',
        exampleDe: 'im Landhaus / in der Arena',
      },
      {
        declensionDe: 'o-Deklination (m. & n.)',
        ending: '-o (nach in)',
        exampleLatin: 'in horto / in foro',
        exampleDe: 'im Garten / auf dem Forum',
      },
      {
        declensionDe: '3. Deklination (kons. / i-Stamm)',
        ending: '-e (nach in)',
        exampleLatin: 'in urbe / in litore',
        exampleDe: 'in der Stadt / am Strand',
      },
    ],
    examples: [
      {
        latin: 'Gaius in horto erat.',
        highlight: 'in horto',
        german: 'Gaius war im Garten.',
      },
      {
        latin: 'Claudia in villa mansit.',
        highlight: 'in villa',
        german: 'Claudia ist im Landhaus geblieben.',
      },
    ],
  },
];

export interface DeclensionMatrixRow {
  declensionDe: string;
  exampleLemma: string;
  cases: Record<'nominative' | 'accusative' | 'dative' | 'ablative', string>;
}

export const CASE_ENDINGS_MATRIX: DeclensionMatrixRow[] = [
  {
    declensionDe: 'a-Deklination (f.)',
    exampleLemma: 'pila, -ae',
    cases: {
      nominative: '-a (pila)',
      accusative: '-am (pilam)',
      dative: '-ae (pilae)',
      ablative: '-a (in pila)',
    },
  },
  {
    declensionDe: 'o-Deklination (m.)',
    exampleLemma: 'anulus, -i',
    cases: {
      nominative: '-us / -er (anulus)',
      accusative: '-um (anulum)',
      dative: '-o (anulo)',
      ablative: '-o (in anulo)',
    },
  },
  {
    declensionDe: 'o-Deklination (n.)',
    exampleLemma: 'atrium, -ii',
    cases: {
      nominative: '-um (atrium)',
      accusative: '-um (atrium)',
      dative: '-o (atrio)',
      ablative: '-o (in atrio)',
    },
  },
  {
    declensionDe: '3. Deklination (kons.)',
    exampleLemma: 'lapis, lapidis',
    cases: {
      nominative: 'Grundform (lapis)',
      accusative: '-em (lapidem)',
      dative: '-i (lapidi)',
      ablative: '-e (in lapide)',
    },
  },
];

export function isGlossaryEntryUnlocked(progress: PlayerProgress, focus: GrammarFocus): boolean {
  const stat = progress.grammarStats?.[focus];
  return Boolean(stat && stat.successes > 0);
}

export function getUnlockedGlossaryCount(progress: PlayerProgress): number {
  return GRAMMAR_GLOSSARY.filter((entry) => isGlossaryEntryUnlocked(progress, entry.focus)).length;
}
