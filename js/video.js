(() => {
  let lastFocused = null;
  let activeSoundVideo = null;

  function dict() {
    const lang = document.documentElement.dataset.lang || "en";
    return window.CWF_TRANSLATIONS?.[lang]?.films || {};
  }

  function setSoundButton(project, soundOn) {
    const button = project.querySelector("[data-film-sound]");
    const label = button?.querySelector("[data-film-sound-label]");
    if (!button || !label) return;

    label.dataset.i18n = soundOn ? "films.soundOff" : "films.soundOn";
    label.textContent = soundOn ? (dict().soundOff || "SOUND OFF") : (dict().soundOn || "SOUND ON");
    button.setAttribute("aria-label", label.textContent);
    button.classList.toggle("is-on", soundOn);
  }

  function startPreview(project) {
    const video = project.querySelector("[data-film-preview]");
    const media = project.querySelector(".film-media");
    if (!video || project.dataset.previewStarted === "true") return;

    project.dataset.previewStarted = "true";
    video.muted = true;
    video.playsInline = true;

    video.play()
      .then(() => media?.classList.add("is-playing"))
      .catch(() => {
        // Keep the poster visible if the browser cannot start playback.
        project.dataset.previewStarted = "false";
      });
  }

  function mutePreview(project) {
    const video = project.querySelector("[data-film-preview]");
    if (!video) return;
    video.muted = true;
    if (activeSoundVideo === video) activeSoundVideo = null;
    setSoundButton(project, false);
  }

  function muteAllPreviews(exceptVideo = null) {
    document.querySelectorAll(".film-project").forEach(project => {
      const video = project.querySelector("[data-film-preview]");
      if (!video || video === exceptVideo) return;
      mutePreview(project);
    });
  }

  function togglePreviewSound(project) {
    const video = project.querySelector("[data-film-preview]");
    if (!video) return;

    if (project.dataset.previewStarted !== "true" || video.paused) {
      project.dataset.previewStarted = "true";
      video.play().catch(() => {});
      project.querySelector(".film-media")?.classList.add("is-playing");
    }

    if (video.muted) {
      muteAllPreviews(video);
      video.muted = false;
      video.volume = 1;
      activeSoundVideo = video;
      setSoundButton(project, true);
    } else {
      video.muted = true;
      activeSoundVideo = null;
      setSoundButton(project, false);
    }
  }

  function projectSource(project) {
    return project.dataset.fullSrc
      || project.querySelector("[data-film-preview] source")?.getAttribute("src")
      || project.querySelector("[data-film-preview]")?.getAttribute("src")
      || "";
  }

  function openModal(project) {
    const modal = document.querySelector("[data-film-modal]");
    const video = modal?.querySelector(".film-modal__video");
    if (!modal || !video) return;

    const source = projectSource(project);
    const title = project.querySelector(".film-meta h3")?.textContent?.trim() || "WEDDING FILM";
    const location = project.querySelector(".film-meta p")?.textContent?.trim() || "";
    if (!source) return;

    lastFocused = document.activeElement;
    muteAllPreviews();

    modal.querySelector("[data-film-title]").textContent = title;
    modal.querySelector("[data-film-location]").textContent = location;
    video.src = source;
    video.muted = false;
    video.volume = 1;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector("[data-film-close]")?.focus();

    // Opening the modal is a user gesture, so browsers generally allow sound here.
    video.play().catch(() => {});
  }

  function closeModal() {
    const modal = document.querySelector("[data-film-modal]");
    const video = modal?.querySelector(".film-modal__video");
    if (!modal || !video) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    video.pause();
    video.removeAttribute("src");
    video.load();
    lastFocused?.focus();
  }

  function initPreviewAutoplay() {
    const projects = [...document.querySelectorAll(".film-project")];
    if (!projects.length) return;

    projects.forEach(project => {
      const poster = project.querySelector(".film-poster");
      poster?.addEventListener("error", () => { poster.hidden = true; }, { once: true });
      setSoundButton(project, false);
    });

    if (!("IntersectionObserver" in window)) {
      projects.forEach(startPreview);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        startPreview(entry.target);
        // Important: after first start we stop observing, so scrolling away does NOT pause/reset it.
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: "80px 0px 80px 0px"
    });

    projects.forEach(project => observer.observe(project));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initPreviewAutoplay();

    document.querySelectorAll(".film-project").forEach(project => {
      project.querySelector(".film-open")?.addEventListener("click", () => openModal(project));
      project.querySelector("[data-film-sound]")?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        togglePreviewSound(project);
      });
    });

    document.querySelector("[data-film-close]")?.addEventListener("click", closeModal);

    document.querySelector("[data-film-modal]")?.addEventListener("click", event => {
      if (event.target.matches("[data-film-modal]")) closeModal();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && document.querySelector("[data-film-modal]")?.classList.contains("is-open")) {
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
