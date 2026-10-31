import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Person, BroadcastSettings } from '../types/broadcast';
import { getAnimationVariants } from '../utils/themePresets';

interface LowerThirdGraphicProps {
  person: Person | null;
  settings: BroadcastSettings;
  visible: boolean;
  isLive?: boolean;
  scaleOverride?: number;
}

export const LowerThirdGraphic: React.FC<LowerThirdGraphicProps> = ({
  person,
  settings,
  visible,
  isLive = false,
  scaleOverride,
}) => {
  if (!person) return null;

  const fontClass = {
    Prompt: 'font-["Prompt",sans-serif]',
    Kanit: 'font-["Kanit",sans-serif]',
    Sarabun: 'font-["Sarabun",sans-serif]',
    Inter: 'font-["Inter",sans-serif]',
    'Noto Sans Lao': 'font-["Noto_Sans_Lao",sans-serif]',
    'JetBrains Mono': 'font-["JetBrains_Mono",monospace]',
  }[settings.fontFamily] || 'font-["Prompt",sans-serif]';

  const accentColor = person.themeColor || settings.primaryAccentColor || '#8B5CF6';
  const effectiveScale = scaleOverride !== undefined ? scaleOverride : settings.scale;

  const variants = getAnimationVariants(
    settings.defaultAnimation,
    settings.exitAnimation,
    settings.animationDuration
  );

  // Position alignment styling
  const getContainerPosition = () => {
    const isTop = settings.verticalAlign === 'top';
    const isRight = settings.horizontalAlign === 'right';
    const isCenter = settings.horizontalAlign === 'center';

    let posStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 50,
      transform: `scale(${effectiveScale})`,
      transformOrigin: `${settings.horizontalAlign} ${settings.verticalAlign}`,
    };

    if (isTop) {
      posStyle.top = `${settings.offsetY}px`;
    } else {
      posStyle.bottom = `${settings.offsetY}px`;
    }

    if (isCenter) {
      posStyle.left = '50%';
      posStyle.transform = `translateX(-50%) scale(${effectiveScale})`;
      posStyle.transformOrigin = `center ${settings.verticalAlign}`;
    } else if (isRight) {
      posStyle.right = `${settings.offsetX}px`;
    } else {
      posStyle.left = `${settings.offsetX}px`;
    }

    return posStyle;
  };

  // Avatar / Logo image element
  const renderAvatar = () => {
    if (settings.logoPosition === 'none') return null;

    const imgUrl = person.profileImage || settings.programLogo;
    const size = settings.logoSize || 64;

    return (
      <div
        className="relative shrink-0 flex items-center justify-center overflow-hidden shadow-2xl transition-all"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.max(8, settings.borderRadius)}px`,
          border: `2.5px solid ${accentColor}`,
          boxShadow: `0 0 15px ${accentColor}40`,
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={person.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback to initials on error
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-bold text-white uppercase text-xl"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #0F172A)`,
            }}
          >
            {person.name.substring(0, 2)}
          </div>
        )}

        {/* Live on-air pulse dot on avatar if live */}
        {isLive && settings.showLiveTallyBadge && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </div>
    );
  };

  // Render preset-specific background & styling
  const renderContentByPreset = () => {
    switch (settings.stylePreset) {
      // 1. Broadcast Glass (Frosted glassmorphism)
      case 'broadcast-glass':
        return (
          <div
            className={`relative flex items-center gap-4 px-6 py-4 backdrop-blur-xl border shadow-2xl text-white ${fontClass}`}
            style={{
              backgroundColor: `rgba(15, 23, 42, ${settings.opacity / 100})`,
              borderColor: `${accentColor}50`,
              borderRadius: `${settings.borderRadius}px`,
              boxShadow: `0 20px 45px -10px rgba(0,0,0,0.8), 0 0 20px ${accentColor}25`,
            }}
          >
            {/* Top glowing accent line */}
            <div
              className="absolute top-0 left-6 right-6 h-[2px] opacity-80"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />

            {settings.logoPosition === 'left' && renderAvatar()}

            <div className="flex flex-col gap-1 min-w-[280px] max-w-[550px]">
              {person.category && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${accentColor}30`,
                      color: accentColor,
                      border: `1px solid ${accentColor}60`,
                    }}
                  >
                    {person.category}
                  </span>
                  {isLive && (
                    <span className="text-[10px] font-bold tracking-wider text-red-400 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      ON AIR
                    </span>
                  )}
                </div>
              )}

              <h2
                className="text-2xl font-bold tracking-tight text-white drop-shadow-md leading-tight"
                style={{ color: person.textColor || '#FFFFFF' }}
              >
                {person.name}
              </h2>

              <p
                className="text-sm font-medium tracking-wide leading-snug"
                style={{ color: `${accentColor}` }}
              >
                {person.position}
              </p>

              {settings.showDescription && person.description && (
                <p className="text-xs text-slate-300/90 font-normal mt-0.5 line-clamp-1 border-t border-white/10 pt-1">
                  {person.description}
                </p>
              )}
            </div>

            {settings.logoPosition === 'right' && renderAvatar()}
          </div>
        );

      // 2. News Ribbon (Authoritative double ribbon bar)
      case 'news-ribbon':
        return (
          <div className={`relative flex items-center shadow-2xl ${fontClass}`}>
            {/* Left accent block */}
            <div
              className="self-stretch w-3 rounded-l"
              style={{ backgroundColor: accentColor }}
            />

            <div
              className="flex items-center gap-4 px-6 py-3.5 shadow-2xl"
              style={{
                backgroundColor: `rgba(15, 23, 42, ${settings.opacity / 100})`,
                borderRadius: `0 ${settings.borderRadius}px ${settings.borderRadius}px 0`,
                borderRight: `2px solid ${accentColor}`,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {settings.logoPosition === 'left' && renderAvatar()}

              <div className="flex flex-col gap-1 min-w-[280px] max-w-[560px]">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-extrabold uppercase px-2 py-0.5 text-black rounded-xs tracking-wider"
                    style={{ backgroundColor: accentColor }}
                  >
                    {person.category || 'LIVE'}
                  </span>
                  {isLive && (
                    <span className="text-[10px] font-black tracking-widest text-red-500 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/80">
                      ON AIR
                    </span>
                  )}
                </div>

                <h2
                  className="text-2xl font-black tracking-normal text-white uppercase drop-shadow leading-tight"
                  style={{ color: person.textColor || '#FFFFFF' }}
                >
                  {person.name}
                </h2>

                <div
                  className="text-sm font-semibold text-slate-200 bg-slate-800/70 px-2.5 py-1 rounded inline-block self-start"
                  style={{ borderLeft: `3px solid ${accentColor}` }}
                >
                  {person.position}
                </div>

                {settings.showDescription && person.description && (
                  <p className="text-xs text-slate-400 font-normal mt-0.5 line-clamp-1">
                    {person.description}
                  </p>
                )}
              </div>

              {settings.logoPosition === 'right' && renderAvatar()}
            </div>
          </div>
        );

      // 3. Cyber Neon (eSports & modern tech gaming)
      case 'neon-cyber':
        return (
          <div
            className={`relative flex items-center gap-4 px-6 py-4 shadow-2xl text-white ${fontClass}`}
            style={{
              backgroundColor: `rgba(9, 9, 11, ${settings.opacity / 100})`,
              borderRadius: `${settings.borderRadius}px`,
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 25px ${accentColor}50, inset 0 0 15px ${accentColor}20`,
            }}
          >
            {/* Tech Corner accents */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2"
              style={{ borderColor: '#FFFFFF' }}
            />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2"
              style={{ borderColor: '#FFFFFF' }}
            />

            {settings.logoPosition === 'left' && renderAvatar()}

            <div className="flex flex-col gap-1 min-w-[280px] max-w-[550px]">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="text-[10px] font-mono tracking-widest uppercase font-bold"
                  style={{ color: accentColor }}
                >
                  // {person.category || 'BROADCAST'}
                </span>
                {isLive && (
                  <span className="text-[10px] font-mono font-bold text-red-400 animate-pulse">
                    ● REC_LIVE
                  </span>
                )}
              </div>

              <h2
                className="text-2xl font-extrabold tracking-wide text-white drop-shadow leading-tight"
                style={{
                  color: person.textColor || '#FFFFFF',
                  textShadow: `0 0 12px ${accentColor}80`,
                }}
              >
                {person.name}
              </h2>

              <p
                className="text-sm font-semibold tracking-wide"
                style={{ color: accentColor }}
              >
                {person.position}
              </p>

              {settings.showDescription && person.description && (
                <p className="text-xs text-zinc-400 font-mono line-clamp-1 mt-0.5">
                  &gt; {person.description}
                </p>
              )}
            </div>

            {settings.logoPosition === 'right' && renderAvatar()}
          </div>
        );

      // 4. Minimal Solid (Clean corporate / conference)
      case 'minimal-solid':
        return (
          <div
            className={`relative flex items-center gap-4 px-6 py-3.5 shadow-2xl text-white ${fontClass}`}
            style={{
              backgroundColor: `rgba(15, 23, 42, ${settings.opacity / 100})`,
              borderRadius: `${settings.borderRadius}px`,
              borderLeft: `5px solid ${accentColor}`,
              boxShadow: '0 15px 35px -5px rgba(0,0,0,0.7)',
            }}
          >
            {settings.logoPosition === 'left' && renderAvatar()}

            <div className="flex flex-col gap-0.5 min-w-[260px] max-w-[540px]">
              {person.category && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {person.category}
                </span>
              )}
              <h2
                className="text-xl font-bold tracking-tight text-white leading-tight"
                style={{ color: person.textColor || '#FFFFFF' }}
              >
                {person.name}
              </h2>
              <p
                className="text-sm font-medium text-slate-300"
                style={{ color: accentColor }}
              >
                {person.position}
              </p>
              {settings.showDescription && person.description && (
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {person.description}
                </p>
              )}
            </div>

            {settings.logoPosition === 'right' && renderAvatar()}
          </div>
        );

      // 5. Modern Gradient (Default premium TV studio look)
      case 'modern-gradient':
      default:
        return (
          <div
            className={`relative flex items-center gap-4 px-6 py-4 shadow-2xl text-white overflow-hidden ${fontClass}`}
            style={{
              background: `linear-gradient(135deg, rgba(30, 27, 75, ${settings.opacity / 100}) 0%, rgba(15, 23, 42, ${settings.opacity / 100}) 60%, rgba(2, 6, 23, ${settings.opacity / 100}) 100%)`,
              borderRadius: `${settings.borderRadius}px`,
              border: `1.5px solid ${accentColor}40`,
              boxShadow: `0 20px 45px -10px rgba(0, 0, 0, 0.85), 0 0 25px ${accentColor}30`,
            }}
          >
            {/* Top glowing beam */}
            <div
              className="absolute top-0 left-0 right-0 h-[2.5px]"
              style={{
                background: `linear-gradient(90deg, ${accentColor}, #3B82F6, transparent)`,
              }}
            />

            {/* Left accent bar */}
            <div
              className="absolute top-0 bottom-0 left-0 w-1.5"
              style={{ backgroundColor: accentColor }}
            />

            {settings.logoPosition === 'left' && renderAvatar()}

            <div className="flex flex-col gap-1 min-w-[280px] max-w-[550px] relative z-10">
              <div className="flex items-center gap-2">
                {person.category && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${accentColor}25`,
                      color: '#FFFFFF',
                      border: `1px solid ${accentColor}60`,
                    }}
                  >
                    {person.category}
                  </span>
                )}
                {isLive && (
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-white bg-red-600 px-2 py-0.5 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                )}
              </div>

              <h2
                className="text-2xl font-black tracking-tight text-white drop-shadow-lg leading-tight"
                style={{
                  color: person.textColor || '#FFFFFF',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {person.name}
              </h2>

              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold tracking-wide"
                  style={{ color: accentColor }}
                >
                  {person.position}
                </span>
              </div>

              {settings.showDescription && person.description && (
                <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-1 border-t border-slate-700/50 pt-1 mt-0.5">
                  {person.description}
                </p>
              )}
            </div>

            {settings.logoPosition === 'right' && renderAvatar()}

            {/* Subtle light sweep reflection */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none transform -skew-x-12" />
          </div>
        );
    }
  };

  return (
    <div style={getContainerPosition()} className="pointer-events-none select-none">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={person.id}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
          >
            {renderContentByPreset()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
