import path from "path";
import fs from "fs";
import replacePlaceholders from "../src/utils/replacePlaceholders.js";

export default async function openapi(req, res) {
  try {
    const filePath = path.resolve("./config/openapi.yaml");

    let openapiYaml = await fs.promises.readFile(filePath, "utf8");
    openapiYaml = replacePlaceholders(openapiYaml, {
      __SERVER_URL__: process.env.SERVER_URL,
    });

    res.setHeader("Content-Type", "text/yaml");
    res.send(openapiYaml);
  } catch (error) {
    console.error("Error in openapi:", error);
    res.status(500).json({ error: "Failed to load OpenAPI specification" });
  }
}
