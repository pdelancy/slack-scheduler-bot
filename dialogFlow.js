// You can find your project ID in your Dialogflow agent settings
const projectId = 'paul-s-schedulerbot'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
const query = 'Schedule a meeting with Brian';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path

export function interpret(slackId, query) {
  const sessionPath = sessionClient.sessionPath(projectId, slackId);
  console.log(sessionPath);
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
  return sessionClient
    .detectIntent(request)
    .then(responses => {
      // console.log('Detected intent');
      const result = responses[0].queryResult;
      // console.log(result);
      // console.log(`  Query: ${result.queryText}`);
      // console.log(`  Response: ${result.fulfillmentText}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
        return result
      } else {
        console.log(`  No intent matched.`);
        throw "No intent matched";
      }
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}
