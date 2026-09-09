import { memo } from 'react';

interface TreeSkeletonProps {
  bgValue?: string;
  bgColor?: string;
  isGradient?: boolean;
  isBackgroundImage?: boolean;
  isDark?: boolean;
  cardBg?: string;
  cardBorder?: string;
  borderRadius?: string;
}

function TreeSkeletonComponent({ 
  bgValue = '#f8fafc',
  bgColor = '#f8fafc',
  isGradient = false,
  isBackgroundImage = false,
  isDark = false,
  cardBg,
  cardBorder,
  borderRadius = '1rem'
}: TreeSkeletonProps) {
  const finalCardBg = cardBg || (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.92)');
  const finalCardBorder = cardBorder || (isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.08)');
  const shimmerBg = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)';
  const shimmerSubtle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)';

  return (
    <main 
      className="min-h-screen w-full flex flex-col items-center justify-start p-0 transition-colors relative overflow-x-hidden"
      style={{ 
        backgroundColor: isBackgroundImage ? '#08080a' : isGradient ? '#09090b' : bgColor,
        backgroundImage: isGradient ? bgValue : undefined,
      }}
    >
      <div className="w-full max-w-[580px] mx-auto min-h-screen px-4 sm:px-6 py-10 sm:py-16 flex flex-col justify-between relative">
        <div>
          <header className="flex flex-col items-center text-center mb-6 pt-2 animate-fade-in">
            <div 
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-full mb-3 animate-pulse"
              style={{ 
                backgroundColor: shimmerBg,
                border: `3px solid ${finalCardBorder}`,
              }}
            />
            
            <div 
              className="h-7 w-44 rounded-xl mb-2.5 animate-pulse"
              style={{ backgroundColor: shimmerBg }}
            />
            
            <div 
              className="h-5 w-32 rounded-full mb-4 animate-pulse"
              style={{ backgroundColor: shimmerSubtle }}
            />
          </header>

          <nav className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 backdrop-blur-md border animate-pulse shadow-xs"
                style={{ 
                  backgroundColor: finalCardBg,
                  borderColor: finalCardBorder,
                  borderRadius: borderRadius,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl shrink-0"
                      style={{ backgroundColor: shimmerBg }}
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div 
                        className="h-4 w-3/5 rounded-md"
                        style={{ backgroundColor: shimmerBg }}
                      />
                      <div 
                        className="h-3 w-2/5 rounded-md"
                        style={{ backgroundColor: shimmerSubtle }}
                      />
                    </div>
                  </div>
                  <div 
                    className="w-7 h-7 rounded-full shrink-0"
                    style={{ backgroundColor: shimmerSubtle }}
                  />
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div 
          className="pt-6 pb-2 text-center text-[11px] border-t mt-10"
          style={{ borderColor: finalCardBorder }}
        >
          <div 
            className="h-3.5 w-28 mx-auto rounded-full animate-pulse"
            style={{ backgroundColor: shimmerSubtle }}
          />
        </div>
      </div>
    </main>
  );
}

export const TreeSkeleton = memo(TreeSkeletonComponent);
export default TreeSkeleton;
