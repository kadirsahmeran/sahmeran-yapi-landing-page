// ===================================
// HTML SECTION LOADING FUNCTION
// ===================================

async function loadSection(containerId, sectionPath) {
  try {
    const response = await fetch(sectionPath);
    if (!response.ok) {
      console.error(
        `HTTP Hata! Durum: ${response.status} - Dosya: ${sectionPath}`
      );
      return;
    }

    const html = await response.text();
    const container = document.getElementById(containerId);

    if (container) {
      container.innerHTML = html;
    } else {
      console.error(`Hata: ID'si "${containerId}" olan yer tutucu bulunamadı!`);
    }
  } catch (error) {
    console.error("Bölüm yüklenirken bir sorun oluştu:", error);
  }
}

// ===================================
// DOM ELEMENTS & SELECTORS
// ===================================
// Instead of a static object, we will select DOM elements where necessary or after initAll.
let DOM = {};

/**
 * Once the sections are loaded, it selects all the necessary DOM elements and fills the DOM object.
 */
function refreshDOMSelectors() {
  DOM.menuToggle = document.getElementById("menuToggle");
  DOM.closeMenu = document.getElementById("closeMenu");
  DOM.mobileMenu = document.getElementById("mobileMenu");
  DOM.header = document.getElementById("mainHeader");
  DOM.filterButtons = document.querySelectorAll(".filter");
  DOM.navLinks = document.querySelectorAll(".menuItems li a");
  DOM.mobileLinks = document.querySelectorAll("#mobileLinks a");
  DOM.sections = document.querySelectorAll("main section[id]");
  DOM.logo = document.querySelectorAll(".logo");
  DOM.mobileLogo = document.querySelector(".mobile-logo");
}

// ===================================
// SLIDER & LIGHTBOX INIT
// ===================================
function initSliders() {
  if (typeof Swiper === "undefined") return;

  // General Slider
  const swiper = new Swiper(".mySwiper", {
    loop: true,
    autoplay: false,
    pagination: { el: ".swiper-pagination", clickable: true },
  });

  // Testimonial slider
  const testimonialSwiper = new Swiper(".myTestimonialSwiper", {
    loop: true,
    autoplay: false,
    pagination: {
      el: ".myTestimonialSwiper .swiper-pagination",
      clickable: true,
    },
  });

  // Autoplay Management with Intersection Observer
  const observerOptions = { threshold: 0.5 };

  const startAutoplay = (swiperInstance) => (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) swiperInstance.autoplay.start();
      else swiperInstance.autoplay.stop();
    });
  };

  const swiperElement = document.querySelector(".mySwiper");
  const testimonialElement = document.querySelector(".myTestimonialSwiper");

  if (swiperElement) {
    const swiperObserver = new IntersectionObserver(
      startAutoplay(swiper),
      observerOptions
    );
    swiperObserver.observe(swiperElement);
  }

  if (testimonialElement) {
    const testimonialObserver = new IntersectionObserver(
      startAutoplay(testimonialSwiper),
      observerOptions
    );
    testimonialObserver.observe(testimonialElement);
  }
}

function initLightbox() {
  if (typeof GLightbox === "undefined") return;

  GLightbox({ selector: ".glightbox", zoomable: true });

  GLightbox({
    selector: ".glightbox-video",
    onOpen: () =>
      document
        .querySelector(".glightbox-container")
        ?.classList.add("video-mode"),
    onClose: () =>
      document
        .querySelector(".glightbox-container")
        ?.classList.remove("video-mode"),
  });
}

// ===================================
// GALLERY FILTER
// ===================================
function initMixitup() {
  if (typeof mixitup === "undefined") return;

  const galleryElement = document.getElementById("mix-gallery");
  if (galleryElement) {
    mixitup(galleryElement, {
      selectors: { target: ".mix" },
      animation: { duration: 300 },
    });
  }
}

// ===================================
// HEADER SCROLL & MENU ACTIVATION
// ===================================
function updateHeaderBackground() {
  if (!DOM.header) return;

  if (window.scrollY > 100) {
    if (DOM.header.classList.contains("bg-black/30")) {
      DOM.header.classList.replace("bg-black/30", "bg-black");
    }
  } else {
    if (DOM.header.classList.contains("bg-black")) {
      DOM.header.classList.replace("bg-black", "bg-black/30");
    }
  }
}

function activateMenuItemOnScroll() {
  const scrollY = window.scrollY;

  if (!DOM.sections.length) return;

  let activeFound = false;

  DOM.sections.forEach((section) => {
    const offset = 100;
    const sectionTop = section.offsetTop - offset;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    // Check only partitions with valid ID
    if (!sectionId) return;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      activeFound = true;

      const activateLink = (linkList) => {
        linkList.forEach((link) => {
          // Enable connection by ID
          const hrefId = link.getAttribute("href")?.substring(1);
          link.classList.toggle("active", hrefId === sectionId);
        });
      };

      activateLink(DOM.navLinks);
      activateLink(DOM.mobileLinks);
    }
  });

  // If no section is active (e.g. at the top of the page), deactivate all sections.
  if (!activeFound) {
    DOM.navLinks.forEach((link) => link.classList.remove("active"));
    DOM.mobileLinks.forEach((link) => link.classList.remove("active"));
  }
}

// Scroll event throttling: Optimizes performance using requestAnimationFrame.
function initScrollListeners() {
  let isThrottled = false;

  window.addEventListener("scroll", () => {
    if (isThrottled) return;

    isThrottled = true;

    setTimeout(() => {
      updateHeaderBackground();
      activateMenuItemOnScroll();
      isThrottled = false;
    }, 100); // ms → isteğe göre 50–150 arası ayarlanabilir
  });

  // Sayfa ilk yüklendiğinde de çalışsın
  updateHeaderBackground();
  activateMenuItemOnScroll();
}

// ===================================
// MOBILE MENU TOGGLE
// ===================================
function initMobileMenu() {
  if (!DOM.menuToggle || !DOM.closeMenu || !DOM.mobileMenu) return;

  const toggleMenu = (open) => {
    const fromClass = open ? "translate-x-full" : "translate-x-0";
    const toClass = open ? "translate-x-0" : "translate-x-full";

    DOM.mobileMenu.classList.replace(fromClass, toClass);
    document.body.classList.toggle("overflow-hidden", open);
  };

  DOM.menuToggle.addEventListener("click", () => toggleMenu(true));
  DOM.closeMenu.addEventListener("click", () => toggleMenu(false));
  DOM.mobileLogo.addEventListener("click", () => toggleMenu(false));

  DOM.mobileLinks.forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });
}

// ===================================
// FILTER BUTTONS
// ===================================
function initFilterButtons() {
  if (!DOM.filterButtons.length) return;

  DOM.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Clear the previous active button
      DOM.filterButtons.forEach((btn) => {
        btn.classList.remove("text-amber-600");
        btn.querySelector(".hoverSpanEffect")?.classList.remove("w-full");
      });
      // Set the new active button
      button.classList.add("text-amber-600");
      button.querySelector(".hoverSpanEffect")?.classList.add("w-full");
    });
  });
}

// ===================================
// ACCORDION
// ===================================
function initAccordion() {
  const accordionButtons = document.querySelectorAll(".accordion-btn");
  if (!accordionButtons.length) return;

  accordionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const content = button.nextElementSibling;
      const icon = button.querySelector("i");
      const title = button.querySelector(".accordion-title");

      const isOpen = content.style.maxHeight;

      // --- RESET ALL ACCORDIONS ---
      document.querySelectorAll(".accordion-content").forEach((c) => {
        if (c !== content) {
          // If different from the one clicked
          c.style.maxHeight = null;
          const btn = c.previousElementSibling;
          const otherIcon = btn?.querySelector("i");
          const otherTitle = btn?.querySelector(".accordion-title");

          otherIcon?.classList.replace("fa-minus", "fa-plus");
          otherIcon?.classList.remove("text-amber-500");
          otherTitle?.classList.remove("text-amber-500");
        }
      });

      // --- OPEN / CLOSE SELECTED ---
      if (!isOpen) {
        // open with max-height and provide fluid animation
        content.style.maxHeight = content.scrollHeight + "px";
        title.classList.add("text-amber-500");
        icon.classList.replace("fa-plus", "fa-minus");
        icon.classList.add("text-amber-500");
      } else {
        content.style.maxHeight = null;
        title.classList.remove("text-amber-500");
        icon.classList.replace("fa-minus", "fa-plus");
        icon.classList.remove("text-amber-500");
      }
    });
  });
}

// ===================================
// DEFAULT FILTER & LOGO SCROLL
// ===================================
function initDefaultFilter() {
  // Sayfa yüklendiğinde varsayılan filtreyi etkinleştir
  document.querySelector('[data-filter="all"]')?.click();
}

function initLogoScroll() {
  // Logolara tıklanıldığında en üste kaydırma
  if (!DOM.logo.length) return;
  DOM.logo.forEach((i) =>
    i.addEventListener("click", function () {
      window.scrollTo(0, 0); // Smooth scroll eklendi
      window.history.replaceState({}, "", "/");
    })
  );
}

// ===================================
// INIT ALL (TÜM İŞLEVSELLİKLERİ BAŞLAT)
// ===================================

/**
 * It loads all sections and then initializes all JS functionality.
 */
async function initAll() {
  // 1. UPLOAD ALL EPISODES SIMULTANEOUSLY
  await Promise.all([
    loadSection("header-container", "src/components/header.html"),
    loadSection("hero-container", "src/components/hero.html"),
    loadSection("services-container", "src/components/services.html"),
    loadSection("projects-container", "src/components/projects.html"),
    loadSection("about-container", "src/components/about.html"),
    loadSection("testimonials-container", "src/components/testimonials.html"),
    loadSection("contact-container", "src/components/contact.html"),
    loadSection("footer-container", "src/components/footer.html"),
  ]);

  // 2. UPDATE DOM OBJECTS (Sections are now on the page)
  refreshDOMSelectors();

  // 3. START ALL FUNCTIONS
  initLogoScroll();
  initSliders();
  initLightbox();
  initMixitup();
  initMobileMenu();
  initFilterButtons();
  initAccordion();
  initDefaultFilter();

  // 4. START SCROLL AND NAVIGATION LISTENERS
  initScrollListeners();

  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.classList.add("opacity-0", "pointer-events-none");

    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  }
}

// Start the entire function as soon as the browser builds the DOM tree
document.addEventListener("DOMContentLoaded", initAll);
