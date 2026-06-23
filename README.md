# sitecite (server)

Welcome to sitecite! If you wish to merely check it out, use [the website](https://sitecite.dantenl.com). It's currently available for [Firefox](https://addons.mozilla.org/en-GB/firefox/addon/sitecite/) and [Chrome](https://chromewebstore.google.com/detail/nhadodoajmnpakkgidheifkfibphlghm/).

This repo is mainly intended for if you wish to self host AND build it from scratch! If you don't want the latter: check out the [Docker version](https://github.com/sitecite/server-docker).

**Need help?** You can join the [Discord server](https://discord.gg/rPBE2B7dng) or create an issue on the Github Issues page.

# Features

![Image showing the Firefox browser with the homepage page of sitecite at sitecite.dantenl.com](https://sitecite.dantenl.com/screenshots/firefox_sitecite_website.png)

sitecite allows you to share (and customise!) quotations from websites. For example, if you're having a conversation on Discord and need to reference something from Wikipedia, you can use sitecite for this! Simply highlight the text, press the keybind on the extension or right click and click "Quote selected text" and you'll get a handy-dandy link that you can share with your friends that shows your selected text through an image and links directly to your Wikipedia page!

# Installation

> [!TIP]
> You should check out the Docker version! Installation via Docker is a whole lot easier. It's available at [github.com/sitecite/server-docker](https://github.com/sitecite/server-docker).

If you really want to, you can build it all yourself. **I don't recommend it!**
However, if you can't read or are really stubborn, you'll need the following on your system.

> [!NOTE]
> These instructions are written for macOS/Linux. However, it *may* be applicable to Windows as well, but I haven't tested it. You may run into issues with cURL however as Windows (for some reason) uses a different format.

## Requirements

You need to have the following ready to go on your system:

* MySQL 8.0 or 8.1
* [node.js](https://nodejs.org/en) - v24 or higher is recommended; it may work on older versions as well
* [git](https://git-scm.com/install/)

## How to install and run without Docker

To start off, you should clone the repo.

```
mkdir sitecite &&
cd sitecite &&
git clone https://github.com/sitecite/server/
```

This will first create a directory named `sitecite` and then it will place the files into the directory.

After which, you can run `npm install` and it will read out the `package.json` file and it will install everything you need! How convenient. Thanks Node!

After that's done, rename the `.env.example` file to just `.env`, or duplicate it: 
```
cp .env.example .env
```
Afterwards, Please fill in the host, username and password for your MySQL server. If you're interested, this is also the place to set up [Discord OAuth 2 authentication](https://docs.discord.com/developers/topics/oauth2) and your [URLhaus API key](https://urlhaus.abuse.ch/). If you're just hosting this for a couple of friends and yourself, don't worry about this! If not: Discord OAuth2 allows for a more secure sign in experience than username and password, as Discord has better security in place. URLhaus will scan each opened URL for malware if you have an API key filled in and if a malicious URL is detected, it will warn the user about it.

First, either rename `example.config.yaml` to `config.yaml` or duplicate it, similarly to the `.env` file:
```
cp example.config.yaml config.yaml
```
After that, you should check out the newly created `config.yaml`. This file has one extremely important key: the host. This is wherever sitecite will be located publicly. This should be the full URL (including https://) and it should not end with a slash (`/`).

If you got that, then you should try and start it! Use the following command:

```
npm run start
```

This will start everything up! If all went well, it should say something like `Server is listening on port 9404`. You should be able to access it on `http://localhost:9404`. (replace `9404` if you chose a different port of course.) To try it out, open it on your browser or you can try sending a GET request with something like cURL.

```
curl -H "Content-type: application/json" 'http://localhost:9404/api/hello'
```

This should give you something like this in return:

```json
{
    "success":true,
    "message":"hii! :3",
    "data": {
        "google":false,
        "discord":true,
        "username":true
    }
}
```

If you got something that looks like a JSON, then all is well! :D

After which, you'll need to get your website running on the chosen port.