import React, { useState } from 'react';
import { BookOpen, Check, HelpCircle, Languages, Sparkles, X } from 'lucide-react';
import { CaseDefinition, ScenarioProp, WordToken } from '../../core/types';
import { WitnessMark, WitnessFigureSvg, RoomBackdropSvg, CHARACTERS } from './Illustrations';

interface StageSceneProps {
  caseData: CaseDefinition;
  selectedWitness: number;
  onSelectWitness: (index: number) => void;
  marks: WitnessMark[];
  onSetMark: (index: number, mark: WitnessMark) => void;
  translatedIndices: Record<number, boolean>;
  translationJokersLeft: number;
  onUseTranslationJoker: (index: number) => void;
  revealedTruthIndices: Record<number, boolean>;
  truthJokersLeft: number;
  onUseTruthJoker: (index: number) => void;
  onToggleVocab: () => void;
  vocabOpen: boolean;
}

export const StageScene: React.FC<StageSceneProps> = ({
  caseData,
  selectedWitness,
  onSelectWitness,
  marks,
  onSetMark,
  translatedIndices,
  translationJokersLeft,
  onUseTranslationJoker,
  revealedTruthIndices,
  truthJokersLeft,
  onUseTruthJoker,
  onToggleVocab,
  vocabOpen,
}) => {
  const [inspectedWord, setInspectedWord] = useState<WordToken | null>(null);
  const [inspectedProp, setInspectedProp] = useState<ScenarioProp | null>(null);

  const activeStmt = caseData.statements[selectedWitness] ?? caseData.statements[0];
  const activeChar = CHARACTERS[activeStmt.speakerId] ?? CHARACTERS.marcus;
  const currentMark = marks[selectedWitness] ?? '';
  const isTranslated = Boolean(translatedIndices[selectedWitness]);
  const isTruthRevealed = Boolean(revealedTruthIndices[selectedWitness]);

  // Calculate speech bubble pointer horizontal position based on witness count
  const witnessCount = caseData.witnessIds.length;
  const pointerPercent = ((selectedWitness + 0.5) / witnessCount) * 100;

  return (
    <section aria-label="Ermittlungsbühne" className="space-y-3">
      {/* Painted Room Stage */}
      <div className="relative h-[340px] sm:h-[370px] w-full rounded-2xl overflow-hidden border border-[#C9B99F] dark:border-[#493D32] shadow-md bg-[#E6D5B8] dark:bg-[#231D17]">
        <RoomBackdropSvg room={caseData.scenario.room} />

        {/* Clickable Evidence Props in Room */}
        {caseData.scenario.props.map((prop) => (
          <button
            key={prop.id}
            type="button"
            onClick={() => {
              setInspectedProp((prev) => (prev?.id === prop.id ? null : prop));
              setInspectedWord(null);
            }}
            style={{ left: `${prop.xPercent}%`, top: `${prop.yPercent}%` }}
            title={`Beweisstück untersuchen: ${prop.labelDe}`}
            aria-label={`Beweisstück untersuchen: ${prop.labelDe}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-[#FFFDF7]/90 dark:bg-[#241C16]/90 border border-[#C89342] text-[#9B2C2C] dark:text-[#D99341] shadow-sm hover:scale-110 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9B2C2C]"
          >
            <span className="text-xs font-bold px-2 whitespace-nowrap">{prop.labelDe}</span>
          </button>
        ))}

        {/* Speech Bubble */}
        <div className="relative z-20 mx-3 mt-3">
          <div
            className="relative rounded-2xl bg-[#FFFDF8] dark:bg-[#26201B] border-2 border-[#3B2B1F] dark:border-[#C89342] px-4 py-3 shadow-md"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 text-xs text-[#6A5A4C] dark:text-[#C5B5A2]">
                <span className="font-bold text-[#9B2C2C] dark:text-[#E06C65]">{activeChar.name}</span>
                <span aria-hidden="true">·</span>
                <span>{activeChar.roleDe}</span>
              </div>
              {isTruthRevealed && (
                <span className="text-xs font-semibold text-[#2A4B7C] dark:text-[#89B0E6]">
                  Wahrheits-Spur aufgedeckt
                </span>
              )}
            </div>

            {/* Interactive Tappable Latin Words */}
            <p className="font-display text-lg sm:text-xl italic leading-snug text-[#241C16] dark:text-[#F2ECE1] flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
              <span aria-hidden="true" className="not-italic text-[#9B2C2C] dark:text-[#E06C65]">„</span>
              {activeStmt.tokens.map((tok, idx) => {
                if (tok.pos === 'Satzzeichen') {
                  return (
                    <span key={idx} className="-ml-1">
                      {tok.text}
                    </span>
                  );
                }
                const isSelectedWord = inspectedWord === tok;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInspectedWord(isSelectedWord ? null : tok);
                      setInspectedProp(null);
                    }}
                    className={`rounded-md px-1 py-0.5 transition-colors cursor-pointer underline decoration-dotted decoration-[#B47B2B]/60 underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#9B2C2C] ${
                      isSelectedWord
                        ? 'bg-[#EFE2C8] dark:bg-[#3B3025] text-[#9B2C2C] dark:text-[#F0B465]'
                        : 'hover:bg-[#EFE8DA] dark:hover:bg-[#332B24]'
                    }`}
                  >
                    {tok.text}
                  </button>
                );
              })}
              <span aria-hidden="true" className="not-italic text-[#9B2C2C] dark:text-[#E06C65]">“</span>
            </p>

            {/* Speech Bubble Pointer */}
            <div
              style={{ left: `${pointerPercent}%` }}
              className="absolute -bottom-[9px] w-4 h-4 -translate-x-1/2 rotate-45 bg-[#FFFDF8] dark:bg-[#26201B] border-r-2 border-b-2 border-[#3B2B1F] dark:border-[#C89342]"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Witness Cast Lineup */}
        <div className="absolute inset-x-0 bottom-2 z-20 flex items-end justify-around px-2 sm:px-5">
          {caseData.witnessIds.map((wId, idx) => {
            const isSelected = idx === selectedWitness;
            const mark = marks[idx] ?? '';
            const ch = CHARACTERS[wId] ?? CHARACTERS.marcus;

            return (
              <button
                key={wId}
                type="button"
                onClick={() => {
                  onSelectWitness(idx);
                  setInspectedWord(null);
                  setInspectedProp(null);
                }}
                aria-pressed={isSelected}
                aria-label={`${ch.name} (${ch.roleDe}) befragen`}
                className={`group relative flex flex-col items-center focus-visible:outline-2 focus-visible:outline-[#9B2C2C] rounded-xl cursor-pointer transition-transform duration-200 ${
                  witnessCount === 3 ? 'w-24 sm:w-28' : 'w-16 sm:w-24'
                } ${isSelected ? 'scale-110 -translate-y-1 z-30' : 'opacity-95 hover:opacity-100 hover:-translate-y-0.5'}`}
              >
                {/* Non-hue-only status marker above figure */}
                {mark !== '' && (
                  <span
                    className={`mb-0.5 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold shadow-sm border ${
                      mark === 'true'
                        ? 'bg-[#EAF5EE] dark:bg-[#193325] text-[#1E5B3A] dark:text-[#7CD3A2] border-[#266B47]'
                        : 'bg-[#FBEAEA] dark:bg-[#3A1B1A] text-[#9B2C2C] dark:text-[#F2918B] border-[#9B2C2C]'
                    }`}
                  >
                    {mark === 'true' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span className="hidden sm:inline">{mark === 'true' ? 'Wahr' : 'Falsch'}</span>
                  </span>
                )}

                <div
                  className={`w-full h-32 sm:h-40 ${
                    !isSelected ? 'animate-witness-breathe' : ''
                  }`}
                >
                  <WitnessFigureSvg speakerId={wId} selected={isSelected} mark={mark} />
                </div>

                <span
                  className={`mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold tracking-tight transition-colors ${
                    isSelected
                      ? 'bg-[#9B2C2C] text-white shadow-sm'
                      : 'bg-[#241C16]/75 text-[#FFF8EA]'
                  }`}
                >
                  {ch.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Inspector: Word Tooltip / Prop Observation / Translation */}
      {inspectedWord && (
        <div
          role="status"
          className="rounded-xl border border-[#C89342]/60 bg-[#FFFDF8] dark:bg-[#221D19] p-3.5 text-sm shadow-sm flex items-start justify-between gap-3"
        >
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-display text-base font-semibold italic text-[#9B2C2C] dark:text-[#E06C65]">
                {inspectedWord.text}
              </span>
              <span className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
                {inspectedWord.pos} · {inspectedWord.grammarLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#241C16] dark:text-[#F2ECE1]">
              Grundform: <em>{inspectedWord.lemma}</em> — <strong>{inspectedWord.meaningDe}</strong>
            </p>
            {inspectedWord.ambiguities && (
              <p className="mt-1 text-xs text-[#8C5B19] dark:text-[#E5AD5B]">
                Hinweis: {inspectedWord.ambiguities.join('; ')} (der Satzkontext entscheidet!).
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setInspectedWord(null)}
            aria-label="Worterklärung schließen"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {inspectedProp && (
        <div
          role="status"
          className="rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-3.5 text-sm shadow-sm flex items-start justify-between gap-3"
        >
          <div>
            <div className="text-xs font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
              Spur am Tatort · <em>{inspectedProp.latinClue}</em>
            </div>
            <p className="mt-0.5 text-[#241C16] dark:text-[#F2ECE1]">{inspectedProp.commentDe}</p>
          </div>
          <button
            type="button"
            onClick={() => setInspectedProp(null)}
            aria-label="Hinweis schließen"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isTranslated && (
        <div className="rounded-xl border border-[#2A4B7C]/35 bg-[#EFF4FA] dark:bg-[#1B2534] px-4 py-2.5 text-sm text-[#1E365C] dark:text-[#D5E3F7]">
          <span className="font-semibold">Übersetzung ({activeChar.name}):</span> {activeStmt.germanText}
        </div>
      )}

      {/* Interrogation Action Bar: Mark Statement + Jokers */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Segmented Truth Mark Control */}
        <div
          role="group"
          aria-label={`Aussage von ${activeChar.name} bewerten`}
          className="inline-flex items-center rounded-xl bg-[#EFE8DA] dark:bg-[#2B241F] p-1 gap-1"
        >
          <button
            type="button"
            onClick={() => onSetMark(selectedWitness, '')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              currentMark === ''
                ? 'bg-white dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                : 'text-[#6A5A4C] dark:text-[#B9AA98] hover:text-[#241C16]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Offen</span>
          </button>
          <button
            type="button"
            onClick={() => onSetMark(selectedWitness, 'true')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              currentMark === 'true'
                ? 'bg-[#266B47] text-white shadow-sm'
                : 'text-[#6A5A4C] dark:text-[#B9AA98] hover:text-[#1E5B3A]'
            }`}
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Wahr</span>
          </button>
          <button
            type="button"
            onClick={() => onSetMark(selectedWitness, 'false')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              currentMark === 'false'
                ? 'bg-[#9B2C2C] text-white shadow-sm'
                : 'text-[#6A5A4C] dark:text-[#B9AA98] hover:text-[#9B2C2C]'
            }`}
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Falsch</span>
          </button>
        </div>

        {/* Limited Helps & Vocabulary */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onUseTranslationJoker(selectedWitness)}
            disabled={isTranslated || translationJokersLeft <= 0}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#EFE8DA] dark:hover:bg-[#2B241F] disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-[#2A4B7C] dark:text-[#89B0E6]" aria-hidden="true" />
            <span>{isTranslated ? 'Übersetzt' : `Übersetzen (${translationJokersLeft})`}</span>
          </button>

          <button
            type="button"
            onClick={() => onUseTruthJoker(selectedWitness)}
            disabled={isTruthRevealed || truthJokersLeft <= 0}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] text-xs font-semibold text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#EFE8DA] dark:hover:bg-[#2B241F] disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B47B2B] dark:text-[#D99341]" aria-hidden="true" />
            <span>Wahrheits-Spur ({truthJokersLeft})</span>
          </button>

          <button
            type="button"
            onClick={onToggleVocab}
            aria-expanded={vocabOpen}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              vocabOpen
                ? 'border-[#9B2C2C] bg-[#9B2C2C] text-white'
                : 'border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] text-[#241C16] dark:text-[#F2ECE1] hover:bg-[#EFE8DA]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Vokabeln</span>
          </button>
        </div>
      </div>
    </section>
  );
};
