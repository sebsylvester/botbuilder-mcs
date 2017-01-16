# botbuilder-samples
This repo contains a few sample bots built with Microsoft's Bot Builder SDK and Cognitive Services API's.

* [celebrity-recognition-bot](https://github.com/sebsylvester/botbuilder-samples/tree/master/celebrity-recognition-bot): 
an example the Computer Vision API. It uses a domain-specific model that recognizes 200K celebrities from business, politics, sports and entertainment around the world.
* [emotion-detection-bot](https://github.com/sebsylvester/botbuilder-samples/tree/master/emotion-detection-bot): 
an example of the Emotion API. It takes a facial expression in an image as an input, and returns the confidence across a set of emotions for each face in the image.

## Getting Started
Clone the repo and run the setup script to install the dependencies for all bots.

      git clone https://github.com/sebsylvester/botbuilder-samples.git
      cd botbuilder-samples
      ./setup.sh
      

1. Go the Bot Framework's [Developer Portal](https://dev.botframework.com/bots/new) and create a new bot. 
Copy and paste the app id and app password somewhere. You will need them later to connect the emulator to the bot.
2. [Sign up](https://www.microsoft.com/cognitive-services/en-us/sign-up) with Microsoft Cognitive Services to get the API keys. To run the bots listed above, you'll need to add (free) subscriptions for the Computer Vision and Emotion API.
3. If you haven't already done so, download the [Bot Framework Emulator](https://github.com/microsoft/botframework-emulator/wiki/Getting-Started).
4. Enter your app id, app password and the relevant API key in the ```config.json``` of the bot you intend to run, then start the bot with ```npm start```.
5. Start up the emulator, enter your app id and app password again and connect to the bot.