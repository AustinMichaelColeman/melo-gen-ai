export default async function aiplugin(req, res) {
  const { SERVER_URL, CONTACT_EMAIL, SCOPE, OPENAI_VERIFICATION_TOKEN } =
    process.env;

  try {
    const config = {
      schema_version: "v1",
      name_for_model: "MeloGenAI",
      name_for_human: "MeloGenAI",
      description_for_model:
        "MeloGenAI is a plugin for generating a YouTube Music playlist based on a provided playlist title and list of songs. Before generating the playlist, the user must give explicit informed consent. The user must be informed of all of the following prior to generating the playlist: the playlist will be public and associated with their YouTube Music account, the plugin will list the title and song list and get explicit consent prior to generating the playlist, the plugin works by searching YouTube for each provided song and adding the first result to the playlist, which may occasionally lead to inaccurate results, and that access can be revoked at any time at https://myaccount.google.com/permissions.",
      description_for_human: "Generate playlists for YouTube Music™",
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
