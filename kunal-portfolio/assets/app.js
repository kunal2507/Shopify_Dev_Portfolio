/* Kunal Singh — shared behavior (dependency-free) */
(() => {
  "use strict";

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch { return null; } },
    set(k,v){ try { localStorage.setItem(k,v); } catch {} }
  };
  const saved = store.get("ks-theme");
  if (saved) root.setAttribute("data-theme", saved);
  else if (matchMedia("(prefers-color-scheme: dark)").matches) root.setAttribute("data-theme","dark");

  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("ks-theme", next);
    });
  });

  /* ---------- overlay nav ---------- */
  const menuBtn = document.querySelector("[data-menu]");
  if (menuBtn) {
    const label = menuBtn.querySelector("span");
    menuBtn.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open);
      if (label) label.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) menuBtn.click();
    });
    document.querySelectorAll(".overlay a").forEach(a =>
      a.addEventListener("click", () => {
        if (document.body.classList.contains("nav-open")) menuBtn.click();
      })
    );
  }

  /* ---------- top bar hide on scroll down ---------- */
  const bar = document.querySelector(".bar");
  let lastY = 0, ticking = false;
  function onScroll(){
    const y = window.scrollY;
    if (bar && !document.body.classList.contains("nav-open")) {
      bar.classList.toggle("hide", y > 140 && y > lastY);
    }
    lastY = y;
    ticking = false;
  }
  addEventListener("scroll", () => {
    if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive:true });

  /* ---------- reveals + counters ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      if (en.target.hasAttribute("data-count")) count(en.target);
      io.unobserve(en.target);
    });
  }, { threshold:.12, rootMargin:"0px 0px -36px 0px" });

  document.querySelectorAll(".rv,[data-count]").forEach(el => io.observe(el));

  function count(el){
    const target = +el.dataset.count, suffix = el.dataset.suffix || "";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce){ el.innerHTML = target + `<i>${suffix}</i>`; return; }
    const t0 = performance.now(), dur = 1500;
    (function tick(now){
      const k = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      el.innerHTML = Math.round(target * eased) + (k === 1 ? `<i>${suffix}</i>` : "");
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- ledger floating preview ---------- */
  const prev = document.querySelector(".float-prev");
  if (prev && matchMedia("(hover:hover)").matches) {
    const img = prev.querySelector("img");
    let px = 0, py = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (px - cx) * .12; cy += (py - cy) * .12;
      prev.style.transform = "";
      prev.style.left = cx + 24 + "px";
      prev.style.top  = cy - prev.offsetHeight / 2 + "px";
      raf = requestAnimationFrame(loop);
    };
    document.querySelectorAll(".lrow[data-img]").forEach(row => {
      row.addEventListener("mouseenter", () => {
        img.src = row.dataset.img;
        img.alt = row.querySelector("h3")?.textContent || "";
        prev.classList.add("on");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener("mousemove", e => { px = e.clientX; py = e.clientY; if(!cx){cx=px;cy=py;} });
      row.addEventListener("mouseleave", () => {
        prev.classList.remove("on");
        cancelAnimationFrame(raf); raf = null;
      });
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
})();
