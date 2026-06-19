// niggle UI lab interactions

// 1. Cursor spotlight on hero (background only)
const hero = document.querySelector('.hero');
const spot = document.querySelector('.spotlight');
hero.addEventListener('pointermove', (e) => {
  const r = hero.getBoundingClientRect();
  spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
  spot.style.setProperty('--my', `${e.clientY - r.top}px`);
});

// 2. Magnetic buttons
document.querySelectorAll('.magnetic').forEach((el) => {
  const strength = 0.35;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

// 3. 3D tilt cards
document.querySelectorAll('.tilt').forEach((card) => {
  const max = 9;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

// 4. Scroll reveal + squiggle draw
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.eyebrow, .h2, .build__lead, .cloud, .build__foot, .how__title, .how__steps, .contact__title, .contact__p, .niggleform')
  .forEach((el) => { el.classList.add('reveal'); io.observe(el); });

// 5. Contact form demo submit
const form = document.querySelector('.niggleform');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.innerHTML = '<p class="formdone">Nice one, I\'ll be in touch shortly.</p>';
  });
}

// 6. Scroll-spy: reflect the section in view in the URL hash
const spyEls = ['hero', 'build', 'how', 'contact']
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
  if (target !== currentHash) {
    currentHash = target;
    history.replaceState(null, '', target);
  }
}
window.addEventListener('scroll', () => {
  if (!spyTick) { spyTick = true; requestAnimationFrame(updateSpy); }
}, { passive: true });
updateSpy();
