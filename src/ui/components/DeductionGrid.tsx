import React from 'react';
import { Check, X } from 'lucide-react';
import { CaseDefinition } from '../../core/types';
import { defaultLexicon } from '../../latin/inflector';
import { CHARACTERS } from './Illustrations';

export type GridMark = '' | 'x' | 'ok';

interface DeductionGridProps {
  caseData: CaseDefinition;
  gridState: Record<string, GridMark>;
  onToggleCell: (key: string) => void;
  onResetGrid: () => void;
}

export const DeductionGrid: React.FC<DeductionGridProps> = ({
  caseData,
  gridState,
  onToggleCell,
  onResetGrid,
}) => {
  const suspects = caseData.witnessIds;
  const items = caseData.candidateItems;
  const locations = caseData.candidateLocations ?? [];
  const showGiver = caseData.difficultyMetrics.requiresGiver;
  const showLocation = caseData.difficultyMetrics.requiresLocation && locations.length > 0;

  const renderCell = (key: string, label: string) => {
    const val = gridState[key] ?? '';
    return (
      <button
        key={key}
        type="button"
        onClick={() => onToggleCell(key)}
        aria-label={`${label}: ${val === 'ok' ? 'bestätigt' : val === 'x' ? 'ausgeschlossen' : 'offen'}`}
        className={`min-w-[44px] min-h-[44px] w-full flex items-center justify-center rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
          val === 'ok'
            ? 'bg-[#EAF5EE] dark:bg-[#193325] border-[#266B47] text-[#1E5B3A] dark:text-[#7CD3A2]'
            : val === 'x'
            ? 'bg-[#FBEAEA] dark:bg-[#3A1B1A] border-[#9B2C2C]/60 text-[#9B2C2C] dark:text-[#F2918B]'
            : 'bg-[#FFFDF8] dark:bg-[#1E1A16] border-[#DED4C3] dark:border-[#3A312A] text-[#8B7B6B] hover:bg-[#EFE8DA] dark:hover:bg-[#2B241F]'
        }`}
      >
        {val === 'ok' ? (
          <Check className="w-4 h-4" aria-hidden="true" />
        ) : val === 'x' ? (
          <X className="w-4 h-4" aria-hidden="true" />
        ) : (
          <span aria-hidden="true">·</span>
        )}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-[#241C16] dark:text-[#F2ECE1]">
            Notizraster
          </h3>
          <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            Tippen wechselt: offen · ausgeschlossen (✘) · passt (✔)
          </p>
        </div>
        <button
          type="button"
          onClick={onResetGrid}
          className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98] hover:bg-[#EFE8DA] dark:hover:bg-[#2B241F] cursor-pointer"
        >
          Leeren
        </button>
      </div>

      {/* Suspect x Item Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="text-left font-semibold text-[#6A5A4C] dark:text-[#B9AA98] pb-1">
                Verdächtige
              </th>
              {items.map((itemId) => {
                const item = defaultLexicon.getNoun(itemId);
                return (
                  <th key={itemId} className="text-center font-semibold text-[#241C16] dark:text-[#F2ECE1] pb-1">
                    <div>{item.lemma}</div>
                    <div className="font-normal text-[11px] text-[#6A5A4C] dark:text-[#B9AA98]">
                      {item.meaningDe.replace(/^(der|die|das) /, '')}
                    </div>
                  </th>
                );
              })}
              {showGiver && (
                <th className="text-center font-semibold text-[#2A4B7C] dark:text-[#89B0E6] pb-1">
                  <div>Geber?</div>
                  <div className="font-normal text-[11px] text-[#6A5A4C] dark:text-[#B9AA98]">hat gegeben</div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {suspects.map((sId) => {
              const ch = CHARACTERS[sId];
              return (
                <tr key={sId}>
                  <td className="font-semibold text-[#241C16] dark:text-[#F2ECE1] pr-2 whitespace-nowrap">
                    {ch?.name ?? sId}
                  </td>
                  {items.map((itemId) =>
                    renderCell(`si-${sId}-${itemId}`, `${ch?.name ?? sId} mit ${itemId}`)
                  ).map((btn, i) => (
                    <td key={items[i]}>{btn}</td>
                  ))}
                  {showGiver && (
                    <td>{renderCell(`giver-${sId}`, `${ch?.name ?? sId} als Geber`)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Optional Stage 4 Location checklist */}
      {showLocation && (
        <div className="mt-3 pt-3 border-t border-[#DED4C3] dark:border-[#3A312A]">
          <div className="text-xs font-semibold text-[#6A5A4C] dark:text-[#B9AA98] mb-2">
            Tatort (in + Ablativ)
          </div>
          <div className="grid grid-cols-3 gap-2">
            {locations.map((locId) => {
              const loc = defaultLexicon.getNoun(locId);
              const key = `loc-${locId}`;
              const val = gridState[key] ?? '';
              return (
                <button
                  key={locId}
                  type="button"
                  onClick={() => onToggleCell(key)}
                  className={`min-h-[44px] px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 cursor-pointer ${
                    val === 'ok'
                      ? 'bg-[#EAF5EE] dark:bg-[#193325] border-[#266B47] text-[#1E5B3A] dark:text-[#7CD3A2]'
                      : val === 'x'
                      ? 'bg-[#FBEAEA] dark:bg-[#3A1B1A] border-[#9B2C2C]/60 text-[#9B2C2C] dark:text-[#F2918B]'
                      : 'bg-[#FFFDF8] dark:bg-[#1E1A16] border-[#DED4C3] dark:border-[#3A312A] text-[#241C16] dark:text-[#F2ECE1]'
                  }`}
                >
                  <span className="truncate">{loc.lemma}</span>
                  <span>{val === 'ok' ? '✔' : val === 'x' ? '✘' : '·'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
