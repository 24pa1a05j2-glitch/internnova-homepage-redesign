(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Dismiss the announcement strip for the current page view.
  const announcement = $(".announcement");
  const announcementClose = $(".announcement-close");
  if (announcement && announcementClose) {
    announcementClose.addEventListener("click", () => announcement.remove());
  }

  // Mobile navigation: close after selecting a section and when Escape is pressed.
  const menuToggle = $(".menu-toggle");
  const primaryNav = $("#primary-nav");
  function closeMenu() {
    if (!menuToggle || !primaryNav) return;
    menuToggle.classList.remove("is-open");
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  }
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      menuToggle.classList.toggle("is-open", isOpen);
      primaryNav.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
    });
    $$("a", primaryNav).forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  // Program filters and text search can be combined.
  const filterButtons = $$(".filter-button");
  const programCards = $$(".program-card");
  const searchInput = $("#program-search");
  const emptyState = $("#empty-state");
  let activeFilter = "all";

  function filterPrograms() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;
    programCards.forEach(card => {
      const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
      const searchText = `${card.dataset.search || ""} ${card.textContent}`.toLowerCase();
      const searchMatches = !query || searchText.includes(query);
      const visible = categoryMatches && searchMatches;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      filterPrograms();
    });
  });
  if (searchInput) {
    searchInput.addEventListener("input", filterPrograms);
    document.addEventListener("keydown", event => {
      const target = event.target;
      const typing = target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchInput.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        filterPrograms();
        searchInput.blur();
      }
    });
  }

  // Accessible accordion behavior: keep one FAQ answer open at a time.
  const faqItems = $$(".faq-item");
  faqItems.forEach(item => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });

  // Student quote carousel. Quotes are paraphrased from public website feedback.
  const testimonials = [
    {
      quote: "My internship experience was very useful and informative. I gained practical knowledge and improved my understanding through project work.",
      name: "Student reflection",
      domain: "Web Development · InternNova review",
      initials: "WD"
    },
    {
      quote: "Working through practical tasks helped me improve my technical skills, problem-solving, and confidence in applying what I learned.",
      name: "Student reflection",
      domain: "Artificial Intelligence · InternNova review",
      initials: "AI"
    },
    {
      quote: "The step-by-step assignments helped me strengthen my foundations and understand how concepts can be used in a real project.",
      name: "Student reflection",
      domain: "Programming · InternNova review",
      initials: "PR"
    }
  ];
  let testimonialIndex = 0;
  const quoteElement = $("#testimonial-quote");
  const nameElement = $("#testimonial-name");
  const domainElement = $("#testimonial-domain");
  const avatarElement = $("#testimonial-avatar");
  const countElement = $("#testimonial-count");

  function renderTestimonial() {
    const item = testimonials[testimonialIndex];
    if (!item || !quoteElement) return;
    quoteElement.textContent = item.quote;
    nameElement.textContent = item.name;
    domainElement.textContent = item.domain;
    avatarElement.textContent = item.initials;
    countElement.textContent = `${String(testimonialIndex + 1).padStart(2, "0")} / ${String(testimonials.length).padStart(2, "0")}`;
  }
  $("#testimonial-prev")?.addEventListener("click", () => {
    testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonial();
  });
  $("#testimonial-next")?.addEventListener("click", () => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonial();
  });

  // Reveal elements as they enter the viewport; respect reduced-motion preferences.
  const revealElements = $$(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -25px 0px" });
    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(element);
    });
  } else {
    revealElements.forEach(element => element.classList.add("is-visible"));
  }

  // Back-to-top control.
  const backToTop = $("#back-to-top");
  function updateBackToTop() {
    backToTop?.classList.toggle("visible", window.scrollY > 550);
  }
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Keep footer year current.
  const year = $("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Small confirmation utility for any future local actions.
  const toast = $("#toast");
  let toastTimeout;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }
  // Expose only a small helper for future extensions, without relying on it in the UI.
  window.internNovaToast = showToast;
})();
