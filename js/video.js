(() => {
  const filmData = {
    "sara-luka": {
      title: "SARA & LUKA",
      location: "Belgrade, Serbia · 2026",
      full: "assets/videos/film-01-full.mp4"
    },
    "ana-marko": {
      title: "ANA & MARKO",
      location: "Novi Sad, Serbia · 2026",
      full: "assets/videos/film-02-full.mp4"
    },
    "mia-nikola": {
      title: "MIA & NIKOLA",
      location: "Athens, Greece · 2026",
      full: "assets/videos/film-03-full.mp4"
    },
    "lea-stefan": {
      title: "LEA & STEFAN",
      location: "Banja Luka, Bosnia and Herzegovina · 2026",
      full: "assets/videos/film-04-full.mp4"
    }
  };

  let lastFocused = null;

  function previewStart(project) {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const video = project.querySelector("video");
    const media = project.querySelector(".film-media");
    if (!video) return;
    video.play().then(() => media.classList.add("is-playing")).catch(() => {});
  }

  function previewStop(project) {
    const video = project.querySelector("video");
    const media = project.querySelector(".film-media");
    if (!video) return;
    video.pause();
    try { video.currentTime = 0; } catch {}
    media.classList.remove("is-playing");
  }

  function openModal(project) {
    const modal = document.querySelector("[data-film-modal]");
    const video = modal.querySelector(".film-modal__video");
    const key = project.dataset.film;
    const data = filmData[key];
    if (!data) return;

    lastFocused = document.activeElement;
    modal.querySelector("[data-film-title]").textContent = data.title;
    modal.querySelector("[data-film-location]").textContent = data.location;
    video.src = data.full;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector("[data-film-close]").focus();
  }

  function closeModal() {
    const modal = document.querySelector("[data-film-modal]");
    const video = modal.querySelector(".film-modal__video");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    video.pause();
    video.removeAttribute("src");
    video.load();
    lastFocused?.focus();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".film-project").forEach(project => {
      const button = project.querySelector(".film-open");
      button.addEventListener("mouseenter", () => previewStart(project));
      button.addEventListener("mouseleave", () => previewStop(project));
      button.addEventListener("focus", () => previewStart(project));
      button.addEventListener("blur", () => previewStop(project));
      button.addEventListener("click", () => openModal(project));
    });

    document.querySelector("[data-film-close]")?.addEventListener("click", closeModal);

    document.querySelector("[data-film-modal]")?.addEventListener("click", e => {
      if (e.target.matches("[data-film-modal]")) closeModal();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && document.querySelector("[data-film-modal]")?.classList.contains("is-open")) {
        closeModal();
      }
    });

    const heroVideo = document.querySelector("[data-hero-video]");
    const heroShell = document.querySelector("[data-hero-shell]");
    if (heroVideo && heroShell) {
      const markReady = () => heroShell.classList.add("is-video-ready");
      const keepFallback = () => heroShell.classList.remove("is-video-ready");
      heroVideo.addEventListener("canplay", markReady, { once: true });
      heroVideo.addEventListener("error", keepFallback);
      if (heroVideo.readyState >= 3) markReady();
    }
  });

  window.CWFVideo = { closeModal };
})();
