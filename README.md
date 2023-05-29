# melo-gen-ai

MeloGenAI is a playlist generator plugin for ChatGPT and for YouTube Music™.

## Features

- **Generate playlists for YouTube Music™**: Given a list of songs and a playlist title, the plugin will search for each song on YouTube and put them into a playlist.

- **Informed Consent**: Prior to generating the playlist, the plugin ensures transparency by informing the user of the following actions and seeking their express consent that:
  - The generated YouTube playlist will be public.
  - The playlist will be publicly associated with the user's YouTube account.
  - The user will be provided with the list of songs planned to be added to the playlist.
  - The user will be informed of the playlist name that is planned to be used.

## Collaborating

I welcome collaboration! Reach out to me. My email is listed on https://www.austincoleman.dev/

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

This is an independent personal project available for free use. Aside from being available as a plugin for ChatGPT, it is not officially supported by nor associated with OpenAI, ChatGPT, Google, nor YouTube Music™.
