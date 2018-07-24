import express from 'express';

const app = express();

import {google} from 'googleapis';
import bodyParser from 'body-parser';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

//google **************************************************

const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.NGROK + "/google/callback");

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

console.log(authUrl);

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.get("/google/callback", (req, res) => {
  console.log(req.query);

  oAuth2Client.getToken(req.query.code, (err, token) => {
    oAuth2Client.setCredentials(token);
    const calendar = google.calendar({version: 'v3', auth: oAuth2Client});

    // calendar.events.list({
    //   calendarId: 'primary',
    //   timeMin: (new Date()).toISOString(),
    //   maxResults: 10,
    //   singleEvents: true,
    //   orderBy: 'startTime',
    // }, (err, resp ) => {
    //   console.log(resp);
    //   resp.data.items.map((event) => {
    //     console.log(event);
    //   })
    // })
    console.log(new Date(Date.now() + 90000).toDateString());
    calendar.events.insert({
      calendarId: 'primary',
      summary: 'Do a codealong',
      start: {
        date: new Date(Date.now() + 30000)
      },
      end: {
        dateTime:new Date(Date.now() + 90000).toDateString()
      }
    },
    (err, resp) => {
      console.log(resp.data);
    }
  )

    res.send("Received code");
  })
})

//slack ***************************************************

const { RTMClient, WebClient } = require('@slack/client');

// An access token (from your Slack app or custom integration - usually xoxb)
const token = process.env.SLACK_TOKEN;

// The client is initialized and then started to get an active connection to the platform
const rtm = new RTMClient(token);
const web = new WebClient(token);

rtm.start();

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
// See the "Combining with the WebClient" topic below for an example of how to get this ID

rtm.on('message', (event) => {
  // rtm.sendMessage('Hello there', event.channel)
  //   .then((res) => {
  //     // `res` contains information about the posted message
  //     console.log('Message sent: ', res.ts);
  //   })
  //   .catch(console.error);
  console.log(event);
  if(event.bot_id) return;
  web.chat.postMessage({
    channel: event.channel,
    text: 'Hello there',
    attachments: [
                        {
                            "text": "Choose a game to play",
                            "fallback": "You are unable to choose a game",
                            "callback_id": "wopr_game",
                            "color": "#3AA3E3",
                            "attachment_type": "default",
                            "actions": [
                                {
                                    "name": "game",
                                    "text": "Chess",
                                    "type": "button",
                                    "value": "chess"
                                },
                                {
                                    "name": "game",
                                    "text": "Falken's Maze",
                                    "type": "button",
                                    "value": "maze"
                                },
                                {
                                    "name": "game",
                                    "text": "Thermonuclear War",
                                    "style": "danger",
                                    "type": "button",
                                    "value": "war",
                                    "confirm": {
                                        "title": "Are you sure?",
                                        "text": "Wouldn't you prefer a good game of chess?",
                                        "ok_text": "Yes",
                                        "dismiss_text": "No"
                                    }
                                }
                            ]
                        }
                    ]
  })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);
})

app.post('/slack', (req, res) => {
  console.log(req.body);
  console.log(JSON.parse(req.body.payload).actions);
  res.send('OKAY');
})

// See: https://api.slack.com/methods/chat.postMessage



//dialogflow **********************************************

// You can find your project ID in your Dialogflow agent settings
const projectId = 'paul-s-schedulerbot'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
const query = 'Schedule a meeting with Brian';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// The text query request.
const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: query,
      languageCode: languageCode,
    },
  },
};

// Send request and log result
// sessionClient
//   .detectIntent(request)
//   .then(responses => {
//     console.log('Detected intent');
//     const result = responses[0].queryResult;
//     console.log(result);
//     if(!result.allRequiredParamsPresent) {
//
//     }
//     console.log(`  Query: ${result.queryText}`);
//     console.log(`  Response: ${result.fulfillmentText}`);
//     if (result.intent) {
//       console.log(`  Intent: ${result.intent.displayName}`);
//     } else {
//       console.log(`  No intent matched.`);
//     }
//   })
//   .catch(err => {
//     console.error('ERROR:', err);
//   });

app.listen(3000)
