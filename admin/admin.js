const loginPanel = document.querySelector("#login-panel");
const inboxPanel = document.querySelector("#inbox-panel");
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const inboxStatus = document.querySelector("#inbox-status");
const listEl = document.querySelector("#message-list");
const unreadEl = document.querySelector("#unread-count");
const logoutBtn = document.querySelector("#logout-btn");

function showStatus(el, text, isError = false) {
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("is-error", Boolean(isError));
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleString("bs-BA", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Greška");
    error.status = response.status;
    throw error;
  }
  return data;
}

function showLogin(message = "") {
  loginPanel.hidden = false;
  inboxPanel.hidden = true;
  showStatus(loginStatus, message, Boolean(message));
}

function showInbox() {
  loginPanel.hidden = true;
  inboxPanel.hidden = false;
}

function renderMessages(payload) {
  const messages = payload.messages || [];
  unreadEl.textContent = `${payload.unreadCount || 0} nepročitanih`;

  if (!messages.length) {
    listEl.innerHTML = `<p class="empty">Još nema poruka.</p>`;
    return;
  }

  listEl.innerHTML = messages
    .map((item) => {
      const unread = item.read ? "" : "is-unread";
      const toggleLabel = item.read ? "Označi kao nepročitano" : "Označi kao pročitano";
      return `
        <article class="card ${unread}" data-id="${item.id}">
          <div class="card-top">
            <h2>${escapeHtml(item.name)}</h2>
            <span>${escapeHtml(formatDate(item.createdAt))}</span>
          </div>
          <p class="meta">${escapeHtml(item.email)} · ${escapeHtml(item.phone)}</p>
          <p class="body">${escapeHtml(item.message)}</p>
          <div class="row-actions">
            <button class="btn small" type="button" data-toggle-read data-read="${item.read}">${toggleLabel}</button>
            <button class="btn small danger" type="button" data-delete>Obriši</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadMessages() {
  showStatus(inboxStatus, "");
  const data = await request("/.netlify/functions/admin-messages");
  showInbox();
  renderMessages(data);
}

async function restoreSession() {
  try {
    await loadMessages();
  } catch {
    showLogin();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showStatus(loginStatus, "Prijava...");
  try {
    const password = new FormData(loginForm).get("password");
    await request("/.netlify/functions/admin-login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    showStatus(loginStatus, "");
    try {
      await loadMessages();
    } catch (error) {
      showInbox();
      showStatus(inboxStatus, error.message, true);
    }
  } catch (error) {
    showStatus(loginStatus, error.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await request("/.netlify/functions/admin-logout", { method: "POST" });
  } catch {
    // Stay logged out in the UI even if the request fails.
  }
  loginForm.reset();
  showLogin();
});

listEl.addEventListener("click", async (event) => {
  const card = event.target.closest(".card");
  if (!card) {
    return;
  }
  const id = card.dataset.id;

  if (event.target.matches("[data-toggle-read]")) {
    const makeRead = event.target.dataset.read !== "true";
    try {
      await request("/.netlify/functions/admin-messages", {
        method: "PATCH",
        body: JSON.stringify({ id, read: makeRead }),
      });
      await loadMessages();
    } catch (error) {
      showStatus(inboxStatus, error.message, true);
    }
  }

  if (event.target.matches("[data-delete]")) {
    if (!window.confirm("Obrisati ovu poruku?")) {
      return;
    }
    try {
      await request("/.netlify/functions/admin-messages", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      await loadMessages();
    } catch (error) {
      showStatus(inboxStatus, error.message, true);
    }
  }
});

restoreSession();
