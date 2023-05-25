export default async function aiPlugin(req, res) {
  try {
    let auth = {
      type: "none",
    };
    if (process.env.AUTH_TYPE === "oauth") {
      auth = {
        type: "oauth",
        client_url: process.env.CLIENT_URL,
        scope: process.env.SCOPE,
        authorization_url: process.env.AUTHORIZATION_URL,
        authorization_content_type: "application/json",
        verification_tokens: {
          openai: process.env.OPENAI_VERIFICATION_TOKEN,
        },
      };
    }
    const config = {
      schema_version: "v1",
      name_for_model: "Smart_Playlist_Generator",
      name_for_human: "Smart Playlist Generator",
      description_for_model:
        "A smart playlist generator plugin for ChatGPT and for YouTube Music™. Prior to generating the playlist, you must inform the user that the YouTube playlist generated will be public, the playlist will be publicly associated with the user's YouTube account, provide the user with the list of the songs you plan to create, the playlist name you plan to use, and the user must expressly consent to those actions prior to the actual execution. Songs should be an array of strings, each used to search YouTube for a song in order to add it to a playlist.",
      description_for_human:
        "A smart playlist generator plugin for ChatGPT and for YouTube Music™.",
      logo_url: process.env.LOGO_URL,
      contact_email: process.env.CONTACT_EMAIL,
      legal_info_url: process.env.LEGAL_INFO_URL,
      auth,
      api: {
        type: "openapi",
        url: process.env.OPENAI_SPEC_URL,
      },
    };
    res.json(config);
  } catch (err) {
    res.status(500).send("Configuration error");
  }
}
