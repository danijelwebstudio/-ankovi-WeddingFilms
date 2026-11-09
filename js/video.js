(() => {
  'use strict';

  // CWF video stability patch — no cutting, seeking or timed restarting of films.
  // Play only one portfolio preview at a time to avoid simultaneous large downloads.
  const ENTER_RATIO = 0.22;
  const KEEP_RATIO = 0.10;
  const SWITCH_ADVANTAGE = 0.22;

  let lastFocused = null;
  let activeProject = null;
  let activeSoundVideo = null;
  let updateVisiblePlayback = () => {};

  function dictionary() {
    const lang = document.documentElement.dataset.lang || 'en';
    return window.CWF_TRANSLATIONS?.[lang]?.films || {};
  }

  function setSoundButton(project, soundOn) {
    const button = project.querySelector('[data-film-sound]');
    const label = button?.querySelector('[data-film-sound-label]');
    if (!button || !label) return;
    label.dataset.i18n = soundOn ? 'films.soundOff' : 'films.soundOn';
    label.textContent = soundOn
      ? (dictionary().soundOff || 'SOUND OFF')
      : (dictionary().soundOn || 'SOUND ON');
    button.setAttribute('aria-label', label.textContent);
    button.classList.toggle('is-on', soundOn);
  }

  function mutePreview(project) {
    const video = project.querySelector('[data-film-preview]');
    if (!video) return;
    video.muted = true;
    if (activeSoundVideo === video) activeSoundVideo = null;
    setSoundButton(project, false);
  }

  function muteAllPreviews(projects, except = null) {
    for (const project of projects) {
      if (project !== except) mutePreview(project);
    }
  }

  function safePlay(video) {
    if (!video || !video.paused || video.error) return;
    // Do not spam play() while buffering or while an earlier call is unresolved.
    if (video._cwfPlayPending) return;
    try {
      const result = video.play();
      if (result && typeof result.then === 'function') {
        video._cwfPlayPending = true;
        result.then(() => {
          video._cwfPlayPending = false;
          // A scroll/tab change may have happened while play() was pending.
          updateVisiblePlayback();
        }, error => {
          video._cwfPlayPending = false;
          if (error?.name !== 'AbortError' && error?.name !== 'NotAllowedError') {
            console.warn('CWF video could not start:', error);
          }
          // No automatic retry here — avoids an endless play/reject loop.
        });
      }
    } catch (error) {
      console.warn('CWF video playback error:', error);
    }
  }

  function visibleFraction(element) {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return 0;
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    return (visibleWidth * visibleHeight) / (rect.width * rect.height);
  }

  function initPlayback() {
    const projects = Array.from(document.querySelectorAll('.film-project'));
    const heroVideo = document.querySelector('[data-hero-video]');
    const heroTarget = document.querySelector('[data-hero-shell]') || heroVideo;
    const modal = document.querySelector('[data-film-modal]');
    const modalVideo = modal?.querySelector('.film-modal__video');
    const mediaFor = project => project.querySelector('.film-media') || project;
    let scheduled = false;

    const saveData = navigator.connection?.saveData === true;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
    const allowAutoPlay = !saveData && !reduceMotion;

    const playIfReady = video => {
      if (video?.paused && !video._cwfPlayPending) safePlay(video);
    };

    function pauseAllBackground() {
      heroVideo?.pause();
      projects.forEach(project => project.querySelector('[data-film-preview]')?.pause());
    }

    function pickActiveProject() {
      let best = null;
      let bestRatio = ENTER_RATIO;
      for (const project of projects) {
        const ratio = visibleFraction(mediaFor(project));
        if (ratio >= bestRatio) {
          bestRatio = ratio;
          best = project;
        }
      }
      if (activeProject) {
        const currentRatio = visibleFraction(mediaFor(activeProject));
        // Hysteresis prevents rapid sound/video switching at card boundaries.
        if (currentRatio >= KEEP_RATIO && (!best || bestRatio - currentRatio < SWITCH_ADVANTAGE)) {
          return activeProject;
        }
      }
      return best;
    }

    updateVisiblePlayback = () => {
      const blocked = document.hidden || modal?.classList.contains('is-open');
      if (blocked) {
        pauseAllBackground();
        muteAllPreviews(projects);
        activeProject = null;
        return;
      }
      if (!allowAutoPlay) {
        // Honor a manually started preview without automatically starting others.
        heroVideo?.pause();
        for (const project of projects) {
          if (project === activeProject && visibleFraction(mediaFor(project)) >= KEEP_RATIO) continue;
          project.querySelector('[data-film-preview]')?.pause();
          mutePreview(project);
          if (project === activeProject) activeProject = null;
        }
        return;
      }

      // The full original Hero retains its natural duration and its HTML loop.
      // It pauses outside the viewport; currentTime is NEVER changed by this script.
      if (heroVideo) {
        if (visibleFraction(heroTarget) >= KEEP_RATIO) playIfReady(heroVideo);
        else heroVideo.pause();
      }

      const selected = pickActiveProject();
      if (selected !== activeProject) {
        if (activeProject) mutePreview(activeProject);
        activeProject = selected;
      }

      for (const project of projects) {
        const video = project.querySelector('[data-film-preview]');
        if (!video) continue;
        if (project !== activeProject) {
          if (!video.paused) video.pause();
          if (!video.muted) mutePreview(project);
        } else {
          // Playback starts muted. SOUND ON is always a user action.
          if (project.dataset.previewStarted !== 'true') {
            project.dataset.previewStarted = 'true';
            video.muted = true;
          }
          playIfReady(video);
        }
      }
    };

    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        updateVisiblePlayback();
      });
    };

    projects.forEach(project => {
      const video = project.querySelector('[data-film-preview]');
      const poster = project.querySelector('.film-poster');
      const media = mediaFor(project);
      if (!video) return;
      setSoundButton(project, false);
      video.muted = true;
      video.playsInline = true;
      // Avoid preloading every very large documentary on page load.
      if (video.readyState === 0) video.preload = 'none';
      poster?.addEventListener('error', () => { poster.hidden = true; }, { once: true });
      video.addEventListener('playing', () => {
        // Guard against a delayed play() finally starting after a user has
        // already scrolled to a different film (the reported audio bug).
        if (document.hidden || modal?.classList.contains('is-open') ||
            activeProject !== project || visibleFraction(media) < KEEP_RATIO) {
          video.pause();
          mutePreview(project);
          return;
        }
        media.classList.add('is-playing');
      });
      video.addEventListener('error', () => media.classList.remove('is-playing'));
      video.addEventListener('canplay', scheduleUpdate);

      project.querySelector('.film-open')?.addEventListener('click', () => openModal(project));
      project.querySelector('[data-film-sound]')?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (modal?.classList.contains('is-open')) return;
        // A click is a direct user gesture and may start playback with sound.
        muteAllPreviews(projects, project);
        if (!video.muted) {
          mutePreview(project);
          return;
        }
        if (activeProject && activeProject !== project) {
          activeProject.querySelector('[data-film-preview]')?.pause();
        }
        activeProject = project;
        video.muted = false;
        video.volume = 1;
        activeSoundVideo = video;
        setSoundButton(project, true);
        video.play()?.catch(error => {
          if (error?.name !== 'AbortError') mutePreview(project);
        });
      });
    });

    if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.playsInline = true;
      const shell = document.querySelector('[data-hero-shell]');
      const markReady = () => shell?.classList.add('is-video-ready');
      const showFallback = () => shell?.classList.remove('is-video-ready');
      heroVideo.addEventListener('playing', () => {
        if (document.hidden || modal?.classList.contains('is-open') ||
            visibleFraction(heroTarget) < KEEP_RATIO || !allowAutoPlay) {
          heroVideo.pause();
        }
      });
      heroVideo.addEventListener('loadeddata', markReady);
      heroVideo.addEventListener('canplay', markReady);
      heroVideo.addEventListener('error', showFallback);
      if (heroVideo.readyState >= 2) markReady();
    }

    function projectSource(project) {
      return project.dataset.fullSrc
        || project.querySelector('[data-film-preview] source')?.getAttribute('src')
        || project.querySelector('[data-film-preview]')?.getAttribute('src')
        || '';
    }

    function openModal(project) {
      if (!modal || !modalVideo) return;
      const source = projectSource(project);
      if (!source) return;
      lastFocused = document.activeElement;
      pauseAllBackground();
      muteAllPreviews(projects);
      activeProject = null;

      const title = project.querySelector('.film-meta h3')?.textContent?.trim() || 'WEDDING FILM';
      const location = project.querySelector('.film-meta p')?.textContent?.trim() || '';
      const titleEl = modal.querySelector('[data-film-title]');
      const locationEl = modal.querySelector('[data-film-location]');
      if (titleEl) titleEl.textContent = title;
      if (locationEl) locationEl.textContent = location;
      modalVideo.src = source;
      modalVideo.muted = false;
      modalVideo.volume = 1;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      modal.querySelector('[data-film-close]')?.focus();
      // Start within the click gesture; the browser controls are available if loading is slow.
      safePlay(modalVideo);
    }

    function closeModal() {
      if (!modal || !modalVideo || !modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      modalVideo.pause();
      modalVideo._cwfPlayPending = false;
      modalVideo.removeAttribute('src');
      modalVideo.load(); // Abort the large film transfer once the player is closed.
      lastFocused?.focus();
      scheduleUpdate();
    }

    modal?.querySelector('[data-film-close]')?.addEventListener('click', closeModal);
    modal?.addEventListener('click', event => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeModal();
    });

    // IO handles entry/exit; the passive scroll listener also catches sticky Hero
    // motion and CSS transforms that can lag between intersection callbacks.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(scheduleUpdate, {
        threshold: [0, KEEP_RATIO, ENTER_RATIO, 0.5, 1]
      });
      if (heroTarget) observer.observe(heroTarget);
      projects.forEach(project => observer.observe(mediaFor(project)));
    }
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseAllBackground();
        muteAllPreviews(projects);
        activeProject = null;
        modalVideo?.pause();
      } else {
        scheduleUpdate();
      }
    });
    window.addEventListener('pagehide', () => {
      pauseAllBackground();
      muteAllPreviews(projects);
      modalVideo?.pause();
    });
    window.addEventListener('pageshow', scheduleUpdate);

    // First sync after the document is parsed and positioned.
    scheduleUpdate();
    window.CWFVideo = { closeModal };
  }

  document.addEventListener('DOMContentLoaded', () => {
    // A small additive CSS file corrects the B&W portrait card. We load it here
    // so the existing index.html / other styles are left untouched.
    if (!document.querySelector('link[data-cwf-video-fixes]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = new URL('css/video-fixes.css', document.baseURI).href;
      link.setAttribute('data-cwf-video-fixes', '');
      document.head.appendChild(link);
    }
    initPlayback();
  });
})();
