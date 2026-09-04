import { memo } from 'react';

interface TreeSkeletonProps {
  bgColor?: string;
  cardBg?: string;
  borderRadius?: string;
}

function TreeSkeletonComponent({ 
  bgColor = '#09090b',
  cardBg = 'rgba(255,255,255,0.06)',
  borderRadius = '1rem'
}: TreeSkeletonProps) {
  return (
    <main 
      className="min-h-screen w-full flex flex-col items-center justify-center p-0 sm:p-6 md:p-10 transition-colors relative overflow-x-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="w-full max-w-md sm:max-w-[440px] md:max-w-[460px] mx-auto my-auto sm:my-8 rounded-none sm:rounded-[36px] sm:border overflow-hidden p-5 sm:p-7 min-h-[580px] flex flex-col justify-between animate-fade-in"
        style={{
          backgroundColor: cardBg,
          borderColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div>
          <header className="flex flex-col items-center text-center mb-6 pt-2">
            <div 
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-full mb-3 skeleton-shimmer"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
            
            <div 
              className="h-6 w-36 rounded-lg mb-2 skeleton-shimmer"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
            
            <div 
              className="h-4 w-24 rounded-full mb-3 skeleton-shimmer"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
            
            <div className="space-y-1.5 w-full max-w-xs">
              <div 
                className="h-3.5 w-full rounded skeleton-shimmer"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              />
              <div 
                className="h-3.5 w-3/4 mx-auto rounded skeleton-shimmer"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              />
            </div>
          </header>

          <nav className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-full p-4 skeleton-shimmer"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: borderRadius,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg skeleton-shimmer"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  />
                  <div className="flex-1 space-y-1.5">
                    <div 
                      className="h-4 w-2/3 rounded skeleton-shimmer"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    />
                    <div 
                      className="h-3 w-1/3 rounded skeleton-shimmer"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="pt-6 pb-2 text-center text-[11px] border-t border-white/10 mt-8">
          <div className="h-3 w-28 mx-auto rounded skeleton-shimmer" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0% { opacity: 0.6; }
          50% { opacity: 0.25; }
          100% { opacity: 0.6; }
        }
        .skeleton-shimmer {
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

export const TreeSkeleton = memo(TreeSkeletonComponent);
export default TreeSkeleton;
