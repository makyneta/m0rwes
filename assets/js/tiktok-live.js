/**
 * tiktok-live.js — TikTok Live Status Checker
 *
 * Periodically polls an endpoint (or simulates in demo mode)
 * to determine whether Nicholas is currently live on TikTok,
 * and toggles the live banner on the homepage accordingly.
 *
 * ## How it works
 * 1. A live banner (<div class="live-banner">) exists in index.html,
 *    hidden by default (transform: translateY(-100%)).
 * 2. This script calls checkTikTokLiveStatus() every POLL_INTERVAL ms.
 * 3. If the result is true, the banner receives class "visible" and
 *    slides into view with a smooth CSS transition.
 * 4. If false, the banner stays (or returns to) hidden.
 *
 * ## Setup
 * - DEMO_MODE: Set to true to test the banner without a real backend.
 *   When true, the script toggles live status using localStorage,
 *   so you can manually trigger it from the browser console:
 *     > setDemoLive(true)   // show banner
 *     > setDemoLive(false)  // hide banner
 * - LIVE_STATUS_ENDPOINT: Replace this URL with a real endpoint that
 *   returns JSON { live: true/false } when you have a backend set up.
 *
 * ## Why a backend is needed
 * TikTok does not provide a public, free, official API for checking
 * live status from the browser (CORS restrictions). A small serverless
 * function (e.g. Cloudflare Worker, Vercel Edge Function, or similar)
 * can periodically check TikTok on the backend and expose a simple
 * JSON endpoint consumed here.
 */

/* ---- CONFIGURATION — Edit these values ---- */

/** Set to true to simulate live status for testing. */
const DEMO_MODE = true;

/** The live TikTok profile URL — used in the banner's "Watch Live" link. */
const TIKTOK_PROFILE_URL = 'https://www.tiktok.com/@m0rwes';

/**
 * LIVE_STATUS_ENDPOINT
 * Replace with your real backend endpoint once deployed.
 * Expected response: { live: boolean }
 * Example: https://your-worker.workers.dev/api/tiktok-status
 */
const LIVE_STATUS_ENDPOINT = 'https://YOUR-BACKEND-OR-SERVICE/api/tiktok-status';

/** How often to check (in milliseconds). Default: 60 000 (1 minute). */
const POLL_INTERVAL = 60000;

/* ---- DOM refs (populated on init) ---- */
let bannerEl = null;


/* ============================================
   checkTikTokLiveStatus()
   Returns a Promise that resolves to:
     true  → currently live
     false → not live (or error)
   ============================================ */
function checkTikTokLiveStatus() {
  return new Promise((resolve) => {
    if (DEMO_MODE) {
      /* ---- Demo mode: read from localStorage ---- */
      const demoStatus = localStorage.getItem('tiktok_demo_live') === 'true';
      console.log('[TikTok Live] DEMO_MODE — live status:', demoStatus);
      resolve(demoStatus);
      return;
    }

    /* ---- Production mode: fetch real endpoint ---- */
    fetch(LIVE_STATUS_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // mode: 'cors' is default for fetch
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const isLive = data.live === true;
        console.log('[TikTok Live] Endpoint response:', data);
        resolve(isLive);
      })
      .catch((err) => {
        /* Fail silently for end-users, log for debugging */
        console.warn('[TikTok Live] Check failed — will retry:', err.message);
        resolve(false);
      });
  });
}


/* ============================================
   updateBanner(isLive)
   Toggles the banner visibility with a smooth
   CSS transition.
   ============================================ */
function updateBanner(isLive) {
  if (!bannerEl) return;

  if (isLive) {
    bannerEl.classList.add('visible');
    console.log('[TikTok Live] Banner shown — Nicholas is live!');
  } else {
    bannerEl.classList.remove('visible');
  }
}


/* ============================================
   pollLiveStatus()
   Runs checkTikTokLiveStatus() immediately,
   then repeats every POLL_INTERVAL.
   ============================================ */
async function pollLiveStatus() {
  const isLive = await checkTikTokLiveStatus();
  updateBanner(isLive);
}


/* ============================================
   Initialisation
   Called automatically when the script loads.
   ============================================ */
(function init() {
  bannerEl = document.querySelector('.live-banner');
  if (!bannerEl) {
    /* Not on a page with a live banner — nothing to do */
    return;
  }

  /* Set the banner's "Watch Live" link */
  const watchLink = bannerEl.querySelector('.live-banner__link');
  if (watchLink) {
    watchLink.href = TIKTOK_PROFILE_URL;
  }

  /* Run immediately, then poll */
  pollLiveStatus();
  setInterval(pollLiveStatus, POLL_INTERVAL);
})();


/* ============================================
   Demo helper (only available when DEMO_MODE)
   Call from browser console to toggle live status.
     > setDemoLive(true)
     > setDemoLive(false)
   ============================================ */
if (DEMO_MODE) {
  window.setDemoLive = function (status) {
    localStorage.setItem('tiktok_demo_live', String(Boolean(status)));
    pollLiveStatus();
    console.log('[TikTok Live] Demo status set to:', Boolean(status));
  };
}
