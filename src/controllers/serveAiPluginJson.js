import readAiPlugin from "../config/readAiPlugin.js";

export default async function serveAiPluginJson(req, res) {
  try {
    let jsonConfig;
    try {
      jsonConfig = await readAiPlugin();
    } catch (error) {
      console.error(error);
      return res.status(500).send("Configuration error");
    }
    res.json(jsonConfig);
  } catch (err) {
    console.error(err);
    res.status(500).send("Configuration error");
  }
}
