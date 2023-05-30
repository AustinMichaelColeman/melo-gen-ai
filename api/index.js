import path from "path";
import fs from "fs";
import replacePlaceholders from "../src/utils/replacePlaceholders.js";

export default async function openapi(req, res) {
  try {
    const filePath = path.resolve("./config/index.html");

    let index = await fs.promises.readFile(filePath, "utf8");
    index = replacePlaceholders(index, {
      __CONTACT_EMAIL__: process.env.CONTACT_EMAIL,
    });

    res.setHeader("Content-Type", "text/html");
    res.send(index);
  } catch (error) {
    console.error("Error in index:", error);
    res.status(500).json({ error: "Failed to load index and conditions" });
  }
}
