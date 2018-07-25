import express from 'express';
import axios from 'axios';
const app = express();
import {getAuthUrl, getToken, createEvent} from './calendar';
import { User } from './models';
import "./slack";

import bodyParser from 'body-parser';

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.post('/slack', (req, res) => {
  // console.log("SLACK CONFIRMATION***********", req.body);
  let payload = JSON.parse(req.body.payload);
  let user = payload.user.id;
  let data = JSON.parse(payload.actions[0].value)
  User.findOne({ slackId: user })
    .then((u) => {
      createEvent(u.googleTokens, data)
    })
  // console.log(data, user);
  res.send('OKAY');
})

app.get("/google/callback", (req, res) => {
  console.log(req.query);

  getToken(req.query.code, (err, token) => {
    let user = new User({
      slackId: req.query.state,
      googleTokens: token
    })

    user.save()
      .then(() => {
        res.send("Received code");
      })


  })
})


app.listen(3000)
