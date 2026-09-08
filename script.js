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
