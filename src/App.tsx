import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { Footer, Contact } from './components/Footer';
import NotFound from './components/NotFound';
import { useGitHubData } from './hooks/useGitHubData';
import { FloatingShapesBackground } from '@/components/animate-ui/components/backgrounds/floating-shapes';

// Lazy Load Heavy Components
const About = lazy(() => import('./components/About'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const Experience = lazy(() => import('./components/Experience'));
const AdminGate = lazy(() => import('./components/admin/AdminGate'));

import { setProgrammaticScroll } from '@/utils/scrollLock';
import { scrollToSection } from '@/utils/scrollToSection';

const SCROLLABLE_SECTIONS = new Set(['about', 'experience', 'skills', 'projects']);

function ScrollHandler() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top if heading to home/root
    if (pathname === '/' || pathname === '/home') {
      setProgrammaticScroll(true);
      scrollToSection('home');
      return;
    }

    // Sections are lazy-loaded, so the target may not be in the DOM on the
    // first tick (especially on a hard refresh of /projects). Retry briefly.
    const sectionId = pathname.replace('/', '');
    if (!SCROLLABLE_SECTIONS.has(sectionId)) return;

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Ignore the scroll observer while the target section is still mounting,
    // otherwise it would briefly mark "home" as active on a deep link.
    setProgrammaticScroll(true, 3000);

    const scrollToTarget = () => {
      if (cancelled) return;

      const element = document.getElementById(sectionId);
      if (!element) {
        if (attempts++ < 40) timer = setTimeout(scrollToTarget, 100);
        return;
      }

      setProgrammaticScroll(true);
      scrollToSection(sectionId);
    };

    scrollToTarget();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}

function MainContent() {
  const { user, repos, loading } = useGitHubData();

  return (
    <main>
      {/* Hero loaded immediately for LCP */}
      <Hero user={user} loading={loading} />

      {/* Lazy load below-the-fold content */}
      <Suspense fallback={<div className="h-screen" />}>
        <About user={user} />
        <Experience />
        <Skills repos={repos} loading={loading} />
        <Projects repos={repos} loading={loading} />
        <Contact />
      </Suspense>
    </main>
  );
}

function App() {
  return (
    <div className="bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text font-sans antialiased transition-colors duration-300 relative min-h-screen overflow-x-hidden w-full">
      <ScrollHandler />
      {/* Unified Background: Floating Shapes for both Light and Dark modes */}
      <FloatingShapesBackground
        className="fixed inset-0 z-0 pointer-events-none"
      />

      <Header />
      <div className="relative z-10">

        {/* We use Routes but render the same MainContent for all valid sections to preserve the Single Page feel */}
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/home" element={<MainContent />} />
          <Route path="/about" element={<MainContent />} />
          <Route path="/experience" element={<MainContent />} />
          <Route path="/skills" element={<MainContent />} />
          <Route path="/projects" element={<MainContent />} />

          {/* Hidden Admin Route — lazy, so Supabase Auth is not in the public bundle */}
          <Route path="/cv-mn" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Admin...</div>}>
              <AdminGate />
            </Suspense>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
      </div>
    </div>
  );
}

export default App;
