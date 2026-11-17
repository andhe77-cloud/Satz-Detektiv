import React, { useState } from 'react';
import { Award, CheckCircle2, Download, Play, RotateCcw, Shuffle, Star, Upload } from 'lucide-react';
import { StoryChapter } from '../../content/storyCases';
import { DifficultyStage, GrammarFocus, PlayerProgress } from '../../core/types';
import { importNounsFromCsv, exportNounsToCsv } from '../../latin/csvImporter';
import { defaultLexicon } from '../../latin/inflector';
import { getRecommendedPracticeFocus } from '../../services/spacedRepetition';
import { BADGES, getCurrentRank } from '../../services/storage';
import { ArchiveStatsDashboard } from './ArchiveStatsDashboard';
import { CorneliusAvatarSvg } from './Illustrations';
import { PWAInstallButton } from './PWAInstallButton';

export const CasesHubView: React.FC<{
  chapters: StoryChapter[];
  progress: PlayerProgress;
  onStartCase: (caseId: string) => void;
  onStartRandomStage: (stage: DifficultyStage) => void;
  onStartDaily: () => void;
}> = ({ chapters, progress, onStartCase, onStartRandomStage, onStartDaily }) => {
  const rank = getCurrentRank(progress.totalStars);
  const solvedCount = Object.keys(progress.solvedCaseIds).length;

  return (
    <div className="space-y-8">
      {/* Editorial Hero Banner */}
      <section className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <CorneliusAvatarSvg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
                Ermittlungsbüro Kommissar Cornelius
              </p>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#241C16] dark:text-[#F2ECE1] text-balance">
                Fünf Zeugen, eine Wahrheitsregel und echte Kasus-Logik
              </h1>
              <p className="text-sm sm:text-base text-[#4A3D33] dark:text-[#D5C9BA] max-w-2xl">
                Befrage die Zeugen auf Latein, prüfe Nominativ, Akkusativ, Dativ und Ablativ genau und überführe den Täter.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                <span>Rang: <strong className="text-[#241C16] dark:text-[#F2ECE1]">{rank.titleDe}</strong></span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tab">{progress.totalStars} Sterne</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tab">{solvedCount} gelöste Fälle</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onStartDaily}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Zum Tagesfall
            </button>
            <PWAInstallButton />
          </div>
        </div>
      </section>

      {/* Quick Random Case Generator by Stage */}
      <section aria-label="Freier Zufallsfall" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
            Endlos-Ermittlung (Zufallsfall generieren)
          </h2>
          <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            Jeder Fall wird neu berechnet und auf genau eine Lösung geprüft.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {([
            { stage: 1 as DifficultyStage, title: 'Stufe 1 · Einstieg', desc: '3 Zeugen · 1 Frage · Nom & Akk (Präsens)' },
            { stage: 2 as DifficultyStage, title: 'Stufe 2 · Perfekt', desc: '5 Zeugen · 2 Fragen · Verneinung & Perfekt' },
            { stage: 3 as DifficultyStage, title: 'Stufe 3 · Komplizen', desc: '5 Zeugen · 3 Fragen · Dativ & Konjunktionen' },
            { stage: 4 as DifficultyStage, title: 'Stufe 4 · Meister', desc: '5 Zeugen · 4 Fragen · Ablativ & harte Regeln' },
          ]).map((item) => (
            <button
              key={item.stage}
              type="button"
              onClick={() => onStartRandomStage(item.stage)}
              className="text-left rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 hover:border-[#9B2C2C] dark:hover:border-[#E06C65] transition-colors shadow-sm flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div>
                <div className="font-display text-base font-bold text-[#241C16] dark:text-[#F2ECE1]">
                  {item.title}
                </div>
                <p className="mt-1 text-xs text-[#6A5A4C] dark:text-[#B9AA98] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
                <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Neuen Fall starten</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Story Chapters */}
      <section aria-label="Ermittlungs-Kapitel" className="space-y-5">
        <h2 className="font-display text-xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
          Detektiv-Karriere (Kapitel 1–4)
        </h2>

        <div className="space-y-5">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#EFE8DA] dark:border-[#322A23] pb-3">
                <div>
                  <div className="text-xs font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
                    {ch.numberLabel} · Stufe {ch.stage}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#241C16] dark:text-[#F2ECE1]">
                    {ch.titleDe}
                  </h3>
                </div>
                <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">{ch.subtitleDe}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ch.cases.map((c, idx) => {
                  const record = progress.solvedCaseIds[c.id];
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onStartCase(c.id)}
                      className="text-left rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/70 dark:bg-[#1A1613] p-4 hover:border-[#9B2C2C] dark:hover:border-[#E06C65] transition-colors flex flex-col justify-between gap-3 cursor-pointer min-h-[116px]"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98]">
                            Akte {idx + 1}
                          </span>
                          {record && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#1E5B3A] dark:text-[#7CD3A2]">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span className="font-mono-tab">{record.stars}/3 ★</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-1 font-display text-base font-bold text-[#241C16] dark:text-[#F2ECE1]">
                          {c.titleDe}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
                        <span>{record ? 'Erneut spielen' : 'Ermittlung starten'}</span>
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const PracticeView: React.FC<{
  progress: PlayerProgress;
  onStartFocusedPractice: (focus: GrammarFocus, stage: DifficultyStage) => void;
}> = ({ progress, onStartFocusedPractice }) => {
  const rec = getRecommendedPracticeFocus(progress);

  const areaItems: Array<{ focus: GrammarFocus; title: string; stage: DifficultyStage }> = [
    { focus: 'nominative', title: 'Nominativ (Subjekt / Wer?)', stage: 1 },
    { focus: 'accusative', title: 'Akkusativ (Objekt / Wen oder was?)', stage: 1 },
    { focus: 'negation', title: 'Verneinung mit non', stage: 2 },
    { focus: 'perfect', title: 'Perfektformen', stage: 2 },
    { focus: 'dative', title: 'Dativ (Empfänger / Wem?)', stage: 3 },
    { focus: 'conjunction', title: 'Satzverbindungen (et / sed)', stage: 3 },
    { focus: 'ablative', title: 'Ablativ mit „in“ (Wo?)', stage: 4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
          Gezieltes Grammatik-Training (Spaced Repetition)
        </h1>
        <p className="mt-1 text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
          Bereiche, in denen Fehler passieren, werden automatisch häufiger vorgeschlagen.
        </p>
      </div>

      {/* Recommended Next Drill */}
      <div className="rounded-2xl border border-[#C89342] bg-[#FFFDF8] dark:bg-[#221D19] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-[#9B2C2C] dark:text-[#E06C65]">
            Empfehlung für dich
          </div>
          <h2 className="font-display text-xl font-bold text-[#241C16] dark:text-[#F2ECE1] mt-0.5">
            {rec.labelDe}
          </h2>
          <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA] mt-1">{rec.reasonDe}</p>
        </div>
        <button
          type="button"
          onClick={() => onStartFocusedPractice(rec.focus, rec.recommendedStage)}
          className="min-h-[48px] px-5 py-3 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
        >
          Trainingsfall starten
        </button>
      </div>

      {/* Grammar Mastery Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {areaItems.map((item) => {
          const stat = progress.grammarStats[item.focus];
          const total = stat.errors + stat.successes;
          const accuracy = total > 0 ? Math.round((stat.successes / total) * 100) : null;

          return (
            <div
              key={item.focus}
              className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold text-sm text-[#241C16] dark:text-[#F2ECE1]">
                  {item.title}
                </div>
                <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] mt-0.5 font-mono-tab">
                  {total === 0
                    ? 'Noch nicht geübt'
                    : `${accuracy}% sicher · ${stat.successes} richtig · ${stat.errors} Fehler`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onStartFocusedPractice(item.focus, item.stage)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] hover:border-[#9B2C2C] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] whitespace-nowrap cursor-pointer"
              >
                Üben
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ArchiveView: React.FC<{
  progress: PlayerProgress;
  onResetProgress: () => void;
  onStartFirstCase: () => void;
}> = ({ progress, onResetProgress, onStartFirstCase }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [csvInput, setCsvInput] = useState(() =>
    exportNounsToCsv([
      defaultLexicon.getNoun('lapis'),
      defaultLexicon.getNoun('pila'),
      defaultLexicon.getNoun('liber'),
    ])
  );
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  const rank = getCurrentRank(progress.totalStars);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satz-detektiv-akte-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestCsvImport = () => {
    const res = importNounsFromCsv(csvInput);
    if (res.errors.length > 0) {
      setCsvFeedback(`Fehler bei CSV-Prüfung: ${res.errors.join(' ')}`);
    } else {
      setCsvFeedback(
        `${res.nouns.length} Vokabel-Einträge erfolgreich validiert (${res.nouns.map((n) => n.lemma).join(', ')}).`
      );
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
          Deine Ermittlungsakte
        </h1>
        <p className="mt-1 text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
          Alle Fortschritte bleiben DSGVO-konform ausschließlich lokal auf deinem Gerät gespeichert.
        </p>
      </div>

      {/* Rank & Stars Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4">
          <div className="text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98]">Aktueller Rang</div>
          <div className="font-display text-xl font-bold text-[#9B2C2C] dark:text-[#E06C65] mt-1">
            {rank.titleDe}
          </div>
          {rank.nextTitleDe && (
            <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] mt-1">
              Nächster Rang „{rank.nextTitleDe}“ ab {rank.nextStars} ★
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4">
          <div className="text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98]">Gesammelte Sterne</div>
          <div className="font-display text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1] mt-1 font-mono-tab flex items-center gap-2">
            <span>{progress.totalStars}</span>
            <Star className="w-6 h-6 fill-[#D99341] text-[#B47B2B]" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4">
          <div className="text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98]">Gelöste Fälle</div>
          <div className="font-display text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1] mt-1 font-mono-tab">
            {Object.keys(progress.solvedCaseIds).length + Object.keys(progress.dailySolvedDates).length}
          </div>
        </div>
      </div>

      {/* Case Statistics Dashboard (Recharts LineChart) */}
      <ArchiveStatsDashboard progress={progress} onStartFirstCase={onStartFirstCase} />

      {/* Badges */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
          Abzeichen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const unlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-4 flex items-start gap-3 ${
                  unlocked
                    ? 'border-[#C89342] bg-[#FFFDF8] dark:bg-[#221D19]'
                    : 'border-[#DED4C3] dark:border-[#3A312A] bg-[#EFE8DA]/45 dark:bg-[#1B1714] opacity-70'
                }`}
              >
                <Award
                  className={`w-6 h-6 shrink-0 mt-0.5 ${
                    unlocked ? 'text-[#B47B2B] dark:text-[#D99341]' : 'text-[#8B7B6B]'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm font-bold text-[#241C16] dark:text-[#F2ECE1]">
                    {badge.titleDe}
                  </div>
                  <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] mt-0.5">
                    {badge.descriptionDe}
                  </p>
                  <div className="text-[11px] font-semibold mt-1 text-[#9B2C2C] dark:text-[#E06C65]">
                    {unlocked ? 'Freigeschaltet' : 'Noch verschlossen'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lexicon CSV Validator / Importer (for teachers & custom word lists) */}
      <section className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 space-y-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#241C16] dark:text-[#F2ECE1]">
            Lexikon-Werkzeug (CSV-Import prüfen)
          </h2>
          <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            Lehrkräfte können eigene Nomen-Listen im CSV-Format gegen das Grammatik-Schema testen.
          </p>
        </div>
        <textarea
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          rows={4}
          aria-label="CSV Vokabeldaten"
          className="w-full rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA] dark:bg-[#161311] p-3 font-mono-tab text-xs text-[#241C16] dark:text-[#F2ECE1]"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTestCsvImport}
            className="min-h-[40px] px-4 py-2 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#EFE8DA] dark:bg-[#2B241F] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>CSV validieren</span>
          </button>
          {csvFeedback && (
            <span className="text-xs text-[#4A3D33] dark:text-[#D5C9BA]">{csvFeedback}</span>
          )}
        </div>
      </section>

      {/* Data Export & Delete */}
      <section className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-[#241C16] dark:text-[#F2ECE1]">
            Speicherstand verwalten
          </h2>
          <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            Exportiere deine Akte als Datei oder lösche alle lokalen Spieldaten unwiderruflich.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/satz-detektiv-offline.html"
            download="satz-detektiv.html"
            className="min-h-[40px] px-4 py-2 rounded-xl border border-[#C89342] bg-[#FFFDF8] dark:bg-[#2B241F] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#EFE8DA] dark:hover:bg-[#382F28] inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#9B2C2C] dark:text-[#E06C65]" aria-hidden="true" />
            <span>Einzel-HTML herunterladen</span>
          </a>
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[40px] px-4 py-2 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#EFE8DA] dark:bg-[#2B241F] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Akte exportieren</span>
          </button>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#9B2C2C]/45 text-xs font-semibold text-[#9B2C2C] dark:text-[#F2918B] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Daten löschen</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#9B2C2C] text-white text-xs font-semibold cursor-pointer"
              >
                Wirklich alles löschen
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98] cursor-pointer"
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
