/* ============================================================
   Natalie Martin — Graphic Design Portfolio
   Edit the PROJECTS array below to swap in real work.
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PROJECTS = [
    {
      title: "Ember & Oak",
      category: "Brand Identity",
      year: "2025",
      img: "img/work-01.svg",
      blurb: "A warm, tactile identity system for a small-batch ceramics studio — wordmark, packaging marks, and a set of stamped textures."
    },
    {
      title: "Northbound Quarterly",
      category: "Editorial Design",
      year: "2024",
      img: "img/work-02.svg",
      blurb: "Layout and art direction for a quarterly print journal — grid system, pull quotes, and a flexible type hierarchy."
    },
    {
      title: "Meridian Skincare",
      category: "Packaging",
      year: "2024",
      img: "img/work-03.svg",
      blurb: "Packaging suite for a minimal skincare line — label system, carton structure, and shelf presence."
    },
    {
      title: "Static / Noise Festival",
      category: "Poster & Print",
      year: "2023",
      img: "img/work-04.svg",
      blurb: "A poster series for an experimental music festival — bold color pairings built on a modular grid."
    },
    {
      title: "Fieldnote",
      category: "Web & Digital",
      year: "2023",
      img: "img/work-05.svg",
      blurb: "Visual direction and UI for a journaling app — component system, iconography, and marketing site."
    },
    {
      title: "Paper Menagerie",
      category: "Illustration",
      year: "2022",
      img: "img/work-06.svg",
      blurb: "An illustrated pattern collection inspired by folded paper forms, licensed for textiles and stationery."
    }
  ];

  /* ---- Hero "flicker" viewer ------------------------------ */
  const viewer = document.getElementById("heroViewer");
  PROJECTS.forEach((p, i) => {
    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.title + " — " + p.category;
    img.loading = i === 0 ? "eager" : "lazy";
    if (i === 0) img.classList.add("is-active");
    viewer.appendChild(img);
  });
  const heroImgs = Array.from(viewer.querySelectorAll("img"));
  let heroIndex = 0;
  function tickHero() {
    heroImgs[heroIndex].classList.remove("is-active");
    heroIndex = (heroIndex + 1) % heroImgs.length;
    heroImgs[heroIndex].classList.add("is-active");
  }
  if (heroImgs.length > 1) {
    setInterval(tickHero, reduce ? 3200 : 1100);
  }

  /* ---- Work grid ------------------------------------------ */
  const grid = document.getElementById("workGrid");
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "work-card";
    card.dataset.index = i;
    card.innerHTML =
      '<div class="work-thumb"><img src="' + p.img + '" alt="" loading="lazy" /></div>' +
      '<div class="work-meta">' +
        '<p class="work-cat">' + p.category + '</p>' +
        '<h3 class="work-title">' + p.title + '</h3>' +
        '<p class="work-year">' + p.year + '</p>' +
      '</div>';
    card.addEventListener("click", () => openModal(i));
    grid.appendChild(card);
  });

  /* ---- Reveal-on-scroll for work cards ---------------------- */
  const cards = Array.from(grid.querySelectorAll(".work-card"));
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => io.observe(c));
  } else {
    cards.forEach((c) => c.classList.add("in-view"));
  }

  /* ---- Modal ------------------------------------------------ */
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalCategory = document.getElementById("modalCategory");
  const modalYear = document.getElementById("modalYear");
  const modalTitle = document.getElementById("modalTitle");
  const modalBlurb = document.getElementById("modalBlurb");
  const prevBtn = modal.querySelector(".modal-prev");
  const nextBtn = modal.querySelector(".modal-next");

  let current = 0;
  let lastFocus = null;

  function renderModal() {
    const p = PROJECTS[current];
    modalImg.src = p.img;
    modalImg.alt = p.title + " — " + p.category;
    modalCategory.textContent = p.category;
    modalYear.textContent = p.year;
    modalTitle.textContent = p.title;
    modalBlurb.textContent = p.blurb;
  }

  function openModal(i) {
    current = i;
    lastFocus = document.activeElement;
    renderModal();
    modal.hidden = false;
    document.body.classList.add("locked");
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("locked");
    if (lastFocus) lastFocus.focus();
  }

  function step(delta) {
    current = (current + delta + PROJECTS.length) % PROJECTS.length;
    renderModal();
  }

  modal.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* ---- Mobile nav toggle ------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const mastNav = document.getElementById("mastNav");
  navToggle.addEventListener("click", () => {
    const open = mastNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mastNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mastNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---- Footer year ------------------------------------------ */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
