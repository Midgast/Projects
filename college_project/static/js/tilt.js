(() => {
  // CSRF (Django)
  function getCookie(name) {
    const v = document.cookie.split("; ").find(row => row.startsWith(name + "="));
    return v ? decodeURIComponent(v.split("=")[1]) : "";
  }
  const csrf = getCookie("csrftoken");

  // 3D Tilt + Glare
  const cards = document.querySelectorAll("[data-tilt]");
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  cards.forEach((card) => {
    const glare = card.querySelector(".glare");

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0..1
      const py = (e.clientY - rect.top) / rect.height;   // 0..1

      const rx = (0.5 - py) * 10; // rotateX
      const ry = (px - 0.5) * 12; // rotateY

      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;

      if (glare) {
        glare.style.opacity = String(clamp(0.25 + Math.abs(ry) / 20, 0.15, 0.55));
        glare.style.left = `${px * 100}%`;
        glare.style.top = `${py * 100}%`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      if (glare) glare.style.opacity = "0";
    });
  });

  // Tasks: toggle (safe POST with CSRF)
  const taskEls = document.querySelectorAll("[data-task]");
  taskEls.forEach((el) => {
    el.addEventListener("click", async () => {
      const id = el.getAttribute("data-id");
      if (!id) return;

      // optimistic UI
      el.classList.toggle("is-done");

      try {
        const res = await fetch(`/toggle-task/${id}/`, {
          method: "POST",
          headers: { "X-CSRFToken": csrf },
        });
        if (!res.ok) {
          el.classList.toggle("is-done"); // rollback
          return;
        }
        const data = await res.json();
        if (data && typeof data.completed === "boolean") {
          el.classList.toggle("is-done", data.completed);
        }
      } catch {
        el.classList.toggle("is-done"); // rollback
      }
    });
  });

  // Countdown
  const cd = document.querySelector("[data-countdown]");
  if (cd) {
    const target = Number(cd.getAttribute("data-target") || "0");
    const out = cd.querySelector(".countdown__time");
    if (target && out) {
      const tick = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
          out.textContent = "Сейчас";
          return;
        }
        const s = Math.floor(diff / 1000);
        const mm = Math.floor(s / 60);
        const ss = s % 60;
        out.textContent = `${mm} мин ${String(ss).padStart(2, "0")} сек`;
        requestAnimationFrame(() => {}); // микро-сглаживание
        setTimeout(tick, 250);
      };
      tick();
    }
  }
})();
