// college_project/static/js/tilt.js
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const MAX_TILT = 4;          // было сильно — теперь мягко
  const SCALE = 1.02;          // лёгкий "подъём"
  const PERSPECTIVE = 900;     // глубина
  const GLARE_OPACITY = 0.16;  // мягкий блик
  const EASE = 0.12;           // скорость догоняния (0.08..0.18)

  const cards = document.querySelectorAll("[data-tilt]");
  if (!cards.length) return;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  cards.forEach((card) => {
    // ensure inner glare layer
    let glare = card.querySelector(".glare");
    if (!glare) {
      glare = document.createElement("div");
      glare.className = "glare";
      card.appendChild(glare);
    }

    let rect = null;
    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    let rafId = null;

    const updateRect = () => { rect = card.getBoundingClientRect(); };

    const render = () => {
      // smooth approach
      curX += (targetX - curX) * EASE;
      curY += (targetY - curY) * EASE;

      const rotateX = curY * MAX_TILT;
      const rotateY = curX * MAX_TILT;

      card.style.transform =
        `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${SCALE})`;

      // glare position and intensity
      const gx = (curX * 0.5 + 0.5) * 100; // 0..100
      const gy = (-curY * 0.5 + 0.5) * 100;

      glare.style.opacity = String(GLARE_OPACITY);
      glare.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)`;

      rafId = requestAnimationFrame(render);
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;

      targetX = 0; targetY = 0;
      curX = 0; curY = 0;

      card.style.transform = "";
      glare.style.opacity = "0";
      glare.style.background = "";
    };

    const onEnter = () => {
      updateRect();
      card.style.willChange = "transform";
      glare.style.opacity = "0";
      if (!rafId) rafId = requestAnimationFrame(render);
    };

    const onMove = (e) => {
      if (!rect) updateRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0..1
      const y = (e.clientY - rect.top) / rect.height;  // 0..1

      // map to -1..1
      const nx = clamp((x - 0.5) * 2, -1, 1);
      const ny = clamp((y - 0.5) * 2, -1, 1);

      targetX = nx;
      targetY = ny;
    };

    const onLeave = () => {
      card.style.willChange = "";
      stop();
    };

    // keep rect fresh on resize/scroll
    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  });
})();
