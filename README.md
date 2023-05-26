# smart-playlist-generator

A smart playlist generator plugin for ChatGPT and for YouTube Music™

Deployed using Vercel serverless plugins.

## Getting started

Run the server locally:

```bash
npm install
npm start
```

## Interacting with plugin

### Requirements

* Requires access to the [ChatGPT plugins beta](https://openai.com/blog/chatgpt-plugins).

### Collaborating

I welcome collaboration! The plugin is not verified yet and is in active development.

#### Installing the unverified plugin

If you'd like to, you can add it by selecting "Install an unverified plugin" and putting in this domain:

https://smart-playlist-generator.vercel.app/

It will take you through a Google Auth page which requires allowing access to your YouTube account.

#### YouTube Authentication/Authorization

Unfortunately, YouTube does not allow granular authorization for only playlist control, so it will ask for very broad permissions for your YouTube account. Additionally, since the app is in development, I would have to add your email to the Google Auth client's allowed email list.

The plugin can be installed by up to 15 developers. If you'd like to collaborate, reach out to me. My email is listed on https://www.austincoleman.dev/

## Use of Trademarks

YouTube Music™ is a trademark of Google Inc. Use of this trademark is subject to [Google Permissions](https://about.google/brand-resource-center/).

ChatGPT is a trademark of OpenAI. Use of this trademark is subject to [OpenAI Brand guidelines](https://openai.com/brand).
