import React, { useState } from 'react';
import { Award, CheckCircle2, Download, Play, RotateCcw, Shuffle, Star } from 'lucide-react';
import { StoryChapter } from '../../content/storyCases';
import { CampusLessonRange, DifficultyStage, GrammarFocus, PlayerProgress } from '../../core/types';
import { getRecommendedPracticeFocus } from '../../services/spacedRepetition';
import { BADGES, BadgeCategory, TowerEvent, getCurrentRank } from '../../services/storage';
import { ArchiveStatsDashboard } from './ArchiveStatsDashboard';
import { CampusVocabTrainer } from './CampusVocabTrainer';
import { CorneliusAvatarSvg } from './Illustrations';
import { LessonRangeSlider } from './LessonRangeSlider';
import { PWAInstallButton } from './PWAInstallButton';

export const CasesHubView: React.FC<{
  chapters: StoryChapter[];
  progress: PlayerProgress;
  onStartCase: (caseId: string) => void;
  onStartRandomStage: (stage: DifficultyStage) => void;
  onStartDaily: () => void;
  onChangeVocabularySource: (source: 'standard' | 'campus') => void;
  onChangeCampusLessonRange: (range: CampusLessonRange) => void;
}> = ({
  chapters,
  progress,
  onStartCase,
  onStartRandomStage,
  onStartDaily,
  onChangeVocabularySource,
  onChangeCampusLessonRange,
}) => {
  const rank = getCurrentRank(progress.totalStars);
  const solvedCount = Object.keys(progress.solvedCaseIds).length;
  const vocabSource = progress.settings.vocabularySource ?? 'standard';
  const campusRange: CampusLessonRange = {
    from: progress.settings.campusLessonFrom ?? 0,
    to: progress.settings.campusLessonTo ?? 40,
  };
  const effectiveFrom = campusRange.from === 0 ? 1 : campusRange.from + 1;

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

        {/* Vocabulary Source & Campus Lesson Range Selector */}
        <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-3.5 sm:p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1]">
                Wortschatz für Zufallsfälle
              </div>
              <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                {vocabSource === 'campus'
                  ? `Aktiv: Campus C1&2 – Vokabeln aus Lektion ${effectiveFrom}–${campusRange.to}`
                  : 'Aktiv: Basis-Detektivlexikon (27 Nomen, 10 Verben)'}
              </div>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#161311]">
              <button
                type="button"
                onClick={() => onChangeVocabularySource('standard')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vocabSource === 'standard'
                    ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                    : 'text-[#4A3D33] dark:text-[#B9AA98]'
                }`}
              >
                Basis-Lexikon
              </button>
              <button
                type="button"
                onClick={() => onChangeVocabularySource('campus')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vocabSource === 'campus'
                    ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                    : 'text-[#4A3D33] dark:text-[#B9AA98]'
                }`}
              >
                Campus C1&2
              </button>
            </div>
          </div>

          {vocabSource === 'campus' && (
            <div className="pt-3 border-t border-[#EFE8DA] dark:border-[#322A23]">
              <LessonRangeSlider
                value={campusRange}
                onChange={onChangeCampusLessonRange}
                label="Campus-Lektionsbereich (Von – Bis)"
              />
            </div>
          )}
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
  campusLessonRange: CampusLessonRange;
  onChangeCampusLessonRange: (range: CampusLessonRange) => void;
  onStartFocusedPractice: (focus: GrammarFocus, stage: DifficultyStage) => void;
  onRecordCampusResult: (cardId: string, correct: boolean, kind: 'meaning' | 'cases') => void;
  onTowerEvent?: (event: TowerEvent) => void;
  onResetCampusProgress: () => void;
}> = ({
  progress,
  campusLessonRange,
  onChangeCampusLessonRange,
  onStartFocusedPractice,
  onRecordCampusResult,
  onTowerEvent,
  onResetCampusProgress,
}) => {
  const [practiceTab, setPracticeTab] = useState<'grammar' | 'campus'>('grammar');
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
            Gezieltes Training & Campus-Wortschatz
          </h1>
          <p className="mt-1 text-sm text-[#4A3D33] dark:text-[#D5C9BA]">
            Übe gezielt schwierige Kasus-Typen im Fall oder trainiere alle 1.018 Campus-Karten nach Lektionen.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#221D19] border border-[#DED4C3] dark:border-[#3A312A] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPracticeTab('grammar')}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              practiceTab === 'grammar'
                ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                : 'text-[#4A3D33] dark:text-[#B9AA98]'
            }`}
          >
            Kasus-Training (Fälle)
          </button>
          <button
            type="button"
            onClick={() => setPracticeTab('campus')}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              practiceTab === 'campus'
                ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                : 'text-[#4A3D33] dark:text-[#B9AA98]'
            }`}
          >
            Campus C1&2 (1.018 Karten)
          </button>
        </div>
      </div>

      {practiceTab === 'campus' ? (
        <CampusVocabTrainer
          progress={progress}
          lessonRange={campusLessonRange}
          onChangeLessonRange={onChangeCampusLessonRange}
          onRecordResult={onRecordCampusResult}
          onTowerEvent={onTowerEvent}
          onResetCampusProgress={onResetCampusProgress}
        />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export const ArchiveView: React.FC<{
  progress: PlayerProgress;
  onResetProgress: () => void;
  onStartFirstCase: () => void;
}> = ({ progress, onResetProgress, onStartFirstCase }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [badgeCategory, setBadgeCategory] = useState<'all' | BadgeCategory>('all');

  const rank = getCurrentRank(progress.totalStars);
  const unlockedCount = BADGES.filter((b) => progress.unlockedBadges.includes(b.id)).length;
  const visibleBadges =
    badgeCategory === 'all' ? BADGES : BADGES.filter((b) => b.category === badgeCategory);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satz-detektiv-akte-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

      {/* Badges & Long-Term Achievements */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
              Achievements &amp; Abzeichen
            </h2>
            <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] mt-0.5 font-mono-tab">
              {unlockedCount} von {BADGES.length} freigeschaltet ({Math.round((unlockedCount / BADGES.length) * 100)}%)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#EFE8DA] dark:bg-[#221D19] border border-[#DED4C3] dark:border-[#3A312A]">
            {(
              [
                { id: 'all', label: 'Alle' },
                { id: 'cases', label: 'Fälle' },
                { id: 'tower', label: 'Passierschein' },
                { id: 'vocab', label: 'Wortschatz' },
                { id: 'chaos', label: 'Verrückt & Geheim' },
              ] as Array<{ id: 'all' | BadgeCategory; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBadgeCategory(tab.id)}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  badgeCategory === tab.id
                    ? 'bg-[#FFFDF8] dark:bg-[#2B241F] text-[#9B2C2C] dark:text-[#E06C65] shadow-sm'
                    : 'text-[#4A3D33] dark:text-[#B9AA98]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleBadges.map((badge) => {
            const unlocked = progress.unlockedBadges.includes(badge.id);
            const prog = badge.progress ? badge.progress(progress) : null;
            const progPct = prog ? Math.min(100, Math.round((prog.current / prog.target) * 100)) : 0;
            const isHiddenSecret = !unlocked && badge.category === 'chaos';

            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-4 flex items-start gap-3 ${
                  unlocked
                    ? 'border-[#C89342] bg-[#FFFDF8] dark:bg-[#221D19]'
                    : 'border-[#DED4C3] dark:border-[#3A312A] bg-[#EFE8DA]/45 dark:bg-[#1B1714] opacity-80'
                }`}
              >
                <Award
                  className={`w-6 h-6 shrink-0 mt-0.5 ${
                    unlocked ? 'text-[#B47B2B] dark:text-[#D99341]' : 'text-[#8B7B6B]'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="text-sm font-bold text-[#241C16] dark:text-[#F2ECE1]">
                    {isHiddenSecret ? '??? (Geheimes Achievement)' : badge.titleDe}
                  </div>
                  <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] leading-relaxed">
                    {isHiddenSecret
                      ? badge.secretHintDe ?? 'Finde im Spiel heraus, was diesen verrückten System-Eintrag auslöst.'
                      : badge.descriptionDe}
                  </p>

                  {prog && !unlocked && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between text-[11px] font-mono-tab text-[#6A5A4C] dark:text-[#B9AA98]">
                        <span>Fortschritt</span>
                        <span>
                          {Math.min(prog.current, prog.target)} / {prog.target}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#DED4C3] dark:bg-[#2B241F] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#9B2C2C] transition-all"
                          style={{ width: `${progPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {unlocked ? (
                    <div className="text-[11px] font-semibold text-[#1E5B3A] dark:text-[#7CD3A2]">
                      Freigeschaltet · <span className="font-normal">{badge.rewardDe}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
                      Noch verschlossen
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
          {(typeof window === 'undefined' || window.location.protocol !== 'file:') && (
            <a
              href={`${import.meta.env.BASE_URL}satz-detektiv-offline.html`}
              download="satz-detektiv.html"
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#C89342] bg-[#FFFDF8] dark:bg-[#2B241F] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#EFE8DA] dark:hover:bg-[#382F28] inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#9B2C2C] dark:text-[#E06C65]" aria-hidden="true" />
              <span>Einzel-HTML herunterladen</span>
            </a>
          )}
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
