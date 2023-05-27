# smart-playlist-generator

A smart playlist generator plugin for ChatGPT and for YouTube Music™

![image](https://github.com/AustinMichaelColeman/smart-playlist-generator/assets/12992271/e9980b5b-4e3e-4ee0-bc4b-c8b92b234a95)



Here's the playlist it generated: https://music.youtube.com/browse/VLPLHue5YJSxY0hLyp_8NmmzzWPwhdsCrZYa

You can also check out [this recording](https://www.linkedin.com/feed/update/urn:li:activity:7067945888945508352/) to get an idea of what it's like.

## Under development

This plugin works as a prototype, but I plan to implement these features for [production](https://platform.openai.com/docs/plugins/production/plugins-in-production):

* Rate limits
* Timeouts
* Terms/privacy policy
* Try to get some feedback to see if I'm making any auth/security mistakes

Also if you're curious, you can see some of the [playlists](https://music.youtube.com/browse/UC7S-wmivIpyNwZVrc3PlA-A) I've generated so far while developing it.

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

This project is deployed using [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions) and uses [Google Cloud](https://console.cloud.google.com/) for auth.

### Environment variables

1. From within Vercel, set these [environment variables](https://vercel.com/docs/concepts/projects/environment-variables):
   - `SERVER_URL`: Your server URL, such as `app.vercel.com`
   - `CONTACT_EMAIL`: Your contact email address
   - `OPENAI_VERIFICATION_TOKEN`: Obtain this token from OpenAI. See the [ChatGPT Plugin OAuth docs](https://platform.openai.com/docs/plugins/authentication/oauth)
   - `SCOPE`: Enter the scopes you're using from Google API. Unfortunately Google does not give granular permissions over playlist creation for YouTube Music. So in order for this plugin to work, it requires very broad YouTube scopes to create playlists and insert songs into playlists: `https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl`
   - `AUTH_PROVIDER_URL`: URL for the authentication provider (e.g., `https://accounts.google.com/o/oauth2/v2/auth`)
   - `TOKEN_PROVIDER_URL`: URL for the token provider (e.g., `https://oauth2.googleapis.com/token`)

### Google Cloud console

You will need a client id and secret from 

Authorized redirect URI: https://chat.openai.com/aip/YOUR_PLUGIN_ID/oauth/callback (replace **YOUR_PLUGIN_ID** with the ID of your plugin)
Authorized JavaScript origins: Your server URL, such as `app.vercel.com`

See the [ChatGPT Plugin OAuth docs](https://platform.openai.com/docs/plugins/authentication/oauth) for more info about obtaining a plugin ID

## Use of Trademarks

YouTube Music™ is a trademark of Google Inc. Use of this trademark is subject to [Google Permissions](https://about.google/brand-resource-center/).

ChatGPT is a trademark of OpenAI. Use of this trademark is subject to [OpenAI Brand guidelines](https://openai.com/brand).
