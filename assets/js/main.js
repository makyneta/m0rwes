/**
 * main.js — Site-wide behaviours
 *
 * Contains the lightbox module and any page-specific
 * initialisation that runs after partials are loaded.
 *
 * This file is loaded after include.js so the DOM
 * is guaranteed to have header + footer in place.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
});


/* ============================================
   LIGHTBOX — Vanilla JS image viewer
   Works with .gallery-grid__item and [data-lightbox]
   elements (homepage gallery teaser).
   ============================================ */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-grid__item, [data-lightbox]');
  if (!galleryItems.length) return;

  /* ---- Build lightbox DOM ---- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Visualizador de imagens');
  lb.innerHTML = `
    <button class="lightbox__close" aria-label="Fechar">&times;</button>
    <button class="lightbox__prev" aria-label="Imagem anterior">&#8249;</button>
    <button class="lightbox__next" aria-label="Próxima imagem">&#8250;</button>
    <img class="lightbox__image" src="" alt="">
    <span class="lightbox__counter"></span>
  `;
  document.body.appendChild(lb);

  const lbImg        = lb.querySelector('.lightbox__image');
  const lbClose      = lb.querySelector('.lightbox__close');
  const lbPrev       = lb.querySelector('.lightbox__prev');
  const lbNext       = lb.querySelector('.lightbox__next');
  const lbCounter    = lb.querySelector('.lightbox__counter');

  /* Collect image sources from the gallery grid items */
  const images = [];
  galleryItems.forEach((item) => {
    const img = item.querySelector('img');
    if (img) {
      const src = img.getAttribute('data-full') || img.src;
      images.push(src);
    }
  });

  let currentIndex = 0;

  /* ---- Open lightbox ---- */
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      currentIndex = idx;
      openLightbox();
    });
  });

  function openLightbox() {
    loadImage(currentIndex);
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCounter();
  }

  function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.classList.remove('loaded');
  }

  function loadImage(index) {
    const src = images[index];
    if (!src) return;
    lbImg.classList.remove('loaded');
    lbImg.src = src;
    lbImg.onload = () => lbImg.classList.add('loaded');
    currentIndex = index;
    updateCounter();
  }

  function updateCounter() {
    lbCounter.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  function prevImage() {
    if (images.length <= 1) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    loadImage(currentIndex);
  }

  function nextImage() {
    if (images.length <= 1) return;
    currentIndex = (currentIndex + 1) % images.length;
    loadImage(currentIndex);
  }

  /* ---- Event listeners ---- */
  lbClose.addEventListener('click', closeLightbox);

  lbPrev.addEventListener('click', prevImage);
  lbNext.addEventListener('click', nextImage);

  /* Click outside image to close */
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  /* Keyboard navigation */
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': prevImage(); break;
      case 'ArrowRight': nextImage(); break;
    }
  });
}
