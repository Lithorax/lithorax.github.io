/* ═══════════════════════════════════════════════════
   LITHOLAB — script.js
   Star Field · Shooting Stars · Nav · Mobile Menu
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── SPACE CANVAS ─────────────────────────────── */
  const canvas = document.getElementById('space-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, stars = [], nebulae = [], shootingStars = [];
  const STAR_COUNT   = 280;
  const NEBULA_COUNT = 5;

  /* Resize */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* Star factory */
  function makeStar(randomY = true) {
    const layers = [
      { speed: 0.010, sizeMax: 0.9,  alpha: 0.35 },
      { speed: 0.018, sizeMax: 1.5,  alpha: 0.55 },
      { speed: 0.030, sizeMax: 2.2,  alpha: 0.80 },
    ];
    const layer = layers[Math.floor(Math.random() * layers.length)];
    return {
      x:     Math.random() * W,
      y:     randomY ? Math.random() * H : -2,
      r:     Math.random() * layer.sizeMax + 0.3,
      alpha: Math.random() * layer.alpha + 0.1,
      speed: layer.speed + Math.random() * 0.012,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir:   Math.random() < 0.5 ? 1 : -1,
      baseAlpha:    0,
      color: pickStarColor(),
    };
  }

  function pickStarColor() {
    const palette = [
      '#ffffff',
      '#e8eeff',
      '#fff4e0',
      '#e0f4ff',
      '#ffe8c0',
      '#c8d8ff',
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  /* Nebula factory */
  function makeNebula() {
    const colors = [
      'rgba(6,182,212,',
      'rgba(139,92,246,',
      'rgba(245,158,11,',
      'rgba(16,185,129,',
      'rgba(59,130,246,',
    ];
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      rx:    120 + Math.random() * 220,
      ry:    80  + Math.random() * 160,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.012 + Math.random() * 0.022,
    };
  }

  /* Shooting star factory */
  function makeShootingStar() {
    const angle = (Math.random() * 30 + 10) * (Math.PI / 180);
    const speed = 6 + Math.random() * 8;
    return {
      x:    Math.random() * W,
      y:    Math.random() * (H * 0.5),
      vx:   Math.cos(angle) * speed,
      vy:   Math.sin(angle) * speed,
      len:  80 + Math.random() * 100,
      alpha: 1,
      life:  1,
      decay: 0.012 + Math.random() * 0.01,
    };
  }

  /* Init */
  function init() {
    resize();

    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const s = makeStar(true);
      s.baseAlpha = s.alpha;
      stars.push(s);
    }

    nebulae = [];
    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push(makeNebula());
    }

    shootingStars = [];
  }

  /* Draw nebulae (soft glowing blobs) */
  function drawNebulae() {
    nebulae.forEach(n => {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
      grad.addColorStop(0,   n.color + n.alpha + ')');
      grad.addColorStop(0.5, n.color + (n.alpha * 0.4) + ')');
      grad.addColorStop(1,   n.color + '0)');
      ctx.save();
      ctx.scale(1, n.ry / n.rx);
      ctx.beginPath();
      ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
  }

  /* Draw stars */
  function drawStars(t) {
    stars.forEach(s => {
      /* twinkle */
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      if (s.alpha > s.baseAlpha + 0.15 || s.alpha < s.baseAlpha - 0.15) {
        s.twinkleDir *= -1;
      }
      s.alpha = Math.max(0.05, Math.min(1, s.alpha));

      /* glow halo for bright stars */
      if (s.r > 1.6) {
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        halo.addColorStop(0,   hexToRgba(s.color, s.alpha * 0.35));
        halo.addColorStop(1,   hexToRgba(s.color, 0));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(s.color, s.alpha);
      ctx.fill();

      /* slow drift downward (parallax feel) */
      s.y += s.speed;
      if (s.y > H + 2) {
        const fresh = makeStar(false);
        fresh.baseAlpha = fresh.alpha;
        Object.assign(s, fresh);
      }
    });
  }

  /* Draw shooting stars */
  function drawShootingStars() {
    shootingStars = shootingStars.filter(ss => ss.life > 0);

    shootingStars.forEach(ss => {
      ctx.save();
      ctx.globalAlpha = ss.life;
      const grad = ctx.createLinearGradient(
        ss.x, ss.y,
        ss.x - ss.vx * (ss.len / 8),
        ss.y - ss.vy * (ss.len / 8)
      );
      grad.addColorStop(0,   'rgba(255,255,230,0.95)');
      grad.addColorStop(0.3, 'rgba(200,220,255,0.4)');
      grad.addColorStop(1,   'rgba(200,220,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(
        ss.x - ss.vx * (ss.len / 8),
        ss.y - ss.vy * (ss.len / 8)
      );
      ctx.stroke();
      ctx.restore();

      ss.x    += ss.vx;
      ss.y    += ss.vy;
      ss.life -= ss.decay;
    });
  }

  /* Spawn shooting stars randomly */
  let lastShot = 0;
  function maybeShoot(t) {
    if (t - lastShot > 2800 + Math.random() * 4000) {
      shootingStars.push(makeShootingStar());
      /* occasionally double-streak */
      if (Math.random() < 0.25) {
        setTimeout(() => shootingStars.push(makeShootingStar()), 120);
      }
      lastShot = t;
    }
  }

  /* Main loop */
  function loop(t) {
    ctx.clearRect(0, 0, W, H);

    /* deep space gradient background */
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#04080f');
    bg.addColorStop(0.5, '#060c18');
    bg.addColorStop(1,   '#040810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawNebulae();
    drawStars(t);
    drawShootingStars();
    maybeShoot(t);

    requestAnimationFrame(loop);
  }

  /* Helper: hex → rgba string */
  function hexToRgba(hex, alpha) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }

  /* Start canvas */
  window.addEventListener('resize', () => { resize(); });
  init();
  requestAnimationFrame(loop);


  /* ── NAV SCROLL EFFECT ────────────────────────── */
  const nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }


  /* ── MOBILE NAV TOGGLE ────────────────────────── */
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });

    /* close on link click */
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.textContent = '☰';
      });
    });

    /* close on outside click */
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) {
        links.classList.remove('open');
        toggle.textContent = '☰';
      }
    });
  }


  /* ── SCROLL REVEAL ────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.tool-card, .research-card, .proj-card, .stat-item, .at-badge'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(22px)';
    el.style.transition = `opacity .5s ease ${i * 0.05}s, transform .5s ease ${i * 0.05}s`;
    observer.observe(el);
  });


  /* ── ACTIVE NAV LINK ON SCROLL ────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) {
        current = sec.getAttribute('id');
      }
    });
    navAs.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  }, { passive: true });

})();