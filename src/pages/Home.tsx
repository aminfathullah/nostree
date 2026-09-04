import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Zap, 
  Palette, 
  Lock, 
  Sparkles, 
  Layers, 
  ExternalLink,
  CheckCircle2,
  Share2
} from 'lucide-react';
import logo from '../assets/logo.png';

const bentoFeatures = [
  {
    colSpan: "md:col-span-2",
    icon: Zap,
    title: "Sub-Second Performance",
    description: "Engineered to load instantly with zero redirect delays. Your links render in under 300ms across the globe.",
    badge: "Blazing Fast",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    colSpan: "md:col-span-1",
    icon: Palette,
    title: "16+ Curated Themes",
    description: "From deep obsidian to crisp minimalist light, or tailor your exact palette with custom CSS tokens.",
    badge: "Expressive",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    colSpan: "md:col-span-1",
    icon: Lock,
    title: "Zero Platform Lock-in",
    description: "Never worry about a platform banning your account or locking your links behind $15/month paywalls.",
    badge: "Yours Forever",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    colSpan: "md:col-span-2",
    icon: Layers,
    title: "Bento Folders & Groups",
    description: "Group your projects, socials, articles, and recommendations into organized, collapsible Bento compartments.",
    badge: "Smart Layout",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
];

export default function HomePage() {
  const { pubkey, status } = useAuth();
  const isAuthenticated = Boolean(pubkey && status === "authenticated");

  return (
    <main className="min-h-screen bg-canvas text-txt-main overflow-x-hidden selection:bg-brand selection:text-brand-fg">
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-canvas/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Nostree Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">Nostree</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/admin"
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-brand text-brand-fg hover:bg-brand-hover shadow-sm transition-all active:scale-[0.98]"
              >
                Go to Editor
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-txt-muted hover:text-txt-main hover:bg-card transition-colors active:scale-[0.98]"
                >
                  Sign In
                </Link>
                <Link
                  to="/admin"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-brand text-brand-fg hover:bg-brand-hover shadow-sm transition-all active:scale-[0.98]"
                >
                  Create Free Tree
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Modern Link Organizer</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6"
          >
            One link.{" "}
            <span className="bg-gradient-to-r from-brand via-purple-500 to-accent bg-clip-text text-transparent">
              Infinite expression.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-base sm:text-xl text-txt-muted max-w-2xl leading-relaxed mb-8"
          >
            Organize your projects, socials, and work in a stunning Bento-style link hub. Blazing fast, free forever, and owned completely by you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto justify-center mb-16"
          >
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand hover:bg-brand-hover text-brand-fg font-semibold rounded-2xl shadow-elevated transition-all active:scale-[0.98] text-sm sm:text-base"
            >
              <span>Build Your Free Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#preview"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-card hover:bg-card-hover border border-border text-txt-main font-semibold rounded-2xl transition-all active:scale-[0.98] text-sm sm:text-base"
            >
              <span>Explore Features</span>
            </a>
          </motion.div>

          <motion.div
            id="preview"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="glass-card bg-card/90 rounded-[2.5rem] p-6 border border-border shadow-elevated text-left">
              <div className="flex items-center justify-between pb-5 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand/30 shadow-xs">
                    <img
                      src="https://api.dicebear.com/7.x/shapes/svg?seed=CreativeStudio"
                      alt="Creator Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-bold text-sm sm:text-base text-txt-main tracking-tight">Alex Rivers</h2>
                      <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                    </div>
                    <p className="text-xs text-txt-dim">Product Designer &amp; Builder</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-canvas border border-border text-txt-dim">
                  <Share2 className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3 pt-5">
                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="group block p-3.5 rounded-2xl bg-canvas/70 hover:bg-card border border-border/80 hover:border-brand/40 shadow-xs transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg p-1.5 rounded-xl bg-card border border-border/60">🎨</span>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-txt-main">Selected Design Portfolio 2026</p>
                        <p className="text-[11px] text-txt-dim">Case studies, design systems, and apps</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-txt-dim group-hover:text-brand transition-colors" />
                  </div>
                </a>

                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="group block p-3.5 rounded-2xl bg-canvas/70 hover:bg-card border border-border/80 hover:border-brand/40 shadow-xs transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg p-1.5 rounded-xl bg-card border border-border/60">🎙️</span>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-txt-main">Design Engineering Podcast</p>
                        <p className="text-[11px] text-txt-dim">Weekly episodes on UI micro-interactions</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-txt-dim group-hover:text-brand transition-colors" />
                  </div>
                </a>

                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="group block p-3.5 rounded-2xl bg-canvas/70 hover:bg-card border border-border/80 hover:border-brand/40 shadow-xs transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg p-1.5 rounded-xl bg-card border border-border/60">⚡</span>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-txt-main">Tip via Lightning Zap</p>
                        <p className="text-[11px] text-txt-dim">Support my open source writings</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-txt-dim group-hover:text-brand transition-colors" />
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Why Creators Choose Nostree
            </h2>
            <p className="text-txt-muted text-sm sm:text-base max-w-xl mx-auto">
              Everything you need to showcase your presence, without corporate gatekeeping or subscription fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bentoFeatures.map((feat, idx) => (
              <div
                key={idx}
                className={`${feat.colSpan} p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-card hover:border-brand/40 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-txt-main mb-2 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-txt-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-brand/10 via-card to-purple-500/10 border border-brand/20 shadow-elevated text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-brand" />
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Instant Setup</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-txt-main mb-3">
              Your link hub is waiting.
            </h2>
            <p className="text-sm sm:text-base text-txt-muted max-w-lg mx-auto mb-8">
              No complicated sign-up form. Open the editor, add your links, pick a theme, and publish in seconds.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-brand-fg font-semibold rounded-2xl shadow-elevated transition-all active:scale-[0.98] text-sm sm:text-base"
            >
              <span>Create Your Free Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border text-xs text-txt-dim">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-txt-muted font-semibold">
            <img src={logo} alt="Nostree Logo" className="w-6 h-6 object-contain" />
            <span>Nostree</span>
          </div>
          <p>
            Clean, decentralized link organizer for modern creators.
          </p>
        </div>
      </footer>
    </main>
  );
}
