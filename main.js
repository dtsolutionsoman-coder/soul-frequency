/* ==========================================================================
   THE SOUL FREQUENCY — interactions
   1. Resonance field (hero canvas)   2. Nav        3. Mobile menu
   4. Scroll reveals                  5. Instrumentarium accordion
   6. Quote stage
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ------------------------------------------------------------------
     1 · RESONANCE FIELD — gold rings breathing like a struck gong.
     Rings warp where the cursor passes; a single strike ripple opens
     the page. Aurora washes + a faint Himalayan starfield beneath.
  ------------------------------------------------------------------ */
  function resonanceField() {
    var canvas = document.getElementById("field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, DPR = 1, CX = 0, CY = 0, RMAX = 0;

    var RING_COUNT = 15;
    var SEGMENTS = 120;
    var TAU = Math.PI * 2;

    var pointer = { x: -9999, y: -9999, energy: 0 };
    var strike = { r: 0, alpha: 0.55, active: false };
    var stars = [];

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      CX = W * 0.5;
      CY = H * 0.455;
      RMAX = Math.max(W, H) * 0.62;
      seedStars();
      if (reduceMotion) draw(0);
    }

    function seedStars() {
      stars = [];
      var n = Math.floor((W * H) / 26000);
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.1 + 0.3,
          tw: Math.random() * TAU,
          sp: 0.4 + Math.random() * 0.8
        });
      }
    }

    /* gentle value noise so rings are never machine-perfect */
    function wobble(angle, t, seed) {
      return (
        Math.sin(angle * 3 + seed + t * 0.35) * 2.2 +
        Math.sin(angle * 7 - seed * 2 + t * 0.22) * 1.2
      );
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);

      /* --- aurora washes --- */
      var auroras = [
        { x: 0.24 + Math.sin(t * 0.00006) * 0.04, y: 0.2, r: 0.55, c: "107, 91, 158", a: 0.085 },  /* violet */
        { x: 0.78, y: 0.68 + Math.cos(t * 0.00005) * 0.05, r: 0.5, c: "46, 95, 99", a: 0.075 },    /* teal   */
        { x: 0.5, y: 0.42, r: 0.42, c: "198, 161, 91", a: 0.05 }                                   /* brass  */
      ];
      for (var a = 0; a < auroras.length; a++) {
        var A = auroras[a];
        var g = ctx.createRadialGradient(A.x * W, A.y * H, 0, A.x * W, A.y * H, A.r * Math.max(W, H));
        g.addColorStop(0, "rgba(" + A.c + ", " + A.a + ")");
        g.addColorStop(1, "rgba(" + A.c + ", 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      /* --- starfield --- */
      for (var s = 0; s < stars.length; s++) {
        var st = stars[s];
        var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * st.sp + st.tw));
        ctx.globalAlpha = 0.5 * tw;
        ctx.fillStyle = "#ECE7DC";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* --- rings --- */
      var px = pointer.x, py = pointer.y;
      var pd = Math.hypot(px - CX, py - CY);

      for (var i = 0; i < RING_COUNT; i++) {
        var f = i / (RING_COUNT - 1);
        var base = 34 + f * RMAX;
        var breathe = Math.sin(t * 0.00045 + f * 1.7) * (4 + f * 9);
        var alpha = 0.34 * (1 - f) + 0.05;
        var lw = 1.15 - f * 0.55;

        /* cursor proximity feeds energy into nearby rings */
        var near = Math.exp(-Math.pow((base + breathe - pd) / 130, 2)) * pointer.energy;
        alpha = Math.min(0.85, alpha + near * 0.4);

        ctx.beginPath();
        for (var k = 0; k <= SEGMENTS; k++) {
          var ang = (k / SEGMENTS) * TAU;
          var r = base + breathe + wobble(ang, t, i * 2.3);

          if (pointer.energy > 0.01) {
            var gx = CX + Math.cos(ang) * r;
            var gy = CY + Math.sin(ang) * r;
            var d = Math.hypot(gx - px, gy - py);
            r += Math.exp(-Math.pow(d / 110, 2)) * -14 * pointer.energy;
          }
          var x = CX + Math.cos(ang) * r;
          var y = CY + Math.sin(ang) * r;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(198, 161, 91, " + alpha.toFixed(3) + ")";
        ctx.lineWidth = lw;
        ctx.stroke();
      }

      /* --- centre point: the still eye --- */
      var pulse = 2.6 + Math.sin(t * 0.0012) * 0.9;
      ctx.beginPath();
      ctx.arc(CX, CY, pulse, 0, TAU);
      ctx.fillStyle = "rgba(233, 213, 163, 0.9)";
      ctx.fill();

      /* --- opening strike ripple --- */
      if (strike.active) {
        strike.r += (RMAX * 1.25 - strike.r) * 0.016;
        strike.alpha *= 0.992;
        ctx.beginPath();
        ctx.arc(CX, CY, strike.r, 0, TAU);
        ctx.strokeStyle = "rgba(233, 213, 163, " + strike.alpha.toFixed(3) + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        if (strike.alpha < 0.02) strike.active = false;
      }
    }

    var lastFrame = 0;
    function loop(t) {
      if (t - lastFrame < 31) { requestAnimationFrame(loop); return; }
      lastFrame = t;
      pointer.energy += ((pointer.x > -999 ? 1 : 0) - pointer.energy) * 0.06;
      draw(t);
      if (fieldVisible) requestAnimationFrame(loop);
    }

    /* stop painting when the hero leaves the viewport */
    var fieldVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var nowVisible = entries[0].isIntersecting;
        if (nowVisible && !fieldVisible) {
          fieldVisible = true;
          requestAnimationFrame(loop);
        } else {
          fieldVisible = nowVisible;
        }
      }, { threshold: 0 }).observe(canvas);
    }

    canvas.parentElement.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener("pointerleave", function () {
      pointer.x = -9999; pointer.y = -9999;
    });

    window.addEventListener("resize", resize);
    resize();

    if (reduceMotion) {
      draw(0);
    } else {
      setTimeout(function () { strike.active = true; }, 500);
      requestAnimationFrame(loop);
    }
  }

  /* ------------------------------------------------------------------
     2 · NAV state
  ------------------------------------------------------------------ */
  function navState() {
    var nav = document.getElementById("nav");
    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 28);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     3 · MOBILE MENU
  ------------------------------------------------------------------ */
  function mobileMenu() {
    var burger = document.getElementById("navBurger");
    var menu = document.getElementById("mobileMenu");
    if (!burger || !menu) return;

    function setOpen(open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
    }
    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     4 · SCROLL REVEALS — with sibling stagger
  ------------------------------------------------------------------ */
  function reveals() {
    var groups = document.querySelectorAll(".outcomes, .rite, .hero-actions");
    groups.forEach(function (g) {
      Array.prototype.forEach.call(g.querySelectorAll(".reveal"), function (el, i) {
        el.style.setProperty("--reveal-delay", (i * 0.12).toFixed(2) + "s");
      });
    });

    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     5 · INSTRUMENTARIUM — hover opens (desktop), tap toggles (touch)
  ------------------------------------------------------------------ */
  function instrumentarium() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".ins"));

    function open(item) {
      items.forEach(function (it) {
        var on = it === item;
        it.setAttribute("data-open", String(on));
        it.querySelector(".ins-row").setAttribute("aria-expanded", String(on));
      });
    }

    items.forEach(function (item) {
      var row = item.querySelector(".ins-row");
      row.addEventListener("click", function () {
        open(item.getAttribute("data-open") === "true" ? null : item);
      });
      if (canHover) {
        row.addEventListener("mouseenter", function () { open(item); });
      }
    });
  }

  /* ------------------------------------------------------------------
     6 · QUOTE STAGE
  ------------------------------------------------------------------ */
  function quoteStage() {
    var stage = document.getElementById("quoteStage");
    if (!stage) return;
    var quotes = Array.prototype.slice.call(stage.querySelectorAll(".quote"));
    var dotsWrap = stage.querySelector(".stage-dots");
    var timer = null;
    var index = 0;

    var dots = quotes.map(function (_, i) {
      var d = document.createElement("button");
      d.className = "stage-dot";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Voice " + (i + 1));
      d.addEventListener("click", function () { go(i, true); });
      dotsWrap.appendChild(d);
      return d;
    });

    function go(i, manual) {
      index = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, k) { q.classList.toggle("is-active", k === index); });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === index); });
      if (manual) restart();
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }
    function restart() {
      if (timer) clearInterval(timer);
      if (!reduceMotion) timer = setInterval(next, 6800);
    }

    stage.querySelector("#quoteNext").addEventListener("click", function () { next(); restart(); });
    stage.querySelector("#quotePrev").addEventListener("click", function () { prev(); restart(); });

    stage.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    stage.addEventListener("mouseleave", restart);

    /* swipe */
    var sx = 0;
    stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 48) { dx < 0 ? next() : prev(); restart(); }
    }, { passive: true });

    go(0);
    restart();
  }

  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    resonanceField();
    navState();
    mobileMenu();
    reveals();
    instrumentarium();
    quoteStage();
  });
})();
