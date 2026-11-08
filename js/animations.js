(() => {
  function initMotion() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector(".site-header");

    if (!window.gsap || !window.ScrollTrigger) {
      if (header) {
        const update = () => header.classList.toggle("is-light", window.scrollY > window.innerHeight * 0.9);
        update();
        window.addEventListener("scroll", update, { passive: true });
      }
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (!reducedMotion && window.Lenis) {
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    if (!reducedMotion) {
      /* Standard quiet reveals for sections that don't have a custom sequence. */
      gsap.utils.toArray(".reveal").forEach(el => {
        if (el.matches(".about-copy, .about-media, .film-project")) return;

        gsap.fromTo(el,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: .88,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 87%", once: true }
          }
        );
      });

      /* About: copy arrives first, portrait follows half a beat later. */
      const aboutCopy = document.querySelector(".about-copy");
      const aboutMedia = document.querySelector(".about-media");

      if (aboutCopy) {
        const copyParts = [
          aboutCopy.querySelector(".eyebrow"),
          aboutCopy.querySelector(".section-title"),
          aboutCopy.querySelector(".lede"),
          ...aboutCopy.querySelectorAll(".body-copy p")
        ].filter(Boolean);

        gsap.fromTo(copyParts,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: .9,
            stagger: .085,
            ease: "power3.out",
            scrollTrigger: { trigger: aboutCopy, start: "top 84%", once: true }
          }
        );
      }

      if (aboutMedia) {
        const portrait = aboutMedia.querySelector("img");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: aboutMedia, start: "top 86%", once: true }
        });

        tl.fromTo(aboutMedia,
          { y: 38, autoAlpha: 0, clipPath: "inset(7% 0 5% 0)" },
          { y: 0, autoAlpha: 1, clipPath: "inset(0% 0 0% 0)", duration: 1.05, ease: "power3.out" }
        );

        if (portrait) {
          tl.fromTo(portrait,
            { scale: 1.045 },
            { scale: 1, duration: 1.15, ease: "power3.out" },
            0
          );
        }
      }

      /* Films: reveal the frame first, then metadata. No aggressive zoom. */
      gsap.utils.toArray(".film-project").forEach(project => {
        const media = project.querySelector(".film-media");
        const meta = project.querySelector(".film-meta");
        if (!media) return;

        const tl = gsap.timeline({
          scrollTrigger: { trigger: project, start: "top 88%", once: true }
        });

        tl.fromTo(media,
          { y: 24, autoAlpha: .55, clipPath: "inset(5% 0 5% 0)" },
          { y: 0, autoAlpha: 1, clipPath: "inset(0% 0 0% 0)", duration: 1, ease: "power3.out" }
        );

        if (meta) {
          tl.fromTo(meta,
            { y: 14, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: .72, ease: "power3.out" },
            .2
          );
        }
      });
    }

    const heroStage = document.querySelector("[data-hero-stage]");
    const heroShell = document.querySelector("[data-hero-shell]");
    const heroContent = document.querySelector("[data-hero-content]");
    const heroVideo = document.querySelector("[data-hero-video]");

    if (!heroStage || !heroShell || !heroContent || !header) return;

    if (reducedMotion) {
      ScrollTrigger.create({
        trigger: heroStage,
        start: "bottom 20%",
        onEnter: () => header.classList.add("is-light"),
        onLeaveBack: () => header.classList.remove("is-light")
      });
      return;
    }

    const introItems = gsap.utils.toArray(".reveal-item");
    gsap.set(introItems, { y: 24, autoAlpha: 0 });
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(introItems, { y: 0, autoAlpha: 1, duration: 1.02, stagger: .1 }, .2);

    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroStage,
        start: "top top",
        end: "bottom bottom",
        scrub: .72,
        onUpdate(self) {
          header.classList.toggle("is-light", self.progress > .78);
        }
      }
    });

    heroTimeline
      .to(heroShell, { scale: .972, borderRadius: "18px", ease: "none" }, 0)
      .to(heroContent, { y: -26, autoAlpha: .28, ease: "none" }, 0);

    if (heroVideo) {
      heroTimeline.to(heroVideo, { scale: 1.055, ease: "none" }, 0);
    }
  }

  document.addEventListener("DOMContentLoaded", initMotion);
})();
