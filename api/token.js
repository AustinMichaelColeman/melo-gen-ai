import axios from "axios";

export default async function token(req, res) {
  const { code } = req.query;

  if (!code) {
    console.error("authorization code required");
    console.error(req);
    return res.status(400).json({ error: "Authorization code is required" });
  }

  const {
    TOKEN_PROVIDER_URL,
    AUTH_PROVIDER_CLIENT_ID,
    AUTH_PROVIDER_CLIENT_SECRET,
    REDIRECT_URI,
  } = process.env;

  try {
    const response = await axios.post(TOKEN_PROVIDER_URL, {
      code,
      client_id: AUTH_PROVIDER_CLIENT_ID,
      client_secret: AUTH_PROVIDER_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to exchange authorization code for tokens" });
  }
}
