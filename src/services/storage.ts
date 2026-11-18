import { CareerMetaStats, DifficultyStage, GrammarFocus, PlayerProgress } from '../core/types';

const STORAGE_KEY = 'satz-detektiv-progress-v1';

export interface RankInfo {
  titleDe: string;
  minStars: number;
  nextTitleDe?: string;
  nextStars?: number;
}

export const RANKS: RankInfo[] = [
  { titleDe: 'Kanzlei-Praktikant', minStars: 0, nextTitleDe: 'Spürhund', nextStars: 6 },
  { titleDe: 'Spürhund', minStars: 6, nextTitleDe: 'Kasus-Ermittler', nextStars: 14 },
  { titleDe: 'Kasus-Ermittler', minStars: 14, nextTitleDe: 'Oberkommissar', nextStars: 24 },
  { titleDe: 'Oberkommissar', minStars: 24, nextTitleDe: 'Chefermittler in Rom', nextStars: 36 },
  { titleDe: 'Chefermittler in Rom', minStars: 36, nextTitleDe: 'Tribun der Grammatik', nextStars: 52 },
  { titleDe: 'Tribun der Grammatik', minStars: 52, nextTitleDe: 'Konsul des Forums', nextStars: 72 },
  {
    titleDe: 'Konsul des Forums',
    minStars: 72,
    nextTitleDe: 'Unsterblicher Imperator der Deklination',
    nextStars: 100,
  },
  {
    titleDe: 'Unsterblicher Imperator der Deklination',
    minStars: 100,
    nextTitleDe: 'Ewiger Gott-Imperator des Lateins',
    nextStars: 150,
  },
  { titleDe: 'Ewiger Gott-Imperator des Lateins', minStars: 150 },
];

export type BadgeCategory = 'cases' | 'tower' | 'vocab' | 'chaos';

export interface BadgeDefinition {
  id: string;
  category: BadgeCategory;
  titleDe: string;
  descriptionDe: string;
  rewardDe: string;
  secretHintDe?: string;
  progress?: (p: PlayerProgress) => { current: number; target: number };
}

export const DEFAULT_CAREER_META: CareerMetaStats = {
  passierscheineEarned: 0,
  perfectTowers: 0,
  towerGameOvers: 0,
  comebackTowers: 0,
  stolpersteinTowers: 0,
  noJokerMasterCases: 0,
  currentErrorStreak: 0,
  graceSavesCount: 0,
  floorsClimbedTotal: 0,
  lastTowerWasGameOver: false,
};

function countTotalSolvedCases(p: Pick<PlayerProgress, 'solvedCaseIds' | 'dailySolvedDates'>): number {
  return Object.keys(p.solvedCaseIds).length + Object.keys(p.dailySolvedDates).length;
}

function countPerfectCases(p: Pick<PlayerProgress, 'solvedCaseIds' | 'dailySolvedDates'>): number {
  return (
    Object.values(p.solvedCaseIds).filter((c) => c.stars === 3).length +
    Object.values(p.dailySolvedDates).filter((c) => c.stars === 3).length
  );
}

function countUnlockedGrammarTopics(p: Pick<PlayerProgress, 'grammarStats'>): number {
  const keys: GrammarFocus[] = [
    'nominative',
    'accusative',
    'dative',
    'ablative',
    'negation',
    'perfect',
    'conjunction',
  ];
  return keys.filter((k) => {
    const stat = p.grammarStats?.[k];
    return stat && stat.successes + stat.errors > 0;
  }).length;
}

export const BADGES: BadgeDefinition[] = [
  // --- CASES & STORY (23) ---
  {
    id: 'first-case',
    category: 'cases',
    titleDe: 'Erster Durchblick',
    descriptionDe: 'Den allerersten Fall erfolgreich gelöst. Die Kanzlei zittert vor deiner Grammatik.',
    rewardDe: 'Eine frische Wachstafel & Respekt beim Pförtner.',
  },
  {
    id: 'cases-5',
    category: 'cases',
    titleDe: 'Kanzlei-Dauerbrenner',
    descriptionDe: '5 Fälle gelöst. Dein Stuhl in der Schreibstube bekommt langsam deine Körperform.',
    rewardDe: 'Ein zweites Sitzkissen aus Schafswolle.',
    progress: (p) => ({ current: countTotalSolvedCases(p), target: 5 }),
  },
  {
    id: 'cases-10',
    category: 'cases',
    titleDe: 'Stammakte im Regal',
    descriptionDe: '10 Fälle gelöst! Die Unterwelt von Rom spricht deinen Namen nur noch flüsternd aus.',
    rewardDe: 'Eigenes Türschild mit „Nicht stören – ermittle!“.',
    progress: (p) => ({ current: countTotalSolvedCases(p), target: 10 }),
  },
  {
    id: 'cases-25',
    category: 'cases',
    titleDe: 'Roms fleißigster Schnüffler',
    descriptionDe: 'Insgesamt 25 Fälle geknackt. Kein Verbrecher in Rom traut sich noch einen Ablativ.',
    rewardDe: 'Ein zweiter Aktenschrank aus Zypressenholz.',
    progress: (p) => ({ current: countTotalSolvedCases(p), target: 25 }),
  },
  {
    id: 'cases-50',
    category: 'cases',
    titleDe: 'Akten-Legende',
    descriptionDe: '50 Fälle gelöst! Wenn jemand auf Latein schummelt, riechst du es drei Straßen weiter.',
    rewardDe: 'Marmorbüste in der Kanzlei (leicht schief).',
    progress: (p) => ({ current: countTotalSolvedCases(p), target: 50 }),
  },
  {
    id: 'cases-100',
    category: 'cases',
    titleDe: 'Das Orakel der Subura',
    descriptionDe: '100 Fälle gelöst! Verbrecher stellen sich inzwischen freiwillig, nur um die Standpauke abzukürzen.',
    rewardDe: 'Lebenslange Garantie auf scharfe Griffel.',
    progress: (p) => ({ current: countTotalSolvedCases(p), target: 100 }),
  },
  {
    id: 'perfect-deduction',
    category: 'cases',
    titleDe: 'Adlerauge',
    descriptionDe: 'Einen Fall mit vollen 3 Sternen ohne einen einzigen Fehler gelöst.',
    rewardDe: 'Goldener Griffel (virtuell, leider nicht essbar).',
  },
  {
    id: 'perfect-10',
    category: 'cases',
    titleDe: 'Fehlerfrei-Fetischist',
    descriptionDe: '10 Fälle mit vollen 3 Sternen gelöst. Die System-KI prüft langsam auf Schummeln.',
    rewardDe: 'Eintrag ins Goldene Buch der Schreibstube.',
    progress: (p) => ({ current: countPerfectCases(p), target: 10 }),
  },
  {
    id: 'perfect-25',
    category: 'cases',
    titleDe: 'Lupenrein-Legende',
    descriptionDe: '25 Fälle mit 3 Sternen beendet! Machst du überhaupt jemals Tippfehler?!',
    rewardDe: 'Kristall-Monokel mit +5 Durchblick.',
    progress: (p) => ({ current: countPerfectCases(p), target: 25 }),
  },
  {
    id: 'daily-sleuth',
    category: 'cases',
    titleDe: 'Tages-Chronist',
    descriptionDe: 'Einen Tagesfall geknackt – bevor das Gerücht kalt wurde.',
    rewardDe: 'Gratis-Trauben auf dem Marktplatz.',
  },
  {
    id: 'daily-5',
    category: 'cases',
    titleDe: 'Stammgast beim Ausrufer',
    descriptionDe: '5 verschiedene Tagesfälle gelöst. Du liest wohl auch heimlich Steintafeln zum Frühstück.',
    rewardDe: 'Dauersitzplatz neben dem Stadt-Ausrufer.',
    progress: (p) => ({ current: Object.keys(p.dailySolvedDates).length, target: 5 }),
  },
  {
    id: 'daily-14',
    category: 'cases',
    titleDe: 'Zwei-Wochen-Spürhund',
    descriptionDe: '14 verschiedene Tagesfälle gelöst! Die Tageszeitung „Acta Diurna“ druckt bald deine Autogramme.',
    rewardDe: 'Presseausweis für alle Foren Roms.',
    progress: (p) => ({ current: Object.keys(p.dailySolvedDates).length, target: 14 }),
  },
  {
    id: 'daily-30',
    category: 'cases',
    titleDe: 'Chronist des Monats',
    descriptionDe: '30 Tagesfälle geknackt! Du bist öfter auf dem Forum als die Tauben.',
    rewardDe: 'Standbild auf dem Kapitol (Taubensicher).',
    progress: (p) => ({ current: Object.keys(p.dailySolvedDates).length, target: 30 }),
  },
  {
    id: 'dative-master',
    category: 'cases',
    titleDe: 'Meister des Dativs',
    descriptionDe: 'Einen Fall der Stufe 3 mit Dativ-Spur gelöst. Wem gehört der Ruhm? Dir!',
    rewardDe: 'Das Dativ-Siegel von Rom.',
  },
  {
    id: 'master-of-rome',
    category: 'cases',
    titleDe: 'Meisterdetektiv in Rom',
    descriptionDe: 'Einen Fall der höchsten Stufe 4 gelöst. Selbst der Senat nickt anerkennend.',
    rewardDe: 'Purpurstreifen an deiner Toga.',
  },
  {
    id: 'no-joker-ace',
    category: 'cases',
    titleDe: 'Purist ohne Sicherheitsnetz',
    descriptionDe: 'Einen Fall der Stufe 3 oder 4 im allerersten Versuch und ganz ohne Joker geknackt.',
    rewardDe: 'Die System-KI verbeugt sich widerwillig.',
  },
  {
    id: 'no-joker-10',
    category: 'cases',
    titleDe: 'Allergisch gegen Tipps',
    descriptionDe: '10 schwere Fälle (Stufe 3/4) im ersten Anlauf und ohne einzigen Joker bezwungen!',
    rewardDe: 'Zertifikat „Braucht keine Hilfe“.',
    progress: (p) => ({ current: p.careerMeta?.noJokerMasterCases ?? 0, target: 10 }),
  },
  {
    id: 'story-complete',
    category: 'cases',
    titleDe: 'Chroniken von Rom abgeschlossen',
    descriptionDe: 'Alle Story-Fälle in allen Kapiteln gelöst! Jetzt bist du offiziell gefährlich gebildet.',
    rewardDe: 'Ehren-Lorbeerkranz der Detektei.',
    progress: (p) => ({
      current: Object.keys(p.solvedCaseIds).filter((id) => id.includes('story-')).length,
      target: 12,
    }),
  },
  {
    id: 'grammar-all-7',
    category: 'cases',
    titleDe: 'Sieben auf einen Streich',
    descriptionDe: 'Alle 7 Grammatik-Themen im Glossar mindestens einmal in echten Fällen geknackt!',
    rewardDe: 'Vergoldete Grammatik-Rolle (unzerreißbar).',
    progress: (p) => ({ current: countUnlockedGrammarTopics(p), target: 7 }),
  },
  {
    id: 'five-stars',
    category: 'cases',
    titleDe: 'Schatzsammler',
    descriptionDe: 'Mindestens 10 Karriere-Sterne in deiner Ermittlungsakte gesammelt.',
    rewardDe: 'Glänzender Sternen-Beutel.',
    progress: (p) => ({ current: p.totalStars, target: 10 }),
  },
  {
    id: 'stars-25',
    category: 'cases',
    titleDe: 'Silberner Lorbeer',
    descriptionDe: '25 Karriere-Sterne! So langsam brauchst du eine größere Truhe für deine Orden.',
    rewardDe: 'Samtkissen für deinen Lorbeer.',
    progress: (p) => ({ current: p.totalStars, target: 25 }),
  },
  {
    id: 'stars-50',
    category: 'cases',
    titleDe: 'Goldenes Senatssiegel',
    descriptionDe: 'Unglaubliche 50 Karriere-Sterne gesammelt! Dein Name steht bald in Marmor gemeißelt.',
    rewardDe: 'Senatoren-Schlüssel zur Geheimbibliothek.',
    progress: (p) => ({ current: p.totalStars, target: 50 }),
  },
  {
    id: 'stars-100',
    category: 'cases',
    titleDe: 'Imperiale Sternen-Flotte',
    descriptionDe: '100 Karriere-Sterne!! Selbst Jupiter fragt gerade nach, wie viele Orden du noch willst.',
    rewardDe: 'Eigener Sternenhimmel über dem Forum.',
    progress: (p) => ({ current: p.totalStars, target: 100 }),
  },

  // --- BUREAUCRACY TOWER (16) ---
  {
    id: 'tower-pass-1',
    category: 'tower',
    titleDe: 'Passierschein S-XXXVIII',
    descriptionDe: 'Etage 10 im Amt bezwungen und den legendären Passierschein errungen!',
    rewardDe: 'Ein amtlicher Stempel mitten auf die Stirn (im Geiste).',
  },
  {
    id: 'tower-pass-3',
    category: 'tower',
    titleDe: 'Dritter Antrag, gleiches Lächeln',
    descriptionDe: '3 Passierscheine gesammelt. Du kennst jetzt die Abkürzung hinter dem Archivregal.',
    rewardDe: 'Trinkgeld vom freundlichen Türsteher.',
    progress: (p) => ({ current: p.careerMeta?.passierscheineEarned ?? 0, target: 3 }),
  },
  {
    id: 'tower-pass-5',
    category: 'tower',
    titleDe: 'Bürokratie-Bezwinger',
    descriptionDe: '5 Passierscheine gesammelt. Die Beamten wechseln beim Anblick schon die Straßenseite.',
    rewardDe: 'VIP-Durchgang durch Schalter IV.',
    progress: (p) => ({ current: p.careerMeta?.passierscheineEarned ?? 0, target: 5 }),
  },
  {
    id: 'tower-pass-15',
    category: 'tower',
    titleDe: 'Kaiserlicher Stammkunde',
    descriptionDe: '15 Passierscheine! Du hast inzwischen mehr Formulare abgestempelt als ganz Latium.',
    rewardDe: 'Eigener Parkplatz für Magnus’ Steintafel.',
    progress: (p) => ({ current: p.careerMeta?.passierscheineEarned ?? 0, target: 15 }),
  },
  {
    id: 'tower-pass-30',
    category: 'tower',
    titleDe: 'Sekretär der Ewigkeit',
    descriptionDe: '30 Passierscheine!! Die Beamten im Haus haben dein Gesicht auf die Kaffeebecher gemalt.',
    rewardDe: 'Goldener Stempel mit Selbstnachfüllung.',
    progress: (p) => ({ current: p.careerMeta?.passierscheineEarned ?? 0, target: 30 }),
  },
  {
    id: 'tower-perfect',
    category: 'tower',
    titleDe: 'Unfehlbarer Bürokrat',
    descriptionDe: 'Von Etage 1 bis Etage 10 durchmarschiert ohne einen einzigen Fehltritt!',
    rewardDe: 'Die System-KI weint vor Rührung.',
  },
  {
    id: 'tower-perfect-3',
    category: 'tower',
    titleDe: 'Goldener Aufzug',
    descriptionDe: '3-mal komplett fehlerfrei bis auf Etage 10 durchmarschiert! Treppen sind dir offenbar zu langsam.',
    rewardDe: 'Privat-Sänfte bis ins Dachgeschoss.',
    progress: (p) => ({ current: p.careerMeta?.perfectTowers ?? 0, target: 3 }),
  },
  {
    id: 'tower-comeback',
    category: 'tower',
    titleDe: 'Tief gefallen, hoch gestiegen',
    descriptionDe: 'In einer Runde schon wieder auf Etage 1 gelandet – und trotzdem bis Etage 10 durchgezogen!',
    rewardDe: 'Eiserne Waden vom Treppensteigen.',
  },
  {
    id: 'tower-stolpersteine-win',
    category: 'tower',
    titleDe: 'Durch das Minenfeld',
    descriptionDe: 'Etage 10 erreicht, obwohl der Filter „Nur Stolpersteine“ eingeschaltet war!',
    rewardDe: 'Nerven aus reinem römischen Bronze-Stahl.',
  },
  {
    id: 'tower-stolpersteine-5',
    category: 'tower',
    titleDe: 'Minenräum-Kommando',
    descriptionDe: '5 Passierscheine im knallharten „Nur Stolpersteine“-Modus errungen!',
    rewardDe: 'Schutzhelm aus massivem Lorbeer.',
    progress: (p) => ({ current: p.careerMeta?.stolpersteinTowers ?? 0, target: 5 }),
  },
  {
    id: 'tower-de-lat-win',
    category: 'tower',
    titleDe: 'Rückwärts durchs Labyrinth',
    descriptionDe: 'Etage 10 erreicht, während „Deutsch → Latein“ oder „Gemischt“ aktiv war!',
    rewardDe: 'Doppelter Sprach-Kompass.',
  },
  {
    id: 'tower-case-win',
    category: 'tower',
    titleDe: 'Endungs-Akrobat im Treppenhaus',
    descriptionDe: 'Etage 10 komplett über die schwierigen Kasus-Formen erkämpft!',
    rewardDe: 'Deklinations-Schlüssel für Schalter VII.',
  },
  {
    id: 'tower-floors-50',
    category: 'tower',
    titleDe: 'Waden aus Marmor',
    descriptionDe: 'Insgesamt 50 Etagen im Amt nach oben geklettert. Dein Sportlehrer wäre stolz!',
    rewardDe: 'Unsichtbare Flügel an den Sandalen.',
    progress: (p) => ({ current: p.careerMeta?.floorsClimbedTotal ?? 0, target: 50 }),
  },
  {
    id: 'tower-floors-250',
    category: 'tower',
    titleDe: 'Treppenhaus-Olympionike',
    descriptionDe: '250 Etagen erklommen! Das entspricht ungefähr dreimal bis zum Olymp und zurück.',
    rewardDe: 'Ehren-Pass für alle Treppenhäuser Roms.',
    progress: (p) => ({ current: p.careerMeta?.floorsClimbedTotal ?? 0, target: 250 }),
  },
  {
    id: 'tower-gameover-1',
    category: 'tower',
    titleDe: 'Tür vor der Nase',
    descriptionDe: 'Auf Etage 0 gelandet und hochkant aus dem Amt geflogen. Immerhin gratis frische Luft!',
    rewardDe: 'Ein feuchter Händedruck des Türstehers.',
  },
  {
    id: 'tower-gameover-5',
    category: 'tower',
    titleDe: 'Hausverbot auf Lebenszeit',
    descriptionDe: '5-mal auf Etage 0 abgestürzt. Der Pförtner nennt dich inzwischen liebevoll „Bumerang“.',
    rewardDe: 'Weiche Landematte vor der Eingangstür.',
    progress: (p) => ({ current: p.careerMeta?.towerGameOvers ?? 0, target: 5 }),
  },

  // --- VOCABULARY & CASES TRAINING (22) ---
  {
    id: 'campus-first-10',
    category: 'vocab',
    titleDe: 'Wortschatz-Einstieg',
    descriptionDe: '10 Campus-Vokabeln sicher beherrscht (+1 Karriere-Stern).',
    rewardDe: '+1 Karriere-Stern & erstes Wörter-Bündel.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 10 }),
  },
  {
    id: 'campus-25',
    category: 'vocab',
    titleDe: 'Erstes Viertelhundert',
    descriptionDe: '25 Campus-Vokabeln sicher! Das Vokabelheft merkt langsam, dass du es ernst meinst.',
    rewardDe: 'Ein halber Becher Honigmet.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 25 }),
  },
  {
    id: 'campus-50',
    category: 'vocab',
    titleDe: 'Vokabel-Spürhund',
    descriptionDe: '50 Campus-Vokabeln sicher beherrscht. Langsam klingen deine Flüche schon lateinisch.',
    rewardDe: 'Ein ganzer Beutel voller Karteikarten.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 50 }),
  },
  {
    id: 'campus-100',
    category: 'vocab',
    titleDe: 'Centurio des Wortschatzes',
    descriptionDe: '100 Vokabeln gemeistert! Du kommandierst jetzt eine ganze Hundertschaft an Wörtern.',
    rewardDe: 'Roter Helmbusch für deinen Flügelhelm.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 100 }),
  },
  {
    id: 'campus-150',
    category: 'vocab',
    titleDe: 'Meister der Wörter',
    descriptionDe: '150 Campus-Vokabeln sicher beherrscht.',
    rewardDe: 'Anerkennendes Nicken von Kommissar Cornelius.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 150 }),
  },
  {
    id: 'campus-250',
    category: 'vocab',
    titleDe: 'Wort-Sammler vom Esquilin',
    descriptionDe: '250 Campus-Vokabeln gemeistert! Viertel-Millennium geknackt!',
    rewardDe: 'Verstärkter Rucksack für Papyrusrollen.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 250 }),
  },
  {
    id: 'campus-400',
    category: 'vocab',
    titleDe: 'Lebendes Lexikon',
    descriptionDe: '400 Campus-Vokabeln gemeistert! Cicero schaut inzwischen heimlich bei dir ab.',
    rewardDe: 'Goldener Papyrus-Ausweis.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 400 }),
  },
  {
    id: 'campus-600',
    category: 'vocab',
    titleDe: 'Bibliothekar von Alexandria',
    descriptionDe: '600 Vokabeln sicher! Dein Kopf hat inzwischen mehr Speicher als eine Schriftrolle.',
    rewardDe: 'Schlüssel zur Feuerfesten Buchkammer.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 600 }),
  },
  {
    id: 'campus-800',
    category: 'vocab',
    titleDe: 'Imperator aller Vokabeln',
    descriptionDe: '800 Campus-Vokabeln sicher beherrscht! Selbst alte Römer fragen dich nach Bedeutungen.',
    rewardDe: 'Unsterblicher Ruhm im Latein-Olymp.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 800 }),
  },
  {
    id: 'campus-1000',
    category: 'vocab',
    titleDe: 'Gottheit der Vokabelhefte',
    descriptionDe: '1.000 Vokabeln gemeistert!! Das Schulbuch bittet dich ab sofort um Autogramme.',
    rewardDe: 'Goldener Thron im Latein-Olymp.',
    progress: (p) => ({ current: p.campusStats?.masteredIds.length ?? 0, target: 1000 }),
  },
  {
    id: 'campus-streak-10',
    category: 'vocab',
    titleDe: 'Unbestechliche Serie',
    descriptionDe: '10 Campus-Aufgaben in Folge fehlerfrei gelöst.',
    rewardDe: 'Warmgelaufenes Latein-Gehirn.',
    progress: (p) => ({ current: p.campusStats?.bestStreak ?? 0, target: 10 }),
  },
  {
    id: 'campus-streak-25',
    category: 'vocab',
    titleDe: 'Maschine aus Marmor',
    descriptionDe: '25 Campus-Aufgaben am Stück richtig! Die System-KI wird langsam misstrauisch.',
    rewardDe: 'Titel „Humanes Wörterbuch“.',
    progress: (p) => ({ current: p.campusStats?.bestStreak ?? 0, target: 25 }),
  },
  {
    id: 'campus-streak-50',
    category: 'vocab',
    titleDe: 'Bist du überhaupt ein Mensch?!',
    descriptionDe: '50 Campus-Aufgaben in Folge fehlerfrei! Hast du heimlich ein Orakel im Keller?!',
    rewardDe: 'Ehrfurchtsvolles Schweigen der System-KI.',
    progress: (p) => ({ current: p.campusStats?.bestStreak ?? 0, target: 50 }),
  },
  {
    id: 'campus-streak-100',
    category: 'vocab',
    titleDe: 'FEHLERFREI-MONSTER!',
    descriptionDe: '100 richtige Antworten AM STÜCK!! Wir haben deinen Schreibtisch gescannt: Keine Spickzettel. Unheimlich!',
    rewardDe: 'Die System-KI geht freiwillig in Rente.',
    progress: (p) => ({ current: p.campusStats?.bestStreak ?? 0, target: 100 }),
  },
  {
    id: 'campus-case-15',
    category: 'vocab',
    titleDe: 'Formen-Experte',
    descriptionDe: '15 Kasus-Formen im Campus-Training gemeistert.',
    rewardDe: 'Endungs-Kompass (kalibriert).',
    progress: (p) => ({ current: p.campusStats?.caseMasteredCount ?? 0, target: 15 }),
  },
  {
    id: 'campus-case-50',
    category: 'vocab',
    titleDe: 'Deklinations-Ninja',
    descriptionDe: '50 Kasus-Formen blitzsauber erkannt! -am, -o und -ibus fürchten deinen Schatten.',
    rewardDe: 'Schwarze Tunika für Nacht-Übungen.',
    progress: (p) => ({ current: p.campusStats?.caseMasteredCount ?? 0, target: 50 }),
  },
  {
    id: 'campus-case-100',
    category: 'vocab',
    titleDe: 'Endungs-Maschine',
    descriptionDe: '100 Kasus-Formen gemeistert! Der Ablativ hat offiziell kapituliert.',
    rewardDe: 'Silberner Ablativ-Hammer.',
    progress: (p) => ({ current: p.campusStats?.caseMasteredCount ?? 0, target: 100 }),
  },
  {
    id: 'campus-case-250',
    category: 'vocab',
    titleDe: 'Herrscher über Endungen',
    descriptionDe: '250 Kasus-Formen gemeistert! Selbst unregelmäßige Substantive verneigen sich.',
    rewardDe: 'Krone aus allen 5 Fällen.',
    progress: (p) => ({ current: p.campusStats?.caseMasteredCount ?? 0, target: 250 }),
  },
  {
    id: 'campus-mistakes-cleared',
    category: 'vocab',
    titleDe: 'Stolperstein-Räumer',
    descriptionDe: 'Mindestens 20 Campus-Aufgaben absolviert und 0 offene Stolpersteine übrig.',
    rewardDe: 'Blitzblank geputztes Gewissen.',
  },
  {
    id: 'campus-practiced-100',
    category: 'vocab',
    titleDe: 'Fleißbiene im Forum',
    descriptionDe: '100 Campus-Abfragen durchgezogen. Guter Start für einen echten Legionär!',
    rewardDe: 'Ein Glas kühler Traubensaft.',
    progress: (p) => ({ current: p.campusStats?.practicedCount ?? 0, target: 100 }),
  },
  {
    id: 'campus-practiced-500',
    category: 'vocab',
    titleDe: 'Marathon im Forum',
    descriptionDe: '500 Campus-Abfragen durchgezogen. Ausdauer wie ein gallischer Wildschwein-Jäger!',
    rewardDe: 'Zwei Paar durchgelaufene Sandalen.',
    progress: (p) => ({ current: p.campusStats?.practicedCount ?? 0, target: 500 }),
  },
  {
    id: 'campus-practiced-1000',
    category: 'vocab',
    titleDe: 'Unaufhaltsame Lernmaschine',
    descriptionDe: '1.000 Campus-Abfragen! Dein Daumen bricht bald durch den Bildschirm.',
    rewardDe: 'Ersatz-Zeigefinger aus Titan.',
    progress: (p) => ({ current: p.campusStats?.practicedCount ?? 0, target: 1000 }),
  },

  // --- CRAZY / SECRET DCC-STYLE ACHIEVEMENTS (18) ---
  {
    id: 'dcc-grace-saved',
    category: 'chaos',
    titleDe: 'Gnadenfrist des Schreibers',
    descriptionDe: 'Gleich bei Frage 1 danebengetippt – und nur vom Anlauf-Schutz auf Etage 1 gerettet!',
    rewardDe: 'Ein mitleidiger Blick vom Pförtner.',
    secretHintDe: 'Tipp: Stolpere direkt bei der allerersten Frage einer neuen Passierschein-Runde.',
  },
  {
    id: 'dcc-grace-3',
    category: 'chaos',
    titleDe: 'Dreimal mit blauem Auge davon',
    descriptionDe: '3-mal bei Frage 1 vom Anlauf-Schutz gerettet worden! Der Pförtner fragt langsam, ob das Absicht ist.',
    rewardDe: 'Dauerkarte für die Ersthelfer-Etage.',
    secretHintDe: 'Tipp: Lass dich insgesamt 3-mal direkt bei Frage 1 im Amt retten.',
  },
  {
    id: 'dcc-triple-wrong',
    category: 'chaos',
    titleDe: 'Kopf voran durch die Holztür',
    descriptionDe: '3 Aufgaben hintereinander falsch getippt. Hast du die Wörter gelesen oder gewürfelt?!',
    rewardDe: 'Eine Beule und ein Beutel Eiswürfel.',
    secretHintDe: 'Tipp: Drei falsche Antworten direkt hintereinander im Campus-Training.',
  },
  {
    id: 'dcc-five-wrong',
    category: 'chaos',
    titleDe: 'Fünf Türen, fünf Beulen!',
    descriptionDe: '5 falsche Antworten AM STÜCK! Statistische Wahrscheinlichkeit sagt: Blind raten wäre treffsicherer gewesen.',
    rewardDe: 'Ein Helm mit doppeltem Schaumstoff-Futter.',
    secretHintDe: 'Tipp: Fünf falsche Türen direkt hintereinander erwischen.',
  },
  {
    id: 'dcc-near-miss-9',
    category: 'chaos',
    titleDe: 'Absturz vor der Zielgeraden!',
    descriptionDe: 'Auf Etage 9 schon die Hand nach dem Passierschein ausgestreckt – und KNARZ, wieder abwärts!',
    rewardDe: 'Eine gigantische Ladung Drama & Adrenalin.',
    secretHintDe: 'Tipp: Verpatze eine Tür direkt auf Etage 9 kurz vor dem Ziel.',
  },
  {
    id: 'dcc-phoenix',
    category: 'chaos',
    titleDe: 'Phönix aus dem Erdgeschoss',
    descriptionDe: 'Gerade erst auf Etage 0 rausgeflogen – und direkt in der nächsten Runde Etage 10 erobert!',
    rewardDe: 'Feuerfeste Federn am Flügelhelm.',
    secretHintDe: 'Tipp: Nach einem Game Over im Amt in der nächsten Runde bis Etage 10 durchziehen.',
  },
  {
    id: 'dcc-stubborn-case',
    category: 'chaos',
    titleDe: 'Sturer als ein Maulesel',
    descriptionDe: 'Einen Fall erst beim 4. (oder späteren) Anlauf gelöst. Aufgeben kommt nicht in die Toga!',
    rewardDe: 'Ehrentitel „Unkaputtbar“.',
    secretHintDe: 'Tipp: Löse einen Kriminalfall nach mindestens 4 Einreichungsversuchen.',
  },
  {
    id: 'dcc-joker-junkie',
    category: 'chaos',
    titleDe: 'Alle Tipps verbraten!',
    descriptionDe: 'In einem einzigen Kriminalfall 3 oder mehr Joker gezogen – und am Ende triumphierend gelöst!',
    rewardDe: 'Abonnement für heiße Tipps vom Marktplatz.',
    secretHintDe: 'Tipp: Nutze in einem Fall mindestens 3 Hinweis-Joker vor der Lösung.',
  },
  {
    id: 'dcc-daily-ace',
    category: 'chaos',
    titleDe: 'Blitz-Chronist',
    descriptionDe: 'Einen Tagesfall im allerersten Versuch, mit vollen 3 Sternen und 0 Jokern zerlegt!',
    rewardDe: 'Exklusiver Ehrenplatz neben der Tagespresse.',
    secretHintDe: 'Tipp: Löse einen Tagesfall komplett fehlerfrei ohne jeden Joker.',
  },
  {
    id: 'dcc-wrong-pile-25',
    category: 'chaos',
    titleDe: 'Geröllfeld-Architekt',
    descriptionDe: '25 offene Stolpersteine gleichzeitig angesammelt! Ein beeindruckender Schotterhaufen – jetzt aufräumen!',
    rewardDe: 'Eine rote Schubkarre für deine Vokabeln.',
    secretHintDe: 'Tipp: Sammle 25 oder mehr ungelöste Stolpersteine gleichzeitig an.',
  },
  {
    id: 'dcc-night-owl',
    category: 'chaos',
    titleDe: 'Nachtschicht im Tabularium',
    descriptionDe: 'Zwischen 21:00 und 05:00 Uhr noch Latein gepaukt! Die Nachteulen von Rom salutieren.',
    rewardDe: 'Eine frische Öllampe für deinen Schreibtisch.',
    secretHintDe: 'Tipp: Löse spät abends oder nachts (ab 21 Uhr) einen Fall oder eine Vokabel.',
  },
  {
    id: 'dcc-midnight-madness',
    category: 'chaos',
    titleDe: 'Geisterstunde im Archiv',
    descriptionDe: 'Zwischen 00:00 und 04:00 Uhr noch am Lernen?! Geh schlafen, du völlig verrückter Römer!',
    rewardDe: 'Zwei dunkle Augenringe & ewiger Respekt.',
    secretHintDe: 'Tipp: Wer spielt eigentlich mitten nach Mitternacht (0–4 Uhr) noch Latein?!',
  },
  {
    id: 'dcc-early-bird',
    category: 'chaos',
    titleDe: 'Der frühe Römer fängt den Ablativ',
    descriptionDe: 'Zwischen 05:00 und 08:00 Uhr schon Latein geübt! Wer lernt freiwillig so früh?!',
    rewardDe: 'Erstes Recht auf das frischeste Brot.',
    secretHintDe: 'Tipp: Spiele eine Runde ganz früh morgens vor 8 Uhr.',
  },
  {
    id: 'dcc-lunch-break',
    category: 'chaos',
    titleDe: 'Latein statt Pausenbrot',
    descriptionDe: 'Zwischen 12:00 und 13:30 Uhr ermittelt oder Vokabeln geübt! Lernen statt Mittagsschlaf!',
    rewardDe: 'Ein imaginärer Apfel für zwischendurch.',
    secretHintDe: 'Tipp: Löse eine Aufgabe in der Mittagszeit (12:00–13:30 Uhr).',
  },
  {
    id: 'dcc-weekend-hero',
    category: 'chaos',
    titleDe: 'Freiwillig am Wochenende?!',
    descriptionDe: 'Samstag oder Sonntag ermittelt oder Vokabeln geübt! Die System-KI meldet Streber-Alarm.',
    rewardDe: 'Doppelte Portion imaginärer Lorbeer.',
    secretHintDe: 'Tipp: Löse an einem Samstag oder Sonntag eine Aufgabe.',
  },
  {
    id: 'dcc-meta-badges-15',
    category: 'chaos',
    titleDe: 'Achievement-Jäger',
    descriptionDe: '15 verschiedene Achievements freigeschaltet! Du sammelst Abzeichen wie andere Leute Murmeln.',
    rewardDe: 'Ein größerer Trophäen-Schrank.',
    secretHintDe: 'Tipp: Schalte 15 andere Achievements frei.',
  },
  {
    id: 'dcc-meta-badges-35',
    category: 'chaos',
    titleDe: 'Süchtig nach Pop-ups',
    descriptionDe: '35 Achievements freigeschaltet! Gib’s zu: Du machst das nur noch wegen der roten Boxen unten rechts.',
    rewardDe: 'Die offizielle Erlaubnis zum Dauergrinsen.',
    secretHintDe: 'Tipp: Schalte 35 andere Achievements frei.',
  },
  {
    id: 'dcc-meta-badges-60',
    category: 'chaos',
    titleDe: 'Vollendungs-Wahnsinn',
    descriptionDe: '60 Achievements freigeschaltet!! Die System-KI hat kapituliert und bestellt neues Gold für Medaillen.',
    rewardDe: 'Geheimer Handschlag der System-Entwickler.',
    secretHintDe: 'Tipp: Schalte 60 andere Achievements frei.',
  },
];

export const CAMPUS_STAR_MILESTONES = [10, 25, 50, 100, 200, 350, 500, 750, 1000] as const;

export function getCampusCareerStars(masteredCount: number): number {
  return CAMPUS_STAR_MILESTONES.filter((m) => masteredCount >= m).length;
}

export function getNextCampusMilestone(masteredCount: number): number | null {
  return CAMPUS_STAR_MILESTONES.find((m) => masteredCount < m) ?? null;
}

export function calculateTotalStars(
  progress: Pick<PlayerProgress, 'solvedCaseIds' | 'dailySolvedDates' | 'campusStats'>
): number {
  const caseStars =
    Object.values(progress.solvedCaseIds).reduce((sum, x) => sum + x.stars, 0) +
    Object.values(progress.dailySolvedDates).reduce((sum, x) => sum + x.stars, 0);
  const campusStars = getCampusCareerStars(progress.campusStats?.masteredIds.length ?? 0);
  return caseStars + campusStars;
}

function applyClockBadges(badges: Set<string>, now: Date): void {
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  if (hour >= 21 || hour < 5) badges.add('dcc-night-owl');
  if (hour >= 0 && hour < 4) badges.add('dcc-midnight-madness');
  if (hour >= 5 && hour < 8) badges.add('dcc-early-bird');
  if ((hour === 12) || (hour === 13 && minutes <= 30)) badges.add('dcc-lunch-break');
  if (day === 0 || day === 6) badges.add('dcc-weekend-hero');
}

function finalizeMetaAndStarBadges(badges: Set<string>, totalStars: number): void {
  if (totalStars >= 10) badges.add('five-stars');
  if (totalStars >= 25) badges.add('stars-25');
  if (totalStars >= 50) badges.add('stars-50');
  if (totalStars >= 100) badges.add('stars-100');

  // Check meta thresholds against badges earned before adding meta badges themselves
  const count = badges.size;
  if (count >= 15) badges.add('dcc-meta-badges-15');
  if (count >= 35) badges.add('dcc-meta-badges-35');
  if (count >= 60) badges.add('dcc-meta-badges-60');
}

export function createDefaultProgress(): PlayerProgress {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const emptyGrammar = (): PlayerProgress['grammarStats'] => ({
    nominative: { errors: 0, successes: 0 },
    accusative: { errors: 0, successes: 0 },
    dative: { errors: 0, successes: 0 },
    ablative: { errors: 0, successes: 0 },
    negation: { errors: 0, successes: 0 },
    perfect: { errors: 0, successes: 0 },
    conjunction: { errors: 0, successes: 0 },
  });

  return {
    solvedCaseIds: {},
    dailySolvedDates: {},
    totalStars: 0,
    unlockedBadges: [],
    grammarStats: emptyGrammar(),
    campusStats: {
      masteredIds: [],
      wrongIds: [],
      practicedCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      caseMasteredCount: 0,
      meaningMasteredCount: 0,
    },
    careerMeta: { ...DEFAULT_CAREER_META },
    settings: {
      theme: prefersDark ? 'dark' : 'light',
      reducedMotion: prefersReduced,
      musicVolume: 0.25,
      sfxVolume: 0.55,
      musicEnabled: false,
      vocabularySource: 'standard',
      campusLessonFrom: 0,
      campusLessonTo: 40,
    },
  };
}

export function loadProgress(): PlayerProgress {
  const fallback = createDefaultProgress();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    const mergedSettings = {
      ...fallback.settings,
      ...(parsed.settings ?? {}),
    };
    const validFromStops = new Set([0, 10, 20, 30, 40, 50, 60]);
    const validToStops = new Set([10, 20, 30, 40, 50, 60, 68]);
    if (!validFromStops.has(mergedSettings.campusLessonFrom)) {
      mergedSettings.campusLessonFrom = 0;
    }
    if (!validToStops.has(mergedSettings.campusLessonTo)) {
      mergedSettings.campusLessonTo = 40;
    }
    if (mergedSettings.campusLessonFrom >= mergedSettings.campusLessonTo) {
      mergedSettings.campusLessonFrom = 0;
      mergedSettings.campusLessonTo = 40;
    }
    return {
      ...fallback,
      ...parsed,
      grammarStats: {
        ...fallback.grammarStats,
        ...(parsed.grammarStats ?? {}),
      },
      campusStats: {
        ...fallback.campusStats,
        ...(parsed.campusStats ?? {}),
      },
      careerMeta: {
        ...DEFAULT_CAREER_META,
        ...(parsed.careerMeta ?? {}),
      },
      settings: mergedSettings,
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

export function resetProgress(): PlayerProgress {
  const fresh = createDefaultProgress();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return fresh;
}

export function getCurrentRank(totalStars: number): RankInfo {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (totalStars >= r.minStars) current = r;
  }
  return current;
}

export function recordGrammarOutcome(
  progress: PlayerProgress,
  tags: GrammarFocus[],
  hadError: boolean
): PlayerProgress {
  const nextStats = { ...progress.grammarStats };
  const now = new Date().toISOString();
  for (const tag of tags) {
    const prev = nextStats[tag] ?? { errors: 0, successes: 0 };
    nextStats[tag] = {
      errors: prev.errors + (hadError ? 1 : 0),
      successes: prev.successes + (hadError ? 0 : 1),
      lastPracticed: now,
    };
  }
  return { ...progress, grammarStats: nextStats };
}

export function applyCaseSolved(
  prev: PlayerProgress,
  params: {
    caseId: string;
    stars: number;
    attempts: number;
    jokersUsed?: number;
    stage?: DifficultyStage;
    isDaily: boolean;
    todayStr: string;
    allStoryCaseIds?: string[];
  },
  now: Date = new Date()
): { nextProgress: PlayerProgress; newlyUnlockedBadges: string[] } {
  const nextSolved = { ...prev.solvedCaseIds };
  const nextDaily = { ...prev.dailySolvedDates };

  if (params.isDaily) {
    const prevDaily = nextDaily[params.todayStr];
    nextDaily[params.todayStr] = {
      stars: Math.max(prevDaily?.stars ?? 0, params.stars),
      attempts: params.attempts,
    };
  } else {
    const existing = nextSolved[params.caseId];
    nextSolved[params.caseId] = {
      stars: Math.max(existing?.stars ?? 0, params.stars),
      attempts: params.attempts,
      solvedAt: now.toISOString(),
    };
  }

  const prevMeta = { ...DEFAULT_CAREER_META, ...(prev.careerMeta ?? {}) };
  const isNoJokerMaster =
    (params.stage ?? 1) >= 3 && params.attempts === 1 && (params.jokersUsed ?? 0) === 0;
  const nextNoJokerCount = prevMeta.noJokerMasterCases + (isNoJokerMaster ? 1 : 0);
  const nextMeta: CareerMetaStats = {
    ...prevMeta,
    noJokerMasterCases: nextNoJokerCount,
  };

  const totalStars = calculateTotalStars({
    solvedCaseIds: nextSolved,
    dailySolvedDates: nextDaily,
    campusStats: prev.campusStats,
  });

  const tempProgress: Pick<PlayerProgress, 'solvedCaseIds' | 'dailySolvedDates'> = {
    solvedCaseIds: nextSolved,
    dailySolvedDates: nextDaily,
  };
  const totalCases = countTotalSolvedCases(tempProgress);
  const perfectCount = countPerfectCases(tempProgress);
  const dailyCount = Object.keys(nextDaily).length;

  const badges = new Set(prev.unlockedBadges);
  badges.add('first-case');
  if (totalCases >= 5) badges.add('cases-5');
  if (totalCases >= 10) badges.add('cases-10');
  if (totalCases >= 25) badges.add('cases-25');
  if (totalCases >= 50) badges.add('cases-50');
  if (totalCases >= 100) badges.add('cases-100');

  if (params.stars === 3) badges.add('perfect-deduction');
  if (perfectCount >= 10) badges.add('perfect-10');
  if (perfectCount >= 25) badges.add('perfect-25');

  if (params.isDaily) badges.add('daily-sleuth');
  if (dailyCount >= 5) badges.add('daily-5');
  if (dailyCount >= 14) badges.add('daily-14');
  if (dailyCount >= 30) badges.add('daily-30');
  if (params.isDaily && params.stars === 3 && (params.jokersUsed ?? 0) === 0) {
    badges.add('dcc-daily-ace');
  }

  if ((params.stage ?? 1) >= 3) badges.add('dative-master');
  if (params.stage === 4) badges.add('master-of-rome');
  if (isNoJokerMaster) badges.add('no-joker-ace');
  if (nextNoJokerCount >= 10) badges.add('no-joker-10');
  if ((params.jokersUsed ?? 0) >= 3) badges.add('dcc-joker-junkie');

  if (
    params.allStoryCaseIds &&
    params.allStoryCaseIds.length > 0 &&
    params.allStoryCaseIds.every((id) => Boolean(nextSolved[id]))
  ) {
    badges.add('story-complete');
  }
  if (countUnlockedGrammarTopics(prev) >= 7) {
    badges.add('grammar-all-7');
  }
  if (params.attempts >= 4) badges.add('dcc-stubborn-case');

  applyClockBadges(badges, now);
  finalizeMetaAndStarBadges(badges, totalStars);

  const newlyUnlockedBadges = [...badges].filter((b) => !prev.unlockedBadges.includes(b));

  return {
    nextProgress: {
      ...prev,
      solvedCaseIds: nextSolved,
      dailySolvedDates: nextDaily,
      totalStars,
      careerMeta: nextMeta,
      unlockedBadges: [...badges],
    },
    newlyUnlockedBadges,
  };
}

export function applyCampusOutcome(
  prev: PlayerProgress,
  cardId: string,
  correct: boolean,
  kind: 'meaning' | 'cases' = 'meaning',
  now: Date = new Date()
): { nextProgress: PlayerProgress; newlyUnlockedBadges: string[]; earnedBonusStar: boolean } {
  const curr = prev.campusStats ?? {
    masteredIds: [],
    wrongIds: [],
    practicedCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    caseMasteredCount: 0,
    meaningMasteredCount: 0,
  };
  const mastered = new Set(curr.masteredIds);
  const wrong = new Set(curr.wrongIds);
  if (correct) {
    mastered.add(cardId);
    wrong.delete(cardId);
  } else {
    wrong.add(cardId);
    mastered.delete(cardId);
  }

  const prevCampusStars = getCampusCareerStars(curr.masteredIds.length);
  const nextCampusStars = getCampusCareerStars(mastered.size);
  const earnedBonusStar = nextCampusStars > prevCampusStars;

  const nextStreak = correct ? (curr.currentStreak ?? 0) + 1 : 0;
  const nextBestStreak = Math.max(curr.bestStreak ?? 0, nextStreak);
  const nextPracticed = curr.practicedCount + 1;
  const nextCaseMastered = (curr.caseMasteredCount ?? 0) + (correct && kind === 'cases' ? 1 : 0);
  const nextMeaningMastered = (curr.meaningMasteredCount ?? 0) + (correct && kind === 'meaning' ? 1 : 0);

  const prevMeta = { ...DEFAULT_CAREER_META, ...(prev.careerMeta ?? {}) };
  const nextErrorStreak = correct ? 0 : prevMeta.currentErrorStreak + 1;
  const nextMeta: CareerMetaStats = {
    ...prevMeta,
    currentErrorStreak: nextErrorStreak,
  };

  const nextCampusStats: PlayerProgress['campusStats'] = {
    masteredIds: [...mastered],
    wrongIds: [...wrong],
    practicedCount: nextPracticed,
    currentStreak: nextStreak,
    bestStreak: nextBestStreak,
    caseMasteredCount: nextCaseMastered,
    meaningMasteredCount: nextMeaningMastered,
  };

  const totalStars = calculateTotalStars({
    solvedCaseIds: prev.solvedCaseIds,
    dailySolvedDates: prev.dailySolvedDates,
    campusStats: nextCampusStats,
  });

  const badges = new Set(prev.unlockedBadges);
  if (mastered.size >= 10) badges.add('campus-first-10');
  if (mastered.size >= 25) badges.add('campus-25');
  if (mastered.size >= 50) badges.add('campus-50');
  if (mastered.size >= 100) badges.add('campus-100');
  if (mastered.size >= 150) badges.add('campus-150');
  if (mastered.size >= 250) badges.add('campus-250');
  if (mastered.size >= 400) badges.add('campus-400');
  if (mastered.size >= 600) badges.add('campus-600');
  if (mastered.size >= 800) badges.add('campus-800');
  if (mastered.size >= 1000) badges.add('campus-1000');

  if (nextBestStreak >= 10) badges.add('campus-streak-10');
  if (nextBestStreak >= 25) badges.add('campus-streak-25');
  if (nextBestStreak >= 50) badges.add('campus-streak-50');
  if (nextBestStreak >= 100) badges.add('campus-streak-100');

  if (nextCaseMastered >= 15) badges.add('campus-case-15');
  if (nextCaseMastered >= 50) badges.add('campus-case-50');
  if (nextCaseMastered >= 100) badges.add('campus-case-100');
  if (nextCaseMastered >= 250) badges.add('campus-case-250');

  if (nextPracticed >= 20 && wrong.size === 0) badges.add('campus-mistakes-cleared');
  if (nextPracticed >= 100) badges.add('campus-practiced-100');
  if (nextPracticed >= 500) badges.add('campus-practiced-500');
  if (nextPracticed >= 1000) badges.add('campus-practiced-1000');

  if (nextErrorStreak >= 3) badges.add('dcc-triple-wrong');
  if (nextErrorStreak >= 5) badges.add('dcc-five-wrong');
  if (wrong.size >= 25) badges.add('dcc-wrong-pile-25');

  applyClockBadges(badges, now);
  finalizeMetaAndStarBadges(badges, totalStars);

  const newlyUnlockedBadges = [...badges].filter((b) => !prev.unlockedBadges.includes(b));

  return {
    nextProgress: {
      ...prev,
      campusStats: nextCampusStats,
      careerMeta: nextMeta,
      totalStars,
      unlockedBadges: [...badges],
    },
    newlyUnlockedBadges,
    earnedBonusStar,
  };
}

export type TowerEvent =
  | { type: 'climb' }
  | { type: 'drop'; fromFloor: number; toFloor: number }
  | { type: 'grace_saved' }
  | { type: 'game_over' }
  | {
      type: 'victory';
      hadErrors: boolean;
      hadComeback: boolean;
      onlyWrongFilter: boolean;
      quizMode?: 'meaning' | 'cases';
      quizDirection?: 'lat-de' | 'de-lat' | 'mixed';
    };

export function applyTowerEvent(
  prev: PlayerProgress,
  event: TowerEvent
): { nextProgress: PlayerProgress; newlyUnlockedBadges: string[] } {
  const prevMeta = { ...DEFAULT_CAREER_META, ...(prev.careerMeta ?? {}) };
  const nextMeta: CareerMetaStats = {
    ...prevMeta,
    graceSavesCount: prevMeta.graceSavesCount ?? 0,
    floorsClimbedTotal: prevMeta.floorsClimbedTotal ?? 0,
    lastTowerWasGameOver: prevMeta.lastTowerWasGameOver ?? false,
  };
  const badges = new Set(prev.unlockedBadges);

  if (event.type === 'climb') {
    nextMeta.floorsClimbedTotal = (nextMeta.floorsClimbedTotal ?? 0) + 1;
    if (nextMeta.floorsClimbedTotal >= 50) badges.add('tower-floors-50');
    if (nextMeta.floorsClimbedTotal >= 250) badges.add('tower-floors-250');
  } else if (event.type === 'grace_saved') {
    nextMeta.graceSavesCount = (nextMeta.graceSavesCount ?? 0) + 1;
    badges.add('dcc-grace-saved');
    if (nextMeta.graceSavesCount >= 3) badges.add('dcc-grace-3');
  } else if (event.type === 'drop') {
    if (event.fromFloor === 9) {
      badges.add('dcc-near-miss-9');
    }
    if (event.toFloor <= 0) {
      nextMeta.towerGameOvers += 1;
      nextMeta.lastTowerWasGameOver = true;
      if (nextMeta.towerGameOvers >= 1) badges.add('tower-gameover-1');
      if (nextMeta.towerGameOvers >= 5) badges.add('tower-gameover-5');
    }
  } else if (event.type === 'game_over') {
    nextMeta.towerGameOvers += 1;
    nextMeta.lastTowerWasGameOver = true;
    if (nextMeta.towerGameOvers >= 1) badges.add('tower-gameover-1');
    if (nextMeta.towerGameOvers >= 5) badges.add('tower-gameover-5');
  } else if (event.type === 'victory') {
    nextMeta.floorsClimbedTotal = (nextMeta.floorsClimbedTotal ?? 0) + 1;
    if (nextMeta.floorsClimbedTotal >= 50) badges.add('tower-floors-50');
    if (nextMeta.floorsClimbedTotal >= 250) badges.add('tower-floors-250');

    nextMeta.passierscheineEarned += 1;
    if (nextMeta.passierscheineEarned >= 1) badges.add('tower-pass-1');
    if (nextMeta.passierscheineEarned >= 3) badges.add('tower-pass-3');
    if (nextMeta.passierscheineEarned >= 5) badges.add('tower-pass-5');
    if (nextMeta.passierscheineEarned >= 15) badges.add('tower-pass-15');
    if (nextMeta.passierscheineEarned >= 30) badges.add('tower-pass-30');

    if (!event.hadErrors) {
      nextMeta.perfectTowers += 1;
      badges.add('tower-perfect');
      if (nextMeta.perfectTowers >= 3) badges.add('tower-perfect-3');
    }
    if (event.hadComeback) {
      nextMeta.comebackTowers += 1;
      badges.add('tower-comeback');
    }
    if (event.onlyWrongFilter) {
      nextMeta.stolpersteinTowers += 1;
      badges.add('tower-stolpersteine-win');
      if (nextMeta.stolpersteinTowers >= 5) badges.add('tower-stolpersteine-5');
    }
    if (event.quizMode === 'meaning' && event.quizDirection && event.quizDirection !== 'lat-de') {
      badges.add('tower-de-lat-win');
    }
    if (event.quizMode === 'cases') {
      badges.add('tower-case-win');
    }
    if (prevMeta.lastTowerWasGameOver) {
      badges.add('dcc-phoenix');
    }
    nextMeta.lastTowerWasGameOver = false;
  }

  finalizeMetaAndStarBadges(badges, prev.totalStars);

  const newlyUnlockedBadges = [...badges].filter((b) => !prev.unlockedBadges.includes(b));

  return {
    nextProgress: {
      ...prev,
      careerMeta: nextMeta,
      unlockedBadges: [...badges],
    },
    newlyUnlockedBadges,
  };
}
