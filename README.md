# botbuilder-mcs

[![Build Status](https://travis-ci.org/sebsylvester/botbuilder-mcs.svg?branch=master)](https://travis-ci.org/sebsylvester/botbuilder-mcs)
[![codecov](https://codecov.io/gh/sebsylvester/botbuilder-mcs/branch/master/graph/badge.svg)](https://codecov.io/gh/sebsylvester/botbuilder-mcs)

This is a demo bot, built with the Bot Builder SDK, that demonstrates a few of Microsoft's Cognitive Services APIs.
The bot currently uses two APIs. The Computer Vision API with a domain-specific model to recognize celebrities, 
and the Emotion API to recognize the dominant emotion in facial expressions.

## Run locally with the Bot Framework Emulator
1. Get the code ```git clone https://github.com/sebsylvester/botbuilder-mcs.git```
2. Install dependencies ```cd botbuilder-mcs && npm install```
3. Go the Bot Framework's [Developer Portal](https://dev.botframework.com/bots/new) and create a new bot.
Copy and paste the app id and app password somewhere, you will need them later to connect the emulator to the bot.
4. [Sign up](https://www.microsoft.com/cognitive-services/en-us/sign-up) with Microsoft Cognitive Services to get the API keys.
You'll need to add (free) subscriptions for the Computer Vision and Emotion APIs.
5. Configure the bot by replacing the placeholder values in the ```config.json``` file with your app id, app password and the API keys.
6. Run ```npm start``` and check if the server is listening.
7. Start up the emulator (download it [here](https://github.com/microsoft/botframework-emulator/wiki/Getting-Started)), enter your app id and app password again and connect to the bot.

## Deploy to Heroku
1. Run ```git clone https://github.com/sebsylvester/botbuilder-mcs.git```
2. Repeat steps 3 and 4 of the previous section.
3. Optionally, you can configure additional channels besides Skype and Web Chat.
4. If necessary, install [Heroku Command Line Interface](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).
5. From the directory of the cloned repo run ```heroku apps:create [name]```
6. Run ```heroku config:set NPM_CONFIG_PRODUCTION=false```. This tells Heroku to install the dev dependencies which are needed for the build step.
7. ```git push heroku master```

## Screenshots
![Celebrity recognition feature](https://cloud.githubusercontent.com/assets/3374297/22204554/da17f586-e172-11e6-89ff-56e3b753c551.png)
![Emotion recognition feature](https://cloud.githubusercontent.com/assets/3374297/22204555/da19048a-e172-11e6-9fbd-c7e7efc29fbb.png)
