/* ============================================================
   Miss Eaves — interactions
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Glyph set for the specimen grid ------------------- */
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");
  const DIGIT = "0123456789".split("");
  const PUNCT = [".", ",", ":", ";", "!", "?", "'", "\"", "-", "(", ")", "&", "/"];
  const GLYPHS = [...UPPER, ...LOWER, ...DIGIT, ...PUNCT];

  const codeTag = (ch) =>
    "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");

  /* ---- Build the grid ------------------------------------ */
  const grid = document.getElementById("grid");
  const cells = [];
  GLYPHS.forEach((ch) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    const g = document.createElement("span");
    g.className = "glyph";
    g.textContent = ch;
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = codeTag(ch);
    cell.appendChild(g);
    cell.appendChild(t);
    grid.appendChild(cell);
    cells.push(cell);
  });

  /* ---- Typewriter cascade -------------------------------- */
  function cascade() {
    if (reduce) {
      cells.forEach((c) => c.classList.add("in"));
      return;
    }
    cells.forEach((c, i) => {
      setTimeout(() => c.classList.add("in"), i * 34);
    });
  }

  /* ---- Splash → site sequence ---------------------------- */
  const splash = document.getElementById("splash");
  const site = document.getElementById("site");
  document.body.classList.add("locked");

  function revealSite() {
    splash.classList.add("done");
    site.classList.add("reveal");
    site.setAttribute("aria-hidden", "false");
    document.body.classList.remove("locked");
    cascade();
  }

  // Fonts ready + splash beat, then reveal.
  const holdMs = reduce ? 200 : 2400;
  const start = performance.now();
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    const elapsed = performance.now() - start;
    setTimeout(revealSite, Math.max(0, holdMs - elapsed));
  });
  // Safety net if fonts.ready never resolves.
  setTimeout(() => { if (!site.classList.contains("reveal")) revealSite(); }, 4200);
  // Let the impatient skip.
  splash.addEventListener("click", () => { if (!site.classList.contains("reveal")) revealSite(); });

  /* ---- Type-your-own ------------------------------------- */
  const tryInput = document.getElementById("tryInput");
  const tryOut = document.getElementById("tryOut");
  const trySize = document.getElementById("trySize");

  function renderTry() {
    const v = tryInput.value.trim();
    tryOut.textContent = v.length ? v : " ";
  }
  function sizeTry() {
    tryOut.style.fontSize = trySize.value + "px";
  }
  tryInput.addEventListener("input", renderTry);
  trySize.addEventListener("input", sizeTry);
  sizeTry();

  document.querySelectorAll(".try-suggest button").forEach((b) => {
    b.addEventListener("click", () => {
      tryInput.value = b.getAttribute("data-word");
      renderTry();
      tryInput.focus();
    });
  });

  /* ---- Payment modal ------------------------------------- */
  const pay = document.getElementById("pay");
  const openBtn = document.getElementById("downloadBtn");
  const form = document.getElementById("payForm");
  const steps = {};
  pay.querySelectorAll(".pay-step").forEach((s) => (steps[s.dataset.step] = s));

  let lastFocus = null;

  function showStep(name) {
    Object.values(steps).forEach((s) => (s.hidden = true));
    steps[name].hidden = false;
  }

  function openPay() {
    lastFocus = document.activeElement;
    showStep("checkout");
    pay.hidden = false;
    document.body.classList.add("locked");
    const first = form.querySelector("input");
    if (first) setTimeout(() => first.focus(), 60);
  }

  function closePay() {
    pay.hidden = true;
    document.body.classList.remove("locked");
    if (lastFocus) lastFocus.focus();
  }

  function triggerDownload() {
    const a = document.createElement("a");
    a.href = "fonts/MissEaves.ttf";
    a.download = "MissEaves.ttf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  openBtn.addEventListener("click", openPay);
  pay.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closePay)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pay.hidden) closePay();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showStep("processing");
    const wait = reduce ? 300 : 1700;
    setTimeout(() => {
      showStep("success");
      triggerDownload();
    }, wait);
  });
})();
