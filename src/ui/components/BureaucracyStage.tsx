import React from 'react';
import { Award, CheckCircle2, RotateCcw, ScrollText, XCircle } from 'lucide-react';

export type HeroMood = 'neutral' | 'happy' | 'angry' | 'victory' | 'defeat';

const ROMAN_NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;
const DOOR_NUMERALS = ['I', 'II', 'III', 'IV'] as const;

const COMIC_CURSES = [
  '⚡ #*!§?!',
  '💢 @?!*#!!',
  '⚡ §%*!?!',
  '💢 #!?*!!',
  '⚡ &%§#*!',
  '💢 *#§!@?!',
] as const;

/**
 * Kommissar Cornelius (clever, compact detective hero) in the exact vector style of WitnessFigureSvg.
 */
export const CorneliusWalkerSvg: React.FC<{ mood: HeroMood; className?: string }> = ({
  mood,
  className = 'w-20 h-32 sm:w-24 sm:h-36',
}) => {
  const isAngry = mood === 'angry' || mood === 'defeat';
  const isHappy = mood === 'happy' || mood === 'victory';

  const browLeft = isAngry ? 'M34 40 L45 45' : isHappy ? 'M34 40 Q39 36 45 40' : 'M34 42 Q39 39 45 42';
  const browRight = isAngry ? 'M66 40 L55 45' : isHappy ? 'M55 40 Q61 36 66 40' : 'M55 42 Q61 39 66 42';
  const mouth = isAngry
    ? 'M42 62 Q50 56 58 62'
    : isHappy
    ? 'M41 58 Q50 65 59 58'
    : 'M43 59 Q50 62 57 59';

  return (
    <svg
      viewBox="0 0 100 165"
      className={`${className} drop-shadow-[0_4px_6px_rgba(20,14,10,0.28)]`}
      aria-hidden="true"
    >
      {/* Shadow */}
      <ellipse cx="50" cy="157" rx="25" ry="5" fill="rgba(20,14,10,0.32)" />

      {/* Legs & Sandals */}
      <rect x="38" y="130" width="8.5" height="23" rx="4" fill="#DBA882" />
      <rect x="53.5" y="130" width="8.5" height="23" rx="4" fill="#DBA882" />
      <path d="M35 150 H48 V156 H34 Z" fill="#4A3222" />
      <path d="M52 150 H66 V156 H52 Z" fill="#4A3222" />

      {/* Detective Tunic */}
      <path
        d="M28 80 Q50 70 72 80 L76 133 Q50 137 24 133 Z"
        fill="#3B2B20"
        stroke="#221710"
        strokeWidth="1.7"
      />
      {/* Belt & Gold Buckle */}
      <rect x="26" y="112" width="48" height="6" rx="2" fill="#221710" />
      <rect x="45" y="111" width="10" height="8" rx="1.5" fill="#D49A45" stroke="#221710" strokeWidth="1" />

      {/* Crimson Investigator Cape */}
      <path
        d="M24 79 Q50 69 76 79 L79 114 Q52 121 21 112 Z"
        fill="#9B2C2C"
        stroke="#221710"
        strokeWidth="1.6"
      />
      <circle cx="63" cy="83" r="4" fill="#D49A45" stroke="#221710" strokeWidth="1.2" />

      {/* Arms */}
      <path
        d={isHappy ? 'M25 84 Q10 70 14 56' : isAngry ? 'M25 84 Q11 88 15 72' : 'M25 84 Q17 98 19 112'}
        stroke="#4A3628"
        strokeWidth="8.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={isHappy ? 'M75 84 Q90 66 86 52' : isAngry ? 'M75 84 Q89 88 85 72' : 'M75 84 Q83 96 81 110'}
        stroke="#9B2C2C"
        strokeWidth="8.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx={isHappy ? 14 : isAngry ? 15 : 19}
        cy={isHappy ? 55 : isAngry ? 71 : 113}
        r="5"
        fill="#F0CAA4"
        stroke="#221710"
        strokeWidth="1.2"
      />
      <circle
        cx={isHappy ? 86 : isAngry ? 85 : 81}
        cy={isHappy ? 51 : isAngry ? 71 : 111}
        r="5"
        fill="#F0CAA4"
        stroke="#221710"
        strokeWidth="1.2"
      />

      {/* Victory Scroll or Magnifying Glass */}
      {mood === 'victory' ? (
        <g transform="translate(76, 34) rotate(14)">
          <rect x="0" y="0" width="18" height="24" rx="3" fill="#FFFDF8" stroke="#221710" strokeWidth="1.4" />
          <circle cx="9" cy="16" r="4.5" fill="#9B2C2C" />
          <line x1="4" y1="6" x2="14" y2="6" stroke="#8B7B6B" strokeWidth="1.5" />
          <line x1="4" y1="10" x2="14" y2="10" stroke="#8B7B6B" strokeWidth="1.5" />
        </g>
      ) : (
        <g transform={isHappy ? 'translate(4, 38) rotate(-25)' : 'translate(10, 104) rotate(25)'}>
          <circle cx="6" cy="6" r="5.5" fill="#DCECF5" stroke="#B47B2B" strokeWidth="1.8" />
          <line x1="10" y1="10" x2="15" y2="15" stroke="#4A3222" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Neck */}
      <rect x="44" y="64" width="12" height="14" rx="5" fill="#DBA882" />

      {/* Head & Ears */}
      <circle cx="28" cy="49" r="4.5" fill="#DBA882" stroke="#221710" strokeWidth="1.2" />
      <circle cx="72" cy="49" r="4.5" fill="#DBA882" stroke="#221710" strokeWidth="1.2" />
      <ellipse cx="50" cy="48" rx="20.5" ry="21.5" fill="#F0CAA4" stroke="#221710" strokeWidth="1.7" />
      <ellipse cx="37" cy="54" rx="3.8" ry="2" fill="#D97B66" opacity="0.28" />
      <ellipse cx="63" cy="54" rx="3.8" ry="2" fill="#D97B66" opacity="0.28" />

      {/* Golden/Blond Fringe & Detective Cap with Small Comic Wings */}
      <path d="M18 35 Q50 28 82 35" stroke="#221710" strokeWidth="4" strokeLinecap="round" />
      <path d="M31 33 Q35 14 50 14 Q65 14 69 33 Z" fill="#4B3728" stroke="#221710" strokeWidth="1.6" />
      <rect x="32" y="28" width="36" height="4.5" fill="#9B2C2C" />
      {/* Small white crest wings on cap sides */}
      <path d="M29 27 Q19 18 22 28 Q26 30 30 30 Z" fill="#FFFDF8" stroke="#221710" strokeWidth="1.2" />
      <path d="M71 27 Q81 18 78 28 Q74 30 70 30 Z" fill="#FFFDF8" stroke="#221710" strokeWidth="1.2" />

      {/* Eyes & Monocle */}
      <g className={isAngry ? '' : 'animate-witness-blink'}>
        <ellipse cx="42" cy="48" rx="3.2" ry="3.7" fill="#FFFFFF" />
        <ellipse cx="58" cy="48" rx="3.2" ry="3.7" fill="#FFFFFF" />
        <circle cx="42.5" cy="48" r="2" fill="#231914" />
        <circle cx="58.5" cy="48" r="2" fill="#231914" />
      </g>
      <circle cx="58" cy="48" r="6.5" fill="none" stroke="#B47B2B" strokeWidth="1.8" />
      <path d="M64.5 48 Q67 60 64 70" stroke="#B47B2B" strokeWidth="1.1" fill="none" />

      {/* Brows, Nose & Expressive Mustache */}
      <path d={browLeft} stroke="#5A4232" strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <path d={browRight} stroke="#5A4232" strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <path d="M49 48 Q52 53 48 54" stroke="#C99568" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d={mouth} stroke="#7B372B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path
        d="M36 57 Q44 51 50 56 Q56 51 64 57 Q56 61 50 58 Q44 61 36 57 Z"
        fill="#E0A948"
        stroke="#221710"
        strokeWidth="1.1"
      />
    </svg>
  );
};

/**
 * Gehilfe Magnus (broad, jovial companion in classic striped tunic carrying heavy scroll tablets).
 */
export const MagnusHelperSvg: React.FC<{ mood: HeroMood; className?: string }> = ({
  mood,
  className = 'w-24 h-36 sm:w-28 sm:h-40',
}) => {
  const isAngry = mood === 'angry' || mood === 'defeat';
  const isHappy = mood === 'happy' || mood === 'victory';

  const browLeft = isAngry ? 'M39 40 L51 44' : isHappy ? 'M39 39 Q45 35 51 39' : 'M39 41 Q45 38 51 41';
  const browRight = isAngry ? 'M71 40 L59 44' : isHappy ? 'M59 39 Q65 35 71 39' : 'M59 41 Q65 38 71 41';
  const mouth = isAngry
    ? 'M47 61 Q55 56 63 61'
    : isHappy
    ? 'M45 57 Q55 64 65 57'
    : 'M48 58 Q55 61 62 58';

  return (
    <svg
      viewBox="0 0 110 175"
      className={`${className} drop-shadow-[0_4px_6px_rgba(20,14,10,0.28)]`}
      aria-hidden="true"
    >
      {/* Shadow */}
      <ellipse cx="55" cy="166" rx="34" ry="6" fill="rgba(20,14,10,0.32)" />

      {/* Sturdy Legs & Sandals */}
      <rect x="38" y="138" width="12" height="24" rx="5" fill="#DFB990" />
      <rect x="60" y="138" width="12" height="24" rx="5" fill="#DFB990" />
      <path d="M35 159 H52 V166 H34 Z" fill="#4A3222" />
      <path d="M58 159 H76 V166 H58 Z" fill="#4A3222" />

      {/* Broad Tunic with Vertical Blue-Cream Stripes */}
      <path
        d="M21 82 Q55 68 89 82 L94 142 Q55 150 16 142 Z"
        fill="#F4EDE0"
        stroke="#221710"
        strokeWidth="1.8"
      />
      {/* Vertical stripes clipped visually to torso */}
      <path d="M29 82 L26 143 H35 L37 80 Z" fill="#2A548A" />
      <path d="M46 76 L45 145 H54 L54 75 Z" fill="#2A548A" />
      <path d="M64 76 L65 145 H74 L72 78 Z" fill="#2A548A" />
      <path d="M81 82 L84 143 H91 L87 82 Z" fill="#2A548A" />

      {/* Green/Gold Waist Sash & Bronze Buckle */}
      <path d="M18 110 Q55 117 92 110 L93 122 Q55 129 17 122 Z" fill="#2E6247" stroke="#221710" strokeWidth="1.5" />
      <circle cx="55" cy="119" r="6" fill="#D49A45" stroke="#221710" strokeWidth="1.3" />

      {/* Left Arm (free or waving) */}
      <path
        d={isHappy ? 'M21 86 Q6 66 13 50' : isAngry ? 'M21 86 Q7 86 12 68' : 'M21 86 Q12 104 16 120'}
        stroke="#DFB990"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx={isHappy ? 13 : isAngry ? 12 : 16}
        cy={isHappy ? 49 : isAngry ? 67 : 121}
        r="5.8"
        fill="#F5D8B8"
        stroke="#221710"
        strokeWidth="1.2"
      />

      {/* Heavy Stone Bureaucracy Tablet carried under right arm */}
      <g transform={isHappy ? 'translate(76, 52) rotate(-8)' : 'translate(75, 76) rotate(6)'}>
        <rect x="0" y="0" width="24" height="34" rx="4" fill="#CFC4B2" stroke="#221710" strokeWidth="1.6" />
        <line x1="5" y1="9" x2="19" y2="9" stroke="#7A6C5C" strokeWidth="1.8" />
        <line x1="5" y1="15" x2="17" y2="15" stroke="#7A6C5C" strokeWidth="1.8" />
        <line x1="5" y1="21" x2="19" y2="21" stroke="#7A6C5C" strokeWidth="1.8" />
        <text x="12" y="30" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#6A5A4C">
          SPQR
        </text>
      </g>
      <path
        d="M86 86 Q95 100 84 110"
        stroke="#DFB990"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="83" cy="110" r="5.5" fill="#F5D8B8" stroke="#221710" strokeWidth="1.2" />

      {/* Auburn Braids behind head */}
      <path d="M31 44 Q24 62 29 76 Q34 78 36 66 Z" fill="#B55422" stroke="#221710" strokeWidth="1.4" />
      <path d="M79 44 Q86 62 81 76 Q76 78 74 66 Z" fill="#B55422" stroke="#221710" strokeWidth="1.4" />

      {/* Neck & Round Cheerful Head */}
      <rect x="46" y="64" width="18" height="14" rx="6" fill="#DFB990" />
      <circle cx="32" cy="49" r="5" fill="#DFB990" stroke="#221710" strokeWidth="1.2" />
      <circle cx="78" cy="49" r="5" fill="#DFB990" stroke="#221710" strokeWidth="1.2" />
      <ellipse cx="55" cy="47" rx="22.5" ry="22" fill="#F5D8B8" stroke="#221710" strokeWidth="1.7" />
      <ellipse cx="40" cy="53" rx="4.2" ry="2.2" fill="#D97B66" opacity="0.3" />
      <ellipse cx="70" cy="53" rx="4.2" ry="2.2" fill="#D97B66" opacity="0.3" />

      {/* Auburn Hair & Tiny Bronze Cap */}
      <path
        d="M32 42 Q34 22 55 22 Q76 22 78 42 Q66 32 55 33 Q44 32 32 42 Z"
        fill="#B55422"
        stroke="#221710"
        strokeWidth="1.5"
      />
      <path d="M43 24 Q55 13 67 24 Z" fill="#D49A45" stroke="#221710" strokeWidth="1.4" />

      {/* Eyes */}
      <g className={isAngry ? '' : 'animate-witness-blink'}>
        <ellipse cx="46" cy="47" rx="3.2" ry="3.7" fill="#FFFFFF" />
        <ellipse cx="64" cy="47" rx="3.2" ry="3.7" fill="#FFFFFF" />
        <circle cx="46.5" cy="47.2" r="2" fill="#231914" />
        <circle cx="64.5" cy="47.2" r="2" fill="#231914" />
      </g>

      {/* Brows, Bulbous Friendly Nose & Big Auburn Mustache */}
      <path d={browLeft} stroke="#8B3B16" strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <path d={browRight} stroke="#8B3B16" strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <ellipse cx="55" cy="51.5" rx="4.2" ry="3.2" fill="#E6AE89" stroke="#C98A63" strokeWidth="1" />
      <path d={mouth} stroke="#7B372B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path
        d="M39 56 Q48 51 55 55 Q62 51 71 56 Q62 60 55 57 Q48 60 39 56 Z"
        fill="#B55422"
        stroke="#221710"
        strokeWidth="1.1"
      />
    </svg>
  );
};

interface BureaucracyStageProps {
  floor: number;
  lastMove: 'none' | 'up' | 'down' | 'grace';
  hasFirstQuestionShield?: boolean;
  curseSeed: number;
  passierscheinCount: number;
  modeLabel: string;
  children?: React.ReactNode;
}

export const BureaucracyStage: React.FC<BureaucracyStageProps> = ({
  floor,
  lastMove,
  hasFirstQuestionShield = false,
  curseSeed,
  passierscheinCount,
  modeLabel,
  children,
}) => {
  const mood: HeroMood =
    floor >= 10
      ? 'victory'
      : floor <= 0
      ? 'defeat'
      : lastMove === 'up'
      ? 'happy'
      : lastMove === 'down' || lastMove === 'grace'
      ? 'angry'
      : 'neutral';

  const curseText = COMIC_CURSES[curseSeed % COMIC_CURSES.length];
  const romanFloor = ROMAN_NUMERALS[Math.max(0, Math.min(10, floor))];

  return (
    <div className="space-y-4">
      {/* Administrative Corridor Scene */}
      <div className="relative rounded-2xl overflow-hidden border border-[#C9B99F] dark:border-[#493D32] bg-[#EFE3CC] dark:bg-[#231D17] shadow-sm">
        {/* Top Floor Tower Bar (Etage 0 -> 10) */}
        <div className="relative z-20 px-3 sm:px-4 pt-3 pb-2 border-b border-[#D8C8AE] dark:border-[#3A312A] bg-[#F7EFE0]/90 dark:bg-[#1C1714]/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-[#9B2C2C] dark:text-[#E06C65]">
              Amt für Passierscheine
            </span>
            <span aria-hidden="true" className="text-[#8B7B6B]">
              ·
            </span>
            <span className="text-[#4A3D33] dark:text-[#D5C9BA] font-medium">
              Etage <strong className="font-mono-tab">{floor}</strong>/10 ({romanFloor})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6A5A4C] dark:text-[#B9AA98]">
            <span>{modeLabel}</span>
            {hasFirstQuestionShield && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#1E5B3A] dark:text-[#7CD3A2]">
                  Erstversuch-Schutz aktiv
                </span>
              </>
            )}
            {passierscheinCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#1E5B3A] dark:text-[#7CD3A2]">
                  <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="font-mono-tab">{passierscheinCount}×</span> Passierschein
                </span>
              </>
            )}
          </div>

          {/* 0–10 Stepped Floor Track */}
          <div
            className="w-full flex items-center gap-1 pt-1"
            role="progressbar"
            aria-label="Aktuelle Etage im Amt für Passierscheine"
            aria-valuenow={floor}
            aria-valuemin={0}
            aria-valuemax={10}
          >
            {Array.from({ length: 11 }, (_, f) => {
              const isCurrent = f === floor;
              const isPassed = f > 0 && f < floor;
              const isZero = f === 0;
              const isGoal = f === 10;
              return (
                <div
                  key={f}
                  className={`flex-1 h-6 rounded-md border text-[11px] font-mono-tab font-bold flex items-center justify-center transition-all ${
                    isCurrent
                      ? isZero
                        ? 'bg-[#9B2C2C] border-[#7D2020] text-white scale-105 shadow-sm'
                        : isGoal
                        ? 'bg-[#1E5B3A] border-[#154229] text-white scale-105 shadow-sm'
                        : 'bg-[#9B2C2C] border-[#7D2020] text-white scale-105 shadow-sm'
                      : isPassed
                      ? 'bg-[#D8EBD9] dark:bg-[#1E3B2B] border-[#266B47]/40 text-[#1E5B3A] dark:text-[#7CD3A2]'
                      : isZero
                      ? 'bg-[#FBEAEA]/80 dark:bg-[#3A1B1A]/70 border-[#9B2C2C]/35 text-[#9B2C2C] dark:text-[#F2918B]'
                      : isGoal
                      ? 'bg-[#FBF1DA] dark:bg-[#382C18] border-[#C89342]/60 text-[#8A5A17] dark:text-[#F0B465]'
                      : 'bg-[#EFE7D8] dark:bg-[#2A221C] border-[#D5C6AF] dark:border-[#3D332B] text-[#6A5A4C] dark:text-[#B9AA98]'
                  }`}
                  title={
                    isZero
                      ? 'Etage 0: Rauswurf (Game Over)'
                      : isGoal
                      ? 'Etage 10: Passierschein!'
                      : `Etage ${f}`
                  }
                >
                  {isZero ? '0!' : isGoal ? '10★' : f}
                </div>
              );
            })}
          </div>
        </div>

        {/* Illustrated Roman Corridor Backdrop + Duo Sprites */}
        <div className="relative px-4 pt-4 pb-3 min-h-[195px] sm:min-h-[215px] flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
          {/* Background Roman Columns & Staircase SVG */}
          <svg
            viewBox="0 0 800 220"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-80 dark:opacity-45"
            aria-hidden="true"
          >
            {/* Plaster wall */}
            <rect width="800" height="162" fill="#F2E4CA" />
            <rect width="800" height="16" fill="#DEC8A4" />
            {/* Wall wainscoting */}
            <rect y="128" width="800" height="34" fill="#DFCEB0" />
            <line x1="0" y1="128" x2="800" y2="128" stroke="#B79D78" strokeWidth="2" />
            {/* Marble floor */}
            <rect y="162" width="800" height="58" fill="#D9C39F" />
            <line x1="0" y1="162" x2="800" y2="162" stroke="#9C835E" strokeWidth="2" />
            {[80, 180, 280, 380, 480, 580, 680].map((x) => (
              <line key={x} x1={x} y1="162" x2={x - 36} y2="220" stroke="#B99F79" strokeWidth="1.5" />
            ))}
            {/* Roman Marble Columns */}
            {[46, 724].map((cx) => (
              <g key={cx}>
                <rect x={cx} y="16" width="30" height="146" fill="#E8DAC0" stroke="#B49B76" strokeWidth="1.5" />
                <rect x={cx - 5} y="14" width="40" height="10" rx="2" fill="#D5C1A0" stroke="#9F8662" strokeWidth="1.3" />
                <rect x={cx - 5} y="152" width="40" height="10" rx="2" fill="#D5C1A0" stroke="#9F8662" strokeWidth="1.3" />
                <line x1={cx + 9} y1="26" x2={cx + 9} y2="150" stroke="#CDB896" strokeWidth="1.2" />
                <line x1={cx + 21} y1="26" x2={cx + 21} y2="150" stroke="#CDB896" strokeWidth="1.2" />
              </g>
            ))}
            {/* Wall plaque */}
            <rect x="315" y="24" width="170" height="28" rx="4" fill="#FFFDF8" stroke="#B49B76" strokeWidth="1.6" />
            <text
              x="400"
              y="43"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#6A5A4C"
              letterSpacing="1.5"
            >
              {floor === 0
                ? 'AUSGANG · ETAGE 0'
                : floor === 10
                ? 'SCHALTER X · PASSIERSCHEIN'
                : `TABULARIUM · ETAGE ${romanFloor}`}
            </text>
            {/* Stairs hint on left (down) and right (up) */}
            <g opacity="0.55">
              <path d="M92 162 V146 H112 V132 H132 V162 Z" fill="#CBB591" stroke="#9F8662" strokeWidth="1.2" />
              <path d="M708 162 V146 H688 V132 H668 V162 Z" fill="#CBB591" stroke="#9F8662" strokeWidth="1.2" />
            </g>
          </svg>

          {/* Left: The Duo Sprites + Comic Speech Bubble */}
          <div className="relative z-10 flex flex-col items-center sm:items-start shrink-0 sm:pl-4">
            {/* Comic Speech / Swear Bubble */}
            {(lastMove === 'down' || lastMove === 'grace') && (
              <div
                role="status"
                className="mb-1 relative rounded-2xl border-2 border-[#241C16] bg-[#FFF2D6] px-3.5 py-1.5 shadow-md animate-comic-shake"
              >
                <span className="font-display font-black text-base sm:text-lg tracking-wider text-[#9B2C2C]">
                  {curseText}
                </span>
                <span className="ml-2 text-xs font-bold text-[#241C16]">
                  {lastMove === 'grace'
                    ? 'Anlauf-Schutz: Du bleibst auf Etage 1!'
                    : floor <= 0
                    ? 'Rausgeflogen!'
                    : '−1 Etage!'}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-10 w-3.5 h-3.5 rotate-45 bg-[#FFF2D6] border-r-2 border-b-2 border-[#241C16]"
                />
              </div>
            )}

            {lastMove === 'up' && floor < 10 && (
              <div
                role="status"
                className="mb-1 relative rounded-2xl border-2 border-[#1E5B3A] bg-[#EAF5EE] px-3.5 py-1.5 shadow-md animate-climb-hop"
              >
                <span className="font-bold text-xs sm:text-sm text-[#1E5B3A]">
                  Treffer! Auf nach Etage {floor}! ↑
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-10 w-3.5 h-3.5 rotate-45 bg-[#EAF5EE] border-r-2 border-b-2 border-[#1E5B3A]"
                />
              </div>
            )}

            <div
              key={`${floor}-${lastMove}`}
              className={`flex items-end -space-x-3 ${
                lastMove === 'down' || lastMove === 'grace'
                  ? 'animate-comic-shake'
                  : lastMove === 'up'
                  ? 'animate-climb-hop'
                  : 'animate-witness-breathe'
              }`}
            >
              <CorneliusWalkerSvg mood={mood} />
              <MagnusHelperSvg mood={mood} />
            </div>
          </div>

          {/* Right: Question / Passierschein / Game Over Prompt Card */}
          <div className="relative z-10 flex-1 w-full min-w-0 sm:pr-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface PassierscheinBannerProps {
  floor: 0 | 10;
  passierscheinCount: number;
  onRestart: () => void;
}

export const PassierscheinOutcomeCard: React.FC<PassierscheinBannerProps> = ({
  floor,
  passierscheinCount,
  onRestart,
}) => {
  if (floor === 10) {
    return (
      <div className="rounded-2xl border-2 border-[#C89342] bg-[#FFFDF5] dark:bg-[#262019] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#9B2C2C] text-[#FFFDF8] flex items-center justify-center shrink-0 shadow-sm border border-[#C89342]">
            <Award className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#9B2C2C] dark:text-[#E06C65]">
              Etage 10 erreicht · Amtlich beglaubigt
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
              Passierschein S-XXXVIII ausgestellt!
            </h3>
            <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA] mt-0.5">
              Cornelius & Magnus haben alle 10 Etagen gemeistert ({passierscheinCount}. Passierschein).
              Dein Lernstand und deine Karriere-Sterne bleiben gespeichert.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E5B3A] hover:bg-[#17462C] text-white text-sm font-semibold shrink-0 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Nächsten Passierschein holen</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#9B2C2C] bg-[#FBEAEA] dark:bg-[#3A1B1A]/75 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#9B2C2C] dark:text-[#F2918B]">
          Etage 0 · Tür verschlossen
        </div>
        <h3 className="font-display text-lg sm:text-xl font-bold text-[#241C16] dark:text-[#F2ECE1]">
          Aus dem Amt gerutscht – Game Over!
        </h3>
        <p className="text-sm text-[#4A3D33] dark:text-[#D5C9BA] mt-0.5">
          Keine Sorge: Deine gelernten Vokabeln, Stolpersteine und Karriere-Sterne bleiben komplett erhalten.
        </p>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9B2C2C] hover:bg-[#822424] text-white text-sm font-semibold shrink-0 cursor-pointer inline-flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        <span>Neuer Anlauf ab Etage 1</span>
      </button>
    </div>
  );
};

interface RomanDoorButtonProps {
  doorIndex: number;
  label: string;
  italic?: boolean;
  disabled: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  revealed: boolean;
  onClick: () => void;
}

export const RomanDoorButton: React.FC<RomanDoorButtonProps> = ({
  doorIndex,
  label,
  italic = false,
  disabled,
  isSelected,
  isCorrect,
  revealed,
  onClick,
}) => {
  const numeral = DOOR_NUMERALS[doorIndex] ?? 'I';

  let cardStyle =
    'border-[#B9A483] dark:border-[#4A3D31] bg-[#FBF6EA] dark:bg-[#191512] text-[#241C16] dark:text-[#F2ECE1] hover:border-[#9B2C2C] hover:-translate-y-0.5 shadow-sm';
  let doorWoodColor = 'bg-[#B9864C] border-[#7A542A] text-[#FFFDF8]';

  if (revealed) {
    if (isCorrect) {
      cardStyle =
        'border-[#266B47] bg-[#EAF5EE] dark:bg-[#193325] text-[#1E5B3A] dark:text-[#7CD3A2]';
      doorWoodColor = 'bg-[#266B47] border-[#1A4D33] text-white';
    } else if (isSelected) {
      cardStyle =
        'border-[#9B2C2C] bg-[#FBEAEA] dark:bg-[#3A1B1A] text-[#9B2C2C] dark:text-[#F2918B]';
      doorWoodColor = 'bg-[#9B2C2C] border-[#6E1B1B] text-white';
    } else {
      cardStyle =
        'border-[#DED4C3] dark:border-[#3A312A] bg-[#F7F3EA]/40 dark:bg-[#161311]/60 text-[#6A5A4C] dark:text-[#8B7B6B] opacity-70';
      doorWoodColor = 'bg-[#9E8B73] border-[#6E5F4D] text-[#FFFDF8]';
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[64px] p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer disabled:cursor-default ${cardStyle}`}
    >
      {/* Miniature Arched Roman Door Icon */}
      <span
        aria-hidden="true"
        className={`relative w-10 h-12 rounded-t-full rounded-b-sm border-2 shrink-0 flex flex-col items-center justify-center shadow-inner ${doorWoodColor}`}
      >
        <span className="text-[11px] font-display font-bold leading-none">{numeral}</span>
        {/* Brass door ring */}
        <span className="mt-1.5 w-2 h-2 rounded-full border border-[#F8DF9C] bg-[#D49A45]" />
      </span>

      <span className={`flex-1 min-w-0 font-medium ${italic ? 'font-display italic text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
        {label}
      </span>

      {revealed && isCorrect && (
        <CheckCircle2 className="w-5 h-5 shrink-0 text-[#1E5B3A] dark:text-[#7CD3A2]" aria-hidden="true" />
      )}
      {revealed && isSelected && !isCorrect && (
        <XCircle className="w-5 h-5 shrink-0 text-[#9B2C2C] dark:text-[#F2918B]" aria-hidden="true" />
      )}
    </button>
  );
};
