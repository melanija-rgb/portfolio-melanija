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
  statusEl.textContent = copy.sending;

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
    statusEl.textContent = copy.thanks;
  } catch {
    statusEl.classList.add("is-error");
    statusEl.textContent = copy.sendError;
  }
});

const translations = {
  sr: {
    lang: "sr",
    title: "Melanija — Web dizajn za male biznise",
    description:
      "Melanija — web dizajn za male biznise. Jednostavne, profesionalne stranice i dizajn.",
    langs: "Jezik",
    skip: "Preskoči na sadržaj",
    menu: "Meni",
    navAria: "Glavna navigacija",
    navProjects: "Moji projekti",
    navAbout: "O meni",
    navContact: "Kontakt",
    tagline: "Web dizajn za vaš biznis",
    lead: "Moderne i jednostavne web stranice koje predstavljaju vaš biznis na pravi način.",
    seeWork: "Pogledaj moje radove",
    projects: "Moji projekti",
    website: "Web stranica",
    altBranko: "Web stranica Branko Krivokuća",
    altRaso: "Web stranica Tetovaže Raso",
    altElitte: "Web stranica Elitte Bella Italia",
    altParadiso: "Web stranica Paradiso Caffe and Playroom",
    altPortrait: "Portret Melanije",
    about: "O meni",
    about1:
      "Ja sam Melanija – web dizajnerka koja voli da jednostavne stvari izgledaju lijepo.",
    about2:
      "Izrađujem moderne i funkcionalne web stranice za male biznise, prilagođene njihovom stilu i potrebama.",
    about3:
      "Volim kad je stranica pregledna i jednostavna za korištenje, ali istovremeno ostavlja dobar prvi utisak.",
    whatIDo: "Šta radim",
    workWeb: "Web stranice",
    workWebText: "Moderne, pregledne i prilagođene svim uređajima.",
    workDesign: "Dizajn",
    workDesignText: "Jednostavan i pažljivo prilagođen vašem biznisu.",
    workFeatures: "Funkcionalnosti",
    workFeaturesText:
      "Galerija, kontakt, Google Maps, rezervacije i drugo — po dogovoru.",
    contact: "Kontakt",
    contactLead: "Imate ideju za svoju web stranicu? Kontaktirajte me.",
    sendMessage: "Pošalji poruku",
    backToTop: "Nazad na vrh",
    close: "Zatvori",
    formTitle: "Pošalji poruku",
    honeypot: "Ne popunjavajte ovo",
    name: "Ime i prezime",
    email: "Email",
    phone: "Broj telefona",
    message: "Poruka",
    sending: "Šaljem...",
    thanks: "Hvala. Javit ću se uskoro.",
    sendError: "Poruka nije poslata. Pokušajte ponovo.",
  },
  en: {
    lang: "en",
    title: "Melanija — Web design for small businesses",
    description:
      "Melanija designs clear, modern websites for small businesses.",
    langs: "Language",
    skip: "Skip to content",
    menu: "Menu",
    navAria: "Main navigation",
    navProjects: "Work",
    navAbout: "About",
    navContact: "Contact",
    tagline: "Web design for your business",
    lead: "Clean, modern websites that present your business in the right light.",
    seeWork: "See my work",
    projects: "Work",
    website: "Website",
    altBranko: "Website for Branko Krivokuća",
    altRaso: "Website for Tetovaže Raso",
    altElitte: "Website for Elitte Bella Italia",
    altParadiso: "Website for Paradiso Caffe and Playroom",
    altPortrait: "Portrait of Melanija",
    about: "About",
    about1:
      "I'm Melanija, a web designer who likes keeping things simple — and making them look good.",
    about2:
      "I build modern, practical websites for small businesses, shaped around their style and what they actually need.",
    about3:
      "I like a site that's easy to find your way around, and still makes a strong first impression.",
    whatIDo: "What I do",
    workWeb: "Websites",
    workWebText: "Modern, clear, and at home on every screen.",
    workDesign: "Design",
    workDesignText: "Simple, considered, and tailored to your business.",
    workFeatures: "Features",
    workFeaturesText:
      "Gallery, contact form, Google Maps, bookings and more — as needed.",
    contact: "Contact",
    contactLead: "Have an idea for your website? Get in touch.",
    sendMessage: "Send a message",
    backToTop: "Back to top",
    close: "Close",
    formTitle: "Send a message",
    honeypot: "Leave this field empty",
    name: "Full name",
    email: "Email",
    phone: "Phone number",
    message: "Message",
    sending: "Sending...",
    thanks: "Thank you. I'll be in touch soon.",
    sendError: "The message didn't go through. Please try again.",
  },
  de: {
    lang: "de",
    title: "Melanija — Webdesign für kleine Unternehmen",
    description:
      "Melanija gestaltet klare, moderne Websites für kleine Unternehmen.",
    langs: "Sprache",
    skip: "Zum Inhalt springen",
    menu: "Menü",
    navAria: "Hauptnavigation",
    navProjects: "Arbeiten",
    navAbout: "Über mich",
    navContact: "Kontakt",
    tagline: "Webdesign für Ihr Unternehmen",
    lead: "Moderne, klare Websites, die Ihr Unternehmen stimmig präsentieren.",
    seeWork: "Arbeiten ansehen",
    projects: "Arbeiten",
    website: "Website",
    altBranko: "Website für Branko Krivokuća",
    altRaso: "Website für Tetovaže Raso",
    altElitte: "Website für Elitte Bella Italia",
    altParadiso: "Website für Paradiso Caffe and Playroom",
    altPortrait: "Porträt von Melanija",
    about: "Über mich",
    about1:
      "Ich bin Melanija, Webdesignerin mit einem Faible für einfache Dinge, die trotzdem schön aussehen.",
    about2:
      "Ich gestalte moderne, funktionale Websites für kleine Unternehmen — passend zu ihrem Stil und ihren Bedürfnissen.",
    about3:
      "Eine gute Seite ist übersichtlich und einfach zu bedienen — und hinterlässt trotzdem einen starken ersten Eindruck.",
    whatIDo: "Was ich anbiete",
    workWeb: "Websites",
    workWebText: "Modern, übersichtlich und auf jedem Gerät zu Hause.",
    workDesign: "Design",
    workDesignText: "Schlicht, durchdacht und auf Ihr Unternehmen abgestimmt.",
    workFeatures: "Funktionen",
    workFeaturesText:
      "Galerie, Kontakt, Google Maps, Reservierungen und mehr — je nach Bedarf.",
    contact: "Kontakt",
    contactLead: "Sie haben eine Idee für Ihre Website? Schreiben Sie mir.",
    sendMessage: "Nachricht senden",
    backToTop: "Nach oben",
    close: "Schließen",
    formTitle: "Nachricht senden",
    honeypot: "Dieses Feld bitte leer lassen",
    name: "Vor- und Nachname",
    email: "E-Mail",
    phone: "Telefonnummer",
    message: "Nachricht",
    sending: "Wird gesendet...",
    thanks: "Danke. Ich melde mich in Kürze.",
    sendError: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
  },
};

const LANG_KEY = "melanija-lang";
let copy = translations.sr;

function applyLang(lang) {
  copy = translations[lang] || translations.sr;
  const htmlLang = lang === "sr" ? "sr" : copy.lang;
  document.documentElement.lang = htmlLang;
  document.title = copy.title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute("content", copy.description);
  }

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && copy[key]) {
      el.textContent = copy[key];
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key && copy[key]) {
      el.setAttribute("aria-label", copy[key]);
    }
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt");
    if (key && copy[key]) {
      el.setAttribute("alt", copy[key]);
    }
  });

  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
  });

  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    applyLang(btn.getAttribute("data-lang"));
  });
});

let startLang = "sr";
try {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored && translations[stored]) {
    startLang = stored;
  }
} catch {
  startLang = "sr";
}

applyLang(startLang);


