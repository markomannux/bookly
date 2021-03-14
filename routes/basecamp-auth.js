var express = require('express');
var router = express.Router();
const {encrypt, decrypt} = require('../utils/crypto')
const BasecampClient = require('../utils/basecamp-client')
const User = require('../model/user');

router.get('/start', async function(req, res, next) {
  res.render('basecamp-auth/start')
})

router.get('/authorize', async function(req, res, next) {
  res.redirect(BasecampClient.authorizationUri);
})

router.get('/callback', async function(req, res, next) {

    try {
      const accessToken = await BasecampClient.getToken(req.query.code);
      console.log('The resulting token: ', accessToken.token);

      /*
       * Cannot use findByIdAndUpdate here. See https://github.com/Automattic/mongoose/issues/1241
       */
      const user = await User.findById(req.user._id)
      user.basecamp = {
        access_token: encrypt(accessToken.token.access_token),
        refresh_token: encrypt(accessToken.token.refresh_token),
        expires_at: accessToken.token.expires_at
      }
      
      const authorization = await BasecampClient.getAuthorization(accessToken.token.access_token)
      await user.save()

      return res.status(200).json(accessToken.token);
    } catch (error) {
      console.error('Access Token Error', error);
      return res.status(500).json('Authentication failed');
    }
})

router.get('/my/profile', async function(req, res, next) {
  const user = await User.findById(req.user._id)
  const token = decrypt(user.basecamp.access_token)

  try {
    const profile = await BasecampClient.myProfile(token)
    res.status(200).json(profile)
  } catch(err) {
    console.log(err);
    return res.status(500).json(err);
  }
})

router.get('/circles/people', async function(req, res, next) {
  const user = await User.findById(req.user._id)
  const token = decrypt(user.basecamp.access_token)
  console.log(token)

  try {
    const people = await BasecampClient.getPingablePeople(token)
    res.status(200).json(people)
  } catch(err) {
    console.log(err);
    return res.status(500).json(err);
  }
})

router.get('/myToken', async function(req, res, next) {
  const user = await User.findById(req.user._id)
  const token = {
    accessToken: decrypt(user.basecamp.access_token)
  }
  return res.status(200).json(token);
})

module.exports = router