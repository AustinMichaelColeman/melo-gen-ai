import path from "path";
import fs from "fs";
import replacePlaceholders from "../src/utils/replacePlaceholders.js";

export default async function openapi(req, res) {
  try {
    const filePath = path.resolve("./config/index.html");

    const { CONTACT_EMAIL, SERVER_URL } = process.env;

    let index = await fs.promises.readFile(filePath, "utf8");
    index = replacePlaceholders(index, {
      __CONTACT_EMAIL__: CONTACT_EMAIL,
      __SERVER_URL__: SERVER_URL,
    });

    res.setHeader("Content-Type", "text/html");
    res.send(index);
  } catch (error) {
    console.error("Error in index:", error);
    res.status(500).json({ error: "Failed to load index and conditions" });
  }
}
