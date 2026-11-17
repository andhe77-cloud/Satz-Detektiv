import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Play, TrendingUp } from 'lucide-react';
import { GrammarFocus, PlayerProgress } from '../../core/types';

interface ArchiveStatsDashboardProps {
  progress: PlayerProgress;
  onStartFirstCase: () => void;
}

type ScopeFilter = 'cases' | 'all';
type MetricMode = 'counts' | 'accuracy';

const CASE_ORDER: Array<{ key: GrammarFocus; label: string; shortLabel: string }> = [
  { key: 'nominative', label: 'Nominativ', shortLabel: 'Nom.' },
  { key: 'accusative', label: 'Akkusativ', shortLabel: 'Akk.' },
  { key: 'dative', label: 'Dativ', shortLabel: 'Dat.' },
  { key: 'ablative', label: 'Ablativ', shortLabel: 'Abl.' },
];

const EXTRA_ORDER: Array<{ key: GrammarFocus; label: string; shortLabel: string }> = [
  { key: 'negation', label: 'Verneinung', shortLabel: 'Neg.' },
  { key: 'perfect', label: 'Perfekt', shortLabel: 'Perf.' },
  { key: 'conjunction', label: 'Konjunktion', shortLabel: 'Konj.' },
];

export const ArchiveStatsDashboard: React.FC<ArchiveStatsDashboardProps> = ({
  progress,
  onStartFirstCase,
}) => {
  const [scope, setScope] = useState<ScopeFilter>('cases');
  const [metric, setMetric] = useState<MetricMode>('counts');

  const isDark = progress.settings.theme === 'dark';

  const chartData = useMemo(() => {
    const items = scope === 'cases' ? CASE_ORDER : [...CASE_ORDER, ...EXTRA_ORDER];
    return items.map((item) => {
      const stat = progress.grammarStats[item.key] ?? { errors: 0, successes: 0 };
      const total = stat.successes + stat.errors;
      const accuracy = total > 0 ? Math.round((stat.successes / total) * 100) : 0;
      return {
        key: item.key,
        name: item.label,
        shortName: item.shortLabel,
        gelöst: stat.successes,
        fehler: stat.errors,
        gesamt: total,
        trefferquote: accuracy,
      };
    });
  }, [progress.grammarStats, scope]);

  const totals = useMemo(() => {
    const solved = chartData.reduce((s, d) => s + d.gelöst, 0);
    const errors = chartData.reduce((s, d) => s + d.fehler, 0);
    const total = solved + errors;
    const avgAccuracy = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { solved, errors, total, avgAccuracy };
  }, [chartData]);

  const axisColor = isDark ? '#B9AA98' : '#6A5A4C';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(36,28,22,0.09)';
  const solvedStroke = isDark ? '#5BB98C' : '#266B47';
  const errorStroke = isDark ? '#E06C65' : '#9B2C2C';
  const accuracyStroke = isDark ? '#D99341' : '#B47B2B';

  return (
    <section
      aria-label="Fall-Statistiken nach Kasus-Typ"
      className="rounded-2xl border border-[#DED4C3] dark:border-[#3A312A] bg-[#FFFDF8] dark:bg-[#221D19] p-5 shadow-sm space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFE8DA] dark:border-[#322A23] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9B2C2C] dark:text-[#E06C65]">
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
            <span>Fall-Statistik</span>
          </div>
          <h2 className="font-display text-xl font-bold text-[#241C16] dark:text-[#F2ECE1] mt-0.5">
            Gelöste Fälle &amp; Sicherheit pro Kasus-Typ
          </h2>
          <p className="text-xs text-[#6A5A4C] dark:text-[#B9AA98] mt-0.5">
            Verlauf deiner bisherigen Ermittlungen nach Kasus und Grammatikbereich.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Segmented Control */}
          <div
            role="group"
            aria-label="Grammatik-Auswahl"
            className="inline-flex rounded-xl bg-[#EFE8DA] dark:bg-[#2B241F] p-1 gap-1"
          >
            <button
              type="button"
              onClick={() => setScope('cases')}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                scope === 'cases'
                  ? 'bg-white dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                  : 'text-[#6A5A4C] dark:text-[#B9AA98]'
              }`}
            >
              Kasus-Typen
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                scope === 'all'
                  ? 'bg-white dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                  : 'text-[#6A5A4C] dark:text-[#B9AA98]'
              }`}
            >
              Alle Bereiche
            </button>
          </div>

          {/* Metric Segmented Control */}
          <div
            role="group"
            aria-label="Diagramm-Kennzahl"
            className="inline-flex rounded-xl bg-[#EFE8DA] dark:bg-[#2B241F] p-1 gap-1"
          >
            <button
              type="button"
              onClick={() => setMetric('counts')}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                metric === 'counts'
                  ? 'bg-white dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                  : 'text-[#6A5A4C] dark:text-[#B9AA98]'
              }`}
            >
              Anzahl
            </button>
            <button
              type="button"
              onClick={() => setMetric('accuracy')}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                metric === 'accuracy'
                  ? 'bg-white dark:bg-[#161311] text-[#241C16] dark:text-[#F2ECE1] shadow-sm'
                  : 'text-[#6A5A4C] dark:text-[#B9AA98]'
              }`}
            >
              Quote %
            </button>
          </div>
        </div>
      </div>

      {/* Inline KPI Summary Strip (no nested cards) */}
      <div className="grid grid-cols-3 gap-4 border-b border-[#EFE8DA] dark:border-[#322A23] pb-4">
        <div>
          <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">Gelöste Einsätze</div>
          <div className="font-display text-2xl font-bold text-[#266B47] dark:text-[#5BB98C] font-mono-tab mt-0.5">
            {totals.solved}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">Fehlversuche</div>
          <div className="font-display text-2xl font-bold text-[#9B2C2C] dark:text-[#E06C65] font-mono-tab mt-0.5">
            {totals.errors}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#6A5A4C] dark:text-[#B9AA98]">Trefferquote</div>
          <div className="font-display text-2xl font-bold text-[#241C16] dark:text-[#F2ECE1] font-mono-tab mt-0.5">
            {totals.total > 0 ? `${totals.avgAccuracy}%` : '—'}
          </div>
        </div>
      </div>

      {/* Populated Chart vs Empty State */}
      {totals.total === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/60 dark:bg-[#191512] p-6 text-center space-y-3">
          <p className="font-display text-base font-semibold text-[#241C16] dark:text-[#F2ECE1]">
            Noch keine Fall-Statistiken vorhanden
          </p>
          <p className="text-xs sm:text-sm text-[#6A5A4C] dark:text-[#B9AA98] max-w-md mx-auto">
            Sobald du deinen ersten Fall prüfst oder löst, zeichnet das Liniendiagramm hier deine
            Treffer und Stolpersteine für Nominativ, Akkusativ, Dativ und Ablativ auf.
          </p>
          <button
            type="button"
            onClick={onStartFirstCase}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>Ersten Fall starten</span>
          </button>
        </div>
      ) : (
        <>
          <div className="h-[270px] w-full" aria-label="Liniendiagramm der Kasus-Statistiken">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={metric === 'accuracy' ? [0, 100] : [0, 'auto']}
                  tickFormatter={(v) => (metric === 'accuracy' ? `${v}%` : String(v))}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1B1714' : '#FFFDF8',
                    borderColor: isDark ? '#3A312A' : '#DED4C3',
                    borderRadius: '12px',
                    color: isDark ? '#F2ECE1' : '#241C16',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'Trefferquote') return [`${value}%`, name];
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />

                {metric === 'counts' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="gelöst"
                      name="Gelöste Fälle"
                      stroke={solvedStroke}
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: solvedStroke }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fehler"
                      name="Fehlversuche"
                      stroke={errorStroke}
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={{ r: 4, fill: errorStroke }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="trefferquote"
                    name="Trefferquote"
                    stroke={accuracyStroke}
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: accuracyStroke }}
                    activeDot={{ r: 7 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Tabular Breakdown Table */}
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EFE8DA] dark:border-[#322A23] text-[#6A5A4C] dark:text-[#B9AA98]">
                  <th className="text-left py-2 font-semibold">Kasus / Bereich</th>
                  <th className="text-right py-2 font-semibold">Gelöst</th>
                  <th className="text-right py-2 font-semibold">Fehler</th>
                  <th className="text-right py-2 font-semibold">Quote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DA] dark:divide-[#2E2721]">
                {chartData.map((row) => (
                  <tr key={row.key} className="hover:bg-[#F7F3EA]/60 dark:hover:bg-[#1A1613]">
                    <td className="py-2 font-medium text-[#241C16] dark:text-[#F2ECE1]">{row.name}</td>
                    <td className="py-2 text-right font-mono-tab text-[#266B47] dark:text-[#5BB98C] font-semibold">
                      {row.gelöst}
                    </td>
                    <td className="py-2 text-right font-mono-tab text-[#9B2C2C] dark:text-[#E06C65] font-semibold">
                      {row.fehler}
                    </td>
                    <td className="py-2 text-right font-mono-tab text-[#4A3D33] dark:text-[#D5C9BA]">
                      {row.gesamt > 0 ? `${row.trefferquote}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
