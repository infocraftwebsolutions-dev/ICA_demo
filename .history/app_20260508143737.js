/* ICA Edu Skills — Premium Cinematic Website
   GSAP ScrollTrigger + Canvas Particles + Magnetic Buttons + 3D Tilt */

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = prefersReduced
    || (navigator.connection && navigator.connection.saveData)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || window.matchMedia('(max-width: 768px)').matches;
  const motionState = { active: document.visibilityState === 'visible' };
  const setMotionActive = active => { motionState.active = active; };
  document.addEventListener('visibilitychange', () => setMotionActive(document.visibilityState === 'visible'));
  window.addEventListener('blur', () => setMotionActive(false));
  window.addEventListener('focus', () => setMotionActive(true));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* PRELOADER */
  const preloader = $('#preloader');
  const preFill = $('#preFill');
  const prePct = $('#prePct');
  let pct = 0;
  const finishPreloader = () => {
    if (!preloader) return;
    preloader.classList.add('done');
    startAnimations();
  };
  if (preloader && preFill && prePct && !prefersReduced) {
    const preInt = setInterval(() => {
      pct = Math.min(100, pct + Math.random() * 13 + 6);
      preFill.style.width = pct + '%';
      prePct.textContent = Math.floor(pct) + '%';
      if (pct >= 100) {
        clearInterval(preInt);
        setTimeout(finishPreloader, 350);
      }
    }, 55);
  } else {
    finishPreloader();
  }

  /* THEME TOGGLE: kept safe, current design is brand locked */
  const themeToggle = $('#themeToggle');
  const toggleIcon = $('#toggleIcon');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      if (toggleIcon) toggleIcon.textContent = isDark ? '☀️' : '🌙';
    });
  }

  /* NAVBAR + ACTIVE LINKS + SCROLL PROGRESS */
  const navbar = $('#navbar');
  const scrollProgress = $('#scrollProgress');
  const navAnchors = $$('.nav-links a');
  const sections = $$('section[id]');
  let scrollTicking = false;
  const updateScroll = () => {
    const y = window.scrollY || 0;
    if (navbar) navbar.classList.toggle('scrolled', y > 60);
    if (scrollProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';
    }
    let current = '';
    sections.forEach(section => {
      if (y >= section.offsetTop - 220) current = section.id;
    });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
    scrollTicking = false;
  };
  updateScroll();
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });

  /* MOBILE MENU */
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    }));
  }

  /* CUSTOM CURSOR GLOW */
  const cursorGlow = $('#cursorGlow');
  if (cursorGlow && !prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    let cursorRaf = null;
    window.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      cursorGlow.style.opacity = '1';
    }, { passive: true });
    window.addEventListener('pointerleave', () => { cursorGlow.style.opacity = '0'; });
    const loop = () => {
      if (!motionState.active) { cursorRaf = null; return; }
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursorGlow.style.left = cx + 'px';
      cursorGlow.style.top = cy + 'px';
      cursorRaf = requestAnimationFrame(loop);
    };
    loop();
    const resumeCursor = () => {
      if (motionState.active && !cursorRaf) loop();
    };
    document.addEventListener('visibilitychange', resumeCursor);
    window.addEventListener('focus', resumeCursor);
    $$('a,button,.course-card,.usp-card,.journey-step,.testimonial-card,.curr-box,.partner-logo').forEach(el => {
      el.addEventListener('mouseenter', () => { cursorGlow.style.width = '72px'; cursorGlow.style.height = '72px'; });
      el.addEventListener('mouseleave', () => { cursorGlow.style.width = '32px'; cursorGlow.style.height = '32px'; });
    });
  }

  /* HERO + CTA CANVAS */
  initHeroParticles(prefersReduced, motionState, lowPower);
  initCtaParticles(prefersReduced, motionState, lowPower);

  /* UNIVERSAL 3D TILT */
  initTilt($$('.course-card,.usp-card,.journey-step,.testimonial-card,.curr-box,.stat-card'), prefersReduced, lowPower);

  /* MAGNETIC BUTTONS */
  initMagneticButtons($$('.btn-primary,.btn-ghost,.nav-cta,.mobile-cta'), prefersReduced, lowPower);

  function startAnimations() {
    if (!window.gsap || prefersReduced) {
      $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    gsap.utils.toArray('.reveal').forEach(el => {
      const delay = parseFloat(el.style.getPropertyValue('--delay')) || 0;
      gsap.fromTo(el,
        { y: 60, opacity: 0, filter: 'blur(8px)' },
        {
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, delay, ease: 'power3.out'
        }
      );
    });

    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .fromTo('.hero-badge', { y: 28, opacity: 0, scale: .94 }, { y: 0, opacity: 1, scale: 1, duration: .65, ease: 'back.out(1.8)' })
      .fromTo('.hero-title', { y: 62, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power4.out' }, '-=.25')
      .fromTo('.hero-sub', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, '-=.55')
      .fromTo('.hero-buttons', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, '-=.45')
      .fromTo('.hero-feat', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .5, ease: 'power3.out' }, '-=.35')
      .fromTo('.hero-image-wrapper', { x: 70, opacity: 0, rotateY: -10 }, { x: 0, opacity: 1, rotateY: 0, duration: 1.15, ease: 'power3.out' }, '-=1');

    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      ScrollTrigger.create({
        trigger: el, start: 'top 82%', once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 2.4, ease: 'expo.out',
            onUpdate: () => { el.textContent = formatIndian(Math.floor(obj.val)) + suffix; }
          });
        }
      });
    });

    gsap.to('.hero-glow', {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
      y: 220, opacity: 0, scale: .75
    });

    gsap.to('.hero-image-wrapper', {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      y: 110, rotate: 3, scale: .92
    });
  }

  function formatIndian(n) {
    const s = String(n);
    if (s.length <= 3) return s;
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }
});

function initTilt(elements, reduced, lowPower) {
  if (reduced || lowPower || !window.matchMedia('(pointer:fine)').matches) return;
  elements.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      const rotateY = x * 10;
      const rotateX = -y * 10;
      if (window.gsap) {
        gsap.to(card, { rotateY, rotateX, transformPerspective: 1000, duration: .35, ease: 'power2.out' });
      } else {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      if (window.gsap) gsap.to(card, { rotateY: 0, rotateX: 0, duration: .55, ease: 'power3.out' });
      else card.style.transform = '';
    });
  });
}

function initMagneticButtons(buttons, reduced, lowPower) {
  if (reduced || lowPower || !window.matchMedia('(pointer:fine)').matches) return;
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (window.gsap) gsap.to(btn, { x: x * .18, y: y * .22, duration: .3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      if (window.gsap) gsap.to(btn, { x: 0, y: 0, duration: .45, ease: 'elastic.out(1,.45)' });
    });
  });
}

function initHeroParticles(reduced, motionState, lowPower) {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, particles = [], mouse = { x: -9999, y: -9999 };
  let gradient = null;
  let rafId = null;
  let inView = true;
  const COUNT = reduced ? 28 : (lowPower ? 58 : 110);
  const CONNECT = lowPower ? 110 : 145;
  const dprCap = reduced ? 1 : (lowPower ? 1 : 1.25);
  const shadowBlur = lowPower ? 4 : 6;

  const isActive = () => !motionState || motionState.active;
  const stop = () => { inView = false; };
  const start = () => {
    if (rafId || !isActive()) return;
    inView = true;
    tick();
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    W = canvas.width = window.innerWidth * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gradient = ctx.createRadialGradient(W * .78, H * .36, 0, W * .78, H * .36, W * .45);
    gradient.addColorStop(0, 'rgba(255,255,0,.06)');
    gradient.addColorStop(1, 'rgba(255,255,0,0)');
  }
  function create() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .55, vy: (Math.random() - .5) * .55,
      r: Math.random() * 2.1 + .7, a: Math.random() * .46 + .18
    }));
  }
  resize(); create();
  window.addEventListener('resize', () => { resize(); create(); });
  document.addEventListener('pointermove', e => {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
  }, { passive: true });

  function tick() {
    if (!isActive() || !inView) { rafId = null; return; }
    rafId = requestAnimationFrame(tick);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 210) { p.vx += dx * .00007; p.vy += dy * .00007; }
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > 1.25) { p.vx *= .96; p.vy *= .96; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,0,${p.a})`;
      ctx.shadowColor = 'rgba(255,255,0,.7)';
      ctx.shadowBlur = shadowBlur;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < CONNECT) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(255,255,0,${(1 - d / CONNECT) * .16})`;
          ctx.lineWidth = .75;
          ctx.stroke();
        }
      }
    }
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView && isActive()) start();
    }, { rootMargin: '200px' });
    io.observe(canvas);
  }
  const onMotionToggle = () => {
    if (isActive() && inView) start();
  };
  document.addEventListener('visibilitychange', onMotionToggle);
  window.addEventListener('focus', onMotionToggle);
  start();
}

function initCtaParticles(reduced, motionState, lowPower) {
  const canvas = document.getElementById('ctaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let rafId = null;
  let inView = true;
  const dots = [];
  const COUNT = reduced ? 20 : (lowPower ? 36 : 70);
  const dprCap = reduced ? 1 : (lowPower ? 1 : 1.25);
  const isActive = () => !motionState || motionState.active;
  const stop = () => { inView = false; };
  const start = () => {
    if (rafId || !isActive()) return;
    inView = true;
    tick();
  };
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    W = canvas.width = canvas.parentElement.offsetWidth * dpr;
    H = canvas.height = canvas.parentElement.offsetHeight * dpr;
    canvas.style.width = canvas.parentElement.offsetWidth + 'px';
    canvas.style.height = canvas.parentElement.offsetHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < COUNT; i++) {
    dots.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 3 + 1, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, a: Math.random() * .28 + .06 });
  }
  function tick() {
    if (!isActive() || !inView) { rafId = null; return; }
    rafId = requestAnimationFrame(tick);
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,0,${d.a})`;
      ctx.fill();
    });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView && isActive()) start();
    }, { rootMargin: '200px' });
    io.observe(canvas);
  }
  const onMotionToggle = () => {
    if (isActive() && inView) start();
  };
  document.addEventListener('visibilitychange', onMotionToggle);
  window.addEventListener('focus', onMotionToggle);
  start();
}
