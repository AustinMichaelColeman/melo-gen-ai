# melo-gen-ai

MeloGenAI is a playlist generator plugin for ChatGPT and for YouTube Music™.

## Example

![image](https://github.com/AustinMichaelColeman/melo-gen-ai/assets/12992271/4e4fe260-95f9-407c-9369-8b1c9a01ede8)

Check out the [Copyright Free Music Playlist](https://music.youtube.com/browse/VLPLHue5YJSxY0idjvqtHa3cRqOeNycFW96t) it generated for YouTube Music.

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
   - `PLUGIN_NAME`: The name of the plugin. I do this so that way my preview deploys show up as "MeloGenAI Preview" and "MeloGenAI" in the plugin store while I develop it.

### Google Cloud console

You will need a client id and secret from Google Cloud.

Authorized redirect URI: https://chat.openai.com/aip/YOUR_PLUGIN_ID/oauth/callback (replace **YOUR_PLUGIN_ID** with the ID of your plugin)
Authorized JavaScript origins: Your server URL, such as `app.vercel.com`

See the [ChatGPT Plugin OAuth docs](https://platform.openai.com/docs/plugins/authentication/oauth) for more info about obtaining a plugin ID

## Use of Trademarks

YouTube Music is a trademark of Google Inc. Use of this trademark is subject to [Google Permissions](https://about.google/brand-resource-center/).

ChatGPT is a trademark of OpenAI. Use of this trademark is subject to [OpenAI Brand guidelines](https://openai.com/brand).

This is an independent personal project available for free use. It is not officially supported by nor associated with OpenAI, ChatGPT, Google, nor YouTube Music.

## Contact

Feel free to reach out to me at https://www.austincoleman.dev/
