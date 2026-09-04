import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Folder,
  BarChart3,
  Mail,
  ExternalLink,
  FileText,
  Video,
  Globe,
  Layers,
  Sparkles
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function HomePage() {
  const navigate = useNavigate();
  const { pubkey, status } = useAuth();
  const isAuthenticated = Boolean(pubkey && status === "authenticated");
  const [claimedSlug, setClaimedSlug] = useState("");
  const [activeTab, setActiveTab] = useState<'utama' | 'koleksi'>('utama');

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
    <main className="min-h-screen bg-canvas text-txt-main flex flex-col justify-between selection:bg-brand selection:text-brand-fg">
      <nav className="border-b border-border bg-canvas/80 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Nostree Logo" className="w-7 h-7 object-contain" />
            <span className="font-bold text-base tracking-tight">Nostree</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/admin"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-brand text-brand-fg hover:bg-brand-hover active:scale-[0.98] transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/admin"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-brand text-brand-fg hover:bg-brand-hover active:scale-[0.98] transition-all"
              >
                Buka Editor
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full space-y-2.5 mb-6"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 text-brand text-[11px] font-medium border border-brand/20">
            <Sparkles className="w-3 h-3" />
            <span>Pusat Tautan Digital</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-main leading-snug">
            Satu Halaman untuk Seluruh Tautan Anda
          </h1>
          <p className="text-xs sm:text-sm text-txt-muted max-w-lg mx-auto leading-relaxed">
            Kumpulkan dokumen, portofolio, media sosial, atau referensi penting dalam satu halaman ringkas yang mudah dibagikan.
          </p>
        </motion.div>

        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="mb-8"
          >
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover active:scale-[0.98] text-brand-fg font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-xs"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleClaim}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="w-full mb-7"
          >
            <div className="flex items-center gap-2 p-1.5 bg-card border border-border focus-within:border-brand rounded-xl transition-colors shadow-xs">
              <div className="flex items-center px-3 text-txt-dim flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-txt-muted select-none">nostree.me/</span>
                <input
                  type="text"
                  value={claimedSlug}
                  onChange={(e) => setClaimedSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="tautan-anda"
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-txt-main placeholder:text-txt-dim focus:outline-none ml-1"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover active:scale-[0.98] text-brand-fg font-semibold rounded-lg text-xs transition-all shrink-0 cursor-pointer"
              >
                <span>Buat Halaman</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-txt-dim mt-2 text-center">
              Contoh: tautan-saya, projek, atau referensi
            </p>
          </motion.form>
        )}

        <div className="w-full mb-3 flex items-center justify-center gap-1 p-1 bg-card/80 border border-border rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('utama')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'utama'
                ? 'bg-brand/15 text-brand shadow-xs border border-brand/20'
                : 'text-txt-muted hover:text-txt-main'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Tautan Pilihan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('koleksi')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'koleksi'
                ? 'bg-brand/15 text-brand shadow-xs border border-brand/20'
                : 'text-txt-muted hover:text-txt-main'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Koleksi &amp; Dokumen</span>
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full bg-card border border-border rounded-2xl p-4 sm:p-5 text-left shadow-xs"
        >
          {activeTab === 'utama' ? (
            <>
              <div className="flex items-center gap-3 pb-3.5 border-b border-border">
                <div className="w-9 h-9 rounded-xl border border-brand/20 bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-xs sm:text-sm text-txt-main">Tautan Terpilih</h2>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-txt-dim">Akses Cepat &amp; Terorganisir</p>
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-canvas/60 border border-border hover:border-brand/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-txt-main">Dokumentasi &amp; Catatan</p>
                      <p className="text-[10px] text-txt-dim">Ringkasan materi &amp; referensi</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-txt-dim" />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-canvas/60 border border-border hover:border-brand/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-txt-main">Ruang Diskusi Virtual</p>
                      <p className="text-[10px] text-txt-dim">Tautan pertemuan &amp; sesi online</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-txt-dim" />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-canvas/60 border border-border hover:border-brand/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-txt-main">Dashboard &amp; Ringkasan</p>
                      <p className="text-[10px] text-txt-dim">Laporan berkala &amp; pemantauan</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-txt-dim" />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-canvas/60 border border-border hover:border-brand/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-txt-main">Folder Berkas Penting</p>
                      <p className="text-[10px] text-txt-dim">Penyimpanan &amp; arsip dokumen</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-txt-dim" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 pb-3.5 border-b border-border">
                <div className="w-9 h-9 rounded-xl border border-brand/20 bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-xs sm:text-sm text-txt-main">Koleksi Tautan</h2>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                      Direktori
                    </span>
                  </div>
                  <p className="text-[11px] text-txt-dim">Kumpulan Tautan Terkelola</p>
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-canvas/60 border border-border hover:border-brand/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-txt-main">Panduan &amp; Dokumentasi</p>
                      <p className="text-[10px] text-txt-dim">Koleksi referensi</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-txt-dim" />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-canvas/60 border border-border hover:border-brand/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-txt-main">Kontak &amp; Dukungan</p>
                      <p className="text-[10px] text-txt-dim">Saluran komunikasi</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-txt-dim" />
                </div>
              </div>
            </>
          )}
        </motion.div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full text-left">
          <div className="p-3 rounded-xl bg-card/60 border border-border">
            <p className="text-xs font-semibold text-txt-main">Cukup Satu Tautan</p>
            <p className="text-[11px] text-txt-dim mt-0.5 leading-relaxed">
              Semua link penting tersusun rapi dalam satu alamat praktis.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-card/60 border border-border">
            <p className="text-xs font-semibold text-txt-main">Rapi di Segala Perangkat</p>
            <p className="text-[11px] text-txt-dim mt-0.5 leading-relaxed">
              Tampil proporsional di layar ponsel, tablet, maupun desktop.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-card/60 border border-border">
            <p className="text-xs font-semibold text-txt-main">Mudah Dikelola</p>
            <p className="text-[11px] text-txt-dim mt-0.5 leading-relaxed">
              Ubah atau tambah tautan baru kapan saja secara instan.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-4 px-4 text-center text-[11px] text-txt-dim">
        <p>Nostree — Platform Berbagi Tautan</p>
      </footer>
    </main>
  );
}
