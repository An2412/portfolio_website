import { useState, useCallback, memo, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { FaMoon, FaSun, FaBars, FaFileDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useActiveSection } from '../hooks/useActiveSection';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { setProgrammaticScroll } from '../utils/scrollLock';
import { scrollToSection } from '../utils/scrollToSection';
import { SUPABASE_KEY, SUPABASE_URL } from '../lib/supabaseEnv';

const NAV_ITEMS = ['home', 'about', 'experience', 'skills', 'projects'] as const;

interface CVEntry {
    url: string;
    file_name: string;
    label: string;
}

function Header() {
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const activeSection = useActiveSection(NAV_ITEMS);
    const navigate = useNavigate();
    const [activeCV, setActiveCV] = useState<CVEntry | null>(null);

    // Fetch the default CV through the Supabase REST API.
    // Using fetch instead of the SDK keeps @supabase/supabase-js out of the initial bundle
    // (the SDK is only needed by the lazy-loaded admin area).
    useEffect(() => {
        if (!SUPABASE_URL || !SUPABASE_KEY) return;

        const controller = new AbortController();

        fetch(
            `${SUPABASE_URL}/rest/v1/cv_entries?select=url,file_name,label&is_default=eq.true&limit=1`,
            {
                headers: {
                    // `apikey` is enough for the public anon role; sending a
                    // publishable key as a Bearer token can fail JWT validation.
                    apikey: SUPABASE_KEY,
                },
                signal: controller.signal,
            }
        )
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((rows: CVEntry[]) => {
                if (Array.isArray(rows) && rows[0]) setActiveCV(rows[0]);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                console.error("Error fetching CV in Header:", error);
            });

        return () => controller.abort();
    }, []);

    const toggleLang = useCallback(() => {
        const nextLanguage = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(nextLanguage);
        document.documentElement.lang = nextLanguage;
    }, [i18n]);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    const goToSection = useCallback((item: string) => {
        navigate(item === 'home' ? '/' : `/${item}`);

        // The scroll observer mirrors the active section into the URL. That can
        // make the router location stale relative to window.location, so a click
        // on the already-highlighted item would not re-run ScrollHandler.
        // Scroll explicitly to keep every nav click responsive.
        setProgrammaticScroll(true);
        scrollToSection(item);
    }, [navigate]);

    return (
        <header className="fixed top-0 w-full z-50 bg-light-card/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-light-border dark:border-dark-border transition-colors duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-2xl font-bold dark:text-white tracking-tighter hover:scale-105 transition-transform flex items-center gap-2" id="nav-logo">
                    <img src="/logo.png" alt="Logo" width="32" height="32" className="w-8 h-8 rounded-full" loading="lazy" />
                    <span>&lt;ANRO<span className="text-primary">/</span>&gt;</span>
                </a>

                {/* Desktop Menu - Switch to lg to prevent overlap on tablets */}
                <nav className="hidden lg:flex space-x-1 xl:space-x-2">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item}
                            onClick={() => goToSection(item)}
                            className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${activeSection === item
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            {activeSection === item && (
                                <motion.span
                                    layoutId="activeSection"
                                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg -z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 30
                                    }}
                                />
                            )}
                            {t(`nav.${item}`)}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {/* CV Download Button - Desktop */}
                    {activeCV && (
                        <a
                            href={`${activeCV.url}?download=${encodeURIComponent(activeCV.label)}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`${activeCV.label}.pdf`}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <FaFileDownload />
                            <span>{t('nav.download_cv')}</span>
                        </a>
                    )}

                    {/* Language Switcher */}
                    <button
                        onClick={toggleLang}
                        aria-label={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card transition-colors text-sm font-bold text-primary"
                    >
                        {i18n.language.toUpperCase()}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card transition-colors text-gray-600 dark:text-yellow-400"
                    >
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>

                    {/* Mobile Menu Button - Show on lg and below */}
                    <button
                        className="lg:hidden text-gray-900 dark:text-white focus:outline-none"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <FaBars className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-light-card dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
                    <nav className="flex flex-col p-4 space-y-4">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item}
                                className={`text-left text-sm font-medium transition-colors hover:text-primary ${activeSection === item
                                    ? 'text-primary'
                                    : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                onClick={() => {
                                    goToSection(item);
                                    closeMobileMenu();
                                }}
                            >
                                {t(`nav.${item}`)}
                            </button>
                        ))}

                        {/* Mobile CV Button */}
                        {activeCV && (
                            <a
                                href={`${activeCV.url}?download=${encodeURIComponent(activeCV.label)}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={`${activeCV.label}.pdf`}
                                className="flex items-center gap-2 text-sm font-medium text-primary"
                            >
                                <FaFileDownload />
                                <span>{t('nav.download_cv')}</span>
                            </a>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

export default memo(Header);
