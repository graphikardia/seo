export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { content, token } = req.body;
  if (!content || !token) return res.status(400).json({ error: "Missing content or token" });

  try {
    const resp = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ text: content }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.detail || data?.errors?.[0]?.message || "Twitter API error " + resp.status });
    }
    return res.status(200).json({ success: true, id: data?.data?.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
