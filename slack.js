const { RTMClient, WebClient } = require('@slack/client');

import {interpret} from './dialogFlow';
import {User} from './models';

import {getAuthUrl, refreshToken} from './calendar';
// An access token (from your Slack app or custom integration - usually xoxb)
const token = process.env.SLACK_TOKEN;

// The client is initialized and then started to get an active connection to the platform
const rtm = new RTMClient(token);
const web = new WebClient(token);

rtm.start();

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
// See the "Combining with the WebClient" topic below for an example of how to get this ID

rtm.on('message', async (event) => {

  // console.log(event);
  if(event.bot_id || !event.user) return;

  let user = await User.findOne({ slackId: event.user});
  if(!user){
    return rtm.sendMessage(`Please sign with google ${getAuthUrl(event.user)}`, event.channel)
  } else if(user.googleTokens.expiry_date < Date.now() + 60000 ){
    let token = refreshToken(user.googleTokens)
    console.log(token);
    user.googleTokens = token;
    await user.save();
  }
  let botResponse = await interpret(event.user, event.text);
  console.log("bot response:", botResponse);
  if(!botResponse.allRequiredParamsPresent) {
    rtm.sendMessage(botResponse.fulfillmentText, event.channel)
      .catch(console.error);
  } else {

    const {invitee, day, time } = botResponse.parameters.fields;
    let person = invitee.listValue.values[0];
    let text = `Confirm your meeting with ${person.stringValue}, on ${new Date(day.stringValue).toDateString()}`;
    const data = {person: person.stringValue, date: new Date(day.stringValue), time:  new Date(time.stringValue).toDateString(), summary: text};
    web.chat.postMessage({
      channel: event.channel,
      text: 'Hello there',
      attachments: [
                          {
                              "text": text,
                              "fallback": "You are unable to choose a game",
                              "callback_id": "wopr_game",
                              "color": "#3AA3E3",
                              "attachment_type": "default",
                              "actions": [
                                  {
                                      "name": "confirm",
                                      "text": "confirm",
                                      "type": "button",
                                      "value": JSON.stringify(data)
                                  },
                                  {
                                      "name": "cancel",
                                      "text": "cancel",
                                      "type": "button",
                                      "value": "false"
                                  },
                              ]
                          }
                      ]
    })
      .then((res) => {
        // `res` contains information about the posted message
        console.log('Message sent: ', res.ts);
      })
      .catch(console.error);

  }

})
