import { useState, memo, useMemo } from 'react';
import type { NostreeDataV2, Link, LinkGroup } from '../../schemas/nostr';
import { BadgeCheck, ChevronDown, Copy, Check, Globe } from 'lucide-react';
import logo from '../../assets/logo.png';
import TreeSkeleton from '../ui/TreeSkeleton';
import ShareButton from '../ui/ShareButton';
import QRCodeModal from '../ui/QRCodeModal';
import { TiltLinkCard } from './TiltLinkCard';
import { toast } from 'sonner';

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

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === 'twitter' || p === 'x') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p === 'github') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  if (p === 'instagram') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (p === 'youtube') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (p === 'linkedin') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (p === 'tiktok') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    );
  }
  if (p === 'telegram') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    );
  }
  if (p === 'discord') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }
  if (p === 'nostr') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 5v14M5 12h14M7 7l10 10M7 17L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  return <Globe className="w-4 h-4" />;
}

function PublicTreeViewerComponent({ 
  status, 
  error, 
  treeData, 
  profile, 
  slug 
}: PublicTreeViewerProps) {
  const [showQR, setShowQR] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const copySlugLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedSlug(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch {}
  };

  const displayData = useMemo(() => {
    const displayName = treeData?.treeMeta?.title || treeData?.profile?.name || profile?.name || 'Anonymous';
    const displayBio = treeData?.profile?.bio || profile?.about || '';
    const showVerification = treeData?.profile?.show_verification ?? true;
    const linkItems = treeData?.links || [];
    
    const rootLinks: Link[] = [];
    const groups: LinkGroup[] = [];
    
    linkItems.forEach(item => {
      if ('type' in item && item.type === 'group') {
        if (item.visible) {
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

    const bgValue = theme?.colors.background || '#f8fafc';
    const isBackgroundImage = bgValue.startsWith('url(');
    const bgColor = isBackgroundImage ? 'rgba(10,10,12,0.85)' : bgValue;
    const bgImage = isBackgroundImage ? bgValue : undefined;
    const fgColor = theme?.colors.foreground || '#0f172a';
    const primaryColor = theme?.colors.primary || '#6366f1';
    const borderRadius = theme?.colors.radius || '1rem';
    const font = theme?.font || 'Plus Jakarta Sans';
    
    const cardBg = isBackgroundImage ? 'rgba(255,255,255,0.08)' : `${fgColor}0a`;
    const cardBorder = isBackgroundImage ? 'rgba(255,255,255,0.12)' : `${fgColor}14`;
    const cardHoverBg = isBackgroundImage ? 'rgba(255,255,255,0.15)' : `${fgColor}12`;
    const cardHoverBorder = isBackgroundImage ? 'rgba(255,255,255,0.25)' : `${fgColor}24`;
    const dimColor = isBackgroundImage ? 'rgba(255,255,255,0.65)' : `${fgColor}90`;
    const textColor = isBackgroundImage ? '#ffffff' : fgColor;
    
    const fontFamily = font === 'Serif' ? 'Georgia, serif' : font === 'Mono' ? 'Space Grotesk, monospace' : `${font}, system-ui, sans-serif`;

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

  if (status === 'loading') {
    return (
      <TreeSkeleton 
        bgColor={displayData.bgColor}
        cardBg={displayData.cardBg}
        borderRadius={displayData.borderRadius}
      />
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center bg-canvas">
        <div className="animate-slide-up max-w-sm">
          <div className="mb-5 flex justify-center">
            <img src={logo} alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-xl font-bold text-txt-main mb-2">Page Not Found</h1>
          <p className="text-sm text-txt-muted mb-6">{error || 'This link tree does not exist or has moved.'}</p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-brand-fg text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-brand-hover active:scale-[0.98]"
          >
            Create Your Own
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

  const totalLinkCount = rootLinks.length + groups.reduce((sum, g) => sum + g.links.length, 0);

  return (
    <>
      <main 
        className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center p-0 sm:p-6 md:p-10 transition-colors selection:bg-brand selection:text-brand-fg relative overflow-x-hidden"
        style={{ 
          backgroundColor: isBackgroundImage ? '#08080a' : bgColor,
          backgroundImage: isBackgroundImage ? bgImage : `radial-gradient(circle at 50% 35%, ${primaryColor}14 0%, transparent 70%)`,
          fontFamily,
        }}
      >
        <div 
          className="w-full sm:max-w-[450px] mx-auto sm:my-auto rounded-none sm:rounded-[36px] border-0 sm:border overflow-hidden transition-all duration-300 flex flex-col justify-between relative shadow-none sm:shadow-2xl min-h-screen sm:min-h-[580px]"
          style={{ 
            backgroundColor: isBackgroundImage ? 'rgba(10, 10, 14, 0.96)' : bgColor,
            backgroundImage: bgImage,
            color: textColor,
            borderColor: cardBorder,
          }}
        >
          {treeData?.profile?.headerImage && (
            <div className="w-full h-32 sm:h-38 overflow-hidden shrink-0">
              <img 
                src={treeData.profile.headerImage} 
                alt="Header" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between">
            <div>
              <header className={`flex flex-col items-center text-center mb-6 animate-slide-up ${treeData?.profile?.headerImage ? '-mt-14 sm:-mt-16' : 'pt-2'}`}>
                <div className="relative mb-3">
                  <div 
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden shadow-elevated transition-transform duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: cardBg,
                      border: `3px solid ${primaryColor}40`,
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
                      className="absolute -bottom-1 -right-1 p-1 rounded-full shadow-md animate-pop"
                      style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                      title={`Verified: ${profile.nip05}`}
                    >
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <h1 
                  className="text-xl sm:text-2xl font-bold tracking-tight mb-1" 
                  style={{ color: textColor }}
                >
                  {displayName}
                </h1>

                <button
                  onClick={copySlugLink}
                  className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md mb-2.5 transition-all duration-150 hover:opacity-90 active:scale-[0.98] cursor-pointer"
                  style={{ 
                    backgroundColor: cardBg, 
                    border: `1px solid ${cardBorder}`, 
                    color: dimColor 
                  }}
                  title="Click to copy link"
                >
                  <span>{typeof window !== 'undefined' ? window.location.host : 'nostree.me'}/{slug}</span>
                  {copiedSlug ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {showVerification && profile?.nip05 && (
                  <p 
                    className="text-xs mb-2 flex items-center gap-1 font-medium" 
                    style={{ color: primaryColor }}
                  >
                    <span>✓</span>
                    <span>{profile.nip05.startsWith('_@') ? profile.nip05.slice(2) : profile.nip05}</span>
                  </p>
                )}

                {displayBio && (
                  <p 
                    className="max-w-xs text-xs sm:text-sm leading-relaxed px-2 text-center" 
                    style={{ color: dimColor }}
                  >
                    {displayBio}
                  </p>
                )}
              </header>

              {(rootLinks.length > 0 || groups.length > 0) && (
                <nav className="flex flex-col gap-2.5" aria-label="Links">
                  {rootLinks.map((link, index) => (
                    <TiltLinkCard
                      key={link.id}
                      link={link}
                      index={index}
                      cardBg={cardBg}
                      cardBorder={cardBorder}
                      cardHoverBg={cardHoverBg}
                      cardHoverBorder={cardHoverBorder}
                      fgColor={primaryColor}
                      textColor={textColor}
                      dimColor={dimColor}
                      borderRadius={borderRadius}
                    />
                  ))}
                  
                  {groups.map((group, groupIndex) => {
                    const isCollapsed = collapsedGroups.has(group.id) || group.collapsed;
                    const startDelay = 100 + (rootLinks.length + groupIndex) * 40;
                    
                    return (
                      <div
                        key={group.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${startDelay}ms` }}
                      >
                        <button
                          onClick={() => toggleGroupCollapse(group.id)}
                          className="w-full px-4 py-3 flex items-center justify-between rounded-xl backdrop-blur-md transition-all duration-200 hover:opacity-90 active:scale-[0.99] mb-2.5 shadow-xs cursor-pointer"
                          style={{
                            backgroundColor: isBackgroundImage ? 'rgba(255,255,255,0.06)' : cardBg,
                            border: `1px solid ${cardBorder}`,
                            borderLeftWidth: '3px',
                            borderLeftColor: primaryColor,
                          }}
                        >
                          <div className="flex items-center gap-2.5 text-left min-w-0">
                            {group.emoji && (
                              <span className="text-lg shrink-0">{group.emoji}</span>
                            )}
                            <span className="font-bold text-sm tracking-tight truncate" style={{ color: textColor }}>
                              {group.title}
                            </span>
                            <span 
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" 
                              style={{ 
                                backgroundColor: `${primaryColor}20`,
                                color: primaryColor,
                              }}
                            >
                              {group.links.length}
                            </span>
                          </div>
                          
                          <div className="shrink-0 p-1 rounded-md transition-transform duration-200" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                            <ChevronDown className="w-4 h-4" style={{ color: primaryColor }} />
                          </div>
                        </button>
                        
                        {!isCollapsed && group.links.length > 0 && (
                          <div className="flex flex-col gap-2.5 pl-3 border-l-2 border-dashed pb-2 mb-2" style={{ borderColor: `${primaryColor}30` }}>
                            {group.links.map((link, linkIndex) => (
                              <TiltLinkCard
                                key={link.id}
                                link={link}
                                index={rootLinks.length + groupIndex + linkIndex}
                                cardBg={cardBg}
                                cardBorder={cardBorder}
                                cardHoverBg={cardHoverBg}
                                cardHoverBorder={cardHoverBorder}
                                fgColor={primaryColor}
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

              {rootLinks.length === 0 && groups.length === 0 && (
                <div 
                  className="text-center py-8 px-6 rounded-2xl backdrop-blur-md animate-fade-in"
                  style={{ 
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                  }}
                >
                  <div className="text-2xl mb-2">📁</div>
                  <p className="text-xs font-semibold mb-1" style={{ color: textColor }}>
                    Belum ada tautan
                  </p>
                  <p className="text-[11px]" style={{ color: dimColor }}>
                    Halaman ini siap menerima daftar tautan dari editor.
                  </p>
                </div>
              )}

              {socials.length > 0 && (
                <nav 
                  className="flex justify-center gap-2 mt-6 animate-slide-up flex-wrap" 
                  aria-label="Social links"
                  style={{ animationDelay: `${120 + totalLinkCount * 40}ms` }}
                >
                  {socials.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 active:scale-95 backdrop-blur-md shadow-xs"
                      style={{ 
                        backgroundColor: cardBg, 
                        border: `1px solid ${cardBorder}`, 
                        color: textColor, 
                      }}
                      title={social.platform}
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  ))}
                </nav>
              )}

              {profile?.lud16 && (
                <div 
                  className="mt-5 text-center animate-slide-up"
                  style={{ animationDelay: `${160 + totalLinkCount * 40}ms` }}
                >
                  <a 
                    href={`lightning:${profile.lud16}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                    style={{ 
                      backgroundColor: primaryColor, 
                      color: '#ffffff',
                    }}
                  >
                    <span>⚡</span>
                    <span>Kirim Tip Lightning</span>
                  </a>
                </div>
              )}
            </div>

            <footer 
              className="pt-6 pb-1 text-center text-[11px] border-t mt-8 transition-opacity hover:opacity-100 opacity-60"
              style={{ 
                color: dimColor,
                borderColor: cardBorder,
              }}
            >
              <a href="/admin" className="inline-flex items-center gap-1.5 font-medium">
                <span>Dikelola dengan</span>
                <span className="font-semibold" style={{ color: textColor }}>Nostree</span>
                <img src={logo} alt="Logo" className="w-3.5 h-3.5 object-contain" />
              </a>
            </footer>
          </div>
        </div>
      </main>

      <ShareButton 
        url={currentUrl}
        onQRClick={() => setShowQR(true)}
        primaryColor={primaryColor}
        bgColor={isBackgroundImage ? '#09090b' : bgColor}
      />

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={currentUrl}
        primaryColor={primaryColor}
        bgColor={isBackgroundImage ? '#09090b' : bgColor}
      />
    </>
  );
}

export const PublicTreeViewer = memo(PublicTreeViewerComponent);
export default PublicTreeViewer;
