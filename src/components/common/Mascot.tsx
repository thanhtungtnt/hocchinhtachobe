import React from 'react';

export type MascotMood = 'idle' | 'listening' | 'celebrating' | 'cheering' | 'thinking';

interface MascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56',
  }[size];

  return (
    <div
      id="app-mascot"
      className={`relative flex items-center justify-center select-none ${sizeClasses} ${className}`}
    >
      {/* Decorative soft glow background */}
      <div className="absolute inset-0 bg-amber-200/40 rounded-full blur-xl scale-95 -z-10" />

      {/* SVG Cartoon Mascot: Bé Bút Chì Vàng Thông Thái */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Shadow below feet */}
        <ellipse cx="100" cy="188" rx="55" ry="10" fill="#E2E8F0" />

        {/* Mascot Body (Chubby Cute Pencil Body) */}
        <path
          d="M60 70 C60 50, 140 50, 140 70 L140 155 C140 170, 60 170, 60 155 Z"
          fill="#FBBF24"
        />
        {/* Pencil wooden shaved tip (Hat/Head) */}
        <path
          d="M60 70 L100 20 L140 70 Z"
          fill="#FDE68A"
        />
        {/* Pencil Lead Tip (Graphite/Ink top) */}
        <path
          d="M88 35 L100 20 L112 35 Z"
          fill="#374151"
        />

        {/* Cute Face White patch */}
        <ellipse cx="100" cy="105" rx="32" ry="24" fill="#FEF3C7" />

        {/* Eyes based on mood */}
        {mood === 'listening' ? (
          // Concentrating happy eyes
          <g>
            <path d="M80 102 Q87 95 94 102" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M106 102 Q113 95 120 102" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        ) : mood === 'celebrating' ? (
          // Joyful crescent eyes
          <g>
            <path d="M78 100 Q86 90 94 100" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M106 100 Q114 90 122 100" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        ) : mood === 'thinking' ? (
          // Curious eyes
          <g>
            <circle cx="86" cy="100" r="6" fill="#1F2937" />
            <circle cx="88" cy="98" r="2.5" fill="#FFFFFF" />
            <circle cx="114" cy="98" r="7" fill="#1F2937" />
            <circle cx="116" cy="96" r="3" fill="#FFFFFF" />
            <path d="M78 90 Q86 85 94 92" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          // Normal big anime cheerful eyes
          <g>
            <circle cx="86" cy="100" r="7" fill="#1F2937" />
            <circle cx="88" cy="97" r="3" fill="#FFFFFF" />
            <circle cx="114" cy="100" r="7" fill="#1F2937" />
            <circle cx="116" cy="97" r="3" fill="#FFFFFF" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <circle cx="75" cy="110" r="6" fill="#F87171" opacity="0.6" />
        <circle cx="125" cy="110" r="6" fill="#F87171" opacity="0.6" />

        {/* Mouth */}
        {mood === 'celebrating' || mood === 'cheering' ? (
          <path
            d="M90 114 Q100 128 110 114"
            fill="#EF4444"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : mood === 'thinking' ? (
          <path
            d="M93 118 Q100 115 107 118"
            stroke="#1F2937"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M92 114 Q100 123 108 114"
            stroke="#1F2937"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Cute Hands */}
        {mood === 'celebrating' ? (
          <g>
            {/* Arms raised up */}
            <path d="M60 110 Q40 85 50 65" stroke="#F59E0B" strokeWidth="9" strokeLinecap="round" fill="none" />
            <circle cx="50" cy="65" r="7" fill="#F59E0B" />
            <path d="M140 110 Q160 85 150 65" stroke="#F59E0B" strokeWidth="9" strokeLinecap="round" fill="none" />
            <circle cx="150" cy="65" r="7" fill="#F59E0B" />
          </g>
        ) : mood === 'listening' ? (
          <g>
            {/* Cute Headphone Gear */}
            <path d="M50 85 C50 40, 150 40, 150 85" stroke="#3B82F6" strokeWidth="7" strokeLinecap="round" fill="none" />
            <rect x="42" y="75" width="16" height="28" rx="8" fill="#2563EB" />
            <rect x="142" y="75" width="16" height="28" rx="8" fill="#2563EB" />
            {/* Audio Waves around ear */}
            <path d="M30 82 Q25 90 30 98" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M170 82 Q175 90 170 98" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            {/* Small hand holding a mini notebook or resting */}
            <path d="M60 120 Q48 135 60 145" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="60" cy="145" r="6" fill="#F59E0B" />
            <path d="M140 120 Q152 135 140 145" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="140" cy="145" r="6" fill="#F59E0B" />
          </g>
        )}

        {/* Small cute feet */}
        <rect x="75" y="160" width="18" height="15" rx="8" fill="#3B82F6" />
        <rect x="107" y="160" width="18" height="15" rx="8" fill="#3B82F6" />

        {/* Star Sparkles for celebration */}
        {mood === 'celebrating' && (
          <g>
            <path d="M35 50 L40 40 L45 50 L55 55 L45 60 L40 70 L35 60 L25 55 Z" fill="#F59E0B" />
            <path d="M155 45 L159 37 L163 45 L171 49 L163 53 L159 61 L155 53 L147 49 Z" fill="#F59E0B" />
          </g>
        )}
      </svg>
    </div>
  );
};
