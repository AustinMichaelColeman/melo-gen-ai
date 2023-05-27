export default function auth(req, res) {
  try {
    const { response_type, client_id, scope, redirect_uri } = req.body;
    const { AUTH_PROVIDER_URL } = process.env;

    const params = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type,
      scope,
      access_type: "offline",
    });

    res.redirect(`${AUTH_PROVIDER_URL}?${params.toString()}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to redirect to authorization URL" });
  }
}
