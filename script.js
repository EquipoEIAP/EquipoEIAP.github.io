const siteHeader = document.querySelector('#site-header');
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('#main-nav');
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const backToTop = document.querySelector('.back-to-top');
const quoteForm = document.querySelector('#cotizacion');
const formStatus = document.querySelector('#form-status');
const currentYear = document.querySelector('#current-year');

const setMenuState = (isOpen) => {
    if (!navToggle || !mainNav) return;

    mainNav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

    const icon = navToggle.querySelector('i');
    if (icon) {
        icon.className = isOpen ? 'bi bi-x-lg' : 'bi bi-list';
    }
};

if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenuState(false);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 860) setMenuState(false);
    });
}

const updateScrollUI = () => {
    const hasScrolled = window.scrollY > 18;
    siteHeader?.classList.toggle('is-scrolled', hasScrolled);
    backToTop?.classList.toggle('is-visible', window.scrollY > 650);
};

updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -55px' }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
}

const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

if ('IntersectionObserver' in window && observedSections.length) {
    const navigationObserver = new IntersectionObserver(
        (entries) => {
            const visibleEntry = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visibleEntry) return;

            navLinks.forEach((link) => {
                link.classList.toggle(
                    'is-active',
                    link.getAttribute('href') === `#${visibleEntry.target.id}`
                );
            });
        },
        { rootMargin: '-28% 0px -58%', threshold: [0.05, 0.25, 0.5] }
    );

    observedSections.forEach((section) => navigationObserver.observe(section));
}

quoteForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
    }

    const formData = new FormData(quoteForm);
    const nombre = String(formData.get('nombre') || '').trim();
    const organizacion = String(formData.get('organizacion') || '').trim();
    const telefono = String(formData.get('telefono') || '').trim();
    const ciudad = String(formData.get('ciudad') || '').trim();
    const linea = String(formData.get('linea') || '').trim();
    const mensaje = String(formData.get('mensaje') || '').trim();

    const whatsappMessage = [
        'Hola EIAP, quisiera solicitar una cotización.',
        '',
        `Nombre: ${nombre}`,
        `Organización: ${organizacion || 'No aplica'}`,
        `Teléfono: ${telefono}`,
        `Ciudad: ${ciudad}`,
        `Línea de interés: ${linea}`,
        '',
        'Necesidad o proyecto:',
        mensaje
    ].join('\n');

    const whatsappUrl = `https://wa.me/573017903532?text=${encodeURIComponent(whatsappMessage)}`;
    const whatsappWindow = window.open(whatsappUrl, '_blank');

    if (whatsappWindow) {
        whatsappWindow.opener = null;
        formStatus.textContent = 'Abrimos WhatsApp con tu solicitud lista para enviar.';
    } else {
        formStatus.textContent = 'Permite las ventanas emergentes para abrir WhatsApp.';
    }
});
