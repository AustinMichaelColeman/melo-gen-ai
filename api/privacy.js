import path from "path";
import fs from "fs";
import replacePlaceholders from "../src/utils/replacePlaceholders.js";

export default async function openapi(req, res) {
  try {
    const filePath = path.resolve("./config/privacy.html");

    let privacy = await fs.promises.readFile(filePath, "utf8");
    privacy = replacePlaceholders(privacy, {
      __CONTACT_EMAIL__: process.env.CONTACT_EMAIL,
    });

    res.setHeader("Content-Type", "text/html");
    res.send(privacy);
  } catch (error) {
    console.error("Error in privacy:", error);
    res.status(500).json({ error: "Failed to load privacy policy" });
  }
}
