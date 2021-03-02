const BASE_URL = 'http://api.soothing.dental:3000'
const ACCESS_TOKEN_EP = `${BASE_URL}/app/token`
const CALLS_EP = `${BASE_URL}/graph/calls`
const LEADS_EP = `${BASE_URL}/graph/leads`
const CALL_EP = `${BASE_URL}/graph/call`
const DOWNLOAD_CALL_EP = `${BASE_URL}/graph/call/download`

const request = require('request-promise');
const crypto = require('crypto');

const MMG = function({
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    ACCESS_TOKEN,
    AUTH_CODE
  }){
  
  this.CLIENT_ID = CLIENT_ID;
  this.CLIENT_SECRET = CLIENT_SECRET;
  this.REDIRECT_URI = REDIRECT_URI
  this.ACCESS_TOKEN = ACCESS_TOKEN
  this.AUTH_CODE = AUTH_CODE
  
  this.request = async (EP, PARAMS, METHOD="GET")=>{
    if (!this.ACCESS_TOKEN && this.AUTH_CODE){
      await this.getAccessToken(this.AUTH_CODE)
    }
    if (!this.ACCESS_TOKEN){
      throw new Error('No access token')
      return
    }
    const params = Object.keys(PARAMS || {}).reduce((acc,cur)=>{
      acc = `${cur}=${encodeURIComponent(PARAMS[cur])}&`
      return acc
    },'');
    
    const options = {
		  uri: `${EP}?access_token=${encodeURIComponent(this.ACCESS_TOKEN)}&${params}`,
		  method: METHOD,
      json: true,
    };
    
    return request(options)
  }
  
  this.verifySignature = (bid, ts, signature)=>{
    if (Math.abd(Date.now() - ts) > 10000){
      //this means that it might be a replay
      return false
    }
    const hmac = crypto.createHmac('sha256', this.CLIENT_SECRET);
    const query = `bid=${bid}&ts=${ts}`
    hmac.update(query);
    return hmac.digest('base64') == signature
  }
  
  this.getAuthCodeUri = scope=>`${BASE_URL}/app/auth?client_id=${this.CLIENT_ID}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&scope=${encodeURIComponent(scope||'')}`
  
  this.getAccessToken = async code=>{
    const options = {
		  uri: `${ACCESS_TOKEN_EP}?client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&code=${encodeURIComponent(code)}`,
		  method: "GET",
      json: true
    };
    let response
    try{
      response = await request(options)
    }catch(e){
      throw new Error(e)
      return
    }
    this.ACCESS_TOKEN = response.access_token
    //at this point you should save this ACCESS_TOKEN and use this moving forward. AUTH_CODE will be invalidated.
    return this.ACCESS_TOKEN
  }
  return this
}

module.exports = MMG;





