import React from 'react';
import { X } from 'lucide-react';
import { CaseDefinition } from '../../core/types';
import { defaultLexicon } from '../../latin/inflector';

export const VocabularyPanel: React.FC<{
  caseData: CaseDefinition;
  onClose: () => void;
}> = ({ caseData, onClose }) => {
  // Collect all unique words from witness statements AND scenario/solution vocabulary
  const entriesMap = new Map<string, { lemma: string; pos: string; meaningDe: string }>();

  const addNoun = (id: string) => {
    try {
      const n = defaultLexicon.getNoun(id);
      if (n.category === 'person') return;
      const key = `${n.lemma}, ${n.genitive} (${n.gender}.)`;
      if (!entriesMap.has(key)) {
        entriesMap.set(key, { lemma: key, pos: 'Nomen', meaningDe: n.meaningDe });
      }
    } catch {
      // Ignore unknown ids
    }
  };

  const addVerb = (id: string) => {
    try {
      const v = defaultLexicon.getVerb(id);
      const key = `${v.infinitive} (${v.present3Sg}, ${v.perfect3Sg})`;
      if (!entriesMap.has(key)) {
        entriesMap.set(key, { lemma: key, pos: 'Verb', meaningDe: v.meaningDeInf });
      }
    } catch {
      // Ignore unknown ids
    }
  };

  addNoun(caseData.scenario.targetNounId);
  caseData.candidateItems.forEach(addNoun);
  (caseData.candidateLocations ?? []).forEach(addNoun);
  addVerb(caseData.scenario.crimeVerbId);
  addVerb(caseData.scenario.actionVerbId);
  if (caseData.difficultyMetrics.requiresGiver) addVerb('dare');

  for (const stmt of caseData.statements) {
    for (const tok of stmt.tokens) {
      if (tok.pos === 'Satzzeichen' || tok.pos === 'Name') continue;
      if (!entriesMap.has(tok.lemma)) {
        entriesMap.set(tok.lemma, {
          lemma: tok.lemma,
          pos: tok.pos,
          meaningDe: tok.meaningDe,
        });
      }
    }
  }

  const entries = [...entriesMap.values()].sort((a, b) => a.lemma.localeCompare(b.lemma, 'de'));

  return (
    <div
      role="region"
      aria-label="Vokabelliste zum Fall"
      className="rounded-2xl border border-[#C89342]/70 bg-[#FFFDF8] dark:bg-[#221D19] p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#DED4C3] dark:border-[#3A312A]">
        <div>
          <h3 className="font-display text-base font-semibold text-[#241C16] dark:text-[#F2ECE1]">
            Vokabelliste zum Fall
          </h3>
          <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            Alle wichtigen Nomen, Verben und Partikeln für diesen Fall ({entries.length} Einträge)
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Vokabelliste schließen"
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-black/5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-[#EFE8DA] dark:divide-[#2E2721] text-sm">
        {entries.map((e) => (
          <div
            key={e.lemma}
            className="py-1.5 flex items-baseline justify-between gap-3 sm:border-b sm:border-[#EFE8DA] sm:dark:border-[#2E2721]"
          >
            <dt className="font-display italic font-medium text-[#9B2C2C] dark:text-[#E06C65]">
              {e.lemma}
            </dt>
            <dd className="text-right text-[#241C16] dark:text-[#F2ECE1] shrink-0">{e.meaningDe}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
