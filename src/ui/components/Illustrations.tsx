import React from 'react';
import { RoomThemeId, ScenarioProp } from '../../core/types';

export type WitnessMark = '' | 'true' | 'false';

interface CharacterVisual {
  id: string;
  name: string;
  roleDe: string;
  skin: string;
  skinShadow: string;
  hair: string;
  tunic: string;
  tunicDark: string;
  cloak: string;
  accent: string;
}

export const CHARACTERS: Record<string, CharacterVisual> = {
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    roleDe: 'Gelehrter',
    skin: '#F3D1B0',
    skinShadow: '#DEB188',
    hair: '#3E2B1E',
    tunic: '#E8DFCF',
    tunicDark: '#CFC1AA',
    cloak: '#2A4B7C',
    accent: '#C89342',
  },
  gaius: {
    id: 'gaius',
    name: 'Gaius',
    roleDe: 'Läufer',
    skin: '#E6B98E',
    skinShadow: '#C99568',
    hair: '#241B15',
    tunic: '#EFE5D5',
    tunicDark: '#D2C2AA',
    cloak: '#9B2C2C',
    accent: '#D49A45',
  },
  lucius: {
    id: 'lucius',
    name: 'Lucius',
    roleDe: 'Botenjunge',
    skin: '#F5D8B8',
    skinShadow: '#DFB990',
    hair: '#A95C24',
    tunic: '#EAE2D2',
    tunicDark: '#CEC2AD',
    cloak: '#2E6247',
    accent: '#B77E33',
  },
  claudia: {
    id: 'claudia',
    name: 'Claudia',
    roleDe: 'Dichterin',
    skin: '#F2CFB0',
    skinShadow: '#DBA882',
    hair: '#4D2D1B',
    tunic: '#F4EAE1',
    tunicDark: '#DCCAC0',
    cloak: '#6F3360',
    accent: '#D29B3E',
  },
  cornelia: {
    id: 'cornelia',
    name: 'Cornelia',
    roleDe: 'Händlerin',
    skin: '#D69F71',
    skinShadow: '#B97E50',
    hair: '#1C1613',
    tunic: '#F2E7D8',
    tunicDark: '#D6C5AF',
    cloak: '#B86A24',
    accent: '#8D2828',
  },
};

export const WitnessFigureSvg: React.FC<{
  speakerId: string;
  selected: boolean;
  mark: WitnessMark;
}> = ({ speakerId, selected, mark }) => {
  const c = CHARACTERS[speakerId] ?? CHARACTERS.marcus;

  // Expressive eyebrow & mouth angles based on selected/mark state
  const browLeft =
    mark === 'false' ? 'M35 41 L45 44' : selected ? 'M35 42 Q40 39 45 42' : 'M35 43 Q40 41 45 43';
  const browRight =
    mark === 'false' ? 'M65 41 L55 44' : selected ? 'M55 42 Q60 39 65 42' : 'M55 43 Q60 41 65 43';
  const mouth =
    mark === 'false'
      ? 'M43 60 Q50 56 57 60'
      : selected
      ? 'M43 57 Q50 63 57 57'
      : 'M44 58 Q50 61 56 58';

  return (
    <svg
      viewBox="0 0 100 170"
      className="w-full h-full drop-shadow-[0_4px_6px_rgba(20,14,10,0.28)]"
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <ellipse cx="50" cy="162" rx="28" ry="5.5" fill="rgba(20,14,10,0.32)" />

      {/* Sandals & Legs */}
      <rect x="37" y="132" width="9" height="27" rx="4" fill={c.skinShadow} />
      <rect x="54" y="132" width="9" height="27" rx="4" fill={c.skinShadow} />
      <path d="M35 156 H48 V162 H34 Z" rx="2" fill="#4A3222" />
      <path d="M52 156 H66 V162 H52 Z" rx="2" fill="#4A3222" />

      {/* Tunic */}
      <path d="M27 78 Q50 68 73 78 L77 136 Q50 140 23 136 Z" fill={c.tunic} stroke="#2A1E16" strokeWidth="1.6" />
      <path d="M27 78 L36 136 H23 Z" fill={c.tunicDark} opacity="0.55" />

      {/* Cloak / Toga Drape */}
      <path
        d={
          speakerId === 'claudia' || speakerId === 'cornelia'
            ? 'M24 76 Q50 64 76 76 L80 128 Q54 122 20 128 Z'
            : 'M24 75 Q50 66 76 75 L73 116 Q48 124 25 108 Z'
        }
        fill={c.cloak}
        stroke="#2A1E16"
        strokeWidth="1.6"
      />
      {/* Gold fibula clasp */}
      <circle cx="64" cy="80" r="4" fill={c.accent} stroke="#2A1E16" strokeWidth="1.2" />

      {/* Arms & Hands */}
      <path
        d={selected ? 'M25 82 Q13 92 17 104' : 'M25 82 Q18 98 20 116'}
        stroke={c.tunicDark}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={selected ? 'M75 82 Q88 74 85 64' : 'M75 82 Q82 98 80 116'}
        stroke={c.cloak}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={selected ? 17 : 20} cy={selected ? 105 : 117} r="5.2" fill={c.skin} stroke="#2A1E16" strokeWidth="1.2" />
      <circle cx={selected ? 85 : 80} cy={selected ? 63 : 117} r="5.2" fill={c.skin} stroke="#2A1E16" strokeWidth="1.2" />

      {/* Scroll / prop for Marcus */}
      {speakerId === 'marcus' && (
        <g transform={selected ? 'translate(8, 92) rotate(-18)' : 'translate(12, 108) rotate(-10)'}>
          <rect x="0" y="0" width="16" height="6" rx="2.5" fill="#F7ECD6" stroke="#2A1E16" strokeWidth="1.2" />
        </g>
      )}

      {/* Neck */}
      <rect x="44" y="62" width="12" height="14" rx="5" fill={c.skinShadow} />

      {/* Head & Ears */}
      <circle cx="28" cy="48" r="4.5" fill={c.skinShadow} stroke="#2A1E16" strokeWidth="1.2" />
      <circle cx="72" cy="48" r="4.5" fill={c.skinShadow} stroke="#2A1E16" strokeWidth="1.2" />
      <ellipse cx="50" cy="46" rx="21" ry="23" fill={c.skin} stroke="#2A1E16" strokeWidth="1.7" />
      {/* Subtle cheek warmth */}
      <ellipse cx="37" cy="53" rx="4" ry="2.2" fill="#D97B66" opacity="0.28" />
      <ellipse cx="63" cy="53" rx="4" ry="2.2" fill="#D97B66" opacity="0.28" />

      {/* Hair styles per character */}
      {speakerId === 'marcus' && (
        <path d="M29 42 Q32 20 50 20 Q68 20 71 42 Q63 29 50 30 Q37 29 29 42 Z" fill={c.hair} stroke="#2A1E16" strokeWidth="1.4" />
      )}
      {speakerId === 'gaius' && (
        <path d="M28 43 Q28 18 50 18 Q72 18 72 43 Q65 30 56 32 Q50 25 43 32 Q34 30 28 43 Z" fill={c.hair} stroke="#2A1E16" strokeWidth="1.4" />
      )}
      {speakerId === 'lucius' && (
        <path d="M28 44 Q26 22 44 19 Q56 14 68 24 Q74 32 71 44 Q61 30 48 31 Q36 30 28 44 Z" fill={c.hair} stroke="#2A1E16" strokeWidth="1.4" />
      )}
      {speakerId === 'claudia' && (
        <>
          <circle cx="50" cy="18" r="10" fill={c.hair} stroke="#2A1E16" strokeWidth="1.4" />
          <path d="M29 45 Q28 21 50 21 Q72 21 71 45 Q61 30 50 31 Q39 30 29 45 Z" fill={c.hair} stroke="#2A1E16" strokeWidth="1.4" />
          <path d="M36 22 Q50 16 64 22" stroke={c.accent} strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </>
      )}
      {speakerId === 'cornelia' && (
        <>
          <path d="M28 48 Q26 19 50 19 Q74 19 72 48 Q64 31 50 32 Q36 31 28 48 Z" fill={c.hair} stroke="#2A1E16" strokeWidth="1.4" />
          <rect x="30" y="27" width="40" height="5" rx="2.5" fill={c.accent} stroke="#2A1E16" strokeWidth="1.1" />
        </>
      )}

      {/* Eyes with subtle blink */}
      <g className="animate-witness-blink">
        <ellipse cx="41" cy="48" rx="3.2" ry="3.8" fill="#FFFFFF" />
        <ellipse cx="59" cy="48" rx="3.2" ry="3.8" fill="#FFFFFF" />
        <circle cx="41.5" cy="48.2" r="2.1" fill="#231914" />
        <circle cx="59.5" cy="48.2" r="2.1" fill="#231914" />
        <circle cx="42.2" cy="47.3" r="0.7" fill="#FFFFFF" />
        <circle cx="60.2" cy="47.3" r="0.7" fill="#FFFFFF" />
      </g>

      {/* Spectacles for Marcus */}
      {speakerId === 'marcus' && (
        <g stroke="#3A2B1F" strokeWidth="1.5" fill="none">
          <circle cx="41" cy="48" r="6.2" />
          <circle cx="59" cy="48" r="6.2" />
          <path d="M47.2 48 H52.8" />
        </g>
      )}

      {/* Brows, Nose & Mouth */}
      <path d={browLeft} stroke={c.hair} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d={browRight} stroke={c.hair} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M49 48 Q51 53 48 54" stroke={c.skinShadow} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d={mouth} stroke="#7B372B" strokeWidth="2.1" strokeLinecap="round" fill="none" />

      {/* Mustache for Marcus */}
      {speakerId === 'marcus' && (
        <path d="M41 56 Q46 53 50 56 Q54 53 59 56 Q50 58 41 56 Z" fill={c.hair} />
      )}
    </svg>
  );
};

export const CorneliusAvatarSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#EFE5D2" stroke="#B47B2B" strokeWidth="3" />
    {/* Coat & cravat */}
    <path d="M22 92 Q50 72 78 92 Z" fill="#3B2B20" />
    <path d="M44 76 L50 88 L56 76 Z" fill="#9B2C2C" />
    {/* Head */}
    <circle cx="50" cy="50" r="20" fill="#F0CAA4" stroke="#2A1E16" strokeWidth="1.6" />
    {/* Detective brimmed hat */}
    <path d="M22 36 Q50 31 78 36" stroke="#2A1E16" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M33 34 Q36 16 50 16 Q64 16 67 34 Z" fill="#4B3728" stroke="#2A1E16" strokeWidth="1.6" />
    <rect x="34" y="29" width="32" height="4" fill="#9B2C2C" />
    {/* Eyes & Monocle */}
    <circle cx="43" cy="48" r="2.3" fill="#231914" />
    <circle cx="57" cy="48" r="2.3" fill="#231914" />
    <circle cx="57" cy="48" r="6.5" fill="none" stroke="#B47B2B" strokeWidth="1.8" />
    <path d="M63.5 48 Q66 60 63 72" stroke="#B47B2B" strokeWidth="1.1" fill="none" />
    {/* Expressive mustache */}
    <path d="M37 58 Q44 52 50 57 Q56 52 63 58 Q55 61 50 58 Q45 61 37 58 Z" fill="#5A4232" />
  </svg>
);

export const RoomBackdropSvg: React.FC<{
  room: RoomThemeId;
  props?: ScenarioProp[];
  onPropClick?: (prop: ScenarioProp) => void;
}> = ({ room }) => {
  const palettes: Record<
    RoomThemeId,
    { wall: string; wallTop: string; dado: string; floor: string; floorDark: string; trim: string; accent: string }
  > = {
    atrium: {
      wall: '#F2E5CB',
      wallTop: '#DFC79F',
      dado: '#8D3B2B',
      floor: '#B48860',
      floorDark: '#8D6340',
      trim: '#7C3626',
      accent: '#5B95B2',
    },
    villa: {
      wall: '#F4E8D4',
      wallTop: '#E2CCA9',
      dado: '#6F3A2C',
      floor: '#9A6B47',
      floorDark: '#734B2E',
      trim: '#8F422D',
      accent: '#C89342',
    },
    hortus: {
      wall: '#DCE9DF',
      wallTop: '#A8CBD4',
      dado: '#847560',
      floor: '#708458',
      floorDark: '#556741',
      trim: '#6D5D4B',
      accent: '#3E7A56',
    },
    forum: {
      wall: '#F0E3CC',
      wallTop: '#B9D1DF',
      dado: '#8B6B52',
      floor: '#B5A690',
      floorDark: '#8E7F6B',
      trim: '#7C4B38',
      accent: '#9B2C2C',
    },
    officina: {
      wall: '#E8D6BC',
      wallTop: '#CFAF86',
      dado: '#6B4730',
      floor: '#8B6244',
      floorDark: '#67442B',
      trim: '#563622',
      accent: '#C96C2B',
    },
    templum: {
      wall: '#EDE7DC',
      wallTop: '#A9BDD2',
      dado: '#8B7D6B',
      floor: '#A8A094',
      floorDark: '#827A6E',
      trim: '#B47B2B',
      accent: '#2A4B7C',
    },
  };
  const p = palettes[room];

  return (
    <svg
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`wall-${room}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.wallTop} />
          <stop offset="100%" stopColor={p.wall} />
        </linearGradient>
        <linearGradient id={`floor-${room}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.floor} />
          <stop offset="100%" stopColor={p.floorDark} />
        </linearGradient>
        <radialGradient id={`sun-${room}`} cx="50%" cy="28%" r="55%">
          <stop offset="0%" stopColor="rgba(255,248,224,0.55)" />
          <stop offset="100%" stopColor="rgba(255,248,224,0)" />
        </radialGradient>
        <linearGradient id={`beam-${room}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="rgba(255,250,228,0.34)" />
          <stop offset="100%" stopColor="rgba(255,250,228,0)" />
        </linearGradient>
      </defs>

      {/* Base Wall & Atmospheric Glow */}
      <rect x="0" y="0" width="800" height="284" fill={`url(#wall-${room})`} />
      <rect x="0" y="0" width="800" height="284" fill={`url(#sun-${room})`} />

      {/* Decorative Upper Cornice & Wainscoting Dado */}
      <rect x="0" y="0" width="800" height="16" fill={p.trim} opacity="0.28" />
      <rect x="0" y="16" width="800" height="4" fill="rgba(255,255,255,0.28)" />
      {room !== 'hortus' && (
        <>
          <rect x="0" y="216" width="800" height="68" fill={p.dado} opacity="0.22" />
          <rect x="0" y="214" width="800" height="4" fill={p.trim} opacity="0.35" />
          {/* Pompeian Wall Fresco Frames */}
          <rect x="114" y="64" width="136" height="128" rx="4" fill="rgba(255,252,244,0.22)" stroke={p.trim} strokeWidth="1.8" strokeOpacity="0.35" />
          <rect x="122" y="72" width="120" height="112" rx="2" fill="none" stroke={p.accent} strokeWidth="1" strokeOpacity="0.35" />
          <rect x="550" y="64" width="136" height="128" rx="4" fill="rgba(255,252,244,0.22)" stroke={p.trim} strokeWidth="1.8" strokeOpacity="0.35" />
          <rect x="558" y="72" width="120" height="112" rx="2" fill="none" stroke={p.accent} strokeWidth="1" strokeOpacity="0.35" />
        </>
      )}

      {/* Floor Surface & Mosaic Border */}
      <rect x="0" y="284" width="800" height="136" fill={`url(#floor-${room})`} />
      <rect x="0" y="282" width="800" height="7" fill="rgba(28,18,10,0.3)" />
      <rect x="0" y="291" width="800" height="5" fill="rgba(255,244,220,0.2)" />

      {/* Floor Perspective Tiles */}
      <g stroke="rgba(255,248,235,0.2)" strokeWidth="1.4">
        <line x1="80" y1="289" x2="-40" y2="420" />
        <line x1="200" y1="289" x2="115" y2="420" />
        <line x1="305" y1="289" x2="265" y2="420" />
        <line x1="400" y1="289" x2="400" y2="420" />
        <line x1="495" y1="289" x2="535" y2="420" />
        <line x1="600" y1="289" x2="685" y2="420" />
        <line x1="720" y1="289" x2="840" y2="420" />
        <line x1="0" y1="322" x2="800" y2="322" />
        <line x1="0" y1="362" x2="800" y2="362" />
        <line x1="0" y1="405" x2="800" y2="405" />
      </g>

      {/* Fluted Classical Pilasters (Left & Right Framing) */}
      {[34, 722].map((xPos, idx) => (
        <g key={idx}>
          <rect x={xPos} y="30" width="44" height="252" fill="#F5EEE0" fillOpacity="0.58" stroke={p.trim} strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1={xPos + 11} y1="36" x2={xPos + 11} y2="274" stroke={p.trim} strokeWidth="1" strokeOpacity="0.28" />
          <line x1={xPos + 22} y1="36" x2={xPos + 22} y2="274" stroke={p.trim} strokeWidth="1" strokeOpacity="0.28" />
          <line x1={xPos + 33} y1="36" x2={xPos + 33} y2="274" stroke={p.trim} strokeWidth="1" strokeOpacity="0.28" />
          <rect x={xPos - 8} y="22" width="60" height="14" rx="3" fill={p.trim} opacity="0.65" />
          <rect x={xPos - 6} y="272" width="56" height="12" rx="2" fill={p.trim} opacity="0.65" />
        </g>
      ))}

      {/* Room-Specific Rich Painted Details */}
      {room === 'atrium' && (
        <g>
          {/* Sunlight Beam from Window */}
          <polygon points="315,183 485,183 590,415 245,415" fill={`url(#beam-${room})`} />

          {/* Window with Cypress Hill Landscape Outside */}
          <rect x="310" y="42" width="180" height="142" rx="6" fill="#C9E2EE" stroke="#5E3A21" strokeWidth="8" />
          <path d="M314 152 Q365 126 410 144 Q455 122 486 146 V180 H314 Z" fill="#89A978" opacity="0.7" />
          <ellipse cx="445" cy="120" rx="10" ry="30" fill="#4C6F47" opacity="0.75" />
          <line x1="400" y1="42" x2="400" y2="184" stroke="#5E3A21" strokeWidth="5" />
          <line x1="310" y1="113" x2="490" y2="113" stroke="#5E3A21" strokeWidth="5" />

          {/* Broken Glass Hole & Cracks */}
          <polygon points="362,88 396,72 422,106 388,136 350,114" fill="#213545" opacity="0.58" />
          <path d="M362 88 L334 68 M396 72 L420 52 M422 106 L462 124 M388 136 L396 172" stroke="#1E2B36" strokeWidth="2.4" />
          <polygon points="354,114 366,110 361,126" fill="#EDF8FC" opacity="0.85" />
          <polygon points="414,94 426,90 420,104" fill="#EDF8FC" opacity="0.85" />

          {/* Potted Terracotta Planters */}
          {[148, 652].map((cx, i) => (
            <g key={i}>
              <path d={`M${cx - 18} 252 H${cx + 18} L${cx + 13} 284 H${cx - 13} Z`} fill="#B55B37" stroke="#5E331E" strokeWidth="1.5" />
              <ellipse cx={cx} cy="252" rx="19" ry="4.5" fill="#9E4B2B" />
              <path d={`M${cx} 250 Q${cx - 16} 225 ${cx - 20} 214 Q${cx - 6} 224 ${cx} 245 Q${cx + 12} 220 ${cx + 22} 212 Q${cx + 14} 230 ${cx} 250`} fill="#3E6E46" />
              <path d={`M${cx} 248 Q${cx - 4} 216 ${cx} 202 Q${cx + 6} 218 ${cx} 248`} fill="#4F8657" />
            </g>
          ))}

          {/* Mosaic Rug & Glass Shards on Floor */}
          <polygon points="295,305 505,305 545,358 255,358" fill="#8C3B2B" opacity="0.28" stroke="#C89342" strokeWidth="2" strokeOpacity="0.45" />
          <polygon points="384,308 398,315 379,320" fill="#D5EFF8" stroke="#7EB4C9" strokeWidth="1" />
          <polygon points="416,314 432,309 425,325" fill="#D5EFF8" stroke="#7EB4C9" strokeWidth="1" />
          <polygon points="360,326 370,322 367,332" fill="#EDF9FD" />
        </g>
      )}

      {room === 'villa' && (
        <g>
          {/* Arched Villa Terrace Window */}
          <path d="M325 178 V94 A75 75 0 0 1 475 94 V178 Z" fill="#C4DCE6" stroke="#734527" strokeWidth="7" />
          <path d="M330 156 Q378 134 420 148 Q452 135 470 154 V176 H330 Z" fill="#8CA874" opacity="0.72" />
          <polygon points="325,178 475,178 555,400 245,400" fill={`url(#beam-${room})`} />

          {/* Draped Velvet Curtains */}
          <path d="M312 36 Q338 92 318 182 L302 182 Q308 100 298 36 Z" fill="#8D2C2C" opacity="0.88" />
          <path d="M488 36 Q462 92 482 182 L498 182 Q492 100 502 36 Z" fill="#8D2C2C" opacity="0.88" />
          <line x1="290" y1="36" x2="510" y2="36" stroke="#B47B2B" strokeWidth="4" strokeLinecap="round" />

          {/* Carved Banquet Table & Linen Runner */}
          <rect x="176" y="216" width="248" height="18" rx="4" fill="#6F4427" stroke="#452714" strokeWidth="1.5" />
          <rect x="200" y="234" width="18" height="54" fill="#523019" />
          <rect x="382" y="234" width="18" height="54" fill="#523019" />
          <rect x="226" y="214" width="148" height="4" fill="#F8F2E4" />

          {/* Empty Bronze Honey-Cake Plate & Wine Pitcher */}
          <ellipse cx="265" cy="213" rx="30" ry="7.5" fill="#C89342" stroke="#6E4716" strokeWidth="1.5" />
          <ellipse cx="265" cy="212" rx="20" ry="4" fill="#F7ECD6" />
          <path d="M342 186 Q334 196 336 213 H356 Q358 196 350 186 Z" fill="#C9A86A" stroke="#6E4716" strokeWidth="1.4" />
          <path d="M353 188 Q363 190 361 202 Q358 208 354 206" fill="none" stroke="#6E4716" strokeWidth="2" />

          {/* Wall Garland */}
          <path d="M126 95 Q182 128 238 95" fill="none" stroke="#4D784B" strokeWidth="5" strokeLinecap="round" />
          <path d="M562 95 Q618 128 674 95" fill="none" stroke="#4D784B" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}

      {room === 'hortus' && (
        <g>
          {/* Open Garden Sky, Sun & Distant Aqueduct */}
          <circle cx="585" cy="74" r="32" fill="#FFF3C8" opacity="0.72" />
          <g fill="#B6C4B0" opacity="0.65">
            <rect x="90" y="132" width="620" height="14" />
            {[115, 195, 275, 355, 435, 515, 595].map((ax, i) => (
              <path key={i} d={`M${ax} 220 V168 A22 22 0 0 1 ${ax + 44} 168 V220 H${ax + 62} V144 H${ax - 18} V220 Z`} />
            ))}
          </g>

          {/* Cypress Trees & Garden Shrubs */}
          <ellipse cx="165" cy="148" rx="30" ry="96" fill="#3E6740" opacity="0.88" />
          <ellipse cx="174" cy="152" rx="18" ry="82" fill="#517F52" opacity="0.65" />
          <ellipse cx="635" cy="142" rx="32" ry="102" fill="#3E6740" opacity="0.88" />
          <ellipse cx="626" cy="146" rx="18" ry="86" fill="#517F52" opacity="0.65" />
          <ellipse cx="265" cy="252" rx="54" ry="30" fill="#4C7748" />
          <ellipse cx="535" cy="252" rx="54" ry="30" fill="#4C7748" />

          {/* Stone Balustrade */}
          <rect x="80" y="232" width="640" height="10" rx="2" fill="#DED5C5" stroke="#8C8070" strokeWidth="1.5" />
          <rect x="80" y="274" width="640" height="12" fill="#CFC5B4" stroke="#8C8070" strokeWidth="1.5" />

          {/* Tiered Fountain on Right */}
          <ellipse cx="608" cy="284" rx="56" ry="14" fill="#CFC6B6" stroke="#7E7364" strokeWidth="2" />
          <ellipse cx="608" cy="281" rx="46" ry="9" fill="#86BDD1" />
          <rect x="598" y="242" width="20" height="38" fill="#DED6C6" />
          <ellipse cx="608" cy="240" rx="28" ry="7" fill="#EAE3D5" stroke="#7E7364" strokeWidth="1.5" />
          <path d="M608 236 Q596 220 590 242 M608 236 Q620 220 626 242" stroke="#BEE4F2" strokeWidth="2.5" fill="none" />

          {/* Carved Pedestal & Tilted Marble Statue */}
          <rect x="358" y="206" width="84" height="78" rx="3" fill="#E3DBCC" stroke="#8C8272" strokeWidth="2" />
          <rect x="350" y="200" width="100" height="10" rx="2" fill="#EFE8D9" stroke="#8C8272" strokeWidth="1.5" />
          <g transform="translate(400, 166) rotate(12)">
            <path d="M-16 -28 Q0 -34 16 -28 L19 32 H-19 Z" fill="#EFEAE0" stroke="#8C8272" strokeWidth="2" />
            <path d="M-14 -16 Q4 -4 16 14" stroke="#C5BCB0" strokeWidth="2.2" fill="none" />
            <circle cx="0" cy="-42" r="13.5" fill="#EFEAE0" stroke="#8C8272" strokeWidth="2" />
          </g>
        </g>
      )}

      {room === 'forum' && (
        <g>
          {/* Basilica Roofs in Background */}
          <polygon points="150,150 280,98 410,150" fill="#D4C6B2" stroke="#8D7B68" strokeWidth="2" />
          <polygon points="410,164 535,112 660,164" fill="#C9B9A4" stroke="#8D7B68" strokeWidth="2" />

          {/* Colonnade Arches */}
          <path d="M165 284 V108 A78 78 0 0 1 321 108 V284" fill="none" stroke={p.trim} strokeWidth="8" opacity="0.45" />
          <path d="M479 284 V108 A78 78 0 0 1 635 108 V284" fill="none" stroke={p.trim} strokeWidth="8" opacity="0.45" />

          {/* Red Market Awning */}
          <path d="M495 144 H620 L632 170 H483 Z" fill="#9B2C2C" opacity="0.72" />
          <path d="M495 144 L518 170 M545 144 L558 170 M595 144 L608 170" stroke="#F7ECD6" strokeWidth="3" opacity="0.6" />

          {/* Scribe Desk with Scrolls, Stylus & Red Wax Seal */}
          <rect x="180" y="212" width="155" height="72" rx="4" fill="#7D5132" stroke="#4D2F1B" strokeWidth="2" />
          <rect x="172" y="204" width="171" height="12" rx="3" fill="#94623F" stroke="#4D2F1B" strokeWidth="1.5" />
          {/* Scrolls & Inkwell */}
          <rect x="274" y="194" width="40" height="10" rx="4" fill="#F5EAD3" stroke="#7A6247" strokeWidth="1.2" />
          <circle cx="228" cy="199" r="7.5" fill="#B82D2D" stroke="#6E1717" strokeWidth="1.2" />
          <line x1="252" y1="201" x2="296" y2="191" stroke="#C89342" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {room === 'officina' && (
        <g>
          {/* Heavy Timber Ceiling Beams */}
          <rect x="0" y="20" width="800" height="14" fill="#5B3B24" opacity="0.5" />
          <rect x="180" y="20" width="14" height="264" fill="#5B3B24" opacity="0.22" />
          <rect x="606" y="20" width="14" height="264" fill="#5B3B24" opacity="0.22" />

          {/* Glowing Brick Kiln Arch in Left Background */}
          <path d="M128 284 V188 A52 52 0 0 1 232 188 V284 Z" fill="#8C482E" stroke="#4E2616" strokeWidth="3" />
          <path d="M150 284 V218 A30 30 0 0 1 210 218 V284 Z" fill="#E68A3E" opacity="0.82" />
          <ellipse cx="180" cy="264" rx="22" ry="18" fill="#FFD178" opacity="0.7" />

          {/* Wooden Amphora Shelf */}
          <rect x="256" y="114" width="290" height="13" rx="3" fill="#684025" stroke="#422614" strokeWidth="1.5" />
          <rect x="275" y="127" width="10" height="24" fill="#4E2F1A" />
          <rect x="515" y="127" width="10" height="24" fill="#4E2F1A" />

          {/* Painted Amphorae on Shelf */}
          {[312, 376, 488].map((ax, i) => (
            <g key={i}>
              <ellipse cx={ax} cy="88" rx="18" ry="25" fill="#B85D38" stroke="#5A2B18" strokeWidth="1.5" />
              <rect x={ax - 7} y="56" width="14" height="10" fill="#B85D38" stroke="#5A2B18" strokeWidth="1.4" />
              <path d={`M${ax - 14} 84 H${ax + 14} M${ax - 15} 92 H${ax + 15}`} stroke="#2C1A12" strokeWidth="2.5" />
            </g>
          ))}

          {/* Potter's Wheel & Clay Shards */}
          <rect x="195" y="240" width="84" height="12" rx="4" fill="#8C735B" stroke="#4E3B2B" strokeWidth="1.5" />
          <rect x="228" y="252" width="18" height="32" fill="#5D4432" />
          <polygon points="410,305 438,295 450,316 418,324" fill="#B85D38" stroke="#5A2B18" strokeWidth="1.4" />
          <polygon points="455,310 478,301 472,321" fill="#9E4A29" stroke="#5A2B18" strokeWidth="1.4" />
        </g>
      )}

      {room === 'templum' && (
        <g>
          {/* Temple Pediment with Golden Laurel Relief */}
          <polygon points="135,84 400,18 665,84" fill="#E6DEC8" stroke={p.trim} strokeWidth="3.5" />
          <polygon points="168,78 400,28 632,78" fill="#D9CEB8" />
          <circle cx="400" cy="56" r="14" fill="none" stroke="#B47B2B" strokeWidth="3" />
          <rect x="145" y="84" width="510" height="14" fill="#D5CBB7" stroke={p.trim} strokeWidth="2" />

          {/* Crimson Temple Banners */}
          <path d="M180 98 H222 V192 L201 178 L180 192 Z" fill="#8D2B2B" opacity="0.88" />
          <path d="M578 98 H620 V192 L599 178 L578 192 Z" fill="#8D2B2B" opacity="0.88" />

          {/* Glowing Oil Braziers */}
          {[246, 554].map((bx, i) => (
            <g key={i}>
              <rect x={bx - 12} y="220" width="24" height="64" fill="#D8CEBA" stroke="#7A6D5C" strokeWidth="1.5" />
              <ellipse cx={bx} cy="218" rx="18" ry="6" fill="#B47B2B" />
              <path d={`M${bx - 8} 215 Q${bx} 188 ${bx + 8} 215 Z`} fill="#F29E38" />
              <path d={`M${bx - 4} 215 Q${bx} 198 ${bx + 4} 215 Z`} fill="#FFE48F" />
            </g>
          ))}

          {/* Stone Altar & Golden Incense Bowl */}
          <rect x="348" y="210" width="104" height="74" rx="3" fill="#E2D8C6" stroke={p.trim} strokeWidth="2.5" />
          <rect x="340" y="204" width="120" height="10" rx="2" fill="#EDE4D4" stroke={p.trim} strokeWidth="1.8" />
          <ellipse cx="400" cy="202" rx="26" ry="7" fill="#C89342" stroke="#7A5218" strokeWidth="1.5" />
          <path d="M396 192 Q390 176 402 164 M406 190 Q414 174 404 160" stroke="rgba(255,255,255,0.65)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};
