export default function auth(req, res) {
  try {
    const { AUTH_PROVIDER_URL, AUTH_PROVIDER_CLIENT_ID, REDIRECT_URI, SCOPE } =
      process.env;

    const params = new URLSearchParams({
      client_id: AUTH_PROVIDER_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
    });

    res.redirect(`${AUTH_PROVIDER_URL}?${params.toString()}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to redirect to authorization URL" });
  }
}
