export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { content, token } = req.body;
  if (!content || !token) return res.status(400).json({ error: "Missing content or token" });

  try {
    // First get the member URN
    const meResp = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { "Authorization": "Bearer " + token },
    });
    if (!meResp.ok) return res.status(401).json({ error: "Invalid LinkedIn token — could not fetch profile" });
    const me = await meResp.json();
    const urn = "urn:li:person:" + me.sub;

    // Post the content
    const postResp = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: urn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    const postData = await postResp.json();
    if (!postResp.ok) {
      return res.status(postResp.status).json({ error: postData?.message || "LinkedIn API error " + postResp.status });
    }
    return res.status(200).json({ success: true, id: postData?.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
