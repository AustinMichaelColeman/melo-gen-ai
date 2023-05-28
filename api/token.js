import axios from "axios";

export default async function token(req, res) {
  const {
    grant_type,
    client_id,
    client_secret,
    code,
    redirect_uri,
    refresh_token,
  } = req.body;

  if (grant_type === "authorization_code" && !code) {
    console.error("authorization code required");
    return res.status(400).json({ error: "Authorization code is required" });
  }

  if (grant_type === "refresh_token" && !refresh_token) {
    console.error("refresh token required");
    return res.status(400).json({ error: "Refresh token is required" });
  }

  const { TOKEN_PROVIDER_URL } = process.env;

  try {
    const response = await axios.post(TOKEN_PROVIDER_URL, {
      code,
      refresh_token,
      client_id,
      client_secret,
      redirect_uri,
      grant_type,
    });

    return res.json(response.data);
  } catch (error) {
    const errorCode = error.response?.status || 500;

    console.error("error.response.data:", error.response?.data);

    res
      .status(errorCode)
      .json({ error: "An error occurred while processing your request." });
  }
}
