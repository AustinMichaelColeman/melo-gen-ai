export default function replacePlaceholders(str, replacements) {
  for (let placeholder in replacements) {
    const regex = new RegExp(placeholder, "g");
    str = str.replace(regex, replacements[placeholder]);
  }
  return str;
}
