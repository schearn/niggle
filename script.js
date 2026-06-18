// niggle.work — small interactions

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

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
