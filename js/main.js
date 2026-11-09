(() => {
  const root = document.documentElement;
  let lang = localStorage.getItem("cwf-lang") || "en";
  if (!["en", "sr"].includes(lang)) lang = "en";

  function resolve(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }


  const COUNTRY_CALLING_CODES = [{"iso":"RS","dial":"+381"},{"iso":"BA","dial":"+387"},{"iso":"HR","dial":"+385"},{"iso":"ME","dial":"+382"},{"iso":"XK","dial":"+383"},{"iso":"SI","dial":"+386"},{"iso":"MK","dial":"+389"},{"iso":"AT","dial":"+43"},{"iso":"DE","dial":"+49"},{"iso":"CH","dial":"+41"},{"iso":"IT","dial":"+39"},{"iso":"GR","dial":"+30"},{"iso":"FR","dial":"+33"},{"iso":"GB","dial":"+44"},{"iso":"NL","dial":"+31"},{"iso":"BE","dial":"+32"},{"iso":"SE","dial":"+46"},{"iso":"NO","dial":"+47"},{"iso":"DK","dial":"+45"},{"iso":"AD","dial":"+376"},{"iso":"VA","dial":"+39"},{"iso":"US","dial":"+1"},{"iso":"CA","dial":"+1"},{"iso":"AU","dial":"+61"},{"iso":"AE","dial":"+971"},{"iso":"AF","dial":"+93"},{"iso":"AG","dial":"+1268"},{"iso":"AI","dial":"+1264"},{"iso":"AL","dial":"+355"},{"iso":"AM","dial":"+374"},{"iso":"AO","dial":"+244"},{"iso":"AR","dial":"+54"},{"iso":"AS","dial":"+1684"},{"iso":"AW","dial":"+297"},{"iso":"AZ","dial":"+994"},{"iso":"BB","dial":"+1246"},{"iso":"BD","dial":"+880"},{"iso":"BF","dial":"+226"},{"iso":"BG","dial":"+359"},{"iso":"BH","dial":"+973"},{"iso":"BI","dial":"+257"},{"iso":"BJ","dial":"+229"},{"iso":"BM","dial":"+1441"},{"iso":"BN","dial":"+673"},{"iso":"BO","dial":"+591"},{"iso":"BR","dial":"+55"},{"iso":"BS","dial":"+1242"},{"iso":"BT","dial":"+975"},{"iso":"BW","dial":"+267"},{"iso":"BY","dial":"+375"},{"iso":"BZ","dial":"+501"},{"iso":"CC","dial":"+61"},{"iso":"CD","dial":"+243"},{"iso":"CF","dial":"+236"},{"iso":"CG","dial":"+242"},{"iso":"CI","dial":"+225"},{"iso":"CK","dial":"+682"},{"iso":"CL","dial":"+56"},{"iso":"CM","dial":"+237"},{"iso":"CN","dial":"+86"},{"iso":"CO","dial":"+57"},{"iso":"CR","dial":"+506"},{"iso":"CU","dial":"+53"},{"iso":"CV","dial":"+238"},{"iso":"CX","dial":"+61"},{"iso":"CY","dial":"+357"},{"iso":"CZ","dial":"+420"},{"iso":"DJ","dial":"+253"},{"iso":"DM","dial":"+1767"},{"iso":"DO","dial":"+1809"},{"iso":"DZ","dial":"+213"},{"iso":"EC","dial":"+593"},{"iso":"EE","dial":"+372"},{"iso":"EG","dial":"+20"},{"iso":"EH","dial":"+212"},{"iso":"ER","dial":"+291"},{"iso":"ES","dial":"+34"},{"iso":"ET","dial":"+251"},{"iso":"FI","dial":"+358"},{"iso":"FJ","dial":"+679"},{"iso":"FK","dial":"+500"},{"iso":"FM","dial":"+691"},{"iso":"FO","dial":"+298"},{"iso":"GA","dial":"+241"},{"iso":"GD","dial":"+1473"},{"iso":"GE","dial":"+995"},{"iso":"GF","dial":"+594"},{"iso":"GG","dial":"+44"},{"iso":"GH","dial":"+233"},{"iso":"GI","dial":"+350"},{"iso":"GL","dial":"+299"},{"iso":"GM","dial":"+220"},{"iso":"GN","dial":"+224"},{"iso":"GP","dial":"+590"},{"iso":"GQ","dial":"+240"},{"iso":"GS","dial":"+500"},{"iso":"GT","dial":"+502"},{"iso":"GU","dial":"+1671"},{"iso":"GW","dial":"+245"},{"iso":"GY","dial":"+592"},{"iso":"HK","dial":"+852"},{"iso":"HN","dial":"+504"},{"iso":"HT","dial":"+509"},{"iso":"HU","dial":"+36"},{"iso":"ID","dial":"+62"},{"iso":"IE","dial":"+353"},{"iso":"IL","dial":"+972"},{"iso":"IM","dial":"+44"},{"iso":"IN","dial":"+91"},{"iso":"IO","dial":"+246"},{"iso":"IQ","dial":"+964"},{"iso":"IR","dial":"+98"},{"iso":"IS","dial":"+354"},{"iso":"JE","dial":"+44"},{"iso":"JM","dial":"+1876"},{"iso":"JO","dial":"+962"},{"iso":"JP","dial":"+81"},{"iso":"KE","dial":"+254"},{"iso":"KG","dial":"+996"},{"iso":"KH","dial":"+855"},{"iso":"KI","dial":"+686"},{"iso":"KM","dial":"+269"},{"iso":"KN","dial":"+1869"},{"iso":"KP","dial":"+850"},{"iso":"KR","dial":"+82"},{"iso":"KW","dial":"+965"},{"iso":"KY","dial":"+1345"},{"iso":"KZ","dial":"+76"},{"iso":"LA","dial":"+856"},{"iso":"LB","dial":"+961"},{"iso":"LC","dial":"+1758"},{"iso":"LI","dial":"+423"},{"iso":"LK","dial":"+94"},{"iso":"LR","dial":"+231"},{"iso":"LS","dial":"+266"},{"iso":"LT","dial":"+370"},{"iso":"LU","dial":"+352"},{"iso":"LV","dial":"+371"},{"iso":"LY","dial":"+218"},{"iso":"MA","dial":"+212"},{"iso":"MC","dial":"+377"},{"iso":"MD","dial":"+373"},{"iso":"MG","dial":"+261"},{"iso":"MH","dial":"+692"},{"iso":"ML","dial":"+223"},{"iso":"MN","dial":"+976"},{"iso":"MO","dial":"+853"},{"iso":"MP","dial":"+1670"},{"iso":"MQ","dial":"+596"},{"iso":"MR","dial":"+222"},{"iso":"MS","dial":"+1664"},{"iso":"MT","dial":"+356"},{"iso":"MU","dial":"+230"},{"iso":"MV","dial":"+960"},{"iso":"MW","dial":"+265"},{"iso":"MX","dial":"+52"},{"iso":"MY","dial":"+60"},{"iso":"MZ","dial":"+258"},{"iso":"NA","dial":"+264"},{"iso":"NC","dial":"+687"},{"iso":"NE","dial":"+227"},{"iso":"NF","dial":"+672"},{"iso":"NG","dial":"+234"},{"iso":"NI","dial":"+505"},{"iso":"NP","dial":"+977"},{"iso":"NR","dial":"+674"},{"iso":"NU","dial":"+683"},{"iso":"NZ","dial":"+64"},{"iso":"OM","dial":"+968"},{"iso":"PA","dial":"+507"},{"iso":"PE","dial":"+51"},{"iso":"PF","dial":"+689"},{"iso":"PG","dial":"+675"},{"iso":"PH","dial":"+63"},{"iso":"PK","dial":"+92"},{"iso":"PL","dial":"+48"},{"iso":"PM","dial":"+508"},{"iso":"PN","dial":"+64"},{"iso":"PR","dial":"+1787"},{"iso":"PT","dial":"+351"},{"iso":"PW","dial":"+680"},{"iso":"PY","dial":"+595"},{"iso":"QA","dial":"+974"},{"iso":"RE","dial":"+262"},{"iso":"RO","dial":"+40"},{"iso":"RU","dial":"+7"},{"iso":"RW","dial":"+250"},{"iso":"SA","dial":"+966"},{"iso":"SB","dial":"+677"},{"iso":"SC","dial":"+248"},{"iso":"SD","dial":"+249"},{"iso":"SG","dial":"+65"},{"iso":"SH","dial":"+290"},{"iso":"SJ","dial":"+4779"},{"iso":"SK","dial":"+421"},{"iso":"SL","dial":"+232"},{"iso":"SM","dial":"+378"},{"iso":"SN","dial":"+221"},{"iso":"SO","dial":"+252"},{"iso":"SR","dial":"+597"},{"iso":"SS","dial":"+211"},{"iso":"ST","dial":"+239"},{"iso":"SV","dial":"+503"},{"iso":"SY","dial":"+963"},{"iso":"SZ","dial":"+268"},{"iso":"TD","dial":"+235"},{"iso":"TG","dial":"+228"},{"iso":"TH","dial":"+66"},{"iso":"TJ","dial":"+992"},{"iso":"TK","dial":"+690"},{"iso":"TL","dial":"+670"},{"iso":"TM","dial":"+993"},{"iso":"TN","dial":"+216"},{"iso":"TO","dial":"+676"},{"iso":"TR","dial":"+90"},{"iso":"TT","dial":"+1868"},{"iso":"TV","dial":"+688"},{"iso":"TW","dial":"+886"},{"iso":"TZ","dial":"+255"},{"iso":"UA","dial":"+380"},{"iso":"UG","dial":"+256"},{"iso":"UY","dial":"+598"},{"iso":"UZ","dial":"+998"},{"iso":"VC","dial":"+1784"},{"iso":"VE","dial":"+58"},{"iso":"VN","dial":"+84"},{"iso":"VU","dial":"+678"},{"iso":"WF","dial":"+681"},{"iso":"WS","dial":"+685"},{"iso":"YE","dial":"+967"},{"iso":"YT","dial":"+262"},{"iso":"ZA","dial":"+27"},{"iso":"ZM","dial":"+260"},{"iso":"ZW","dial":"+263"}];

  function initCountryPicker() {
    const picker = document.querySelector("[data-country-picker]");
    if (!picker) return;

    const trigger = picker.querySelector("[data-country-trigger]");
    const panel = picker.querySelector("[data-country-panel]");
    const list = picker.querySelector("[data-country-list]");
    const search = picker.querySelector("[data-country-search]");
    const current = picker.querySelector("[data-country-current]");
    const codeInput = picker.querySelector("[data-country-code]");
    const isoInput = picker.querySelector("[data-country-iso]");
    let selectedIso = isoInput.value || "RS";

    const regionNames = () => {
      try {
        return new Intl.DisplayNames([root.dataset.lang === "sr" ? "sr-Latn" : "en"], { type: "region" });
      } catch {
        return null;
      }
    };

    const countryName = (iso) => {
      if (iso === "XK") return root.dataset.lang === "sr" ? "Kosovo" : "Kosovo";
      return regionNames()?.of(iso) || iso;
    };

    function selectedEntry() {
      return COUNTRY_CALLING_CODES.find(item => item.iso === selectedIso) || COUNTRY_CALLING_CODES.find(item => item.iso === "RS") || COUNTRY_CALLING_CODES[0];
    }

    function syncTrigger() {
      const item = selectedEntry();
      selectedIso = item.iso;
      isoInput.value = item.iso;
      codeInput.value = item.dial;
      current.textContent = `${item.iso} ${item.dial}`;
    }

    function render(query = "") {
      const q = query.trim().toLocaleLowerCase(root.dataset.lang === "sr" ? "sr-Latn" : "en");
      const options = COUNTRY_CALLING_CODES.filter(item => {
        const name = countryName(item.iso);
        const haystack = `${item.iso} ${item.dial} ${name}`.toLocaleLowerCase(root.dataset.lang === "sr" ? "sr-Latn" : "en");
        return !q || haystack.includes(q);
      });

      list.innerHTML = "";
      if (!options.length) {
        const empty = document.createElement("p");
        empty.className = "country-picker__empty";
        empty.textContent = root.dataset.lang === "sr" ? "Nema rezultata." : "No results.";
        list.appendChild(empty);
        return;
      }

      options.forEach(item => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "country-picker__option";
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(item.iso === selectedIso));
        option.dataset.iso = item.iso;
        option.innerHTML = `<span class="country-picker__iso">${item.iso}</span><span class="country-picker__name"></span><span class="country-picker__dial">${item.dial}</span>`;
        option.querySelector(".country-picker__name").textContent = countryName(item.iso);
        option.addEventListener("click", () => {
          selectedIso = item.iso;
          syncTrigger();
          close();
          trigger.focus();
        });
        list.appendChild(option);
      });
    }

    function open() {
      picker.classList.add("is-open");
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      search.value = "";
      render();
      requestAnimationFrame(() => search.focus());
    }

    function close() {
      picker.classList.remove("is-open");
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", () => panel.hidden ? open() : close());
    search.addEventListener("input", () => render(search.value));
    search.addEventListener("keydown", event => {
      if (event.key === "Escape") { close(); trigger.focus(); }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        list.querySelector(".country-picker__option")?.focus();
      }
    });

    list.addEventListener("keydown", event => {
      const options = [...list.querySelectorAll(".country-picker__option")];
      const i = options.indexOf(document.activeElement);
      if (event.key === "ArrowDown" && i >= 0) { event.preventDefault(); options[Math.min(i + 1, options.length - 1)]?.focus(); }
      if (event.key === "ArrowUp" && i >= 0) { event.preventDefault(); (i === 0 ? search : options[i - 1])?.focus(); }
      if (event.key === "Escape") { close(); trigger.focus(); }
    });

    document.addEventListener("pointerdown", event => {
      if (!picker.contains(event.target)) close();
    });

    syncTrigger();
    render();

    window.CWFCountryPicker = {
      refreshLanguage() {
        const dict = window.CWF_TRANSLATIONS[root.dataset.lang || "en"];
        search.placeholder = dict.form.countrySearch;
        search.setAttribute("aria-label", dict.form.countrySearch);
        syncTrigger();
        render(search.value);
      },
      reset() {
        selectedIso = "RS";
        syncTrigger();
        render();
        close();
      }
    };
  }

  function applyLanguage(nextLang) {
    lang = nextLang;
    root.dataset.lang = lang;
    root.lang = lang === "sr" ? "sr" : "en";
    localStorage.setItem("cwf-lang", lang);

    const dict = window.CWF_TRANSLATIONS[lang];

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const value = resolve(dict, el.dataset.i18n);
      if (typeof value === "string") el.textContent = value;
    });

    window.CWFCalendar?.refreshLanguage();
    window.CWFCountryPicker?.refreshLanguage();
  }

  function initLanguage() {
    applyLanguage(lang);
    document.querySelectorAll("[data-lang-toggle]").forEach(btn => {
      btn.addEventListener("click", () => applyLanguage(lang === "en" ? "sr" : "en"));
    });
  }

  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;

    const setOpen = open => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };

    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  }

  function initTestimonials() {
    const items = [...document.querySelectorAll(".testimonial")];
    if (!items.length) return;
    let index = 0;

    const current = document.querySelector("[data-testimonial-current]");
    const render = () => {
      items.forEach((item, i) => item.classList.toggle("is-active", i === index));
      current.textContent = String(index + 1).padStart(2, "0");
    };

    document.querySelector("[data-testimonial-prev]")?.addEventListener("click", () => {
      index = (index - 1 + items.length) % items.length;
      render();
    });

    document.querySelector("[data-testimonial-next]")?.addEventListener("click", () => {
      index = (index + 1) % items.length;
      render();
    });

    // Native mobile swipe for testimonials; no separate script is needed.
    const stage = document.querySelector(".section--testimonials .testimonial-stage");
    if (!stage) return;
    let touchStart = null;
    stage.addEventListener("touchstart", event => {
      touchStart = null;
      if (event.touches.length !== 1 || event.target.closest("button, a")) return;
      const touch = event.touches[0];
      touchStart = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    stage.addEventListener("touchend", event => {
      if (!touchStart) return;
      const start = touchStart;
      touchStart = null;
      const touch = Array.from(event.changedTouches).find(t => t.identifier === start.id);
      if (!touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy) * 1.35) return;
      // Use the same navigation state and counter as existing arrow buttons.
      index = (index + (dx < 0 ? 1 : items.length - 1)) % items.length;
      render();
    }, { passive: true });

    stage.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });
  }

  function initForm() {
    const form = document.querySelector(".inquiry-form");
    if (!form) return;

    const showError = (field, message) => {
      const wrapper = field.closest(".field");
      wrapper?.querySelector(".field-error")?.replaceChildren(document.createTextNode(message));
      field.setAttribute("aria-invalid", "true");
    };

    const clearError = field => {
      const wrapper = field.closest(".field");
      wrapper?.querySelector(".field-error")?.replaceChildren();
      field.removeAttribute("aria-invalid");
    };

    form.querySelectorAll("input, select, textarea").forEach(field => {
      field.addEventListener("input", () => clearError(field));
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const dict = window.CWF_TRANSLATIONS[root.dataset.lang || "en"];
      let valid = true;

      form.querySelectorAll("[required]").forEach(field => {
        if (field.type === "radio") return;
        clearError(field);
        if (!field.value.trim()) {
          valid = false;
          showError(field, dict.form.required);
        }
      });

      const budget = form.querySelector('input[name="budget"]:checked');
      const budgetError = form.querySelector("[data-budget-error]");
      budgetError.textContent = "";
      if (!budget) {
        valid = false;
        budgetError.textContent = dict.form.budgetRequired;
      }

      const status = form.querySelector("[data-form-status]");
      status.textContent = "";

      if (!valid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]') || form.querySelector('input[name="budget"]');
        firstInvalid?.focus();
        return;
      }

      // Development-only submission. Replace with a real API/email/CRM endpoint.
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.phone = `${payload.countryCode || ""} ${payload.phone || ""}`.trim();
      payload.weddingDate = window.CWFCalendar?.getSelectedDate() || null;
      console.info("CWF inquiry payload:", payload);

      status.textContent = dict.form.success;
      form.reset();
      window.CWFCountryPicker?.reset();
    });
  }

  function initYear() {
    document.querySelectorAll("[data-current-year]").forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCountryPicker();
    initLanguage();
    initMobileMenu();
    initTestimonials();
    initForm();
    initYear();
  });
})();
