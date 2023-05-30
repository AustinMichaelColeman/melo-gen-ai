import path from "path";
import fs from "fs";
import replacePlaceholders from "../src/utils/replacePlaceholders.js";

export default async function openapi(req, res) {
  try {
    const filePath = path.resolve("./config/terms.html");

    let terms = await fs.promises.readFile(filePath, "utf8");
    terms = replacePlaceholders(terms, {
      __CONTACT_EMAIL__: process.env.CONTACT_EMAIL,
    });

    res.setHeader("Content-Type", "text/html");
    res.send(terms);
  } catch (error) {
    console.error("Error in terms:", error);
    res.status(500).json({ error: "Failed to load terms and conditions" });
  }
}
