const STORE = "admin-inbox";
const KEY = "messages";

function blobsApi() {
  try {
    return require("@netlify/blobs");
  } catch {
    return null;
  }
}

function inboxStore() {
  const blobs = blobsApi();
  if (!blobs || !blobs.getStore) {
    throw new Error("blobs-unavailable");
  }
  try {
    return blobs.getStore(STORE);
  } catch {
    return blobs.getStore({
      name: STORE,
      siteID: process.env.SITE_ID || process.env.NETLIFY_SITE_ID,
      token:
        process.env.NETLIFY_BLOBS_TOKEN ||
        process.env.NETLIFY_API_TOKEN ||
        process.env.NETLIFY_AUTH_TOKEN,
    });
  }
}

function normalize(message) {
  return {
    id: String(message.id || ""),
    name: String(message.name || ""),
    email: String(message.email || ""),
    phone: String(message.phone || ""),
    message: String(message.message || ""),
    createdAt: message.createdAt || new Date().toISOString(),
    read: Boolean(message.read),
  };
}

async function readInbox() {
  try {
    const data = await inboxStore().get(KEY, { type: "json" });
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(normalize).filter((item) => item.id);
  } catch {
    return [];
  }
}

async function writeInbox(messages) {
  await inboxStore().setJSON(KEY, messages.map(normalize));
}

function mergeInbox(current, incoming) {
  const result = (Array.isArray(current) ? current : []).map(normalize);
  (Array.isArray(incoming) ? incoming : []).forEach((item) => {
    const next = normalize(item);
    const index = result.findIndex(
      (existing) =>
        existing.id === next.id ||
        (existing.email &&
          next.email &&
          existing.email === next.email &&
          existing.message === next.message)
    );
    if (index === -1) {
      result.push(next);
    } else {
      result[index] = { ...next, read: result[index].read };
    }
  });
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function upsertMessages(incoming) {
  const merged = mergeInbox(await readInbox(), incoming.map(normalize));
  await writeInbox(merged);
  return merged;
}

async function setRead(id, read) {
  const messages = await readInbox();
  const next = messages.map((item) =>
    item.id === id ? { ...item, read: Boolean(read) } : item
  );
  await writeInbox(next);
  return next;
}

async function removeMessage(id) {
  const next = (await readInbox()).filter((item) => item.id !== id);
  await writeInbox(next);
  return next;
}

module.exports = {
  readInbox,
  writeInbox,
  mergeInbox,
  upsertMessages,
  setRead,
  removeMessage,
  normalize,
};
