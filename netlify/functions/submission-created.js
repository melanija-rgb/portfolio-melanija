const { upsertMessages } = require("../lib/inbox");

function fields(source = {}) {
  return {
    name: source.ime || source.name || source.Name || "",
    email: source.email || source.Email || "",
    phone: source.telefon || source.phone || source.Phone || "",
    message: source.poruka || source.message || source.Message || "",
  };
}

function fromEvent(raw) {
  const body = typeof raw === "string" ? JSON.parse(raw || "{}") : raw || {};
  const payload = body.payload || body;
  const data = payload.data || payload.human_fields || body.data || {};
  const mapped = fields(data);
  const formName = payload.form_name || payload.formName || body.formName || "";

  if (formName && formName !== "kontakt") {
    return null;
  }

  return {
    id: String(payload.id || body.id || `${Date.now()}`),
    name: mapped.name || payload.name || "",
    email: mapped.email || payload.email || "",
    phone: mapped.phone,
    message: mapped.message,
    createdAt: payload.created_at || payload.createdAt || new Date().toISOString(),
    read: false,
  };
}

exports.handler = async (event) => {
  try {
    const message = fromEvent(event.body);
    if (message && (message.name || message.email || message.message)) {
      await upsertMessages([message]);
    }
  } catch (error) {
    console.error("submission-created", error);
  }

  return { statusCode: 200, body: "" };
};
