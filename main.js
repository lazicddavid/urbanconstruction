/* ═══════════════════════════════════════════════════════════
   URBAN CONSTRUCTION — main.js
   Lenis · Three.js · GSAP ScrollTrigger · Custom Cursor
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Page Loader ────────────────────────────────────────── */
(function injectLoader() {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.id = 'pageLoader';
  loader.innerHTML = `
    <div class="page-loader__inner">
      <div class="page-loader__logo">URBAN</div>
      <div class="page-loader__sub">Construction</div>
      <div class="page-loader__bar"><div class="page-loader__fill"></div></div>
    </div>
  `;
  document.body.prepend(loader);
})();

/* ─── Register GSAP Plugin ───────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ─── Lenis Smooth Scroll ────────────────────────────────── */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.35,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1.1,
    smoothTouch: false,
    touchMultiplier: 1.4,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Anchor click smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.8 });
      }
    });
  });

  return lenis;
}

/* ─── Custom Cursor ──────────────────────────────────────── */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  function animateRing() {
    ringX += (mouseX - ringX) * 0.115;
    ringY += (mouseY - ringY) * 0.115;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'a, button, .service-card, .portfolio-card, input, textarea, select, .award-item, .nav__logo';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ─── Navigation ─────────────────────────────────────────── */
function initNav() {
  const nav       = document.getElementById('mainNav');
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -72',
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ─── Three.js Hero Scene ────────────────────────────────── */
function initHeroScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // Scene & Camera
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 7, 42);
  camera.lookAt(0, 6, 0);

  // ── Materials ──
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    wireframe: true,
    transparent: true,
    opacity: 0.10,
  });

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xc9a84c,
    transparent: true,
    opacity: 0.32,
  });

  const windowMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    wireframe: true,
    transparent: true,
    opacity: 0.045,
  });

  // ── City Buildings ──
  // [x, width, height, depth]
  const buildingData = [
    [-24, 3.5, 7,  3.5],
    [-20, 2.5, 18, 2.5],
    [-15, 5,   11, 4  ],
    [-9,  3,   26, 3  ],
    [-4,  6,   15, 5  ],
    [ 2,  4,   22, 3.5],
    [ 7,  5.5, 11, 4.5],
    [ 13, 2.8, 20, 2.8],
    [ 18, 4,   10, 4  ],
    [ 22, 3,   14, 3  ],
    [ 26, 2,    8, 2  ],
    [-26, 2,    5, 2  ],
  ];

  const buildings = new THREE.Group();

  buildingData.forEach(([x, w, h, d], i) => {
    const geo  = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, wireMat.clone());
    mesh.position.set(x, h / 2, 0);

    const edges    = new THREE.EdgesGeometry(geo);
    const lineMesh = new THREE.LineSegments(edges, edgeMat.clone());
    lineMesh.position.copy(mesh.position);

    buildings.add(mesh);
    buildings.add(lineMesh);

    // Window grid on tall buildings
    if (h > 14) {
      const wGeo  = new THREE.PlaneGeometry(w * 0.82, h * 0.88, Math.ceil(w * 1.4), Math.ceil(h * 0.75));
      const wMesh = new THREE.Mesh(wGeo, windowMat.clone());
      wMesh.position.set(x, h / 2, d / 2 + 0.05);
      buildings.add(wMesh);

      // Back face windows
      const wMesh2 = wMesh.clone();
      wMesh2.position.z = -(d / 2 + 0.05);
      wMesh2.rotation.y = Math.PI;
      buildings.add(wMesh2);
    }

    // GSAP entrance: rise from below
    const finalY = mesh.position.y;
    mesh.position.y    = finalY - 18;
    lineMesh.position.y = finalY - 18;

    gsap.to(mesh.position,     { y: finalY, duration: 2.2, delay: 0.5 + i * 0.04, ease: 'power3.out' });
    gsap.to(lineMesh.position, { y: finalY, duration: 2.2, delay: 0.5 + i * 0.04, ease: 'power3.out' });
    gsap.from(mesh.material,     { opacity: 0, duration: 1.8, delay: 0.6 + i * 0.04 });
    gsap.from(lineMesh.material, { opacity: 0, duration: 1.8, delay: 0.6 + i * 0.04 });
  });

  scene.add(buildings);

  // ── Ground Grid ──
  const groundGeo = new THREE.PlaneGeometry(110, 40, 36, 14);
  const groundMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    wireframe: true,
    transparent: true,
    opacity: 0.03,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 4);
  scene.add(ground);

  // ── Particle System ──
  const PARTICLE_COUNT = 1600;
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 90;
    positions[i3 + 1] = Math.random() * 38;
    positions[i3 + 2] = (Math.random() - 0.5) * 22;
    velocities.push({
      x: (Math.random() - 0.5) * 0.011,
      y: 0.004 + Math.random() * 0.007,
      z: (Math.random() - 0.5) * 0.007,
    });
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Soft disc texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d');
  const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0,   'rgba(232,201,122,1)');
  grad.addColorStop(0.35,'rgba(201,168,76,0.7)');
  grad.addColorStop(1,   'rgba(201,168,76,0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 32, 32);

  const pMat = new THREE.PointsMaterial({
    color: 0xc9a84c,
    map: new THREE.CanvasTexture(pCanvas),
    size: 0.32,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── Atmospheric Light Rays ──
  const rayData = [
    { y: 8,  z: -6, opacity: 0.045 },
    { y: 14, z: -4, opacity: 0.030 },
    { y: 20, z: -8, opacity: 0.025 },
    { y: 5,  z: -3, opacity: 0.035 },
  ];
  rayData.forEach(({ y, z, opacity }) => {
    const rGeo = new THREE.PlaneGeometry(80, 0.06 + Math.random() * 0.06);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
    });
    const ray = new THREE.Mesh(rGeo, rMat);
    ray.position.set(0, y, z);
    ray.userData.baseY = y;
    ray.userData.speed = 0.0004 + Math.random() * 0.0003;
    scene.add(ray);
  });

  // ── Mouse Parallax ──
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  const handleMouseMove = (e) => {
    targetRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.07;
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.035;
  };
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // ── Hero Scroll Effect: buildings sink ──
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 2.5,
    onUpdate: (self) => {
      buildings.position.y = -self.progress * 7;
      particles.position.y = -self.progress * 3;
    },
  });

  // ── Animation Loop ──
  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();
    requestAnimationFrame(animate);

    // Particle drift & loop
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i].x;
      pos[i3 + 1] += velocities[i].y;
      pos[i3 + 2] += velocities[i].z;
      if (pos[i3 + 1] > 38) {
        pos[i3 + 1] = 0;
        pos[i3]     = (Math.random() - 0.5) * 90;
        pos[i3 + 2] = (Math.random() - 0.5) * 22;
      }
    }
    pGeo.attributes.position.needsUpdate = true;

    // Gentle building sway
    buildings.rotation.y = Math.sin(elapsed * 0.07) * 0.005;

    // Camera float & parallax
    currentRotX += (targetRotX - currentRotX) * 0.038;
    currentRotY += (targetRotY - currentRotY) * 0.038;
    camera.rotation.x = currentRotX;
    camera.rotation.y = currentRotY;
    camera.position.y = 7 + Math.sin(elapsed * 0.13) * 0.25;

    // Ray drift
    scene.children.forEach(child => {
      if (child.userData.speed) {
        child.position.y = child.userData.baseY + Math.sin(elapsed * child.userData.speed * 1000) * 0.4;
      }
    });

    renderer.render(scene, camera);
  }
  animate();
}

/* ─── Hero Text Reveal (GSAP Timeline) ───────────────────── */
function initHeroAnimations() {
  const tl = gsap.timeline({ delay: 1.05 });

  tl
    .to('.hero__line', {
      scaleX: 1,
      duration: 0.9,
      ease: 'power3.inOut',
      transformOrigin: 'left',
    })
    .to('.hero__label', {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: 'power2.out',
    }, '-=0.35')
    .to('.hero__title-line', {
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.14,
      ease: 'power4.out',
    }, '-=0.25')
    .to('.hero__tagline', {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power2.out',
    }, '-=0.55')
    .to('.hero__sub', {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: 'power2.out',
    }, '-=0.45')
    .to('.hero__actions', {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: 'power2.out',
    }, '-=0.38')
    .to('.hero__scroll-indicator', {
      opacity: 1,
      duration: 0.5,
    }, '-=0.2');
}

/* ─── Scroll Animations ──────────────────────────────────── */
function initScrollAnimations() {

  // ── About ──
  const aboutTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.about',
      start: 'top 72%',
      once: true,
    },
  });
  aboutTl
    .to('.about__image-wrapper', {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.35,
      ease: 'power3.inOut',
    })
    .to('.about__image', {
      scale: 1,
      duration: 1.5,
      ease: 'power2.out',
    }, '<')
    .to('.about__badge', {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'back.out(1.6)',
    }, '-=0.5')
    .to('.about .reveal-item', {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.12,
      ease: 'power3.out',
    }, '-=0.8');

  // ── Services Header ──
  gsap.to('.services .reveal-item', {
    scrollTrigger: {
      trigger: '.services__header',
      start: 'top 78%',
      once: true,
    },
    opacity: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.12,
    ease: 'power3.out',
  });

  // ── Service Cards ──
  gsap.to('.service-card', {
    scrollTrigger: {
      trigger: '.services__grid',
      start: 'top 80%',
      once: true,
    },
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: { amount: 0.5, from: 'start' },
    ease: 'power3.out',
  });

  // ── Stats Counter ──
  document.querySelectorAll('.stat-item__value').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = Math.floor(obj.val);
          },
          onComplete() {
            el.textContent = target;
          },
        });
      },
    });
  });

  // ── Portfolio Header ──
  gsap.to('.portfolio .reveal-item', {
    scrollTrigger: {
      trigger: '.portfolio__header',
      start: 'top 80%',
      once: true,
    },
    opacity: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.12,
    ease: 'power3.out',
  });

  // ── Portfolio Cards ──
  gsap.to('.portfolio-card', {
    scrollTrigger: {
      trigger: '.portfolio__grid',
      start: 'top 78%',
      once: true,
    },
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.95,
    stagger: 0.14,
    ease: 'power3.out',
  });

  // ── Awards Header & Items ──
  const awardsTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.awards',
      start: 'top 72%',
      once: true,
    },
  });
  awardsTl
    .to('.awards .reveal-item', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    })
    .to('.award-item', {
      opacity: 1,
      x: 0,
      duration: 0.75,
      stagger: 0.16,
      ease: 'power3.out',
    }, '-=0.3');

  // ── Philosophy: parallax scrub ──
  gsap.to('.philosophy__bg-image', {
    scrollTrigger: {
      trigger: '.philosophy',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    },
    y: '-18%',
    ease: 'none',
  });

  // ── Philosophy Quote: word-by-word ──
  ScrollTrigger.create({
    trigger: '.philosophy__content',
    start: 'top 68%',
    once: true,
    onEnter() {
      splitAndAnimate('#philosophyQuote');
      gsap.from('.philosophy__cite, .philosophy__gold-line', {
        opacity: 0,
        y: 14,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.6,
      });
    },
  });

  // ── Contact ──
  const contactTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 72%',
      once: true,
    },
  });
  contactTl
    .to('.contact .reveal-item', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    });
}

/* ─── Philosophy Quote Word Split ────────────────────────── */
function splitAndAnimate(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  const rawText = el.textContent.trim();
  const words   = rawText.split(/\s+/);

  el.innerHTML = words.map(w =>
    `<span class="word-wrap" style="overflow:hidden;display:inline-block;"><span class="word" style="display:inline-block;">${w}</span></span>`
  ).join(' ');

  gsap.from(el.querySelectorAll('.word'), {
    y: '105%',
    opacity: 0,
    duration: 0.72,
    stagger: 0.045,
    ease: 'power3.out',
  });
}

/* ─── About Image Parallax ───────────────────────────────── */
function initParallax() {
  gsap.to('.about__image', {
    scrollTrigger: {
      trigger: '.about__visual',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.8,
    },
    y: '-14%',
    ease: 'none',
  });
}

/* ─── Contact Form ───────────────────────────────────────── */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate async submit (replace with real endpoint if needed)
    await new Promise(resolve => setTimeout(resolve, 1600));

    submitBtn.classList.remove('loading');
    gsap.to(submitBtn, {
      background: '#2a5c2a',
      duration: 0.35,
      onComplete() {
        submitBtn.querySelector('.btn__text').textContent = 'Poruka Poslata!';
        gsap.from(submitBtn.querySelector('.btn__text'), {
          opacity: 0,
          y: -8,
          duration: 0.3,
        });
      },
    });

    if (success) {
      success.classList.add('visible');
      gsap.from(success, { opacity: 0, y: 8, duration: 0.5 });
    }

    // Reset after 5s
    setTimeout(() => {
      form.reset();
      gsap.to(submitBtn, { background: 'var(--gold)', duration: 0.4 });
      submitBtn.querySelector('.btn__text').textContent = 'Pošaljite Poruku';
      submitBtn.disabled = false;
      success && success.classList.remove('visible');
    }, 5000);
  });
}

/* ─── Page Loader Dismiss ────────────────────────────────── */
function dismissLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 700);
  }, 1000);
}

/* ─── Smooth nav link active state on scroll ─────────────── */
function initNavActiveState() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link');

  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ─── Hover line pulse on service cards ─────────────────── */
function initServiceCardHovers() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card.querySelector('.service-card__icon'), {
        y: -3,
        duration: 0.35,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card.querySelector('.service-card__icon'), {
        y: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    });
  });
}

/* ─── Portfolio card cursor hint ────────────────────────── */
function initPortfolioCards() {
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card.querySelector('.portfolio-card__number'), {
        scale: 1.1,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card.querySelector('.portfolio-card__number'), {
        scale: 1,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    });
  });
}

/* ─── Footer link hover line draw ───────────────────────── */
function initFooterHovers() {
  document.querySelectorAll('.footer__nav a').forEach(link => {
    link.style.position = 'relative';
    link.style.display  = 'inline-block';

    const underline = document.createElement('span');
    underline.style.cssText = `
      position:absolute;
      bottom:-3px;left:0;
      width:0;height:1px;
      background:var(--gold);
      transition:width 0.35s cubic-bezier(0.16,1,0.3,1);
    `;
    link.appendChild(underline);

    link.addEventListener('mouseenter', () => { underline.style.width = '100%'; });
    link.addEventListener('mouseleave', () => { underline.style.width = '0'; });
  });
}

/* ─── Gold border subtle pulse on award items ───────────── */
function initAwardItemAnimations() {
  document.querySelectorAll('.award-item').forEach((item, i) => {
    gsap.to(item.querySelector('.award-item__icon'), {
      filter: 'drop-shadow(0 0 18px rgba(201,168,76,0.5))',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.4,
    });
  });
}

/* ─── Main Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Order matters: Lenis first, then Three.js, then GSAP
  const lenis = initLenis();
  initCursor();
  initNav();
  initNavActiveState();
  initHeroScene();
  initHeroAnimations();
  initScrollAnimations();
  initParallax();
  initContactForm();
  initServiceCardHovers();
  initPortfolioCards();
  initFooterHovers();
  dismissLoader();

  // VanillaTilt — only on non-touch
  if (!window.matchMedia('(pointer: coarse)').matches && typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max: 6,
      speed: 350,
      glare: true,
      'max-glare': 0.15,
      perspective: 1200,
      scale: 1.01,
    });
  }

  // Deferred heavy animations
  setTimeout(initAwardItemAnimations, 2500);
});
