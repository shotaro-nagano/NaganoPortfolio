/* =========================================================
   main.js — orchestration
   Lenis · GSAP/ScrollTrigger · cursor · magnetic · counters
   split-text · theme + language · Works modal · rendering
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const POINTER_FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (REDUCE) root.classList.add("no-motion");

  const hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- i18n ---------------- */
  let lang = localStorage.getItem("lang") || "ja";
  const dict = () => (window.I18N && window.I18N[lang]) || {};
  function t(key) { return dict()[key] != null ? dict()[key] : key; }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.getAttribute("data-i18n"));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const v = t(el.getAttribute("data-i18n-html"));
      if (v != null) el.innerHTML = v;
    });
    root.setAttribute("lang", lang);
    body.setAttribute("lang", lang);
    const lb = document.getElementById("lang-btn");
    if (lb) {
      lb.querySelector(".ja").classList.toggle("on", lang === "ja");
      lb.querySelector(".en").classList.toggle("on", lang === "en");
    }
  }

  /* ---------------- Render: Works grid ---------------- */
  const works = window.WORKS || [];
  function workPlaceholder(w) {
    return `<div class="ph ph-stripes"></div><div class="ph-label">${w.phph || "media"}</div>`;
  }
  function renderWorks() {
    const grid = document.getElementById("works-grid");
    if (!grid) return;
    grid.innerHTML = works.map((w, i) => {
      const wide = w.group === "B" ? " wide" : "";
      const small = (w.group === "C" || w.group === "D") ? " small" : "";
      const lock = w.confidential ? `<div class="lock"><span class="lk-ic"></span><span>${t("work.confidential")}</span></div>` : "";
      const tags = (w.tech || []).slice(0, 3).map((x) => `<span class="wt">${x}</span>`).join("");
      const ext = w.link ? `<a class="wf-ext" href="${w.link}" target="_blank" rel="noopener" aria-label="${t("work.open")}">${t("work.open")} ↗</a>` : "";
      const award = w.award ? `<span class="work-award"><span class="star"></span>${t("hi.award")}</span>` : "";
      return `
      <article class="work${wide}${small} r-up" data-id="${w.id}" data-cursor="${t("work.view")}" tabindex="0" role="button" aria-label="${w.title[lang]}">
        <div class="work-media">
          ${w.img
            ? `<img class="work-img-bg" src="${w.img}" alt="" aria-hidden="true" loading="lazy" decoding="async"><img class="work-img" src="${w.img}" alt="${w.title[lang]}" loading="lazy" decoding="async">`
            : `<div class="ph ph-stripes"></div><span class="ph-tag">${w.phph || "media"}</span>`}
          <span class="work-num">${String(i + 1).padStart(2, "0")}</span>
          <div class="work-reveal"></div>
          <div class="work-revtext"><span class="rev-pill">${t("work.view")} <span class="ar">→</span></span></div>
        </div>
        <div class="work-body">
          ${lock}
          <div class="work-cat"><span class="d"></span>${w.cat[lang]}</div>
          <h3>${w.title[lang]}</h3>
          ${award}
          <p class="work-sum">${w.summary[lang]}</p>
          <div class="work-tags">${tags}</div>
          <div class="work-foot"><span class="wf-view">${t("work.view")} <span class="ar">→</span></span>${ext}</div>
        </div>
      </article>`;
    }).join("");
    grid.querySelectorAll(".work").forEach((el) => {
      const open = () => openModal(el.getAttribute("data-id"));
      // a real link inside the card (e.g. "Open site") should navigate, not open the modal
      el.addEventListener("click", (e) => { if (e.target.closest("a")) return; open(); });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    bindCursorTargets(grid);
  }

  /* ---------------- Render: Skills ---------------- */
  function renderSkills() {
    const wrap = document.getElementById("skill-rows");
    if (!wrap || !window.SKILLS) return;
    wrap.innerHTML = window.SKILLS.map((s, i) => {
      const pin = s.feature ? `<span class="pin">★ Focus</span>` : "";
      const chips = s.chips.map((c) => {
        const empty = /\[.*\]/.test(c) ? " empty" : "";
        return `<span class="chip${empty}">${c}</span>`;
      }).join("");
      return `
      <div class="skill-row r-up${s.feature ? " feature" : ""}">
        <div class="sk-head">
          <span class="sk-no">${String(i + 1).padStart(2, "0")} /</span>
          <span class="sk-title">${s.title[lang]} ${pin}</span>
        </div>
        <div class="skill-chips">${chips}</div>
      </div>`;
    }).join("");
  }

  /* ---------------- Works modal ---------------- */
  const modal = document.getElementById("work-modal");
  function openModal(id) {
    const w = works.find((x) => x.id === id);
    if (!w || !modal) return;
    const did = (w.did[lang] || []).map((d, idx) => {
      const badge = (w.awardIndex === idx) ? ` <span class="award-tag"><span class="star"></span>${t("hi.award")}</span>` : "";
      return `<li><span>${d}${badge}</span></li>`;
    }).join("");
    const tech = (w.tech || []).map((x) => `<span class="tag">${x}</span>`).join("");
    const note = w.note ? `<p style="color:var(--fg-dim);font-family:var(--font-mono);font-size:var(--fs-mono-lg);margin-top:1rem">${w.note[lang]}</p>` : "";
    const conf = w.confidential ? `<div class="wm-confidential"><span class="conf-mk"></span><span>${t("wm.confnote")}</span></div>` : "";
    let result = w.result[lang];
    if (w.resultPh) result = result.replace(/\[(.*?)\]/g, '<span class="ph-inline">[$1]</span>');

    const actions = [];
    if (w.link) actions.push(`<a class="btn btn--primary magnetic" href="${w.link}" target="_blank" rel="noopener"><span class="btn-t">${t("work.open")}</span><span class="btn-arrow">↗</span></a>`);
    const actionsHtml = (conf || actions.length) ? `<div class="wm-actions">${conf}${actions.join("")}</div>` : "";

    modal.querySelector(".wm-inner").innerHTML = `
      <div class="wm-head">
        <div class="wm-cat"><span class="d"></span>${w.cat[lang]}</div>
        <button class="wm-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
      </div>
      <div class="wm-body">
        <div class="wm-media">${w.img
          ? `<img class="wm-img-bg" src="${w.img}" alt="" aria-hidden="true" loading="lazy" decoding="async"><img class="wm-img" src="${w.img}" alt="${w.title[lang]}" loading="lazy" decoding="async">`
          : `<div class="ph ph-stripes"></div><div class="ph-label">${w.phph || "media"}</div>`}</div>
        <h2>${w.title[lang]}</h2>
        <p class="wm-summary">${w.summary[lang]}</p>
        <div class="wm-block"><div class="wm-k"><span class="n">01</span>${t("wm.challenge")}</div><p>${w.challenge[lang]}</p></div>
        <div class="wm-block"><div class="wm-k"><span class="n">02</span>${t("wm.did")}</div><ul>${did}</ul>${note}</div>
        <div class="wm-block"><div class="wm-k"><span class="n">03</span>${t("wm.tech")}</div><div class="wm-tech">${tech}</div></div>
        <div class="wm-block"><div class="wm-k"><span class="n">04</span>${t("wm.result")}</div><p class="wm-result">${result}</p></div>
      </div>
      ${actionsHtml}`;

    modal.querySelector(".wm-close").addEventListener("click", closeModal);
    bindCursorTargets(modal);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    if (window.lenisInstance) window.lenisInstance.stop();
    body.style.overflow = "hidden";
    if (hasGSAP && !REDUCE) {
      const items = modal.querySelectorAll(".wm-block, .wm-summary, .wm-media, h2");
      gsap.fromTo(items,
        { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power3.out", delay: 0.25 });
      // visibility floor in case rAF is throttled
      setTimeout(() => gsap.set(items, { y: 0, opacity: 1, clearProps: "transform" }), 1400);
    }
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (window.lenisInstance) window.lenisInstance.start();
    body.style.overflow = "";
  }
  if (modal) {
    modal.querySelector(".wm-scrim").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* ---------------- Custom cursor ---------------- */
  function initCursor() {
    if (!POINTER_FINE) return;
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;
    body.classList.add("cursor-on");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
    (function r() {
      requestAnimationFrame(r);
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px,${my}px)`;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
    })();
    window.bindCursorTargets = function (scope) {
      (scope || document).querySelectorAll("a, button, .work, [data-cursor], .magnetic, input, .beyond-card").forEach((el) => {
        if (el.__cbound) return; el.__cbound = true;
        const label = el.getAttribute("data-cursor");
        el.addEventListener("pointerenter", () => {
          if (label) { ring.classList.add("is-label"); ring.querySelector(".clabel").textContent = label; }
          else ring.classList.add("is-hover");
        });
        el.addEventListener("pointerleave", () => { ring.classList.remove("is-hover", "is-label"); });
      });
    };
    bindCursorTargets(document);
  }
  // no-op fallback so calls are safe before cursor init / on touch
  if (!window.bindCursorTargets) window.bindCursorTargets = function () {};

  /* ---------------- Magnetic ---------------- */
  function initMagnetic() {
    if (!POINTER_FINE || REDUCE) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = parseFloat(el.getAttribute("data-mag")) || 0.35;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px,${y * strength}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------- Theme ---------------- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (window.HeroFX) window.HeroFX.setTheme();
  }
  function initTheme() {
    let theme = localStorage.getItem("theme");
    if (!theme) theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    applyTheme(theme);
    const btn = document.getElementById("theme-btn");
    if (btn) btn.addEventListener("click", () => applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light"));
  }

  /* ---------------- Language ---------------- */
  function initLang() {
    const btn = document.getElementById("lang-btn");
    if (btn) btn.addEventListener("click", () => {
      lang = lang === "ja" ? "en" : "ja";
      localStorage.setItem("lang", lang);
      revertScrollTextFx();           // restore original markup BEFORE i18n swaps text
      renderWorks(); renderSkills(); applyI18n(); buildHero(true);
      // re-attach scroll FX to the re-rendered / re-texted DOM
      buildScrollTextFx();
      applyReveals();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  /* ---------------- Hero split text ---------------- */
  let heroSplits = [];
  function buildHero(isSwap) {
    const lines = document.querySelectorAll(".hero h1 .splt");
    // revert FIRST (revert restores each line's original captured text),
    // THEN apply i18n so the new-language text is what actually sticks.
    heroSplits.forEach((s) => { try { s.revert(); } catch (e) {} });
    heroSplits = [];
    applyI18n();
    if (!lines.length) return;
    if (!window.SplitType) {
      if (window.gsap) gsap.set(lines, { opacity: 1, y: 0 });
      return;
    }
    lines.forEach((ln) => heroSplits.push(new SplitType(ln, { types: "chars", tagName: "span" })));
    const chars = document.querySelectorAll(".hero h1 .char");
    if (hasGSAP) {
      if (REDUCE) { gsap.set(chars, { y: 0, opacity: 1 }); return; }
      gsap.set(chars, { yPercent: 115, opacity: 0 });
      gsap.to(chars, { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.022, ease: "power4.out", delay: isSwap ? 0.05 : 0 });
      // robustness floor: guarantee text is visible shortly after, even if rAF
      // is throttled and the tween above never advances.
      setTimeout(() => gsap.set(chars, { yPercent: 0, opacity: 1, clearProps: "transform" }), 1600);
    }
  }

  /* ---------------- Counters ---------------- */
  function initCounters() {
    document.querySelectorAll(".stat-v[data-count]").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const numEl = el.querySelector(".num");
      const run = () => {
        if (REDUCE || !hasGSAP) { numEl.textContent = target; return; }
        const obj = { v: 0 };
        gsap.fromTo(el, { scale: 0.9, y: 16 }, { scale: 1, y: 0, duration: 0.9, ease: "power3.out" });
        gsap.to(obj, { v: target, duration: 1.6, ease: "power2.out", onUpdate: () => { numEl.textContent = Math.round(obj.v); } });
      };
      if (hasGSAP && window.ScrollTrigger) {
        ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: run });
      } else { run(); }
    });
  }

  /* ---------------- Scroll text FX (split-char reveals; rebuilt on lang swap) ---------------- */
  let stfxSplits = [], stfxTriggers = [];
  function revertScrollTextFx() {
    stfxTriggers.forEach((st) => { try { st.kill(); } catch (e) {} }); stfxTriggers = [];
    stfxSplits.forEach((s) => { try { s.revert(); } catch (e) {} }); stfxSplits = [];
  }
  function buildScrollTextFx() {
    revertScrollTextFx();
    if (!window.SplitType || !hasGSAP || !window.ScrollTrigger || REDUCE) return;
    const reg = (tw) => { if (tw && tw.scrollTrigger) stfxTriggers.push(tw.scrollTrigger); };

    // 1) Section titles — chars rise out of line masks
    document.querySelectorAll(".section-head h1, .section-head h2").forEach((h) => {
      h.classList.remove("r-up"); h.removeAttribute("data-rv"); h.classList.add("split-title");
      gsap.set(h, { opacity: 1, y: 0, clearProps: "transform" });
      const sp = new SplitType(h, { types: "lines,chars", tagName: "span" });
      stfxSplits.push(sp);
      if (!sp.chars || !sp.chars.length) return;
      reg(gsap.fromTo(sp.chars, { yPercent: 115, opacity: 0 }, {
        yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.016, ease: "power4.out",
        scrollTrigger: { trigger: h, start: "top 90%" }
      }));
    });

    // 2) About lead — characters ink in as you scroll (scrubbed)
    const lead = document.querySelector(".about-lead");
    if (lead) {
      lead.classList.remove("r-up"); lead.removeAttribute("data-rv");
      gsap.set(lead, { opacity: 1, y: 0, clearProps: "transform" });
      const sp = new SplitType(lead, { types: "chars", tagName: "span" });
      stfxSplits.push(sp);
      if (sp.chars && sp.chars.length) {
        reg(gsap.fromTo(sp.chars, { opacity: 0.14 }, {
          opacity: 1, stagger: 0.02, ease: "none",
          scrollTrigger: { trigger: lead, start: "top 82%", end: "top 28%", scrub: 0.4 }
        }));
      }
    }

    // 3) Contact title — chars rise on arrival
    const ct = document.querySelector(".contact-cta .ctitle");
    if (ct) {
      const sp = new SplitType(ct.querySelector('[data-i18n="contact.ctitle1"]'), { types: "chars", tagName: "span" });
      stfxSplits.push(sp);
      if (sp.chars && sp.chars.length) {
        reg(gsap.fromTo(sp.chars, { yPercent: 60, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.035, ease: "power3.out",
          scrollTrigger: { trigger: ct, start: "top 86%" }
        }));
      }
    }
  }

  /* ---------------- Reveal tweens (re-appliable after re-renders) ---------------- */
  function applyReveals() {
    if (!hasGSAP || !window.ScrollTrigger) return;
    // drop triggers whose elements were re-rendered away
    ScrollTrigger.getAll().forEach((st) => { if (st.trigger && !document.contains(st.trigger)) st.kill(); });
    if (REDUCE) { gsap.set(".r-up, .r-fade", { opacity: 1, y: 0 }); return; }
    gsap.utils.toArray(".r-up:not([data-rv])").forEach((el) => {
      el.setAttribute("data-rv", "1");
      gsap.fromTo(el, { y: 46, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.95, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
    gsap.utils.toArray(".r-fade:not([data-rv])").forEach((el) => {
      el.setAttribute("data-rv", "1");
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    // Works media — unmask + settle
    gsap.utils.toArray(".work .work-media:not([data-sfx])").forEach((m) => {
      m.setAttribute("data-sfx", "1");
      gsap.fromTo(m, { clipPath: "inset(10% 7% 10% 7%)", scale: 1.04 }, {
        clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: m, start: "top 86%" }
      });
    });
    // Skill chips — cascade per row
    gsap.utils.toArray(".skill-row:not([data-sfx])").forEach((row) => {
      row.setAttribute("data-sfx", "1");
      const chips = row.querySelectorAll(".chip");
      if (!chips.length) return;
      gsap.fromTo(chips, { y: 16, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.55, stagger: 0.035, ease: "power2.out",
        scrollTrigger: { trigger: row, start: "top 88%" }
      });
    });
    // About bio — chapters cascade top→bottom; timeline spine draws with scroll
    gsap.utils.toArray(".about-bio:not([data-sfx])").forEach((bioEl) => {
      bioEl.setAttribute("data-sfx", "1");
      const spine = bioEl.querySelector(".bio-spine");
      if (spine) {
        gsap.fromTo(spine, { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: bioEl, start: "top 80%", end: "bottom 72%", scrub: 0.5 }
        });
      }
      gsap.utils.toArray(bioEl.querySelectorAll("p")).forEach((p) => {
        gsap.fromTo(p, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: p, start: "top 86%" }
        });
      });
    });
    // Cert cards — pop in
    gsap.utils.toArray(".certs-grid .cert:not([data-sfx])").forEach((cardEl, i) => {
      cardEl.setAttribute("data-sfx", "1");
      gsap.fromTo(cardEl, { scale: 0.86, y: 24, opacity: 0 }, {
        scale: 1, y: 0, opacity: 1, duration: 0.8, delay: (i % 6) * 0.07, ease: "back.out(1.5)",
        scrollTrigger: { trigger: cardEl.closest(".certs-grid"), start: "top 86%" }
      });
    });
  }

  /* ---------------- Scroll-driven reveals & pin ---------------- */
  function initScroll() {
    if (!hasGSAP || !window.ScrollTrigger) return;

    buildScrollTextFx();
    applyReveals();

    if (!REDUCE) {
      // section heading line reveal
      gsap.utils.toArray(".reveal-h").forEach((el) => {
        gsap.fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 92%" } });
      });
      // scroll progress bar
      const prog = document.getElementById("scroll-progress");
      if (prog) {
        gsap.fromTo(prog, { scaleX: 0 }, { scaleX: 1, ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "max", scrub: 0.3 } });
      }
      // hero exit parallax — content drifts up + fades as you leave
      if (document.querySelector(".hero")) {
        gsap.to(".hero-inner", { yPercent: -16, opacity: 0.15, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 25%", scrub: true } });
        gsap.to(".hero-name", { opacity: 0, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "40% top", scrub: true } });
      }
    } else {
      gsap.set(".r-up, .r-fade", { opacity: 1, y: 0 });
    }

    // Horizontal pinned About track
    const track = document.querySelector(".htrack");
    const wrap = document.querySelector(".htrack-wrap");
    const fill = document.querySelector(".about-progress .bar i");
    const small = window.matchMedia("(max-width: 900px)").matches;
    if (track && wrap && !REDUCE && !small) {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + (window.innerWidth * 0.04));
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: wrap, start: "top top", end: () => "+=" + dist(),
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: (self) => { if (fill) fill.style.width = (self.progress * 100).toFixed(1) + "%"; }
        }
      });
      // panel parallax + per-panel content staging
      gsap.utils.toArray(".spanel").forEach((p, i) => {
        gsap.fromTo(p.querySelector(".glyph"), { rotate: -8, y: 12 }, {
          rotate: 8, y: -12, ease: "none",
          scrollTrigger: { trigger: wrap, start: "top top", end: () => "+=" + dist(), scrub: true, containerAnimation: tween }
        });
        const bits = p.querySelectorAll("h3, p, .spanel-tags, .spanel-no");
        gsap.fromTo(bits, { x: 70, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: "power3.out",
          scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 88%" }
        });
      });
    } else if (track) {
      // fallback: native horizontal scroll
      track.style.overflowX = "auto";
      track.style.scrollSnapType = "x mandatory";
      track.querySelectorAll(".spanel").forEach((p) => (p.style.scrollSnapAlign = "start"));
      if (fill) fill.style.width = "100%";
    }

    // Works image parallax (subtle)
    if (!REDUCE) {
      gsap.utils.toArray(".work .work-media .ph").forEach((img) => {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.closest(".work"), start: "top bottom", end: "bottom top", scrub: true } });
      });
    }

    // Logo marquee — smooth seamless scroll that eases to a pause on hover
    const mq = document.querySelector(".mq-track");
    if (mq && !REDUCE) {
      const w = mq.scrollWidth / 2;
      const tween = gsap.to(mq, { x: -w, duration: 40, ease: "none", repeat: -1, modifiers: { x: (x) => (parseFloat(x) % w) + "px" } });
      const band = document.querySelector(".marquee");
      if (band) {
        band.addEventListener("pointerenter", () => gsap.to(tween, { timeScale: 0, duration: 0.6, overwrite: true }));
        band.addEventListener("pointerleave", () => gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: true }));
      }
    }
  }

  /* ---------------- Header behaviour ---------------- */
  function initHeader() {
    const header = document.querySelector(".site-header");
    const fab = document.getElementById("to-top-fab");
    const rail = document.getElementById("scroll-rail");
    if (fab) {
      fab.addEventListener("click", () => {
        if (window.lenisInstance) window.lenisInstance.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: REDUCE ? "auto" : "smooth" });
      });
    }
    if (!header) return;
    let last = 0;
    const onScroll = (y) => {
      header.classList.toggle("scrolled", y > 40);
      if (y > last && y > 400) header.classList.add("hide");
      else header.classList.remove("hide");
      last = y;
      if (fab) fab.classList.toggle("show", y > window.innerHeight * 0.9);
      if (rail) rail.classList.toggle("hidden", y > window.innerHeight * 0.6);
    };
    if (window.lenisInstance) window.lenisInstance.on("scroll", (e) => onScroll(e.scroll));
    else window.addEventListener("scroll", () => onScroll(window.scrollY));
  }

  /* ---------------- Mobile menu ---------------- */
  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;
    const close = () => { menu.classList.remove("open"); body.classList.remove("menu-open"); };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      body.classList.toggle("menu-open", open);
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  /* ---------------- Anchor smooth scroll via Lenis ---------------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const tgt = document.querySelector(id);
        if (!tgt) return;
        e.preventDefault();
        if (window.lenisInstance) window.lenisInstance.scrollTo(tgt, { offset: -10, duration: 1.4 });
        else tgt.scrollIntoView();
      });
    });
  }

  /* ---------------- Lenis ---------------- */
  function initLenis() {
    if (!window.Lenis || REDUCE) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.6 });
    window.lenisInstance = lenis;
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  }

  /* ---------------- Preloader ----------------
     Timer/CSS-transition based (never rAF-dependent) so the
     curtain can never trap the user, even if rAF is throttled. */
  function runPreloader(done) {
    const pl = document.getElementById("preloader");
    let called = false;
    const finishOnce = () => { if (called) return; called = true; done(); };
    if (!pl) { finishOnce(); return; }

    const count = pl.querySelector(".pl-count");
    const bar = pl.querySelector(".pl-bar i");

    const hide = () => {
      pl.classList.add("done");                 // CSS transition slides it up
      const after = () => { pl.style.display = "none"; finishOnce(); };
      pl.addEventListener("transitionend", after, { once: true });
      setTimeout(after, 1100);                   // safety if transitionend never fires
    };

    if (REDUCE) { pl.style.display = "none"; finishOnce(); return; }

    // count up with a plain timer (independent of requestAnimationFrame)
    const DUR = 1400, t0 = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / DUR);
      const v = Math.round((1 - Math.pow(1 - p, 2)) * 100);
      if (count) count.textContent = String(v).padStart(3, "0");
      if (bar) bar.style.transform = "scaleX(" + (1 - Math.pow(1 - p, 2)).toFixed(3) + ")";
      if (p >= 1) { clearInterval(iv); setTimeout(hide, 200); }
    };
    const iv = setInterval(tick, 1000 / 30);
    tick();

    // Hard safety: whatever happens, never stay blocked > 3.2s
    setTimeout(() => { clearInterval(iv); if (!called) hide(); }, 3200);
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    renderWorks();
    renderSkills();
    applyI18n();
    initTheme();
    initLang();
    initLenis();
    initAnchors();
    initHeader();
    initMenu();
    initCursor();
    initMagnetic();
    initCounters();
    initScroll();
    runPreloader(() => {
      buildHero(false);
      if (hasGSAP && !REDUCE && document.querySelector(".hero")) {
        gsap.fromTo(".hero-eyebrow, .hero-lead, .hero-cta, .hero-name",
          { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power3.out", delay: 0.2 });
        setTimeout(() => gsap.set(".hero-eyebrow, .hero-lead, .hero-cta, .hero-name", { y: 0, opacity: 1, clearProps: "transform" }), 1700);
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    // rAF-health safety: if requestAnimationFrame is throttled (e.g. a
    // backgrounded/offscreen iframe), GSAP's ticker stalls and scroll/entrance
    // tweens never run — which would leave content invisible. Detect that and
    // force a static, fully-readable state. Harmless on real browsers (rAF alive).
    setTimeout(() => {
      const stalled = hasGSAP && gsap.ticker.frame < 5;
      if (!stalled) return;
      root.classList.add("no-motion");
      const pl = document.getElementById("preloader");
      if (pl) { pl.style.display = "none"; }
      if (hasGSAP) {
        gsap.set(".r-up, .r-fade, .reveal-h", { clearProps: "transform", opacity: 1, y: 0, yPercent: 0 });
        gsap.set(".hero h1 .char", { yPercent: 0, opacity: 1 });
        gsap.set(".section-head h1 .char, .section-head h2 .char, .about-lead .char, .ctitle .char", { yPercent: 0, opacity: 1, clearProps: "transform" });
        gsap.set(".hero-eyebrow, .hero-lead, .hero-cta, .hero-name", { y: 0, opacity: 1 });
        gsap.set(".spanel .glyph", { rotate: 0, y: 0 });
        gsap.set(".spanel h3, .spanel p, .spanel .spanel-tags, .spanel .spanel-no", { x: 0, opacity: 1, clearProps: "transform" });
        gsap.set(".work .work-media", { clearProps: "clipPath,transform", opacity: 1 });
        gsap.set(".skill-row .chip, .certs-grid .cert", { y: 0, opacity: 1, scale: 1, clearProps: "transform" });
        gsap.set(".stat-v", { scale: 1, y: 0, clearProps: "transform" });
      }
      document.querySelectorAll(".stat-v[data-count]").forEach((el) => {
        const n = el.querySelector(".num"); if (n) n.textContent = el.getAttribute("data-count");
      });
      const fill = document.querySelector(".about-progress .bar i"); if (fill) fill.style.width = "100%";
    }, 1600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
