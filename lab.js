// niggle UI lab — interactions

// 1. Cursor spotlight on hero
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
document.querySelectorAll('.eyebrow, .h2, .build__lead, .cloud, .build__foot, .how__title, .how__steps, .cta__title, .cta__p')
  .forEach((el) => { el.classList.add('reveal'); io.observe(el); });
