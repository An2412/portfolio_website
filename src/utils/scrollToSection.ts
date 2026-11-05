const HEADER_OFFSET = 80;

/**
 * Scroll to a section by id. Returns false when the section is not mounted yet
 * (the below-the-fold sections are lazy-loaded).
 */
export function scrollToSection(sectionId: string, behavior: ScrollBehavior = 'smooth'): boolean {
    if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior });
        return true;
    }

    const element = document.getElementById(sectionId);
    if (!element) return false;

    const offsetPosition = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: offsetPosition, behavior });
    return true;
}
