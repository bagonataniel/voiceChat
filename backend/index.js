const AccessToken = require('livekit-server-sdk').AccessToken;
const LivekitClient = require('livekit-server-sdk');
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const port = 3000;
const API_KEY = process.env.API_KEY
const API_SECRET = process.env.API_SECRET

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.post('/api/token', async (req, res) => {
    const participantName = req.body.participantName || 'anonymous';
    const roomName = 'my-room';
    const at = new AccessToken(API_KEY, API_SECRET, {
    identity: participantName, name: participantName}
    );

    const videoGrant = {
        room: roomName,
        roomJoin: true,
    };

    const sipGrant = {
        admin: true,
        call: true
    }; 

    at.addSIPGrant(sipGrant);
    at.addGrant(videoGrant)

    const token = await at.toJwt();
    res.json({ token: token });
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});