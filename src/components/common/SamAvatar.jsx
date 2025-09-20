// src/components/common/SamAvatar.jsx
import React from 'react';
import SamFaces from '@/assets/sam/moods';

// Minimal SVG fallback — shown if PNG doesn’t exist yet
const FallbackFace = ({ mood = 'thinking' }) => {
  const moodStyle = {
    happy:     { mouth: 'M35 60 Q50 75 65 60', brow:  4 },
    concerned: { mouth: 'M35 63 Q50 57 65 63', brow: -6 },
    alert:     { mouth: 'M44 58 L56 58',       brow: -10 },
    thinking:  { mouth: 'M35 60 Q50 63 65 60', brow:  0 },
    sad:       { mouth: 'M35 63 Q50 55 65 63', brow: -8 },
    angry:     { mouth: 'M42 62 L58 62',       brow: -12 },
    excited:   { mouth: 'M33 58 Q50 78 67 58', brow:  6 },
    surprised: { mouth: 'M48 60 a4,6 0 1,0 8,0 a4,6 0 1,0 -8,0', brow: 0 },
  }[mood] || { mouth: 'M35 60 Q50 63 65 60', brow: 0 };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="50" fill="url(#g)" />
      <ellipse cx="50" cy="48" rx="30" ry="32" fill="#d6a574" />
      <path d="M20 35 Q50 18 80 35 L80 28 Q50 12 20 28 Z" fill="#2c1810" />
      {/* brows */}
      <path d={`M30 35 Q35 ${33 - moodStyle.brow/2} 40 35`} stroke="#2c1810" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={`M60 35 Q65 ${33 - moodStyle.brow/2} 70 35`} stroke="#2c1810" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <ellipse cx="36" cy="43" rx="4" ry="5" fill="#2c1810" />
      <ellipse cx="64" cy="43" rx="4" ry="5" fill="#2c1810" />
      {/* mouth */}
      <path d={moodStyle.mouth} stroke="#2c1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* suit hint */}
      <path d="M22 78 L40 74 L50 78 L60 74 L78 78 L78 100 L22 100 Z" fill="#374151" />
      <circle cx="50" cy="84" r="2" fill="#93c5fd" />
    </svg>
  );
};

export default function SamAvatar({ mood = 'thinking', size = 56, className = '' }) {
  const src = SamFaces[mood];
  const style = { width: size, height: size };

  // Try image; on error show fallback
  const [errored, setErrored] = React.useState(false);
  React.useEffect(() => setErrored(false), [src]);

  return (
    <div className={`relative rounded-full border border-zinc-700 shadow overflow-hidden bg-zinc-900 ${className}`} style={style}>
      {!errored && src ? (
        <img
          src={src}
          alt={`Sam ${mood}`}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <FallbackFace mood={mood} />
      )}
      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900 animate-pulse" />
    </div>
  );
}
