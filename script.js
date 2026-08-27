// niggle.work interactions
document.documentElement.classList.add('js');

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.querySelector('.nav__toggle');
const links = document.querySelector('.nav__links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); })
  );
}

// Cursor spotlight on hero (background only)
const hero = document.querySelector('.hero');
const spot = document.querySelector('.spotlight');
if (hero && spot) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
    spot.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// Magnetic buttons (skipped when the user prefers reduced motion)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.35}px, ${(e.clientY - (r.top + r.height / 2)) * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// Scroll reveal
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.band__item, .eyebrow, .h2, .build__lead, .build__foot, .drawline, .why__title, .why__p, .why__roi, .pricing__title, .pricing__lead, .tl__item, .pricing__callout, .pricing__value, .quote blockquote, .about__copy, .about__side, .contact__title, .contact__p, .formcard')
  .forEach((el) => { el.classList.add('reveal'); io.observe(el); });

// "what I build" pills: scatter in, then assemble into the grid on scroll-in
const cloud = document.querySelector('.cloud');
if (cloud && !reduceMotion) {
  cloud.querySelectorAll('li').forEach((li, i) => {
    li.style.setProperty('--fx', ((Math.random() * 2 - 1) * 44).toFixed(1) + 'px');
    li.style.setProperty('--fy', (8 + Math.random() * 48).toFixed(1) + 'px');
    li.style.setProperty('--fr', ((Math.random() * 2 - 1) * 33).toFixed(1) + 'deg');
    li.style.setProperty('--rest', ((Math.random() * 2 - 1) * 2.4).toFixed(1) + 'deg');
    li.style.transitionDelay = (i * 0.04).toFixed(3) + 's';
  });
  cloud.classList.add('cloud--fall');
  const cloudIO = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        obs.disconnect();
        // let them sit jumbled for a beat, then assemble
        setTimeout(() => cloud.classList.add('cloud--settled'), 950);
      }
    });
  }, { threshold: 0.3 });
  cloudIO.observe(cloud);
}

// Contact form: sends via Web3Forms (emails land privately in the configured inbox)
const form = document.querySelector('.niggleform');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = form.querySelector('.formbtn');
    const btnLabel = btn && btn.querySelector('span');
    if (btnLabel) btnLabel.textContent = 'sending…';
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();
      if (data.success) {
        form.innerHTML = '<p class="formdone">Nice one, I\'ll be in touch shortly.</p>';
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      if (btn) btn.disabled = false;
      if (btnLabel) btnLabel.textContent = 'send it over';
      if (!form.querySelector('.formerr')) {
        form.insertAdjacentHTML('beforeend',
          '<p class="formerr">That didn\'t send. Email <a href="mailto:hello@niggle.work">hello@niggle.work</a> directly?</p>');
      }
    }
  });
}

// Scroll-spy: reflect the section in view in the URL hash
const spyEls = ['hero', 'build', 'pricing', 'about', 'contact']
  .map((id) => document.getElementById(id))
  .filter(Boolean);
let currentHash = location.hash;
let spyTick = false;
function updateSpy() {
  spyTick = false;
  const mid = window.scrollY + window.innerHeight / 2;
  let active = spyEls[0];
  for (const el of spyEls) { if (el.offsetTop <= mid) active = el; }
  const target = active.id === 'hero' ? location.pathname + location.search : '#' + active.id;
  if (target !== currentHash) { currentHash = target; history.replaceState(null, '', target); }
}
window.addEventListener('scroll', () => { if (!spyTick) { spyTick = true; requestAnimationFrame(updateSpy); } }, { passive: true });
updateSpy();
