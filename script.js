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

// Contact form -> opens the user's mail client with a prefilled message
// (this is a static site with no backend; wire this to a real form
// endpoint such as Formspree or a server route before going live)
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const phone = data.get('phone') || '';
    const service = data.get('service') || '';
    const message = data.get('message') || '';

    const subject = `Anfrage über heizungstreuhand.ch — ${service}`;
    const body =
      `Name: ${name}\n` +
      `E-Mail: ${email}\n` +
      `Telefon: ${phone}\n` +
      `Interessiert an: ${service}\n\n` +
      `Nachricht:\n${message}`;

    window.location.href =
      `mailto:amstalden@heizungstreuhand.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
