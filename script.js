// niggle.work, small interactions

// Flag that JS is on (gates the scroll-reveal CSS so content is never hidden without JS)
document.documentElement.classList.add('js');

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// --- Scroll reveal -------------------------------------------------------
const revealSolo = [
  '.eyebrow', '.section__title', '.section__intro',
  '.honesty', '.quote blockquote', '.about__copy', '.about__side', '.contact__inner'
];
const revealStagger = ['.band__grid', '.cards', '.steps'];

revealSolo.forEach((sel) =>
  document.querySelectorAll(sel).forEach((el) => el.classList.add('reveal'))
);
revealStagger.forEach((sel) =>
  document.querySelectorAll(sel).forEach((el) => {
    el.classList.add('reveal');
    el.setAttribute('data-stagger', '');
  })
);

const revealIO = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

// Mobile nav toggle
const toggle = document.querySelector('.nav__toggle');
const links = document.querySelector('.nav__links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
// Close menu after tapping a link
links.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Normalise each squiggle path length so the dash animation is consistent
document.querySelectorAll('.squiggle .draw').forEach((path) => {
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
});

// Draw the squiggle when it scrolls into view
const squiggle = document.querySelector('.squiggle');
if (squiggle) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          squiggle.classList.add('in');
          io.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(squiggle);
}
