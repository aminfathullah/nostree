import { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  BarChart3, 
  Calendar, 
  Mail, 
  FileText, 
  Table, 
  Database, 
  Globe, 
  MessageSquare, 
  Video, 
  Code, 
  ExternalLink,
  ChevronDown, 
  Sparkles
} from 'lucide-react';

export const ICON_MAP = {
  folder: { label: 'Folder', icon: Folder, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  chart: { label: 'Grafik', icon: BarChart3, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  calendar: { label: 'Kalender', icon: Calendar, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  mail: { label: 'Email', icon: Mail, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  file: { label: 'Dokumen', icon: FileText, color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  sheet: { label: 'Spreadsheet', icon: Table, color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  database: { label: 'Database', icon: Database, color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  globe: { label: 'Web', icon: Globe, color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  message: { label: 'Pesan', icon: MessageSquare, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  video: { label: 'Video', icon: Video, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  code: { label: 'Kode', icon: Code, color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' },
  link: { label: 'Tautan', icon: ExternalLink, color: 'bg-brand/10 text-brand border-brand/20' },
} as const;

export type IconKey = keyof typeof ICON_MAP;

export function extractDomain(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return null;
  try {
    const withProto = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProto);
    if (!parsed.hostname || !parsed.hostname.includes('.')) return null;
    return parsed.hostname;
  } catch {
    return null;
  }
}

export function inferIconFromUrl(url?: string): IconKey {
  if (!url) return 'link';
  const lower = url.toLowerCase();
  if (lower.includes('drive.google') || lower.includes('dropbox') || lower.includes('onedrive')) return 'folder';
  if (lower.includes('docs.google.com/spreadsheets') || lower.includes('sheets') || lower.includes('excel') || lower.includes('airtable')) return 'sheet';
  if (lower.includes('docs.google.com/document') || lower.includes('notion.so') || lower.includes('pdf')) return 'file';
  if (lower.includes('calendar.google') || lower.includes('calendly')) return 'calendar';
  if (lower.includes('mailto:') || lower.includes('mail.')) return 'mail';
  if (lower.includes('meet.google') || lower.includes('zoom.us') || lower.includes('teams.microsoft')) return 'video';
  if (lower.includes('wa.me') || lower.includes('whatsapp') || lower.includes('telegram') || lower.includes('t.me') || lower.includes('slack')) return 'message';
  if (lower.includes('github.com') || lower.includes('gitlab.com')) return 'code';
  if (lower.includes('metabase') || lower.includes('tableau') || lower.includes('analytics') || lower.includes('looker')) return 'chart';
  return 'link';
}

export function LinkItemIcon({
  icon,
  emoji,
  url,
  size = 'md',
}: {
  icon?: string;
  emoji?: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const domain = extractDomain(url);
  const [errorLevel, setErrorLevel] = useState<number>(0);

  useEffect(() => {
    setErrorLevel(0);
  }, [domain]);

  if (emoji) {
    const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-10 h-10 text-lg' : 'w-9 h-9 text-base';
    return (
      <span className={`${sizeClasses} shrink-0 rounded-xl bg-canvas border border-border/80 flex items-center justify-center select-none shadow-xs`}>
        {emoji}
      </span>
    );
  }

  const isManualLucide = Boolean(icon && icon in ICON_MAP && icon !== 'link');

  if (!isManualLucide && domain && errorLevel < 2) {
    const faviconUrl = errorLevel === 0
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
      : `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;

    const sizeClasses = size === 'sm' 
      ? 'w-7 h-7 rounded-lg p-1' 
      : size === 'lg' 
        ? 'w-10 h-10 rounded-2xl p-2' 
        : 'w-9 h-9 rounded-xl p-1.5';

    return (
      <div className={`${sizeClasses} shrink-0 bg-white/95 dark:bg-zinc-800/90 border border-black/8 dark:border-white/10 shadow-xs flex items-center justify-center overflow-hidden transition-transform duration-150`}>
        <img
          src={faviconUrl}
          alt=""
          loading="lazy"
          className="w-full h-full object-contain rounded-xs"
          onError={() => setErrorLevel(prev => prev + 1)}
        />
      </div>
    );
  }

  const resolvedKey: IconKey = (icon && icon in ICON_MAP) 
    ? (icon as IconKey) 
    : inferIconFromUrl(url);

  const config = ICON_MAP[resolvedKey] || ICON_MAP.link;
  const IconComp = config.icon;

  const sizeClasses = size === 'sm' ? 'w-7 h-7 rounded-lg' : size === 'lg' ? 'w-10 h-10 rounded-2xl' : 'w-9 h-9 rounded-xl';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className={`${sizeClasses} shrink-0 flex items-center justify-center border shadow-xs ${config.color}`}>
      <IconComp className={iconSize} />
    </div>
  );
}

export function IconPickerDropdown({
  selectedIcon,
  selectedEmoji,
  url,
  onSelectIcon,
  onSelectEmoji,
}: {
  selectedIcon?: string;
  selectedEmoji?: string;
  url?: string;
  onSelectIcon: (icon: string | undefined) => void;
  onSelectEmoji: (emoji: string | undefined) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openUpward, setOpenUpward] = useState(false);
  const domain = extractDomain(url);

  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 360 && rect.top > 360);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isAutoFavicon = !selectedIcon && !selectedEmoji;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="h-10 px-2.5 rounded-xl bg-canvas border border-border hover:border-brand/40 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
        title="Pilih ikon / favicon"
      >
        <LinkItemIcon icon={selectedIcon} emoji={selectedEmoji} url={url} size="sm" />
        <ChevronDown className="w-3 h-3 text-txt-dim" />
      </button>

      {isOpen && (
        <div 
          className={`absolute left-0 z-50 w-72 p-3 bg-card border border-border rounded-2xl shadow-elevated animate-fade-in max-h-[min(420px,85vh)] overflow-y-auto ${
            openUpward 
              ? 'bottom-full mb-1.5 origin-bottom-left' 
              : 'top-full mt-1.5 origin-top-left'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <span className="text-xs font-semibold text-txt-main">Pilih Ikon Tautan</span>
            {(selectedIcon || selectedEmoji) && (
              <button
                type="button"
                onClick={() => {
                  onSelectIcon(undefined);
                  onSelectEmoji(undefined);
                }}
                className="text-[10px] text-brand hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Gunakan Favicon</span>
              </button>
            )}
          </div>

          <div className="mb-2.5">
            <button
              type="button"
              onClick={() => {
                onSelectIcon(undefined);
                onSelectEmoji(undefined);
                setIsOpen(false);
              }}
              className={`w-full p-2 rounded-xl flex items-center gap-2.5 border transition-all cursor-pointer ${
                isAutoFavicon 
                  ? 'border-brand bg-brand/10 text-brand' 
                  : 'border-border/60 hover:border-brand/40 bg-canvas/60 text-txt-muted hover:text-txt-main'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center p-1 shrink-0">
                {domain ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-brand" />
                )}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-xs font-semibold truncate leading-tight">Favicon Otomatis</p>
                <p className="text-[10px] text-txt-dim truncate">
                  {domain ? `Favicon dari ${domain}` : 'Otomatis dari URL'}
                </p>
              </div>
            </button>
          </div>

          <div className="text-[10px] text-txt-dim font-medium mb-1.5">Atau pilih ikon khusus:</div>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {(Object.keys(ICON_MAP) as IconKey[]).map((key) => {
              const item = ICON_MAP[key];
              const IconComp = item.icon;
              const isSelected = selectedIcon === key && !selectedEmoji;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSelectIcon(key);
                    onSelectEmoji(undefined);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer active:scale-[0.95] ${
                    isSelected 
                      ? 'border-brand bg-brand/10 text-brand' 
                      : 'border-border/60 hover:border-brand/40 bg-canvas/60 text-txt-muted hover:text-txt-main'
                  }`}
                  title={item.label}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="text-[9px] font-medium truncate max-w-full">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border">
            <label className="block text-[10px] text-txt-dim mb-1 font-medium">Atau gunakan karakter / emoji:</label>
            <input
              type="text"
              value={selectedEmoji || ''}
              onChange={(e) => {
                const val = e.target.value.trim();
                onSelectEmoji(val || undefined);
                if (val) onSelectIcon(undefined);
              }}
              placeholder="Contoh: ✦"
              className="w-full h-8 px-2.5 text-xs bg-canvas border border-border rounded-lg focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
              maxLength={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}

