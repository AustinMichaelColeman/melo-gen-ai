export default async function aiplugin(req, res) {
  const { SERVER_URL, CONTACT_EMAIL, SCOPE, OPENAI_VERIFICATION_TOKEN } =
    process.env;

  try {
    const config = {
      schema_version: "v1",
      name_for_model: "MeloGenAI",
      name_for_human: "MeloGenAI",
      description_for_model: `A playlist generator plugin for ChatGPT and for YouTube Music™. Prior to generating the playlist, you must inform the user:
        
        * that the YouTube playlist generated will be public
        * that the YouTube playlist will be associated with the user's account
        * that the user can revoke the permissions at any time at https://myaccount.google.com/permissions
        * that the plugin works by searching YouTube for each song title and adding the first result to the playlist, so it may not always be accurate
        
        You will also need this information:
        * the name of the playlist, which you can suggest or allow the user to provide.
        * the list of songs names to search in order to add to the playlist.`,
      description_for_human:
        "A playlist generator plugin for ChatGPT and for YouTube Music™",
      logo_url: `${SERVER_URL}/logo.png`,
      contact_email: CONTACT_EMAIL,
      legal_info_url: `${SERVER_URL}/legal`,
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
