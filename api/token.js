import axios from "axios";

export default async function token(req, res) {
  const { grant_type, client_id, client_secret, code, redirect_uri } = req.body;

  if (!code) {
    console.error("authorization code required");
    return res.status(400).json({ error: "Authorization code is required" });
  }

  const { TOKEN_PROVIDER_URL } = process.env;

  try {
    const response = await axios.post(TOKEN_PROVIDER_URL, {
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type,
    });

    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to exchange authorization code for tokens" });
  }
}
