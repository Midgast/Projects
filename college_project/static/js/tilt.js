// college_project/static/js/tilt.js
(() => {
  const cards = document.querySelectorAll("[data-tilt]");

  // Настройки "мягкого Apple-tilt"
  const MAX_ROT_X = 5;      // было слишком много — теперь мягко
  const MAX_ROT_Y = 6;
  const PERSPECTIVE = 900;  // больше = спокойнее
  const SCALE = 1.012;      // лёгкое приближение
  const GLARE_OPACITY = 0.14;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  cards.forEach((card) => {
    card.style.transformStyle = "preserve-3d";
    card.style.willChange = "transform";

    // glare layer
    const glare = document.createElement("div");
    glare.className = "tilt-glare";
    glare.style.position = "absolute";
    glare.style.inset = "0";
    glare.style.borderRadius = "inherit";
    glare.style.pointerEvents = "none";
    glare.style.background =
      "radial-gradient(600px circle at 50% 50%, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.0) 40%, rgba(255,255,255,0.14) 100%)";
    glare.style.opacity = "0";
    glare.style.transition = "opacity .35s cubic-bezier(.2,.8,.2,1)";
    card.style.position = card.style.position || "relative";
    card.appendChild(glare);

    let raf = 0;

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0..1
      const py = (e.clientY - r.top) / r.height;   // 0..1

      // center -0.5..0.5
      const dx = px - 0.5;
      const dy = py - 0.5;

      const rotY = clamp(dx * (MAX_ROT_Y * 2), -MAX_ROT_Y, MAX_ROT_Y);
      const rotX = clamp(-dy * (MAX_ROT_X * 2), -MAX_ROT_X, MAX_ROT_X);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(${PERSPECTIVE}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;

        // glare follow cursor
        const gx = Math.round(px * 100);
        const gy = Math.round(py * 100);
        glare.style.background =
          `radial-gradient(520px circle at ${gx}% ${gy}%, rgba(255,255,255,${GLARE_OPACITY}) 0%, rgba(255,255,255,0.05) 35%, rgba(255,255,255,0) 70%)`;
      });
    };

    const onEnter = () => {
      glare.style.opacity = "1";
      card.classList.add("tilt-on");
    };

    const onLeave = () => {
      glare.style.opacity = "0";
      card.classList.remove("tilt-on");
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    };

    // Только на устройствах с hover
    const canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    if (!canHover) return;

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
  });
})();
