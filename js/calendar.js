(() => {
  const mockBookedDates = new Set([
    "2026-10-03",
    "2026-10-17",
    "2026-10-24",
    "2026-11-07",
    "2026-11-21",
    "2026-12-12"
  ]);

  let currentView = new Date();
  currentView.setDate(1);
  let selectedDate = null;

  const pad = n => String(n).padStart(2, "0");
  const toISO = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const today = new Date();
  today.setHours(0,0,0,0);

  function t() {
    return window.CWF_TRANSLATIONS[document.documentElement.dataset.lang || "en"];
  }

  function renderCalendar() {
    const grid = document.querySelector("[data-calendar-grid]");
    const monthLabel = document.querySelector("[data-calendar-month]");
    const yearLabel = document.querySelector("[data-calendar-year]");
    const weekdays = document.querySelector("[data-calendar-weekdays]");
    if (!grid) return;

    monthLabel.textContent = t().months[currentView.getMonth()];
    yearLabel.textContent = currentView.getFullYear();
    weekdays.innerHTML = t().weekdays.map(day => `<span>${day}</span>`).join("");

    const first = new Date(currentView.getFullYear(), currentView.getMonth(), 1);
    const last = new Date(currentView.getFullYear(), currentView.getMonth() + 1, 0);
    const startOffset = (first.getDay() + 6) % 7;
    const cells = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= last.getDate(); day++) {
      cells.push(new Date(currentView.getFullYear(), currentView.getMonth(), day));
    }
    while (cells.length % 7) cells.push(null);

    grid.innerHTML = "";
    cells.forEach(date => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day";

      if (!date) {
        btn.classList.add("is-outside");
        btn.tabIndex = -1;
        grid.appendChild(btn);
        return;
      }

      const iso = toISO(date);
      btn.textContent = date.getDate();
      btn.dataset.date = iso;
      btn.setAttribute("aria-label", date.toLocaleDateString(document.documentElement.dataset.lang === "sr" ? "sr-RS" : "en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      }));

      const isPast = date < today;
      const isBooked = mockBookedDates.has(iso);

      if (isPast) {
        btn.classList.add("is-past");
        btn.disabled = true;
      } else if (isBooked) {
        btn.classList.add("is-booked");
        btn.disabled = true;
        btn.setAttribute("aria-label", `${btn.getAttribute("aria-label")} — ${t().booking.booked}`);
      }

      if (selectedDate && iso === selectedDate) btn.classList.add("is-selected");

      btn.addEventListener("click", () => selectDate(iso, date));
      grid.appendChild(btn);
    });
  }

  function selectDate(iso, dateObj) {
    selectedDate = iso;
    renderCalendar();

    const panel = document.querySelector("[data-inquiry-panel]");
    const dateEl = document.querySelector("[data-selected-date]");
    panel.hidden = false;
    dateEl.textContent = dateObj.toLocaleDateString(
      document.documentElement.dataset.lang === "sr" ? "sr-RS" : "en-GB",
      { day: "2-digit", month: "long", year: "numeric" }
    );

    requestAnimationFrame(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function shiftMonth(delta) {
    currentView = new Date(currentView.getFullYear(), currentView.getMonth() + delta, 1);
    renderCalendar();
  }

  function refreshLanguage() {
    renderCalendar();
    if (selectedDate) {
      const [y,m,d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m-1, d);
      document.querySelector("[data-selected-date]").textContent = dateObj.toLocaleDateString(
        document.documentElement.dataset.lang === "sr" ? "sr-RS" : "en-GB",
        { day: "2-digit", month: "long", year: "numeric" }
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("[data-calendar-prev]")?.addEventListener("click", () => shiftMonth(-1));
    document.querySelector("[data-calendar-next]")?.addEventListener("click", () => shiftMonth(1));
    renderCalendar();
  });

  window.CWFCalendar = {
    renderCalendar,
    refreshLanguage,
    getSelectedDate: () => selectedDate,
    mockBookedDates
  };
})();
