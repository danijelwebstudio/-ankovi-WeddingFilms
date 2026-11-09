(() => {
  let lastFocused = null;
  let activeSoundVideo = null;
  let updateVisiblePlayback = () => {};

  // A preview repeats its FIRST 12 seconds without creating a new video file.
  // When SOUND ON is selected, the original soundtrack is allowed to continue.
  const PREVIEW_SECONDS = 12;
  const START_RATIO = 0.15;
  const STOP_RATIO = 0.05;

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
    if (!video) return;

    // Set these values only once: returning to the section must NOT reset
    // the movie position, SOUND ON choice, or the visible video frame.
    if (project.dataset.previewStarted !== "true") {
      project.dataset.previewStarted = "true";
      video.muted = true;
      video.playsInline = true;
    }
    if (!video.paused) return;

    video.play()
      .then(() => media?.classList.add("is-playing"))
      .catch(() => {
        // Playback may be blocked by the browser or cancelled by a pause.
        // Leave the last frame visible; retry when it becomes visible again.
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
    updateVisiblePlayback(); // Pause Hero and ALL previews behind the modal.

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
    updateVisiblePlayback(); // Resume only what is visible after closing.
  }

  function initPreviewAutoplay() {
    const projects = [...document.querySelectorAll(".film-project")];
    const heroVideo = document.querySelector("[data-hero-video]");
    const heroTarget = document.querySelector("[data-hero-shell]") || heroVideo;
    const observed = projects.concat(heroTarget ? [heroTarget] : []);
    const inView = new Map();

    // No extra posters are created or substituted. Existing visuals stay put.
    projects.forEach(project => {
      const poster = project.querySelector(".film-poster");
      poster?.addEventListener("error", () => { poster.hidden = true; }, { once: true });
      setSoundButton(project, false);
      const video = project.querySelector("[data-film-preview]");
      if (!video) return;
      video.playsInline = true;

      // A short HTML/JS preview is just a playback window into the same file.
      // Original footage, resolution, soundtrack and full-film modal are untouched.
      video.addEventListener("timeupdate", () => {
        if (!video.muted || video.paused || video.currentTime < PREVIEW_SECONDS) return;
        if (Number.isFinite(video.duration) && video.duration > PREVIEW_SECONDS) {
          try { video.currentTime = 0; } catch { /* not seekable yet */ }
        }
      });
    });

    // A visitor who explicitly enabled Data Saver or reduced motion should
    // not be forced to autoplay videos. WATCH FILM and SOUND ON still work.
    const prefersLessMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    const saveData = navigator.connection?.saveData || false;
    const allowAutomaticPlayback = !(prefersLessMotion || saveData);

    function visibleFraction(element) {
      const rect = element.getBoundingClientRect();
      const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
      const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      return rect.width > 0 && rect.height > 0 ? (width * height) / (rect.width * rect.height) : 0;
    }

    function refreshTargets() {
      observed.forEach(target => {
        const fraction = visibleFraction(target);
        const wasVisible = inView.get(target) || false;
        if (fraction >= START_RATIO) inView.set(target, true);
        else if (fraction <= STOP_RATIO) inView.set(target, false);
        else if (!inView.has(target)) inView.set(target, wasVisible);
      });
    }

    function stopAllBackgroundVideos() {
      heroVideo?.pause();
      projects.forEach(project => project.querySelector("[data-film-preview]")?.pause());
    }

    updateVisiblePlayback = () => {
      const modalIsOpen = document.querySelector("[data-film-modal]")?.classList.contains("is-open");
      if (document.hidden || modalIsOpen || !allowAutomaticPlayback) {
        stopAllBackgroundVideos();
        return;
      }

      // Hero keeps its original, full-length loop. It pauses when below the
      // Hero section and resumes at the exact previous timestamp on return.
      if (heroVideo) {
        if (heroTarget && inView.get(heroTarget)) {
          if (heroVideo.paused) heroVideo.play().catch(() => {});
        } else {
          heroVideo.pause();
        }
      }

      projects.forEach(project => {
        const video = project.querySelector("[data-film-preview]");
        if (!video) return;
        if (inView.get(project)) startPreview(project);
        else video.pause(); // Keeps currentTime; does not restart the movie.
      });
    };

    refreshTargets();
    updateVisiblePlayback();

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const wasVisible = inView.get(entry.target) || false;
          if (entry.intersectionRatio >= START_RATIO) inView.set(entry.target, true);
          else if (entry.intersectionRatio <= STOP_RATIO) inView.set(entry.target, false);
          else inView.set(entry.target, wasVisible);
        });
        updateVisiblePlayback();
      }, {
        threshold: [0, STOP_RATIO, START_RATIO, 0.35, 0.65, 1],
        rootMargin: "0px"
      });
      observed.forEach(target => observer.observe(target));
    } else {
      // Fallback for older browsers: lightweight, frame-throttled visibility check.
      let scheduled = false;
      const check = () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          refreshTargets();
          updateVisiblePlayback();
        });
      };
      window.addEventListener("scroll", check, { passive: true });
      window.addEventListener("resize", check, { passive: true });
    }

    document.addEventListener("visibilitychange", updateVisiblePlayback);
    window.addEventListener("pagehide", stopAllBackgroundVideos);
    window.addEventListener("pageshow", () => {
      refreshTargets();
      updateVisiblePlayback();
    });
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
