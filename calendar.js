import {google} from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

//google **************************************************

function getClient(){
  return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.NGROK + "/google/callback");
}

export function getAuthUrl(state) {
  return getClient().generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state
    });
}

export function getToken(code, cb) {
  getClient().getToken(code, cb)
}

export function refreshToken(token) {
  let client = getClient();
  client.setCredentials(token);
  return new Promise((resolve, reject) => {
    client.refreshAccessToken((err, token) => {
      return token
    })
  })
}

export function createEvent(token, data) {
    console.log("IN CREATE EVENT");
    let client = getClient();
    client.setCredentials(token);

    const calendar = google.calendar({version: 'v3', auth: client});
    console.log(data);

    let start = new Date(data.date)
    let time = new Date(data.time);
    start.setHours(time.getHours());
    start.setMinutes(time.getMinutes());
    // console.log(new Date(Date.now() + 90000).toISOString());
    calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: data.summary,
        start: {
          dateTime: start.toISOString()
        },
        end: {
          dateTime: new Date(start.getTime() + 1800000).toISOString()
        }
      }
    },
    (err, resp) => {
      console.log(resp);
      console.log(token);
      // axios(`https://accounts.google.com/o/oauth2/revoke?token=${token.access_token}`)
    })
}

// console.log(authUrl);
