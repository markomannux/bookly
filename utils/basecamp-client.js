const axios = require('axios')
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');
const Memembed = require('memembed');
const memembed = new Memembed();

const BC3_CLIENT_ID = process.env.BC3_CLIENT_ID
const BC3_CLIENT_SECRET = process.env.BC3_CLIENT_SECRET
const BC3_API_BASE_URL = process.env.BC3_API_BASE_URL
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const config = {
  client: {
    id: BC3_CLIENT_ID,
    secret: BC3_CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://launchpad.37signals.com',
    authorizePath: '/authorization/new',
    tokenPath: '/authorization/token',
  }
};

const oAuth2Client = new AuthorizationCode(config);

const authorizationUri = oAuth2Client.authorizeURL({
    redirect_uri: `${BASE_URL}/auth/basecamp/callback`,
    type: 'web_server'
});

function getToken(code) {
    const options = {
      code,
      type: 'web_server',
      redirect_uri: `${BASE_URL}/auth/basecamp/callback`,
      client_id: BC3_CLIENT_ID,
      client_secret: BC3_CLIENT_SECRET
    };
    const httpOptions = {
      headers: {
        "content-type": "application/json",
      }
    }

    return oAuth2Client.getToken(options, httpOptions);
}

function getAuthorization(access_token) {
    return axios.get('https://launchpad.37signals.com/authorization.json', {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            "User-Agent": "Gilogica's Bookly (m.mannucci@solvingteam.it)"
        }
    }).then(response => response.data)
}

function myProfile(access_token) {
    const uri = `${BC3_API_BASE_URL}/my/profile.json`
    return doCacheableGet({
        uri,
        access_token,
    })
}

function getPingablePeople(access_token) {
    const uri = `${BC3_API_BASE_URL}/circles/people.json`
    return doCacheableGet({
        uri,
        access_token,
    })
}

async function doCacheableGet(cacheableGetOptions) {

    const {uri, access_token} = cacheableGetOptions

    const httpOptions = {
        validateStatus: function(status) {
            return status < 300 || status === 304   
        },
        headers: {
            'Authorization': `Bearer ${access_token}`,
            "User-Agent": "Gilogica's Bookly (m.mannucci@solvingteam.it)",
        }
    }
    const cacheControl = await memembed.get(`${uri}:cache_control`)

    if(cacheControl) {
        httpOptions.headers["If-None-Match"] = cacheControl.etag
    }

    return axios.get(uri, httpOptions).then(async response => {

        let resultData

        memembed.set(`${uri}:cache_control`, {
            etag: response.headers['etag']
        })

        if (response.status === 304) {
            resultData = await memembed.get(`${uri}:cached_response`) 
        } else {
            resultData = response.data
            memembed.set(`${uri}:cached_response`, resultData)
        }

        return resultData
    })
}


module.exports = {
    authorizationUri,
    getToken,
    getAuthorization,
    myProfile,
    getPingablePeople
}
