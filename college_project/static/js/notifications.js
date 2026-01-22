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

  async function postJSON(url) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": CSRF || "",
      },
      body: "{}",
    });

    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const msg = (data && data.error) ? data.error : `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  function setBadge(count) {
    const badge = document.getElementById("notifBadge");
    if (!badge) return;

    badge.dataset.count = String(count);
    badge.textContent = String(count);

    // скрытие/показ через CSS: badge[data-count="0"]{display:none;}
  }

  function markRowRead(row) {
    row.dataset.read = "1";
    row.classList.add("is-read");

    const check = row.querySelector(".check");
    if (check) {
      check.classList.remove("on");
      check.textContent = "✓";
    }

    const btn = row.querySelector("[data-notif-read]");
    if (btn) {
      btn.remove();
      const ok = document.createElement("span");
      ok.className = "pill mini";
      ok.textContent = "OK";
      row.querySelector("div[style*='display:flex']")?.appendChild(ok);
    }
  }

  async function markRead(id, row) {
    const data = await postJSON(`/api/notifications/${id}/read/`);
    if (data && data.ok) {
      markRowRead(row);
      if (typeof data.unread_count === "number") setBadge(data.unread_count);
    }
  }

  // кнопка "Прочитано"
  function bindButtons() {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-notif-read]");
      if (!btn) return;

      const id = btn.getAttribute("data-id");
      const row = btn.closest("[data-notif-row]");
      if (!id || !row) return;

      btn.classList.add("loading");
      try {
        await markRead(id, row);
      } catch (err) {
        alert(`Не удалось отметить: ${err.message}`);
      } finally {
        btn.classList.remove("loading");
      }
    });
  }

  // авто-пометка на странице уведомлений
  async function autoMarkOnNotificationsPage() {
    const page = document.querySelector("[data-notifications-page][data-auto-read='1']");
    if (!page) return;

    const rows = [...document.querySelectorAll("[data-notif-row][data-read='0']")];
    if (!rows.length) return;

    // Чтобы не спамить запросами: максимум 20 за раз
    const batch = rows.slice(0, 20);

    for (const row of batch) {
      const id = row.getAttribute("data-id");
      if (!id) continue;
      try {
        await markRead(id, row);
      } catch (_) {
        // тихо игнорируем, чтобы UI не падал
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindButtons();
    autoMarkOnNotificationsPage();
  });
})();
