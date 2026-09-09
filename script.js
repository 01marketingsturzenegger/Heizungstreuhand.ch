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
const navLinks = document.getElementById('navLinks');
const navActions = document.querySelector('.nav-actions');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navActions.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navActions.classList.remove('is-open');
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

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    })
      .then(() => {
        form.hidden = true;
        formSuccess.hidden = false;
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anfrage senden';
        formNote.textContent =
          'Das hat leider nicht geklappt. Bitte rufen Sie uns an (052 551 00 23) oder schreiben Sie direkt an info@heizungstreuhand.ch.';
      });
  });
}
