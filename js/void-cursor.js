/**
 * Universal void cursor: dot + blue particles attracted to cursor.
 * Requires: #cursor-overlay and #cursor-dot in DOM, void-theme.css loaded.
 */
(function() {
  'use strict';
  var cursorOverlay = document.getElementById('cursor-overlay');
  var cursorDot = document.getElementById('cursor-dot');
  if (!cursorOverlay || !cursorDot) return;
  var isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isTouch) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var hover = false;
  var overText = false;
  var mouse = { targetX: 0.5, targetY: 0.5 };
  var particles = [];
  var ripples = [];
  var lastSpawn = 0;

  var particlesCanvas = document.getElementById('cursor-particles');
  if (!particlesCanvas) {
    particlesCanvas = document.createElement('canvas');
    particlesCanvas.id = 'cursor-particles';
    particlesCanvas.setAttribute('aria-hidden', 'true');
    cursorOverlay.insertBefore(particlesCanvas, cursorDot);
  }

  function setCursorPosition(clientX, clientY) {
    cursorDot.style.transform = 'translate(' + clientX + 'px,' + clientY + 'px) translate(-50%, -50%)';
  }

  function resize() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function addRipple(x, y) {
    ripples.push({ x: x, y: y, r: 0, maxR: 90, alpha: 1 });
  }

  function spawnParticle() {
    var angle = Math.random() * Math.PI * 2;
    var dist = 80 + Math.random() * 120;
    var w = particlesCanvas.width;
    var h = particlesCanvas.height;
    particles.push({
      x: mouse.targetX * w + Math.cos(angle) * dist,
      y: mouse.targetY * h + Math.sin(angle) * dist,
      vx: 0, vy: 0,
      life: 1,
      size: 1 + Math.random() * 1.5
    });
  }

  function updateParticles(ctx) {
    var w = particlesCanvas.width;
    var h = particlesCanvas.height;
    var cx = mouse.targetX * w;
    var cy = mouse.targetY * h;
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      var dx = cx - p.x;
      var dy = cy - p.y;
      var d = Math.sqrt(dx * dx + dy * dy) + 1;
      var f = 80 / (d * d);
      p.vx += (dx / d) * f;
      p.vy += (dy / d) * f;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      var a = p.life * 0.6;
      ctx.fillStyle = 'rgba(34, 211, 238, ' + a + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateRipples(ctx) {
    var w = particlesCanvas.width;
    var h = particlesCanvas.height;
    for (var i = ripples.length - 1; i >= 0; i--) {
      var r = ripples[i];
      r.r += 3.5;
      r.alpha = Math.max(0, 1 - r.r / r.maxR);
      if (r.alpha <= 0) { ripples.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(34, 211, 238, ' + (r.alpha * 0.4) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function updateCursorState(el) {
    var interactive = el && (el.closest('a') || el.closest('button') || el.closest('input') || el.closest('[role="button"]'));
    var text = el && el.closest && el.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, label');
    hover = !!interactive;
    overText = !!(text && !interactive);
  }

  document.body.classList.add('void-cursor-active');
  window.addEventListener('mousemove', function(e) {
    mouse.targetX = e.clientX / window.innerWidth;
    mouse.targetY = e.clientY / window.innerHeight;
    setCursorPosition(e.clientX, e.clientY);
    var now = performance.now();
    if (now - lastSpawn > 80) {
      lastSpawn = now;
      if (particles.length < 35) spawnParticle();
    }
  });
  window.addEventListener('mousedown', function(e) {
    addRipple(e.clientX, e.clientY);
    for (var i = 0; i < 3; i++) spawnParticle();
  });
  document.addEventListener('mouseover', function(e) { updateCursorState(e.target); });
  document.addEventListener('mouseout', function(e) { updateCursorState(e.relatedTarget); });

  function tick() {
    if (hover) cursorDot.classList.add('hover'); else cursorDot.classList.remove('hover');
    if (overText) cursorDot.classList.add('cursor-text'); else cursorDot.classList.remove('cursor-text');
    var pctx = particlesCanvas.getContext('2d');
    if (pctx) {
      pctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      updateRipples(pctx);
      updateParticles(pctx);
    }
    requestAnimationFrame(tick);
  }
  setCursorPosition(window.innerWidth / 2, window.innerHeight / 2);
  tick();
})();
