// college_project/static/js/app.js
(() => {
  // --- CSRF helper (Django) ---
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const csrf = getCookie("csrftoken");

  // --- Homework toggle ---
  const toggles = document.querySelectorAll("[data-hw-toggle][data-hw-id]");
  if (toggles.length) {
    toggles.forEach((cb) => {
      cb.addEventListener("change", async () => {
        const id = cb.getAttribute("data-hw-id");
        const url = `/api/homeworks/${id}/toggle/`;

        // optimistic UI is OK, but revert on fail
        const prev = !cb.checked;

        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "X-CSRFToken": csrf || "",
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          if (!data || data.ok !== true) throw new Error("Bad response");
          // Server is source of truth
          cb.checked = !!data.completed;

          // update pill in same row (if exists)
          const row = cb.closest(".hw-row");
          if (row) {
            const pill = row.querySelector(".pill.mini");
            if (pill) {
              if (cb.checked) {
                pill.textContent = "Готово";
                pill.classList.remove("subtle");
              } else {
                pill.textContent = "В работе";
                pill.classList.add("subtle");
              }
            }
          }
        } catch (e) {
          // revert
          cb.checked = prev;
          console.error("Homework toggle failed:", e);
        }
      });
    });
  }

  // --- Optional: close flash messages (if you have them) ---
  document.querySelectorAll("[data-flash-close]").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest("[data-flash]")?.remove());
  });
})();
