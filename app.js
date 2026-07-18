// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// A little something for the curious ones peeking at devtools
console.log('%c</AVN/>', 'font-size:22px;font-weight:bold;color:#8B7CFF;');
console.log('%cHey! Since you\'re already in here poking around \u2014 try the Konami code: \u2191 \u2191 \u2193 \u2193 \u2190 \u2192 \u2190 \u2192 B A', 'font-size:13px;color:#4FD8B0;');

// ===== Starfield + shooting stars background =====
(function starfield(){
  const canvas = document.getElementById('stars-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let stars = [];
  let shootingStars = [];
  let rainbowUntil = 0;
  let hue = 0;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars(){
    const count = Math.round((width * height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function spawnShootingStar(){
    const startX = Math.random() * width * 0.7;
    const startY = Math.random() * height * 0.4;
    const angle = (Math.PI / 6) + Math.random() * (Math.PI / 10); // downward-right
    const speed = 9 + Math.random() * 6;
    shootingStars.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40 + Math.random() * 20,
      length: 90 + Math.random() * 60
    });
  }

  let frame = 0;
  let nextShootAt = 60 + Math.random() * 120;

  function draw(){
    ctx.clearRect(0, 0, width, height);
    const rainbowActive = performance.now() < rainbowUntil;
    if (rainbowActive) hue = (hue + 3) % 360;

    // twinkling stars
    for (const s of stars){
      s.phase += s.twinkleSpeed;
      const alpha = s.baseAlpha + Math.sin(s.phase) * 0.25;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = rainbowActive
        ? `hsla(${(hue + s.x * 0.3) % 360},90%,70%,${Math.max(0, Math.min(1, alpha))})`
        : `rgba(244,243,240,${Math.max(0, Math.min(1, alpha))})`;
      ctx.fill();
    }

    // shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--){
      const st = shootingStars[i];
      st.x += st.vx;
      st.y += st.vy;
      st.life++;

      const progress = st.life / st.maxLife;
      const alpha = 1 - progress;
      const tailX = st.x - st.vx * (st.length / 12);
      const tailY = st.y - st.vy * (st.length / 12);

      const gradient = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
      if (rainbowActive){
        gradient.addColorStop(0, `hsla(${hue},95%,75%,${alpha})`);
        gradient.addColorStop(1, `hsla(${(hue + 80) % 360},95%,65%,0)`);
      } else {
        gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
        gradient.addColorStop(1, 'rgba(139,124,255,0)');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = rainbowActive ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      if (st.life >= st.maxLife || st.x > width + 100 || st.y > height + 100){
        shootingStars.splice(i, 1);
      }
    }

    frame++;
    if (frame >= nextShootAt){
      spawnShootingStar();
      frame = 0;
      nextShootAt = 90 + Math.random() * 150;
    }

    requestAnimationFrame(draw);
  }

  function drawStaticFrame(){
    // Reduced-motion fallback: draw stars once, no shooting stars, no loop
    ctx.clearRect(0, 0, width, height);
    for (const s of stars){
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244,243,240,${s.baseAlpha})`;
      ctx.fill();
    }
  }

  window.addEventListener('resize', () => {
    resize();
    if (reduceMotion) drawStaticFrame();
  });

  resize();
  if (reduceMotion){
    drawStaticFrame();
  } else {
    requestAnimationFrame(draw);
  }

  // Called by the Konami-code easter egg below
  window.__triggerStarBurst = function(){
    rainbowUntil = performance.now() + 6000;
    if (!reduceMotion){
      for (let i = 0; i < 6; i++){
        setTimeout(spawnShootingStar, i * 120);
      }
    }
  };
})();

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

navToggle.addEventListener('click', () => {
  const isOpen = primaryNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close mobile nav after choosing a link (keeps navigation simple)
primaryNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  });
});

// ===== Easter egg: Konami code =====
(function konami(){
  const sequence = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  let pos = 0;

  function showToast(){
    const toast = document.createElement('div');
    toast.className = 'easter-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = '\u2728 Easter egg found \u2014 Konami Coder mode activated!';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    pos = (key === sequence[pos]) ? pos + 1 : (key === sequence[0] ? 1 : 0);
    if (pos === sequence.length){
      pos = 0;
      showToast();
      if (typeof window.__triggerStarBurst === 'function'){
        window.__triggerStarBurst();
      }
    }
  });
})();

// ===== Tap-to-hover for grid tiles =====
document.querySelectorAll('.tile').forEach(tile => {
  tile.setAttribute('tabindex', '0');

  tile.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    tile.classList.toggle('is-active');
  });

  tile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      if (e.target.closest('a, button')) return;
      e.preventDefault();
      tile.classList.toggle('is-active');
    }
  });
});

// ===== Easter egg: pixel rocket spawns an interactive pixel girl =====
(function pixelMode(){
  const toggle = document.getElementById('pixelToggle');
  const iconHost = toggle ? toggle.querySelector('.pixel-icon') : null;
  const sprite = document.getElementById('pixelSprite');
  const glow = document.getElementById('pixelSpriteGlow');
  if (!toggle || !iconHost || !sprite) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildPixelSVG(rows, colorMap){
    const cols = rows[0].length;
    const height = rows.length;
    let rects = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++){
        const ch = row[x];
        if (ch === '.') continue;
        const color = colorMap[ch];
        if (!color) continue;
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
      }
    });
    return `<svg viewBox="0 0 ${cols} ${height}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rects}</svg>`;
  }

  // Tiny pixel rocket for the button
  const rocketRows = [
    '...rr...',
    '..rrrr..',
    '.rrwwrr.',
    '.rrwwrr.',
    '.rrrrrr.',
    '.rrrrrr.',
    'r.rrrr.r',
    '..rrrr..',
    '..ffff..',
    '...ff...'
  ];
  const rocketColors = { r: '#C7CCDA', w: '#4FD8B0', f: '#FF8F6B' };
  iconHost.innerHTML = buildPixelSVG(rocketRows, rocketColors);

  // Pixel girl: sun hat, long hair, blue dress — now with shading/highlight detail
  const girlColors = {
    h: '#D9B382',   // hat mid
    k: '#EFCE9E',   // hat highlight
    n: '#3B5B7C',   // hat band
    H: '#3B2415',   // hair mid
    J: '#241407',   // hair shadow
    f: '#E8A874',   // skin
    c: '#E8836B',   // cheek blush
    e: '#241208',   // eyes
    d: '#5B84B1',   // dress mid
    L: '#7FA3CC',   // dress highlight
    t: '#EAF2FA',   // dress trim
    a: '#E8A874',   // arm skin
    p: '#A05A3F',   // shoe light
    q: '#7A3F29'    // shoe shadow
  };

  const girlWaveUp = [
    '......hhhh......',
    '.....hkkkkh.....',
    '....hkkkkkkh....',
    '...hhnnnnnnhh...',
    '....HHHHHHHH....',
    '...JHffffffHJ...',
    '...HfcefecfH....',
    '...HfffffffH....',
    '...JHHHHHHHJ....',
    'a..HHddLddHH....',
    '...HdddLdddH....',
    '...dddttddd..H..',
    '...dddttddd...a.',
    '....dddttdd.....',
    '....dddddddd....',
    '....dddddddd....',
    '.....p....p.....',
    '.....q....q.....'
  ];
  const girlWaveDown = [
    '......hhhh......',
    '.....hkkkkh.....',
    '....hkkkkkkh....',
    '...hhnnnnnnhh...',
    '....HHHHHHHH....',
    '...JHffffffHJ...',
    '...HfcefecfH....',
    '...HfffffffH....',
    '...JHHHHHHHJ....',
    '...HHddLddHH..a.',
    '...HdddLdddH....',
    '...dddttddd..H..',
    '...dddttddd.a...',
    '....dddttdd.....',
    '....dddddddd....',
    '....dddddddd....',
    '.....p....p.....',
    '.....q....q.....'
  ];

  const wavePoses = [
    buildPixelSVG(girlWaveUp, girlColors),
    buildPixelSVG(girlWaveDown, girlColors)
  ];
  sprite.innerHTML = wavePoses[0];

  let waveTimer = null;
  let waveFrame = 0;
  function startWaving(){
    stopWaving();
    if (reduceMotion) return;
    waveTimer = setInterval(() => {
      waveFrame = 1 - waveFrame;
      sprite.innerHTML = wavePoses[waveFrame];
    }, 550);
  }
  function stopWaving(){
    if (waveTimer){ clearInterval(waveTimer); waveTimer = null; }
  }

  let ambientTimer = null;
  function startAmbientSparkles(){
    stopAmbientSparkles();
    if (reduceMotion) return;
    ambientTimer = setInterval(() => {
      const rect = sprite.getBoundingClientRect();
      spawnStar(
        rect.left + rect.width / 2 + (Math.random() * 20 - 10),
        rect.top + (Math.random() * 10)
      );
    }, 2200);
  }
  function stopAmbientSparkles(){
    if (ambientTimer){ clearInterval(ambientTimer); ambientTimer = null; }
  }

  function moveSpriteTo(x, y){
    sprite.style.left = x + 'px';
    sprite.style.top = y + 'px';
    if (glow){
      glow.style.left = (x + 24) + 'px';
      glow.style.top = (y + 27) + 'px';
    }
  }

  function defaultSpawnPoint(){
    return {
      x: Math.min(window.innerWidth - 64, Math.max(20, window.innerWidth / 2 - 24)),
      y: window.innerHeight - 150
    };
  }

  // ----- Speech bubble on click -----
  let bubble = null;
  function showBubble(){
    if (!bubble){
      bubble = document.createElement('div');
      bubble.className = 'pixel-bubble';
      bubble.textContent = 'heyy';
      document.body.appendChild(bubble);
    }
    const rect = sprite.getBoundingClientRect();
    bubble.style.left = (rect.left + rect.width / 2) + 'px';
    bubble.style.top = rect.top + 'px';
    bubble.classList.add('show');
    clearTimeout(bubble._hideTimer);
    bubble._hideTimer = setTimeout(() => bubble.classList.remove('show'), 1400);
  }

  // ----- Star particles while dragging -----
  function spawnStar(x, y){
    const star = document.createElement('div');
    star.className = 'pixel-star-particle';
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    star.style.setProperty('--dx', (Math.random() * 24 - 12) + 'px');
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 950);
  }

  // ----- Drag + click handling -----
  let dragging = false;
  let moved = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let lastStarAt = 0;

  sprite.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    const rect = sprite.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    sprite.setPointerCapture(e.pointerId);
    sprite.classList.add('is-dragging');
  });

  sprite.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    moved = true;
    const x = e.clientX - dragOffsetX;
    const y = e.clientY - dragOffsetY;
    moveSpriteTo(x, y);
    const now = performance.now();
    if (!reduceMotion && Math.random() < 0.35 && now - lastStarAt > 90){
      lastStarAt = now;
      spawnStar(x + 20, y + 30);
    }
  });

  function endDrag(e){
    if (!dragging) return;
    dragging = false;
    sprite.classList.remove('is-dragging');
    if (!moved){
      showBubble();
    }
  }
  sprite.addEventListener('pointerup', endDrag);
  sprite.addEventListener('pointercancel', endDrag);

  sprite.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      showBubble();
    }
  });

  // ----- "Flies" while the page scrolls -----
  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    if (sprite.hidden) return;
    if (!reduceMotion) sprite.classList.add('is-flying');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => sprite.classList.remove('is-flying'), 400);
  }, { passive: true });

  // ----- Toggle pixel mode + spawn/hide the sprite -----
  toggle.addEventListener('click', () => {
    const active = document.body.classList.toggle('pixel-mode');
    toggle.setAttribute('aria-pressed', String(active));

    if (!active){
      sprite.hidden = true;
      if (glow) glow.hidden = true;
      stopWaving();
      stopAmbientSparkles();
      return;
    }

    const point = defaultSpawnPoint();
    sprite.style.transition = 'none';
    moveSpriteTo(point.x, point.y);
    sprite.hidden = false;
    if (glow) glow.hidden = false;
    void sprite.offsetWidth;
    sprite.style.transition = '';
    startWaving();
    startAmbientSparkles();
  });
})();