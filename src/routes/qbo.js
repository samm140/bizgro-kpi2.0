// Express.js example
// routes/qbo.js

const express = require('express');
const router = express.Router();
const OAuthClient = require('intuit-oauth');

// Initialize OAuth client
const oauthClient = new OAuthClient({
  clientId: process.env.QBO_CLIENT_ID,
  clientSecret: process.env.QBO_CLIENT_SECRET,
  environment: process.env.QBO_ENVIRONMENT,
  redirectUri: process.env.QBO_REDIRECT_URI
});

// OAuth callback
router.get('/callback', async (req, res) => {
  const authResponse = await oauthClient.createToken(req.url);
  req.session.accessToken = authResponse.getToken().access_token;
  req.session.refreshToken = authResponse.getToken().refresh_token;
  req.session.realmId = authResponse.getToken().realmId;
  
  res.redirect('/dashboard?qbo=connected');
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const authResponse = await oauthClient.refresh();
    res.json({
      access_token: authResponse.getToken().access_token,
      expires_in: authResponse.getToken().expires_in
    });
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// Sync data endpoint
router.post('/sync', async (req, res) => {
  try {
    // Implement sync logic
    const syncResult = await syncQBOData(req.session.accessToken, req.session.realmId);
    res.json(syncResult);
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

module.exports = router;
