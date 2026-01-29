import { useState, memo, useMemo } from 'react';
import type { NostreeDataV2, Link, LinkItem, LinkGroup } from '../../schemas/nostr';
import { BadgeCheck, ChevronDown, ChevronRight } from 'lucide-react';
import logo from '../../assets/logo.png';
import TreeSkeleton from '../ui/TreeSkeleton';
import ShareButton from '../ui/ShareButton';
import QRCodeModal from '../ui/QRCodeModal';
import { TiltLinkCard } from './TiltLinkCard';

interface UserProfile {
  pubkey: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
}

interface PublicTreeViewerProps {
  status: 'loading' | 'ready' | 'error';
  error?: string | null;
  treeData: NostreeDataV2 | null;
  profile: UserProfile | null;
  slug: string;
}

// Platform emoji mapping for social icons
const platformEmoji: Record<string, string> = {
  twitter: '𝕏',
  instagram: '📷',
  youtube: '▶️',
  github: '💻',
  linkedin: '💼',
  tiktok: '🎵',
  twitch: '🎮',
  nostr: '🟣',
  website: '🌐',
  telegram: '✈️',
  discord: '💬',
};

/**
 * PublicTreeViewer - Unified component for displaying public link trees
 * Features:
 * - Animated loading skeleton
 * - Staggered entrance animations
 * - Enhanced link cards with hover effects
 * - Share button with QR code
 * - Collapsible groups
 */
function PublicTreeViewerComponent({ 
  status, 
  error, 
  treeData, 
  profile, 
  slug 
}: PublicTreeViewerProps) {
  const [showQR, setShowQR] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Toggle group collapse
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Theme and display data
  const displayData = useMemo(() => {
    const displayName = treeData?.treeMeta?.title || treeData?.profile?.name || profile?.name || 'Anonymous';
    const displayBio = treeData?.profile?.bio || profile?.about || '';
    const showVerification = treeData?.profile?.show_verification ?? true;
    const linkItems = treeData?.links || [];
    
    // Separate root links from groups and filter by visibility
    const rootLinks: Link[] = [];
    const groups: LinkGroup[] = [];
    
    linkItems.forEach(item => {
      if ('type' in item && item.type === 'group') {
        if (item.visible) {
          // Only include group if it has visible links or if the group itself should be shown
          const visibleLinksInGroup = item.links.filter(l => l.visible);
          if (visibleLinksInGroup.length > 0 || item.visible) {
            groups.push({
              ...item,
              links: visibleLinksInGroup
            });
          }
        }
      } else {
        if (item.visible) {
          rootLinks.push(item as Link);
        }
      }
    });
    
    const socials = treeData?.socials || [];
    const theme = treeData?.theme;

    // Theme colors with fallbacks
    const bgValue = theme?.colors.background || '#f5f5f7';
    const isBackgroundImage = bgValue.startsWith('url(');
    const bgColor = isBackgroundImage ? 'rgba(0,0,0,0.7)' : bgValue;
    const bgImage = isBackgroundImage ? bgValue : undefined;
    const fgColor = theme?.colors.foreground || '#1f2937';
    const primaryColor = theme?.colors.primary || '#5E47B8';
    const borderRadius = theme?.colors.radius || '1rem';
    const font = theme?.font || 'Inter';
    
    // Computed styles for theme
    const cardBg = isBackgroundImage ? 'rgba(255,255,255,0.12)' : `${fgColor}08`;
    const cardBorder = isBackgroundImage ? 'rgba(255,255,255,0.15)' : `${fgColor}15`;
    const cardHoverBg = isBackgroundImage ? 'rgba(255,255,255,0.18)' : `${fgColor}12`;
    const cardHoverBorder = isBackgroundImage ? 'rgba(255,255,255,0.3)' : `${fgColor}25`;
    const dimColor = isBackgroundImage ? 'rgba(255,255,255,0.7)' : `${fgColor}99`;
    const textColor = isBackgroundImage ? '#ffffff' : fgColor;
    
    // Font family CSS
    const fontFamily = font === 'Serif' ? 'Georgia, serif' : font === 'Mono' ? 'monospace' : `${font}, system-ui, sans-serif`;

    return {
      displayName,
      displayBio,
      showVerification,
      rootLinks,
      groups,
      socials,
      isBackgroundImage,
      bgColor,
      bgImage,
      fgColor,
      primaryColor,
      borderRadius,
      cardBg,
      cardBorder,
      cardHoverBg,
      cardHoverBorder,
      dimColor,
      textColor,
      fontFamily,
    };
  }, [treeData, profile, collapsedGroups]);

  // Loading state
  if (status === 'loading') {
    return (
      <TreeSkeleton 
        bgColor={displayData.bgColor}
        cardBg={displayData.cardBg}
        borderRadius={displayData.borderRadius}
      />
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center bg-canvas">
        <div className="animate-bounce-in">
          <div className="mb-4 flex justify-center">
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-brand mb-2">Not Found</h1>
          <p className="text-txt-muted max-w-md mb-6">{error || 'Tree not found'}</p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-brand-fg font-medium rounded-xl transition-all hover:bg-brand-hover"
          >
            Go to Homepage
          </a>
        </div>
      </main>
    );
  }

  const {
    displayName,
    displayBio,
    showVerification,
    rootLinks,
    groups,
    socials,
    isBackgroundImage,
    bgColor,
    bgImage,
    fgColor,
    primaryColor,
    borderRadius,
    cardBg,
    cardBorder,
    cardHoverBg,
    cardHoverBorder,
    dimColor,
    textColor,
    fontFamily,
  } = displayData;

  // Calculate total link count for animation delays
  const totalLinkCount = rootLinks.length + groups.reduce((sum, g) => sum + g.links.length, 0);

  return (
    <>
      <main 
        className="min-h-screen flex flex-col items-center px-4 py-12 pb-24 transition-colors bg-cover bg-center bg-fixed"
        style={{ 
          backgroundColor: isBackgroundImage ? '#1a1a1a' : bgColor,
          backgroundImage: bgImage,
          color: textColor, 
          fontFamily,
        }}
      >
        <div className="w-full max-w-md mx-auto">
          {/* Header Image */}
          {treeData?.profile?.headerImage && (
            <div 
              className="w-full h-40 rounded-2xl overflow-hidden mb-6 animate-fade-in"
              style={{ animationDelay: '0ms' }}
            >
              <img 
                src={treeData.profile.headerImage} 
                alt="Header" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Profile Header */}
          <header 
            className="flex flex-col items-center text-center mb-8 animate-slide-up"
            style={{ animationDelay: '50ms' }}
          >
            {/* Avatar */}
            <div className="relative mb-4">
              <div 
                className="w-24 h-24 rounded-full overflow-hidden ring-4 transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: cardBg, 
                  ['--tw-ring-color' as string]: bgColor,
                }}
              >
                <img 
                  src={treeData?.profile?.picture || profile?.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}`}
                  alt={`${displayName}'s avatar`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              
              {showVerification && profile?.nip05 && (
                <div 
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full shadow-lg animate-pop"
                  style={{ backgroundColor: primaryColor, color: bgColor }}
                  title={`Verified: ${profile.nip05}`}
                >
                  <BadgeCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Name */}
            <h1 
              className="text-2xl font-bold mb-2" 
              style={{ color: textColor }}
            >
              {displayName}
            </h1>

            {/* Slug badge */}
            <p 
              className="text-xs px-3 py-1 rounded-full mb-3 backdrop-blur-sm"
              style={{ 
                backgroundColor: cardBg, 
                border: `1px solid ${cardBorder}`, 
                color: dimColor 
              }}
            >
              {typeof window !== 'undefined' ? window.location.host : 'nostree.me'}/{slug}
            </p>


            {/* NIP-05 */}
            {showVerification && profile?.nip05 && (
              <p 
                className="text-sm mb-2 flex items-center gap-1.5" 
                style={{ color: primaryColor }}
              >
                <span className="text-xs">✓</span>
                <span>{profile.nip05.startsWith('_@') ? profile.nip05.slice(2) : profile.nip05}</span>
              </p>
            )}

            {/* Bio */}
            {displayBio && (
              <p 
                className="max-w-sm text-sm leading-relaxed" 
                style={{ color: dimColor }}
              >
                {displayBio}
              </p>
            )}
          </header>

          {/* Links */}
          {(rootLinks.length > 0 || groups.length > 0) && (
            <nav className="flex flex-col gap-3" aria-label="Links">
              {/* Root level links */}
              {rootLinks.map((link, index) => (
                <TiltLinkCard
                  key={link.id}
                  link={link}
                  index={index}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                  cardHoverBg={cardHoverBg}
                  cardHoverBorder={cardHoverBorder}
                  fgColor={fgColor}
                  textColor={textColor}
                  dimColor={dimColor}
                  borderRadius={borderRadius}
                />
              ))}
              
              {/* Groups */}
              {groups.map((group, groupIndex) => {
                const isCollapsed = collapsedGroups.has(group.id) || group.collapsed;
                const startDelay = 150 + (rootLinks.length + groupIndex) * 60;
                
                return (
                  <div
                    key={group.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${startDelay}ms` }}
                  >
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="w-full px-5 py-4 flex items-center gap-3 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mb-2"
                      style={{
                        backgroundColor: cardBg,
                        border: `2px solid ${cardBorder}`,
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isCollapsed ? (
                          <ChevronRight className="w-5 h-5" style={{ color: dimColor }} />
                        ) : (
                          <ChevronDown className="w-5 h-5" style={{ color: dimColor }} />
                        )}
                      </div>
                      {group.emoji && (
                        <span className="text-2xl flex-shrink-0">{group.emoji}</span>
                      )}
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold" style={{ color: textColor }}>
                          {group.title}
                        </h3>
                        <p className="text-xs" style={{ color: dimColor }}>
                          {group.links.length} {group.links.length === 1 ? 'link' : 'links'}
                        </p>
                      </div>
                    </button>
                    
                    {/* Group Links */}
                    {!isCollapsed && group.links.length > 0 && (
                      <div className="flex flex-col gap-2 ml-4 pl-4 border-l-2" style={{ borderColor: cardBorder }}>
                        {group.links.map((link, linkIndex) => (
                          <TiltLinkCard
                            key={link.id}
                            link={link}
                            index={rootLinks.length + groupIndex + linkIndex}
                            cardBg={cardBg}
                            cardBorder={cardBorder}
                            cardHoverBg={cardHoverBg}
                            cardHoverBorder={cardHoverBorder}
                            fgColor={fgColor}
                            textColor={textColor}
                            dimColor={dimColor}
                            borderRadius={borderRadius}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {/* Empty state */}
          {rootLinks.length === 0 && groups.length === 0 && (
            <div 
              className="text-center py-12 px-6 rounded-2xl backdrop-blur-sm animate-fade-in"
              style={{ 
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
              }}
            >
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-lg font-medium mb-1" style={{ color: textColor }}>
                No links yet
              </p>
              <p className="text-sm" style={{ color: dimColor }}>
                This tree is just getting started.
              </p>
            </div>
          )}

          {/* Social Icons */}
          {socials.length > 0 && (
            <nav 
              className="flex justify-center gap-3 mt-8 animate-slide-up" 
              aria-label="Social links"
              style={{ animationDelay: `${150 + totalLinkCount * 60 + 100}ms` }}
            >
              {socials.map((social, index) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="p-3 transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm"
                  style={{ 
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: borderRadius,
                    animationDelay: `${index * 50}ms`,
                  }}
                  title={social.platform}
                >
                  <span className="text-lg">{platformEmoji[social.platform] || '🔗'}</span>
                </a>
              ))}
            </nav>
          )}

          {/* Zap Button */}
          {profile?.lud16 && (
            <div 
              className="mt-8 text-center animate-slide-up"
              style={{ animationDelay: `${150 + totalLinkCount * 60 + 200}ms` }}
            >
              <a 
                href={`lightning:${profile.lud16}`}
                className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: bgColor,
                  boxShadow: `0 4px 20px ${primaryColor}40`
                }}
              >
                <span>⚡</span>
                <span>Send a Zap</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer 
          className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs backdrop-blur-sm"
          style={{ 
            color: dimColor,
            backgroundColor: isBackgroundImage ? 'rgba(0,0,0,0.3)' : `${bgColor}cc`,
          }}
        >
          <a href="/" className="transition-opacity hover:opacity-80 inline-flex items-center gap-1.5">
            <span>Powered by</span>
            <span className="font-medium">Nostree</span>
            <img src={logo} alt="Logo" className="w-4 h-4 object-contain" />
          </a>
        </footer>
      </main>

      {/* Share Button */}
      <ShareButton 
        url={currentUrl}
        onQRClick={() => setShowQR(true)}
        primaryColor={primaryColor}
        bgColor={isBackgroundImage ? '#ffffff' : bgColor}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={currentUrl}
        primaryColor={primaryColor}
        bgColor={isBackgroundImage ? '#ffffff' : bgColor}
      />
    </>
  );
}

export const PublicTreeViewer = memo(PublicTreeViewerComponent);
export default PublicTreeViewer;
