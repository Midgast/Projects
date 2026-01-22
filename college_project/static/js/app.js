(() => {
  // -----------------------------
  // CSRF helper (Django)
  // -----------------------------
  function getCookie(name) {
    const v = document.cookie.split(";").map(s => s.trim());
    for (const item of v) {
      if (item.startsWith(name + "=")) return decodeURIComponent(item.slice(name.length + 1));
    }
    return null;
  }
  const CSRF = getCookie("csrftoken");

  async function postJSON(url, body = null) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": CSRF || "",
      },
      body: body ? JSON.stringify(body) : "{}",
    });

    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const msg = (data && data.error) ? data.error : `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  // -----------------------------
  // Active nav highlight
  // -----------------------------
  function markActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll(".nav-item").forEach(a => {
      const href = a.getAttribute("href") || "";
      const isActive =
        href !== "/" &&
        (path === href || (href !== "/" && path.startsWith(href)));

      if (isActive) a.classList.add("active");
      else a.classList.remove("active");
    });
  }

  // -----------------------------
  // Countdown (data-countdown)
  // -----------------------------
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatHHMMSS(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
  }

  function initCountdowns() {
    const nodes = [...document.querySelectorAll("[data-countdown]")];
    if (!nodes.length) return;

    function tick() {
      const now = Date.now();
      for (const node of nodes) {
        const targetMs = Number(node.getAttribute("data-target-ms") || "0");
        const out = node.querySelector("[data-countdown-text]");
        if (!out) continue;

        if (!targetMs) {
          out.textContent = "—";
          continue;
        }

        const diff = targetMs - now;
        out.textContent = formatHHMMSS(diff);
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  // -----------------------------
  // Homework toggle (data-hw-toggle)
  // -----------------------------
  function setHomeworkRowState(row, completed) {
    row.dataset.completed = completed ? "1" : "0";
    row.classList.toggle("is-done", !!completed);

    const check = row.querySelector(".check");
    if (check) {
      check.classList.toggle("on", !!completed);
      check.textContent = completed ? "✓" : "\u00A0";
    }

    const btn = row.querySelector("[data-hw-toggle]");
    if (btn) btn.textContent = completed ? "Снять" : "Готово";
  }

  function initHomeworkToggle() {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-hw-toggle]");
      if (!btn) return;

      const id = btn.getAttribute("data-id");
      const row = btn.closest("[data-hw-row]");
      if (!id || !row) return;

      btn.classList.add("loading");

      try {
        const data = await postJSON(`/api/homeworks/${id}/toggle/`);
        if (data && data.ok) {
          setHomeworkRowState(row, !!data.completed);
        }
      } catch (err) {
        // максимально тихо, без краша UI
        alert(`Не удалось обновить домашку: ${err.message}`);
      } finally {
        btn.classList.remove("loading");
      }
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    markActiveNav();
    initCountdowns();
    initHomeworkToggle();
  });
})();
