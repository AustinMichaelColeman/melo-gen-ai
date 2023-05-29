export default async function aiplugin(req, res) {
  const { SERVER_URL, CONTACT_EMAIL, SCOPE, OPENAI_VERIFICATION_TOKEN } =
    process.env;

  try {
    const config = {
      schema_version: "v1",
      name_for_model: "MeloGenAI",
      name_for_human: "MeloGenAI",
      description_for_model:
        "A playlist generator plugin for ChatGPT and for YouTube Music™. Prior to generating the playlist, you must inform the user that the YouTube playlist generated will be public, the playlist will be publicly associated with the user's YouTube account, provide the user with the list of the song search queries you plan to use, inform the user the way the plugin works is by searching for each query and adding the first result to the playlist, so it may not always be accurate, the playlist name you plan to use, and the user must expressly consent to those actions prior to the actual execution. Songs should be an array of strings, each used to search YouTube for a song in order to add it to a playlist.",
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
