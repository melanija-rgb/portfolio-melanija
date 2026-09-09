const { json, isAuthed } = require("../lib/auth");
const inbox = require("../lib/inbox");

const SITE_ID =
  process.env.SITE_ID ||
  process.env.NETLIFY_SITE_ID ||
  "a6d5c9be-2ceb-4ec8-a484-fbff47ccc799";
const API_TOKEN = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
const FORM_NAME = "kontakt";

function apiHeaders() {
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    "User-Agent": "MelanijaPortfolio (melanija-rgb@users.noreply.github.com)",
  };
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: apiHeaders() });
    if (!res.ok) {
      return [];
    }
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("forms-api", url, error);
    return [];
  }
}

function mapFromApi(item) {
  const data = item.data || {};
  return {
    id: item.id,
    name: data.ime || item.name || "",
    email: data.email || item.email || "",
    phone: data.telefon || data.phone || "",
    message: data.poruka || item.body || "",
    createdAt: item.created_at,
    read: false,
  };
}

async function importFromNetlify() {
  if (!API_TOKEN || !SITE_ID) {
    return [];
  }

  const forms = await fetchJson(`https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`);
  const form = forms.find((item) => item && item.name === FORM_NAME);
  const urls = [];

  if (form) {
    urls.push(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=100`,
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=100&state=spam`
    );
  }

  urls.push(
    `https://api.netlify.com/api/v1/sites/${SITE_ID}/submissions?per_page=100`,
    `https://api.netlify.com/api/v1/sites/${SITE_ID}/submissions?per_page=100&state=spam`
  );

  const batches = await Promise.all(urls.map((url) => fetchJson(url)));
  const byId = new Map();
  batches.flat().forEach((item) => {
    if (item && item.id) {
      byId.set(item.id, mapFromApi(item));
    }
  });
  return Array.from(byId.values());
}

async function loadMessages() {
  let stored = [];
  try {
    stored = await inbox.readInbox();
  } catch (error) {
    console.error("inbox-read", error);
  }

  let imported = [];
  try {
    imported = await importFromNetlify();
  } catch (error) {
    console.error("inbox-import", error);
  }

  let messages = Array.isArray(stored) ? stored : [];
  if (imported.length) {
    try {
      messages = await inbox.upsertMessages(imported);
    } catch (error) {
      console.error("inbox-upsert", error);
      messages = inbox.mergeInbox(messages, imported);
    }
  }

  return Array.isArray(messages) ? messages : imported;
}

exports.handler = async (event) => {
  if (!isAuthed(event)) {
    return json(401, { error: "Prijava je potrebna." });
  }

  try {
    if (event.httpMethod === "GET") {
      const messages = await loadMessages();
      const unreadCount = messages.filter((item) => !item.read).length;
      return json(200, { messages, unreadCount });
    }

    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Neispravan zahtjev." });
    }

    if (event.httpMethod === "PATCH") {
      if (!body.id) {
        return json(400, { error: "Nedostaje id poruke." });
      }
      try {
        await inbox.setRead(body.id, body.read);
      } catch (error) {
        console.error("inbox-read-flag", error);
      }
      return json(200, { ok: true, read: Boolean(body.read) });
    }

    if (event.httpMethod === "DELETE") {
      if (!body.id) {
        return json(400, { error: "Nedostaje id poruke." });
      }
      if (API_TOKEN) {
        await fetch(`https://api.netlify.com/api/v1/submissions/${body.id}`, {
          method: "DELETE",
          headers: apiHeaders(),
        }).catch(() => {});
      }
      try {
        await inbox.removeMessage(body.id);
      } catch (error) {
        console.error("inbox-delete", error);
      }
      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    console.error("admin-messages", error);
    return json(500, { error: "Poruke trenutno nisu dostupne." });
  }
};
