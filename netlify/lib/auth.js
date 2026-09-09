const crypto = require("node:crypto");

const COOKIE = "melanija_admin";
const WEEK = 60 * 60 * 24 * 7;

function json(status, body, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function headerValue(event, name) {
  const headers = event.headers || {};
  const value = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("; ");
  }
  return value || "";
}

function parseCookies(header = "") {
  const out = {};
  String(header)
    .split(";")
    .forEach((part) => {
      const [key, ...rest] = part.trim().split("=");
      if (key) {
        out[key] = rest.join("=");
      }
    });
  return out;
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function makeSessionCookie(event) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  const exp = Date.now() + WEEK * 1000;
  const payload = String(exp);
  const token = `${payload}.${sign(payload, secret)}`;
  const proto = headerValue(event, "x-forwarded-proto");
  const secure = proto.includes("https") ? "; Secure" : "";
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${WEEK}; SameSite=Strict${secure}`;
}

function clearCookie() {
  return `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}

function isAuthed(event) {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret) {
      return false;
    }
    const token = parseCookies(headerValue(event, "cookie"))[COOKIE];
    if (!token || !token.includes(".")) {
      return false;
    }
    const [payload, mac] = token.split(".");
    const expected = sign(payload, secret);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return false;
    }
    return Number(payload) > Date.now();
  } catch {
    return false;
  }
}

function safeEqual(input, expected) {
  const a = Buffer.from(String(input || ""));
  const b = Buffer.from(String(expected || ""));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  json,
  makeSessionCookie,
  clearCookie,
  isAuthed,
  safeEqual,
};
