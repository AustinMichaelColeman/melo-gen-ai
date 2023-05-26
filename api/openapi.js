import path from "path";
import fs from "fs";

export default async function openapi(req, res) {
  const filePath = path.resolve("./config/openapi.yaml");

  let openapiYaml = await fs.promises.readFile(filePath, "utf8");
  openapiYaml = openapiYaml.replace("__SERVER_URL__", process.env.SERVER_URL);

  res.setHeader("Content-Type", "text/yaml");
  res.send(openapiYaml);
}
