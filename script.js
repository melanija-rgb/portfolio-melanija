const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const year = document.querySelector("#godina");
const portraitImg = document.querySelector(".portrait img");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (portraitImg) {
  const markMissing = () => {
    portraitImg.setAttribute("data-missing", "true");
    portraitImg.closest(".portrait")?.classList.add("is-empty");
  };

  portraitImg.addEventListener("error", markMissing);

  if (portraitImg.complete && portraitImg.naturalWidth === 0) {
    markMissing();
  }
}

const modal = document.querySelector("#kontakt-modal");
const openers = document.querySelectorAll("[data-open-modal]");
const form = document.querySelector(".kontakt-form");
const statusEl = document.querySelector(".form-status");
let lastFocus = null;

function openModal() {
  if (!modal) {
    return;
  }
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const first = modal.querySelector("input:not([name='bot-field'])");
  first?.focus();
}

function closeModal() {
  if (!modal) {
    return;
  }
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocus?.focus();
}

openers.forEach((btn) => {
  btn.addEventListener("click", openModal);
});

modal?.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.hidden) {
    closeModal();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!statusEl) {
    return;
  }

  statusEl.hidden = false;
  statusEl.classList.remove("is-error");
  statusEl.textContent = "Šaljem...";

  try {
    const body = new URLSearchParams(new FormData(form)).toString();
    const response = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      throw new Error("send-failed");
    }

    form.reset();
    statusEl.textContent = "Hvala. Javit ću se uskoro.";
  } catch {
    statusEl.classList.add("is-error");
    statusEl.textContent = "Poruka nije poslata. Pokušajte ponovo.";
  }
});

