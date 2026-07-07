export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("GHL_WEBHOOK_URL is not set");
    res.status(500).json({ error: "Server not configured" });
    return;
  }

  const lead = req.body && typeof req.body === "object" ? req.body : {};
  if (!lead.email) {
    res.status(400).json({ error: "Missing email" });
    return;
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!upstream.ok) {
      console.error("GHL webhook responded", upstream.status);
      res.status(502).json({ error: "Upstream error", status: upstream.status });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to forward to GHL:", err);
    res.status(500).json({ error: "Failed to forward lead" });
  }
}
