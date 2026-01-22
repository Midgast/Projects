(() => {
  const MAX_TILT = 10;      // degrees
  const SCALE = 1.02;
  const GLARE_OPACITY = 0.22;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function makeGlare(el) {
    let glare = el.querySelector(".glare");
    if (glare) return glare;

    glare = document.createElement("div");
    glare.className = "glare";
    el.appendChild(glare);
    return glare;
  }

  function onMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top) / rect.height;   // 0..1

    const px = (x - 0.5) * 2; // -1..1
    const py = (y - 0.5) * 2; // -1..1

    const rotY = clamp(px * MAX_TILT, -MAX_TILT, MAX_TILT);
    const rotX = clamp(-py * MAX_TILT, -MAX_TILT, MAX_TILT);

    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;
    el.style.boxShadow = "0 30px 70px rgba(0,0,0,.22)";

    const glare = makeGlare(el);
    const gx = x * 100;
    const gy = y * 100;

    glare.style.opacity = String(GLARE_OPACITY);
    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%)`;
  }

  function onEnter(e) {
    const el = e.currentTarget;
    el.style.willChange = "transform";
    el.classList.add("tilt-on");
    makeGlare(el);
  }

  function onLeave(e) {
    const el = e.currentTarget;
    el.style.transform = "";
    el.style.boxShadow = "";
    el.style.willChange = "";
    el.classList.remove("tilt-on");

    const glare = el.querySelector(".glare");
    if (glare) glare.style.opacity = "0";
  }

  function init() {
    const cards = document.querySelectorAll("[data-tilt], .tilt");
    cards.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
