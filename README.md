# melo-gen-ai

MeloGenAI is a playlist generator [plugin for ChatGPT](https://openai.com/blog/chatgpt-plugins) and for YouTube Music™.

## Features

- Generates playlists for YouTube Music using the YouTube Data API.
- Adds the first search result of each song to the playlist.
- Sets generated playlist as public, private, or unlisted based on user preference. Defaults to public.

## Example

![image](https://github.com/AustinMichaelColeman/melo-gen-ai/assets/12992271/4e4fe260-95f9-407c-9369-8b1c9a01ede8)

Check out the [Copyright Free Music Playlist](https://music.youtube.com/browse/VLPLHue5YJSxY0idjvqtHa3cRqOeNycFW96t) it generated for YouTube Music.

Here is a [Youtube video example](https://www.youtube.com/watch?v=8pOSu8AR8j0) as well.

## Configuration

This project is deployed using [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions) and uses [Google Cloud](https://console.cloud.google.com/) for auth. If you are trying to fork this project, this information may be helpful:

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
