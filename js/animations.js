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
      gsap.utils.toArray(".reveal").forEach(el => {
        gsap.fromTo(el,
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: .9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true }
          }
        );
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
    gsap.set(introItems, { y: 26, autoAlpha: 0 });
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(introItems, { y: 0, autoAlpha: 1, duration: 1.05, stagger: .11 }, .2);

    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroStage,
        start: "top top",
        end: "bottom bottom",
        scrub: .8,
        onUpdate(self) {
          header.classList.toggle("is-light", self.progress > .78);
        }
      }
    });

    heroTimeline
      .to(heroShell, { scale: .978, borderRadius: "12px", ease: "none" }, 0)
      .to(heroContent, { y: -20, autoAlpha: .34, ease: "none" }, 0);

    if (heroVideo) {
      heroTimeline.to(heroVideo, { scale: 1.045, ease: "none" }, 0);
    }
  }

  document.addEventListener("DOMContentLoaded", initMotion);
})();
