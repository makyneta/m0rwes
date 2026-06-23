/**
 * include.js — Header/Footer Injection
 *
 * Fetches partials/header.html and partials/footer.html,
 * injects them into #site-header and #site-footer containers,
 * highlights the active nav link, and initialises UI behaviours.
 *
 * This script is loaded on every page via a <script> tag
 * in the <head> (deferred) or just before </body>.
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    /* ---- Inject Header ---- */
    const headerResp = await fetch('partials/header.html');
    if (!headerResp.ok) throw new Error(`Header fetch failed: ${headerResp.status}`);
    const headerHTML = await headerResp.text();
    document.getElementById('site-header').innerHTML = headerHTML;

    /* ---- Inject Footer ---- */
    const footerResp = await fetch('partials/footer.html');
    if (!footerResp.ok) throw new Error(`Footer fetch failed: ${footerResp.status}`);
    const footerHTML = await footerResp.text();
    document.getElementById('site-footer').innerHTML = footerHTML;

    /* ---- Set current year in footer ---- */
    const yearSpan = document.getElementById('footer-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* ---- Set active nav link ---- */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach((link) => {
      const page = link.getAttribute('data-page');
      if (page === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    /* ---- Initialise UI behaviours ---- */
    initMobileNav();
    initScrollHeader();
    initFadeIn();

  } catch (err) {
    console.error('include.js — Error loading partials:', err);
  }
});


/* -----------------------------------------------
   Mobile Nav Toggle
   ----------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if (!toggle || !navList) return;

  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);

    /* Prevent body scroll while nav is open */
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close nav when a link is clicked */
  navList.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}


/* -----------------------------------------------
   Header scroll effect (background blur)
   ----------------------------------------------- */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const checkScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll(); // initial state
}


/* -----------------------------------------------
   Scroll-triggered fade-in animations
   Uses IntersectionObserver — no libraries.
   ----------------------------------------------- */
function initFadeIn() {
  const targets = document.querySelectorAll('.fade-in, .fade-in--left, .fade-in--right');

  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    }
  );

  targets.forEach((el) => observer.observe(el));
}
