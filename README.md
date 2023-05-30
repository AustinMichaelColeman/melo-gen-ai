# melo-gen-ai

MeloGenAI is a playlist generator plugin for ChatGPT and for YouTube Music™.

## Features

- Generates a public playlist on the user's YouTube Music™ account through the ChatGPT plugin.
- Searches YouTube for each song title provided, adding the first returned result to the playlist.
- Prioritizes user privacy by seeking consent before starting the song search and playlist creation process.

## Example

![image](https://github.com/AustinMichaelColeman/melo-gen-ai/assets/12992271/eb53a693-edb5-40f8-9a58-46f6f8dba1f4)

Check out the [Electronic Discovery](https://music.youtube.com/browse/VLPLHue5YJSxY0hkqjMazz_HdagdSQiUF3V_) YouTube Music playlist it generated.

## Configuration

This project is deployed using [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions) and uses [Google Cloud](https://console.cloud.google.com/) for auth. If you are trying to fork this project, this information may be helpful:

### Environment variables

1. From within Vercel, set these [environment variables](https://vercel.com/docs/concepts/projects/environment-variables):
   - `SERVER_URL`: Your server URL, such as `app.vercel.com`
   - `CONTACT_EMAIL`: Your contact email address
   - `OPENAI_VERIFICATION_TOKEN`: Obtain this token from OpenAI. See the [ChatGPT Plugin OAuth docs](https://platform.openai.com/docs/plugins/authentication/oauth)
   - `SCOPE`: Enter the scopes you're using from Google API.
   - `AUTH_PROVIDER_URL`: URL for the authentication provider (e.g., `https://accounts.google.com/o/oauth2/v2/auth`)
   - `TOKEN_PROVIDER_URL`: URL for the token provider (e.g., `https://oauth2.googleapis.com/token`)

### Google Cloud console

You will need a client id and secret from Google Cloud.

Authorized redirect URI: https://chat.openai.com/aip/YOUR_PLUGIN_ID/oauth/callback (replace **YOUR_PLUGIN_ID** with the ID of your plugin)
Authorized JavaScript origins: Your server URL, such as `app.vercel.com`

See the [ChatGPT Plugin OAuth docs](https://platform.openai.com/docs/plugins/authentication/oauth) for more info about obtaining a plugin ID

## Use of Trademarks

YouTube Music™ is a trademark of Google Inc. Use of this trademark is subject to [Google Permissions](https://about.google/brand-resource-center/).

ChatGPT is a trademark of OpenAI. Use of this trademark is subject to [OpenAI Brand guidelines](https://openai.com/brand).

This is an independent personal project available for free use. It is not officially supported by nor associated with OpenAI, ChatGPT, Google, nor YouTube Music™.

## Contact

Feel free to reach out to me at https://www.austincoleman.dev/
