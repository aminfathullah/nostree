import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useI18n } from '../i18n/context';
import { LanguageToggle } from '../components/ui/LanguageToggle';

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center relative bg-canvas">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="mb-4 flex justify-center">
        <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
      </div>
      <h1 className="text-2xl font-bold text-brand mb-2">{t("notFound.title")}</h1>
      <p className="text-txt-muted max-w-md mb-6 text-sm">
        {t("notFound.desc")}
      </p>
      <Link 
        to="/admin" 
        className="text-xs font-semibold px-4 py-2 rounded-xl bg-brand text-brand-fg hover:bg-brand-hover active:scale-[0.98] transition-all shadow-xs"
      >
        {t("notFound.returnDashboard")}
      </Link>
    </main>
  );
}
