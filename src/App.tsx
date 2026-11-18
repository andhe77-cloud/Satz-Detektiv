import { useEffect, useMemo, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { getDailyCase, getStoryChapters } from './content/storyCases';
import { CampusLessonRange, CaseDefinition, DifficultyStage, GrammarFocus, PlayerProgress } from './core/types';
import { generateCase } from './generator/caseGenerator';
import {
  BADGES,
  BadgeDefinition,
  TowerEvent,
  applyCampusOutcome,
  applyCaseSolved,
  applyTowerEvent,
  calculateTotalStars,
  loadProgress,
  recordGrammarOutcome,
  resetProgress,
  saveProgress,
} from './services/storage';
import { AchievementToast } from './ui/components/AchievementToast';
import { CaseWorkspace } from './ui/components/CaseWorkspace';
import { AppView, Header, MobileBottomNav } from './ui/components/Header';
import { LegalModal, LegalTab } from './ui/components/LegalModal';
import { OfflineIndicator } from './ui/components/OfflineIndicator';
import { SettingsModal } from './ui/components/SettingsModal';
import { ArchiveView, CasesHubView, PracticeView } from './ui/components/Views';
import { GlossaryView } from './ui/components/GlossaryView';

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const latestProgressRef = useRef<PlayerProgress>(progress);
  latestProgressRef.current = progress;
  const [activeView, setActiveView] = useState<AppView>('cases');
  const [activeCase, setActiveCase] = useState<CaseDefinition | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{ open: boolean; tab: LegalTab }>({
    open: false,
    tab: 'privacy',
  });
  const [achievementQueue, setAchievementQueue] = useState<BadgeDefinition[]>([]);

  const chapters = useMemo(() => getStoryChapters(), []);
  const allStoryCases = useMemo(() => chapters.flatMap((ch) => ch.cases), [chapters]);
  const allStoryCaseIds = useMemo(() => allStoryCases.map((c) => c.id), [allStoryCases]);

  const enqueueBadgeIds = (badgeIds: string[]) => {
    if (badgeIds.length === 0) return;
    const defs = badgeIds
      .map((id) => BADGES.find((b) => b.id === id))
      .filter((b): b is BadgeDefinition => Boolean(b));
    if (defs.length === 0) return;
    setAchievementQueue((prev) => {
      const seen = new Set(prev.map((b) => b.id));
      const fresh = defs.filter((d) => !seen.has(d.id));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
  };

  // Sync theme, reduced-motion, and Web Audio settings
  useEffect(() => {
    const root = document.documentElement;
    if (progress.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (progress.settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', progress.settings.theme === 'dark' ? '#161311' : '#F7F3EA');
    }

    soundEngine.configure({
      musicVolume: progress.settings.musicVolume,
      sfxVolume: progress.settings.sfxVolume,
      musicEnabled: progress.settings.musicEnabled,
    });
    saveProgress(progress);
  }, [progress]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleNavigate = (view: AppView) => {
    soundEngine.unlockAndMaybeStartMusic();
    if (view === 'daily') {
      setActiveCase(getDailyCase(todayStr));
      setActiveView('daily');
      return;
    }
    setActiveView(view);
  };

  const handleStartStoryCase = (caseId: string) => {
    soundEngine.unlockAndMaybeStartMusic();
    const found = allStoryCases.find((c) => c.id === caseId);
    if (found) {
      setActiveCase(found);
      setActiveView('play');
    }
  };

  const campusLessonRange: CampusLessonRange = {
    from: progress.settings.campusLessonFrom ?? 0,
    to: progress.settings.campusLessonTo ?? 40,
  };

  const activeCampusRange: CampusLessonRange | undefined =
    progress.settings.vocabularySource === 'campus' ? campusLessonRange : undefined;

  const handleChangeCampusRange = (range: CampusLessonRange) => {
    setProgress((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        campusLessonFrom: range.from,
        campusLessonTo: range.to,
      },
    }));
  };

  const handleStartRandomStage = (stage: DifficultyStage) => {
    soundEngine.unlockAndMaybeStartMusic();
    const seed = `free-${stage}-${Date.now()}`;
    setActiveCase(generateCase({ seed, stage, campusLessonRange: activeCampusRange }));
    setActiveView('play');
  };

  const handleStartFocusedPractice = (focus: GrammarFocus, stage: DifficultyStage) => {
    soundEngine.unlockAndMaybeStartMusic();
    const seed = `practice-${focus}-${Date.now()}`;
    setActiveCase(
      generateCase({ seed, stage, grammarBias: focus, campusLessonRange: activeCampusRange })
    );
    setActiveView('play');
  };

  const handleRecordCampusResult = (
    cardId: string,
    correct: boolean,
    kind: 'meaning' | 'cases' = 'meaning'
  ) => {
    const res = applyCampusOutcome(latestProgressRef.current, cardId, correct, kind);
    latestProgressRef.current = res.nextProgress;
    setProgress(res.nextProgress);
    enqueueBadgeIds(res.newlyUnlockedBadges);
  };

  const handleTowerEvent = (event: TowerEvent) => {
    const res = applyTowerEvent(latestProgressRef.current, event);
    latestProgressRef.current = res.nextProgress;
    setProgress(res.nextProgress);
    enqueueBadgeIds(res.newlyUnlockedBadges);
  };

  const handleResetCampusProgress = () => {
    const prev = latestProgressRef.current;
    const emptyCampusStats = {
      masteredIds: [],
      wrongIds: [],
      practicedCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      caseMasteredCount: 0,
      meaningMasteredCount: 0,
    };
    const next: PlayerProgress = {
      ...prev,
      campusStats: emptyCampusStats,
      totalStars: calculateTotalStars({
        solvedCaseIds: prev.solvedCaseIds,
        dailySolvedDates: prev.dailySolvedDates,
        campusStats: emptyCampusStats,
      }),
    };
    latestProgressRef.current = next;
    setProgress(next);
  };

  const handleCaseSolved = (result: {
    caseId: string;
    stars: number;
    attempts: number;
    jokersUsed: number;
    grammarTags: GrammarFocus[];
  }) => {
    const isDaily =
      activeView === 'daily' ||
      (result.caseId.startsWith('gen-') && result.caseId.includes(`daily-${todayStr}`));
    const res = applyCaseSolved(latestProgressRef.current, {
      caseId: result.caseId,
      stars: result.stars,
      attempts: result.attempts,
      jokersUsed: result.jokersUsed,
      stage: activeCase?.stage,
      isDaily,
      todayStr,
      allStoryCaseIds,
    });
    latestProgressRef.current = res.nextProgress;
    setProgress(res.nextProgress);
    enqueueBadgeIds(res.newlyUnlockedBadges);
  };

  const handleGrammarOutcome = (tags: GrammarFocus[], hadError: boolean) => {
    const next = recordGrammarOutcome(latestProgressRef.current, tags, hadError);
    latestProgressRef.current = next;
    setProgress(next);
  };

  const handleNextCase = () => {
    if (!activeCase) return;
    const idx = allStoryCases.findIndex((c) => c.id === activeCase.id);
    if (idx >= 0 && idx + 1 < allStoryCases.length) {
      setActiveCase(allStoryCases[idx + 1]);
      return;
    }
    // Otherwise generate a fresh case on the same stage
    handleStartRandomStage(activeCase.stage);
  };

  const hasNextStoryCase = Boolean(
    activeCase &&
      (() => {
        const idx = allStoryCases.findIndex((c) => c.id === activeCase.id);
        return idx >= 0 && idx + 1 < allStoryCases.length;
      })()
  );

  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F3EA] dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1]">
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-10">
        {(activeView === 'play' || activeView === 'daily') && activeCase ? (
          <CaseWorkspace
            caseData={activeCase}
            hasNextCase={hasNextStoryCase}
            onBack={() => setActiveView('cases')}
            onNextCase={handleNextCase}
            onSolved={handleCaseSolved}
            onGrammarOutcome={handleGrammarOutcome}
          />
        ) : activeView === 'practice' ? (
          <PracticeView
            progress={progress}
            campusLessonRange={campusLessonRange}
            onChangeCampusLessonRange={handleChangeCampusRange}
            onStartFocusedPractice={handleStartFocusedPractice}
            onRecordCampusResult={handleRecordCampusResult}
            onTowerEvent={handleTowerEvent}
            onResetCampusProgress={handleResetCampusProgress}
          />
        ) : activeView === 'glossary' ? (
          <GlossaryView
            progress={progress}
            onNavigateToCases={() => setActiveView('cases')}
            onStartStage={handleStartRandomStage}
            onStartFocusedPractice={handleStartFocusedPractice}
          />
        ) : activeView === 'archive' ? (
          <ArchiveView
            progress={progress}
            onResetProgress={() => {
              const fresh = resetProgress();
              latestProgressRef.current = fresh;
              setAchievementQueue([]);
              setProgress(fresh);
            }}
            onStartFirstCase={() => setActiveView('cases')}
          />
        ) : (
          <CasesHubView
            chapters={chapters}
            progress={progress}
            onStartCase={handleStartStoryCase}
            onStartRandomStage={handleStartRandomStage}
            onStartDaily={() => handleNavigate('daily')}
            onChangeVocabularySource={(vocabularySource) =>
              setProgress((prev) => ({
                ...prev,
                settings: { ...prev.settings, vocabularySource },
              }))
            }
            onChangeCampusLessonRange={handleChangeCampusRange}
          />
        )}
      </main>

      <footer className="hidden md:block border-t border-[#DED4C3] dark:border-[#3A312A] py-4 px-6 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <span>Satz-Detektiv · Latein-Logikrätsel ohne Werbung und ohne Tracking</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLegalModal({ open: true, tab: 'privacy' })}
              className="hover:underline cursor-pointer"
            >
              Datenschutz
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setLegalModal({ open: true, tab: 'imprint' })}
              className="hover:underline cursor-pointer"
            >
              Impressum
            </button>
          </div>
        </div>
      </footer>

      <MobileBottomNav activeView={activeView} onNavigate={handleNavigate} />

      <SettingsModal
        open={settingsOpen}
        settings={progress.settings}
        onChangeSettings={(patch) =>
          setProgress((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
        }
        onOpenLegal={(tab) => setLegalModal({ open: true, tab })}
        onClose={() => setSettingsOpen(false)}
      />

      <LegalModal
        open={legalModal.open}
        tab={legalModal.tab}
        onChangeTab={(tab) => setLegalModal((prev) => ({ ...prev, tab }))}
        onClose={() => setLegalModal((prev) => ({ ...prev, open: false }))}
      />

      <AchievementToast
        queue={achievementQueue}
        onDismissCurrent={() => setAchievementQueue((prev) => prev.slice(1))}
      />

      <OfflineIndicator />
    </div>
  );
}
