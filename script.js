document.addEventListener("DOMContentLoaded", function () {
    setupLazyImages();
    setupImageAccessibility();
    setupExternalLinksA11y();
    setupActiveNav();
    setupMobileMenu();
    setupMobileDropdown();
    setupKeyboardDropdown();
    enforceCarouselSizing();
    setupRevealOnScroll();
    setupLightbox();
});

function setupLazyImages() {
    document.querySelectorAll("img").forEach(function (img) {
        if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
        if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
    });
}

function setupImageAccessibility() {
    document.querySelectorAll("img").forEach(function (img) {
        var alt = (img.getAttribute("alt") || "").trim();
        if (!alt || /imagen|image/i.test(alt)) {
            var src = img.getAttribute("src") || "";
            var file = src.split("/").pop() || "imagen institucional";
            var cleaned = file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
            if (!cleaned) cleaned = "imagen institucional de Patrick Elementary School";
            img.setAttribute("alt", "Patrick Elementary School - " + cleaned);
        }
    });
}

function setupExternalLinksA11y() {
    document.querySelectorAll("a[target=\"_blank\"]").forEach(function (a) {
        if (!a.getAttribute("rel")) {
            a.setAttribute("rel", "noopener noreferrer");
        }
        var label = a.getAttribute("aria-label");
        if (!label) {
            var txt = (a.textContent || "Enlace externo").trim();
            a.setAttribute("aria-label", txt + " (abre en una nueva pestana)");
        }
    });
}

function setupActiveNav() {
    var current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav a[href]").forEach(function (link) {
        var href = link.getAttribute("href");
        if (!href || href.startsWith("#")) return;
        if (href === current) link.classList.add("active-nav");
    });
}

function setupKeyboardDropdown() {
    document.querySelectorAll(".dropdown > a").forEach(function (trigger) {
        trigger.setAttribute("aria-haspopup", "true");
        trigger.setAttribute("aria-expanded", "false");
        trigger.addEventListener("focus", function () {
            var parent = trigger.closest(".dropdown");
            if (!parent) return;
            parent.classList.add("dropdown-open");
            trigger.setAttribute("aria-expanded", "true");
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        document.querySelectorAll(".dropdown.dropdown-open").forEach(function (openMenu) {
            openMenu.classList.remove("dropdown-open");
            var trigger = openMenu.querySelector(":scope > a");
            if (trigger) trigger.setAttribute("aria-expanded", "false");
        });
    });
}

function enforceCarouselSizing() {
    function applyCarouselSize() {
        var mobile = window.matchMedia("(max-width: 900px)").matches;
        var h = mobile ? 220 : 360;

        document.querySelectorAll("#banner-container-basica").forEach(function (container) {
            container.style.setProperty("overflow", "hidden", "important");

            container.querySelectorAll("img").forEach(function (img) {
                img.style.setProperty("width", "100%", "important");
                img.style.setProperty("height", "auto", "important");
                img.style.setProperty("max-height", h + "px", "important");
                img.style.setProperty("object-fit", "cover", "important");
                img.style.setProperty("object-position", "center center", "important");
                img.style.setProperty("display", "block", "important");
                img.style.setProperty("margin", "0", "important");
                img.style.setProperty("padding", "0", "important");
            });
        });
    }

    applyCarouselSize();
    setTimeout(applyCarouselSize, 150);
    setTimeout(applyCarouselSize, 600);
    window.addEventListener("resize", applyCarouselSize);

    // If Slick injects cloned slides later, keep size locked.
    var observer = new MutationObserver(function () {
        applyCarouselSize();
    });
    document.querySelectorAll("#banner-container-basica .slick-carousel").forEach(function (node) {
        observer.observe(node, { childList: true, subtree: true });
    });
}

function setupMobileDropdown() {
    var isMobile = function () {
        return window.matchMedia("(max-width: 900px)").matches;
    };

    document.querySelectorAll(".dropdown > a").forEach(function (trigger) {
        trigger.addEventListener("click", function (e) {
            if (!isMobile()) return;
            e.preventDefault();
            var parent = trigger.closest(".dropdown");
            if (!parent) return;

            document.querySelectorAll(".dropdown.dropdown-open").forEach(function (openMenu) {
                if (openMenu !== parent) openMenu.classList.remove("dropdown-open");
            });
            parent.classList.toggle("dropdown-open");
        });
    });

    document.addEventListener("click", function (e) {
        if (!isMobile()) return;
        if (e.target.closest(".dropdown")) return;
        document.querySelectorAll(".dropdown.dropdown-open").forEach(function (openMenu) {
            openMenu.classList.remove("dropdown-open");
        });
    });
}

function setupMobileMenu() {
    var header = document.querySelector("header");
    var nav = document.querySelector("header nav");
    if (!header || !nav) return;
    if (header.querySelector(".menu-toggle")) return;

    var btn = document.createElement("button");
    btn.className = "menu-toggle";
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-label", "Abrir menú");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";
    header.insertBefore(btn, nav);

    btn.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("nav-open");
        btn.classList.toggle("is-open", isOpen);
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.classList.toggle("menu-open", isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            nav.classList.remove("nav-open");
            btn.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        });
    });

    window.addEventListener("resize", function () {
        if (window.matchMedia("(min-width: 901px)").matches) {
            nav.classList.remove("nav-open");
            btn.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        }
    });
}

function setupRevealOnScroll() {
    var targets = document.querySelectorAll(
        ".quienes-somos-article, .modern-article, .modern-article-B, .modern-article-basica, .modern-article-bachillerato, .event-article, .club, .article-sectionC article, .seccion-adicional article, .transport-article"
    );

    if (!("IntersectionObserver" in window)) {
        targets.forEach(function (el) { el.classList.add("is-visible"); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    targets.forEach(function (el) {
        el.classList.add("reveal-on-scroll");
        observer.observe(el);
    });
}

function setupLightbox() {
    var images = document.querySelectorAll(
        "main img, #background-container img, .event-article img, .club img, .seccion-adicional img, .article-sectionC img"
    );
    if (!images.length) return;

    var modal = document.createElement("div");
    modal.className = "image-lightbox";
    modal.innerHTML = '<button class="lightbox-close" aria-label="Cerrar">×</button><img alt="Vista ampliada">';
    document.body.appendChild(modal);

    var modalImg = modal.querySelector("img");
    var closeBtn = modal.querySelector(".lightbox-close");

    function closeLightbox() {
        modal.classList.remove("open");
        document.body.classList.remove("lightbox-open");
    }

    images.forEach(function (img) {
        img.addEventListener("click", function () {
            if (img.closest(".slick-cloned")) return;
            modalImg.src = img.currentSrc || img.src;
            modalImg.alt = img.alt || "Imagen ampliada";
            modal.classList.add("open");
            document.body.classList.add("lightbox-open");
        });
    });

    closeBtn.addEventListener("click", closeLightbox);
    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
    });
}
