const { json, makeSessionCookie, safeEqual } = require("../lib/auth");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return json(503, { error: "Admin lozinka još nije postavljena." });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Neispravan zahtjev." });
  }

  if (!safeEqual(body.password, password)) {
    return json(401, { error: "Pogrešna lozinka." });
  }

  return json(
    200,
    { ok: true },
    { "Set-Cookie": makeSessionCookie(event) }
  );
};
