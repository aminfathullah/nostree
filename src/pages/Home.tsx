import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Briefcase,
  Layers, 
  Zap, 
  Folder,
  BarChart3,
  Calendar,
  Mail,
  Share2, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import logo from '../assets/logo.png';

const features = [
  {
    icon: Layers,
    title: "Terpusat & Mudah Dicari",
    description: "Rekan kerja tidak perlu lagi berulang kali menanyakan link dokumen atau folder drive yang tercecer di riwayat pesan.",
    badge: "Terorganisir",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    icon: Zap,
    title: "Akses Cepat & Ringan",
    description: "Dimuat instan tanpa instalasi aplikasi. Nyaman dibuka langsung dari komputer kantor maupun ponsel.",
    badge: "Responsif",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    icon: CheckCircle2,
    title: "Pengelompokan Fleksibel",
    description: "Kelompokkan tautan berdasarkan kategori proyek, divisi, atau jenis berkas dengan tampilan yang bersih dan formal.",
    badge: "Praktis",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

const steps = [
  {
    num: "1",
    title: "Tentukan Alamat Halaman",
    description: "Gunakan nama Anda atau singkatan tim, misalnya nostree.me/budi atau nostree.me/divisi-it.",
  },
  {
    num: "2",
    title: "Susun Tautan Kerja",
    description: "Masukkan folder Drive, spreadsheet rekap, dashboard kerja, dokumen SOP, dan kontak koordinasi.",
  },
  {
    num: "3",
    title: "Bagikan ke Rekan Kantor",
    description: "Kirimkan tautan saat koordinasi penugasan atau cantumkan pada profil komunikasi kerja tim.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { pubkey, status } = useAuth();
  const isAuthenticated = Boolean(pubkey && status === "authenticated");
  const [claimedSlug, setClaimedSlug] = useState("");

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = claimedSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!clean) {
      navigate('/admin');
      return;
    }
    navigate(`/admin?claim=${encodeURIComponent(clean)}`);
  };

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
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-brand text-brand-fg hover:bg-brand-hover shadow-xs transition-all active:scale-[0.98]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-txt-muted hover:text-txt-main hover:bg-card transition-colors active:scale-[0.98]"
                >
                  Masuk
                </Link>
                <Link
                  to="/admin"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-brand text-brand-fg hover:bg-brand-hover shadow-xs transition-all active:scale-[0.98]"
                >
                  Buka Editor
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold mb-6 shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Direktori &amp; Tautan Kerja Pegawai</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-5 text-txt-main"
          >
            Satu tautan untuk semua kebutuhan kerja Anda.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-sm sm:text-lg text-txt-muted max-w-2xl leading-relaxed mb-8"
          >
            Kumpulkan folder dokumen, spreadsheet tim, dashboard proyek, dan kontak koordinasi dalam satu halaman profil yang rapi dan mudah diakses rekan kantor.
          </motion.p>

          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14"
            >
              <Link
                to="/admin"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand hover:bg-brand-hover text-brand-fg font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] text-sm sm:text-base cursor-pointer"
              >
                <span>Buka Dashboard Kerja</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleClaim}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="w-full max-w-xl mx-auto mb-14"
            >
              <div className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-card border border-border focus-within:border-brand rounded-2xl shadow-xs transition-colors">
                <div className="flex items-center px-4 py-3 sm:py-0 text-txt-dim bg-canvas sm:bg-transparent rounded-xl sm:rounded-none flex-1">
                  <span className="text-sm font-semibold text-txt-muted select-none">nostree.me/</span>
                  <input
                    type="text"
                    value={claimedSlug}
                    onChange={(e) => setClaimedSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="nama-atau-divisi"
                    className="w-full bg-transparent text-sm font-semibold text-txt-main placeholder:text-txt-dim/70 focus:outline-none ml-1"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand-hover text-brand-fg font-semibold rounded-xl text-sm transition-all active:scale-[0.98] shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Buat Halaman Kerja</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-txt-dim mt-2.5">
                Contoh: budi-santoso atau tim-analisis. Siap pakai langsung tanpa instalasi.
              </p>
            </motion.form>
          )}

          <motion.div
            id="preview"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-card rounded-3xl p-6 border border-border shadow-xs text-left">
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl border border-brand/20 bg-brand/10 text-brand font-bold flex items-center justify-center text-base">
                    BS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm sm:text-base text-txt-main tracking-tight">Budi Santoso</h2>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-txt-dim">Divisi Analisis Data &amp; Pelaporan</p>
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
                  className="group block p-3.5 rounded-xl bg-canvas/60 hover:bg-card border border-border hover:border-brand/40 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-txt-main">Folder Dokumen &amp; SOP Tim</p>
                        <p className="text-[11px] text-txt-dim">Panduan kerja dan template laporan resmi</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-txt-dim group-hover:text-brand transition-colors" />
                  </div>
                </a>

                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="group block p-3.5 rounded-xl bg-canvas/60 hover:bg-card border border-border hover:border-brand/40 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-txt-main">Dashboard Monitoring Capaian</p>
                        <p className="text-[11px] text-txt-dim">Metrik progres mingguan dan status tiket</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-txt-dim group-hover:text-brand transition-colors" />
                  </div>
                </a>

                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="group block p-3.5 rounded-xl bg-canvas/60 hover:bg-card border border-border hover:border-brand/40 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-txt-main">Jadwal &amp; Agenda Koordinasi</p>
                        <p className="text-[11px] text-txt-dim">Kalender shift kerja dan jadwal rapat mingguan</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-txt-dim group-hover:text-brand transition-colors" />
                  </div>
                </a>

                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="group block p-3.5 rounded-xl bg-canvas/60 hover:bg-card border border-border hover:border-brand/40 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-txt-main">Kontak Langsung Pegawai</p>
                        <p className="text-[11px] text-txt-dim">Email dinas &amp; saluran koordinasi tugas</p>
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

      <section className="py-16 px-4 border-t border-border bg-card/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Alur Penggunaan Praktis
            </h2>
            <p className="text-txt-muted text-sm sm:text-base max-w-lg mx-auto">
              Didesain sederhana agar setiap pegawai atau unit kerja dapat langsung menyusun dan membagikan tautan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand font-bold flex items-center justify-center text-sm mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-txt-main mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-txt-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Efisien untuk Kebutuhan Kantor
            </h2>
            <p className="text-txt-muted text-sm sm:text-base max-w-lg mx-auto">
              Mempermudah pertukaran informasi dan koordinasi antar pegawai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-card border border-border hover:border-brand/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                      <feat.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-txt-main mb-2 tracking-tight">
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
        <div className="max-w-3xl mx-auto">
          <div className="p-8 sm:p-10 rounded-3xl bg-card border border-border text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-main mb-3">
              Mulai rapikan tautan kerja Anda.
            </h2>
            <p className="text-sm text-txt-muted max-w-lg mx-auto mb-6">
              Langsung buka editor, susun tautan dokumen tim, dan bagikan ke rekan kerja dengan satu alamat praktis.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-brand-fg font-semibold rounded-xl transition-all active:scale-[0.98] text-sm cursor-pointer shadow-xs"
            >
              <span>Buka Editor Sekarang</span>
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
            Direktori &amp; Tautan Kerja Internal Pegawai.
          </p>
        </div>
      </footer>
    </main>
  );
}
