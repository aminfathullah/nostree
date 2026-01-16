import { memo } from 'react';

interface TreeSkeletonProps {
  bgColor?: string;
  cardBg?: string;
  borderRadius?: string;
}

/**
 * Animated loading skeleton for the public tree viewer
 * Displays shimmer placeholders matching the final layout
 */
function TreeSkeletonComponent({ 
  bgColor = '#f5f5f7',
  cardBg = 'rgba(0,0,0,0.05)',
  borderRadius = '1rem'
}: TreeSkeletonProps) {
  return (
    <main 
      className="min-h-screen flex flex-col items-center px-4 py-12 pb-20"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full max-w-md mx-auto animate-fade-in">
        {/* Profile Skeleton */}
        <header className="flex flex-col items-center text-center mb-8">
          {/* Avatar */}
          <div 
            className="w-24 h-24 rounded-full mb-4 skeleton-shimmer"
            style={{ backgroundColor: cardBg }}
          />
          
          {/* Name */}
          <div 
            className="h-7 w-40 rounded-lg mb-2 skeleton-shimmer"
            style={{ backgroundColor: cardBg }}
          />
          
          {/* Badge */}
          <div 
            className="h-5 w-20 rounded-full mb-3 skeleton-shimmer"
            style={{ backgroundColor: cardBg }}
          />
          
          {/* Bio */}
          <div className="space-y-2 w-full max-w-xs">
            <div 
              className="h-4 w-full rounded skeleton-shimmer"
              style={{ backgroundColor: cardBg }}
            />
            <div 
              className="h-4 w-3/4 mx-auto rounded skeleton-shimmer"
              style={{ backgroundColor: cardBg }}
            />
          </div>
        </header>

        {/* Link Skeletons */}
        <nav className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full p-4 skeleton-shimmer"
              style={{ 
                backgroundColor: cardBg,
                borderRadius: borderRadius,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded skeleton-shimmer"
                  style={{ backgroundColor: `${cardBg}` }}
                />
                <div 
                  className="flex-1 h-5 rounded skeleton-shimmer"
                  style={{ backgroundColor: `${cardBg}` }}
                />
                <div 
                  className="w-4 h-4 rounded skeleton-shimmer"
                  style={{ backgroundColor: `${cardBg}` }}
                />
              </div>
            </div>
          ))}
        </nav>

        {/* Social Icons Skeleton */}
        <div className="flex justify-center gap-4 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg skeleton-shimmer"
              style={{ 
                backgroundColor: cardBg,
                animationDelay: `${400 + i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS for skeleton shimmer */}
      <style>{`
        @keyframes skeleton-shimmer {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.6;
          }
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
