import fs from "fs/promises";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

export default async function readAiPlugin() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const configText = await fs.readFile(
    path.join(__dirname, "ai-plugin.json"),
    "utf-8"
  );
  const config = {
    ...JSON.parse(configText),
    logo_url: process.env.LOGO_URL,
    contact_email: process.env.CONTACT_EMAIL,
    legal_info_url: process.env.LEGAL_INFO_URL,
    auth: {
      type: "oauth",
      client_url: process.env.CLIENT_URL,
      scope: process.env.SCOPE,
      authorization_url: process.env.AUTHORIZATION_URL,
      authorization_content_type: "application/json",
      verification_tokens: {
        openai: process.env.OPENAI_VERIFICATION_TOKEN,
      },
    },
    api: {
      type: "openapi",
      url: process.env.OPENAI_SPEC_URL,
    },
  };
  console.log("config", config);
  return config;
}
