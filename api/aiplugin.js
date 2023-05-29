export default async function aiplugin(req, res) {
  const { SERVER_URL, CONTACT_EMAIL, SCOPE, OPENAI_VERIFICATION_TOKEN } =
    process.env;

  try {
    const config = {
      schema_version: "v1",
      name_for_model: "MeloGenAI",
      name_for_human: "MeloGenAI",
      description_for_model: `MeloGenAI is a playlist generator plugin for ChatGPT and YouTube Music™. It creates a public YouTube playlist associated with your YouTube Music account based on a list of song titles you provide. 

Please note:
- The YouTube playlist generated will be public.
- The YouTube playlist will be associated with your YouTube Music account.
- You can revoke the permissions at any time at https://myaccount.google.com/permissions.
- The plugin works by searching YouTube for each song title and adding the first result to the playlist. The accuracy of the search results may vary.

To generate a playlist, the plugin will request from the user:
- The name of the playlist.
- The list of song titles to search and add to the playlist.`,

      description_for_human:
        "A playlist generator plugin for ChatGPT and for YouTube Music™",
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
