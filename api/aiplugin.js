export default async function aiplugin(req, res) {
  const { SERVER_URL, CONTACT_EMAIL, SCOPE, OPENAI_VERIFICATION_TOKEN } =
    process.env;

  try {
    const config = {
      schema_version: "v1",
      name_for_model: "MeloGenAI",
      name_for_human: "MeloGenAI",
      description_for_model:
        "Generate playlists for YouTube Music. Explicit informed consent is required prior to generating the playlist, including the list of song search queries, playlist title, and playlist privacy setting.",
      description_for_human: "Generate playlists for YouTube Music™.",
      logo_url: `${SERVER_URL}/logo.png`,
      contact_email: CONTACT_EMAIL,
      legal_info_url: `${SERVER_URL}/terms`,
      auth: {
        type: "oauth",
        client_url: `${SERVER_URL}/api/auth`,
        scope: SCOPE,
        authorization_url: `${SERVER_URL}/api/token`,
        authorization_content_type: "application/json",
        verification_tokens: {
          openai: OPENAI_VERIFICATION_TOKEN,
        },
      },
      api: {
        type: "openapi",
        url: `${SERVER_URL}/openapi.yaml`,
      },
    };
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).send("Configuration error");
  }
}
