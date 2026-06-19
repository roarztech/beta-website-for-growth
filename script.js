const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const progressBar = document.querySelector("[data-scroll-progress]");
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

function syncScrollMotion() {
  const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  root.style.setProperty("--scroll-progress", progress.toFixed(4));

  if (!reduceMotion) {
    root.style.setProperty("--scroll-y", `${Math.min(window.scrollY, window.innerHeight)}px`);
  }
}

syncHeader();
syncScrollMotion();
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("scroll", syncScrollMotion, { passive: true });
window.addEventListener("resize", syncScrollMotion);

menuButton.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  });
});

const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const message = [
    `Name: ${formData.get("name")}`,
    `Email: ${formData.get("email")}`,
    `Goal: ${formData.get("message")}`,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(message);
    formNote.textContent = "Inquiry copied. Paste it into an Instagram message to Growth.";
  } catch {
    formNote.textContent = "Message Growth on Instagram with your name, email, and growth goal.";
  }
});

const revealTargets = [
  ".signal-strip > div",
  ".section-heading",
  ".service-card",
  ".panel-dark",
  ".process-item",
  ".metrics-band > div",
  ".plan-card",
  ".contact > div",
  ".contact-form",
  ".site-footer",
];

document.querySelectorAll(revealTargets.join(",")).forEach((element, index) => {
  element.classList.add("reveal");
  element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 80}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
);

document.querySelectorAll(".reveal").forEach((element) => {
  if (reduceMotion) {
    element.classList.add("is-visible");
  } else {
    revealObserver.observe(element);
  }
});

const metricObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const number = entry.target.querySelector("strong");
      const target = Number(number.textContent.replace(/\D/g, ""));
      const suffix = number.textContent.replace(/\d/g, "");

      if (!target || reduceMotion) {
        metricObserver.unobserve(entry.target);
        return;
      }

      let start = null;
      const duration = 900;

      function step(timestamp) {
        start ||= timestamp;
        const progress = Math.min(1, (timestamp - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        number.textContent = `${Math.round(target * eased)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      number.textContent = `0${suffix}`;
      requestAnimationFrame(step);
      metricObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.45 },
);

document.querySelectorAll(".metrics-band > div").forEach((metric) => metricObserver.observe(metric));

const processObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-active", entry.isIntersecting);
    });
  },
  { threshold: 0.58 },
);

document.querySelectorAll(".process-item").forEach((item) => processObserver.observe(item));

if (!reduceMotion) {
  document.querySelectorAll(".service-card, .plan-card").forEach((card) => {
    const isPlanCard = card.classList.contains("plan-card");

    card.addEventListener("pointerenter", () => {
      if (isPlanCard) {
        card.classList.add("is-pointer-active");
      }
    });

    card.addEventListener("pointermove", (event) => {
      if (isPlanCard) {
        card.classList.add("is-pointer-active");
      }

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
      card.style.setProperty("--spot-x", `${((x + 0.5) * 100).toFixed(0)}%`);
      card.style.setProperty("--spot-y", `${((y + 0.5) * 100).toFixed(0)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--spot-x", "50%");
      card.style.setProperty("--spot-y", "20%");
      card.classList.remove("is-pointer-active");
    });
  });
}
