document.getElementById('year').textContent = new Date().getFullYear();

// Nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 12);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu toggle
const burger = document.getElementById('navBurger');
const navMobilePanel = document.getElementById('navMobilePanel');

burger.addEventListener('click', () => {
  const open = navMobilePanel.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navMobilePanel.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// Pre-select service in contact form when a pricing card CTA is clicked
const serviceSelect = document.getElementById('f-service');
document.querySelectorAll('[data-service]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (serviceSelect) serviceSelect.value = btn.dataset.service;
  });
});

// Contact form -> submitted to Netlify Forms in the background (no page reload).
// Netlify collects the submission, emails HeizungsTreuhand automatically, and
// this script then shows an on-page confirmation to the customer. Only works
// once the site is deployed on Netlify — a plain "npm start"/local preview
// won't have a Netlify server behind it to receive the POST.
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('formSubmitBtn');
const formNote = document.getElementById('formNote');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet…';

    const showError = () => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Anfrage senden';
      formNote.textContent =
        'Das hat leider nicht geklappt. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt: Telefon 052 551 00 23 oder info@heizungstreuhand.ch.';
    };

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    })
      .then((response) => {
        if (response.ok) {
          form.hidden = true;
          formSuccess.hidden = false;
          // GA4: successful lead, no form data sent — just the bare event,
          // and only if the visitor has actually consented to analytics.
          trackEvent('generate_lead');
        } else {
          showError();
        }
      })
      .catch(showError);
  });
}

// ---------------------------------------------------------------------------
// Cookie-Consent & Google Analytics 4
//
// Non-essential analytics only ever loads after explicit opt-in. The choice
// itself is stored locally in the browser (localStorage, not a cookie) so we
// don't ask again on every visit. Nothing analytics-related is loaded, and no
// GA cookies are set, until the visitor has actively consented.
// ---------------------------------------------------------------------------
(function () {
  const GA_MEASUREMENT_ID = 'G-XFTDKKRGY5';

  const STORAGE_KEY = 'htz-consent';
  const CONSENT_VERSION = 1;

  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === CONSENT_VERSION) return parsed;
      return null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        analytics: analytics,
        date: new Date().toISOString(),
      }));
    } catch (e) {
      /* Local Storage nicht verfügbar (z. B. privates Fenster) — Banner
         erscheint dann bei jedem Besuch erneut, Verhalten bleibt sicher. */
    }
  }

  let gaReady = false;

  function loadGA4() {
    if (gaReady) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf('XXXX') !== -1) {
      console.warn('GA4: Keine Messwert-ID hinterlegt — Analytics wird nicht geladen.');
      return;
    }
    gaReady = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      // Keine Google-Signale / Anzeigenpersonalisierung — reine Statistik.
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
  }

  function trackEvent(name) {
    const consent = readConsent();
    if (consent && consent.analytics && window.gtag) {
      window.gtag('event', name);
    }
  }
  window.htzTrackEvent = trackEvent;

  // --- Banner & Einstellungs-Dialog: Markup wird injiziert, damit es auf
  //     allen Seiten garantiert identisch ist (eine Quelle, keine Kopien). ---

  function buildUI() {
    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.id = 'consentBanner';
    banner.hidden = true;
    banner.innerHTML =
      '<div class="consent-banner-inner">' +
        '<div class="consent-banner-text">' +
          '<h2>Diese Website verwendet Cookies</h2>' +
          '<p>Wir nutzen technisch notwendige Funktionen sowie – nur mit Ihrer Einwilligung – Google Analytics zur anonymisierten Besucherstatistik. Mehr dazu in unserer <a href="/datenschutz.html">Datenschutzerklärung</a>.</p>' +
        '</div>' +
        '<div class="consent-banner-actions">' +
          '<button type="button" class="btn btn-outline" id="consentSettingsBtn">Einstellungen</button>' +
          '<button type="button" class="btn btn-outline" id="consentRejectBtn">Nur notwendige</button>' +
          '<button type="button" class="btn btn-primary" id="consentAcceptBtn">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';

    const modal = document.createElement('div');
    modal.className = 'consent-modal';
    modal.id = 'consentModal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="consent-modal-backdrop" id="consentModalBackdrop"></div>' +
      '<div class="consent-modal-panel" role="dialog" aria-modal="true" aria-labelledby="consentModalTitle">' +
        '<h2 id="consentModalTitle">Cookie-Einstellungen</h2>' +
        '<p>Wählen Sie, welche Kategorien Sie zulassen möchten. Notwendige Funktionen sind für den Betrieb der Website erforderlich und lassen sich nicht deaktivieren.</p>' +
        '<div class="consent-category">' +
          '<div class="consent-category-head">' +
            '<span class="consent-category-title">Notwendig</span>' +
            '<span class="consent-toggle consent-toggle-locked" aria-hidden="true"><span class="consent-toggle-dot"></span></span>' +
          '</div>' +
          '<p class="consent-category-desc">Erforderlich für grundlegende Funktionen wie das Kontaktformular und die Navigation.</p>' +
        '</div>' +
        '<div class="consent-category">' +
          '<div class="consent-category-head">' +
            '<label class="consent-category-title" for="consentAnalyticsToggle">Statistik</label>' +
            '<button type="button" class="consent-toggle" id="consentAnalyticsToggle" role="switch" aria-checked="false"><span class="consent-toggle-dot"></span></button>' +
          '</div>' +
          '<p class="consent-category-desc">Google Analytics hilft uns zu verstehen, wie Besucher:innen unsere Website nutzen. Wird erst nach Aktivierung geladen.</p>' +
        '</div>' +
        '<div class="consent-modal-actions">' +
          '<button type="button" class="btn btn-outline" id="consentModalRejectBtn">Nur notwendige</button>' +
          '<button type="button" class="btn btn-primary" id="consentModalSaveBtn">Auswahl speichern</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);
    document.body.appendChild(modal);
    return { banner: banner, modal: modal };
  }

  document.addEventListener('DOMContentLoaded', function () {
    const ui = buildUI();
    const banner = ui.banner;
    const modal = ui.modal;
    const analyticsToggle = document.getElementById('consentAnalyticsToggle');

    function showBanner() { banner.hidden = false; }
    function hideBanner() { banner.hidden = true; }
    function openModal(prefillAnalytics) {
      analyticsToggle.setAttribute('aria-checked', String(!!prefillAnalytics));
      modal.hidden = false;
    }
    function closeModal() { modal.hidden = true; }

    function applyDecision(analytics) {
      writeConsent(analytics);
      hideBanner();
      closeModal();
      if (analytics) loadGA4();
    }

    document.getElementById('consentAcceptBtn').addEventListener('click', function () {
      applyDecision(true);
    });
    document.getElementById('consentRejectBtn').addEventListener('click', function () {
      applyDecision(false);
    });
    document.getElementById('consentSettingsBtn').addEventListener('click', function () {
      const current = readConsent();
      openModal(current ? current.analytics : false);
    });
    document.getElementById('consentModalBackdrop').addEventListener('click', closeModal);
    document.getElementById('consentModalRejectBtn').addEventListener('click', function () {
      applyDecision(false);
    });
    document.getElementById('consentModalSaveBtn').addEventListener('click', function () {
      applyDecision(analyticsToggle.getAttribute('aria-checked') === 'true');
    });
    analyticsToggle.addEventListener('click', function () {
      const on = analyticsToggle.getAttribute('aria-checked') === 'true';
      analyticsToggle.setAttribute('aria-checked', String(!on));
    });

    // "Cookie-Einstellungen"-Link im Footer: Entscheidung jederzeit änderbar.
    const reopenLink = document.getElementById('cookieSettingsLink');
    if (reopenLink) {
      reopenLink.addEventListener('click', function (e) {
        e.preventDefault();
        const current = readConsent();
        openModal(current ? current.analytics : false);
      });
    }

    // Initialzustand beim Laden der Seite.
    const existing = readConsent();
    if (existing === null) {
      showBanner();
    } else if (existing.analytics) {
      loadGA4();
    }
  });
})();
