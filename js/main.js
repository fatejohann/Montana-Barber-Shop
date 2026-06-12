/**
 * Montana Barber Shop — main.js
 * Comportamientos: nav scroll, hero scale, drawer mobile, Intersection Observer
 * Sin jQuery. Sin librerías externas. Respeta prefers-reduced-motion.
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     CONFIGURACIÓN GLOBAL
     ============================================================ */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. NAV — cambio de fondo al hacer scroll
     ============================================================ */
  var nav = document.getElementById('nav');

  function handleNavScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // estado inicial

  /* ============================================================
     2. HERO — animación scale(1.05 → 1) al cargar
     ============================================================ */
  var heroBg = document.getElementById('heroBg');

  if (heroBg && !prefersReducedMotion) {
    // Estado inicial: ligeramente ampliado
    heroBg.style.transform = 'scale(1.05)';
    heroBg.style.transition = 'transform 1500ms ease-out';

    // Forzar reflow para que el navegador registre el estado inicial
    // antes de aplicar el estado final
    heroBg.getBoundingClientRect();

    // Al cargar la imagen (o inmediatamente si ya está cacheada)
    function startHeroScale() {
      heroBg.style.transform = 'scale(1)';
    }

    if (heroBg.complete && heroBg.naturalWidth > 0) {
      // Imagen ya cacheada: pequeño delay para que el reflow se complete
      requestAnimationFrame(function () {
        requestAnimationFrame(startHeroScale);
      });
    } else {
      heroBg.addEventListener('load', startHeroScale, { once: true });
    }
  }

  /* ============================================================
     3. HERO — animaciones fade-up de los elementos al cargar
     ============================================================ */
  if (!prefersReducedMotion) {
    var heroContent = document.querySelector('.hero__content');
    if (heroContent) {
      var heroItems = [
        heroContent.querySelector('.hero__tag'),
        heroContent.querySelector('.hero__claim'),
        heroContent.querySelector('.hero__sub'),
        heroContent.querySelector('.hero__ctas')
      ];

      heroItems.forEach(function (el, i) {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 700ms cubic-bezier(0.23,1,0.32,1), transform 700ms cubic-bezier(0.23,1,0.32,1)';
        el.style.transitionDelay = (i * 100) + 'ms';

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      });
    }
  }

  /* ============================================================
     4. HAMBURGER / DRAWER MÓVIL
     ============================================================ */
  var hamburger     = document.getElementById('hamburger');
  var drawer        = document.getElementById('drawer');
  var drawerOverlay = document.getElementById('drawerOverlay');
  var drawerLinks   = drawer ? drawer.querySelectorAll('.drawer__link') : [];

  function openDrawer() {
    drawer.classList.add('is-open');
    drawerOverlay.classList.add('is-visible');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.removeAttribute('inert'); // links vuelven a ser enfocables
    drawerOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Mover el foco al primer link del menú (accesibilidad)
    if (drawerLinks.length) drawerLinks[0].focus();
  }

  function closeDrawer() {
    var wasOpen = drawer.classList.contains('is-open');
    drawer.classList.remove('is-open');
    drawerOverlay.classList.remove('is-visible');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', ''); // links dejan de ser tabbables
    drawerOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Devolver el foco al botón hamburguesa si el menú estaba abierto
    if (wasOpen && hamburger) hamburger.focus();
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  // Cerrar drawer al pulsar Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  });

  // Cerrar drawer al hacer clic en un link interno
  drawerLinks.forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  /* ============================================================
     5. SMOOTH SCROLL para links internos (#hash)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      // Logo u otros enlaces "#": volver al inicio de la página
      if (href === '#' || href === '#0') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
        return;
      }

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      var navHeight = nav ? nav.offsetHeight : 0;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });
  });

  /* ============================================================
     6. INTERSECTION OBSERVER — fade-up en secciones
     ============================================================ */
  var fadeElements = document.querySelectorAll('.fade-up');

  if (fadeElements.length > 0) {
    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animar solo una vez
        }
      });
    }, observerOptions);

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

});
