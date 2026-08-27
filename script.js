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

// Hero WebGL molten background (hand-written, no dependencies).
// Falls back to the CSS aurora if WebGL is unavailable or the shader fails to build.
(function initHeroShader() {
  const canvas = document.querySelector('.hero__gl');
  if (!canvas || !hero) return;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.style.display = 'none'; return; }

  const vsrc = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  const fsrc = [
    'precision highp float;',
    'uniform float uTime; uniform vec2 uResolution; uniform vec2 uMouse;',
    'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}',
    'float snoise(vec2 v){',
    ' const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);',
    ' vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);',
    ' vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
    ' vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);',
    ' vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
    ' vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;',
    ' vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;',
    ' m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
    ' vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw; return 130.0*dot(m,g);',
    '}',
    'float fbm(vec2 p){float v=0.0,a=0.5; for(int i=0;i<5;i++){v+=a*snoise(p);p*=2.0;a*=0.5;} return v;}',
    'void main(){',
    ' vec2 p=(gl_FragCoord.xy-0.5*uResolution)/uResolution.y; float t=uTime*0.06;',
    ' vec2 q=vec2(fbm(p+vec2(0.0,t)),fbm(p+vec2(5.2,1.3)-t));',
    ' vec2 r=vec2(fbm(p+2.0*q+vec2(1.7,9.2)+0.15*t),fbm(p+2.0*q+vec2(8.3,2.8)-0.13*t));',
    ' float n=fbm(p+2.4*r+0.1*t); n=n*0.5+0.5;',
    ' vec2 m=(uMouse-0.5*uResolution)/uResolution.y; float glow=smoothstep(0.55,0.0,length(p-m));',
    ' vec3 ink=vec3(0.106,0.149,0.196); vec3 slate=vec3(0.173,0.231,0.302);',
    ' vec3 terra=vec3(0.639,0.318,0.224); vec3 amber=vec3(1.0,0.694,0.384); vec3 cream=vec3(0.933,0.914,0.875);',
    ' vec3 col=mix(ink,slate,smoothstep(0.15,0.6,n));',
    ' col=mix(col,terra,smoothstep(0.5,0.82,n+0.12*length(r)));',
    ' col=mix(col,amber,smoothstep(0.74,0.97,n)+0.45*glow);',
    ' col+=cream*smoothstep(0.92,1.0,n)*0.35;',
    ' float gr=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453); col+=(gr-0.5)*0.03;',
    ' col*=1.0-0.28*length(p);',
    ' gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, vsrc), fs = compile(gl.FRAGMENT_SHADER, fsrc);
  if (!vs || !fs) { canvas.style.display = 'none'; return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); canvas.style.display = 'none'; return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uRes = gl.getUniformLocation(prog, 'uResolution');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  const dpr = Math.min(window.devicePixelRatio || 1, reduceMotion ? 1 : 1.5);
  let W = 1, H = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0.5, y: 0.58 }, target = { x: 0.5, y: 0.58 };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height; // flip Y to match gl_FragCoord
  });

  function draw(tSeconds) {
    gl.uniform1f(uTime, tSeconds);
    gl.uniform2f(uRes, W, H);
    gl.uniform2f(uMouse, mouse.x * W, mouse.y * H);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  if (reduceMotion) {
    draw(14.0); // one calm static frame, no animation
    return;
  }

  let raf = null;
  function frame(ms) {
    mouse.x += (target.x - mouse.x) * 0.06;
    mouse.y += (target.y - mouse.y) * 0.06;
    draw(ms * 0.001);
    raf = requestAnimationFrame(frame);
  }
  // Only animate while the hero is on screen (saves GPU/battery once scrolled past)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && raf === null) raf = requestAnimationFrame(frame);
      else if (!e.isIntersecting && raf !== null) { cancelAnimationFrame(raf); raf = null; }
    });
  }, { threshold: 0 });
  io.observe(hero);
})();
