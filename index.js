const request = require('request-promise');
const crypto = require('crypto');

const MMG = function({
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    ACCESS_TOKEN,
    AUTH_CODE,
    BASE_URL
  }){
  BASE_URL = BASE_URL || 'https://apigateway.mmgfusion.com';
  const ACCESS_TOKEN_EP = `${BASE_URL}/app/token`
  this.CLIENT_ID = CLIENT_ID;
  this.CLIENT_SECRET = CLIENT_SECRET;
  this.REDIRECT_URI = REDIRECT_URI
  this.ACCESS_TOKEN = ACCESS_TOKEN
  this.AUTH_CODE = AUTH_CODE
  
  const endpoints = {
    get_leads : `${BASE_URL}/graph/leads`,
    get_calls : `${BASE_URL}/graph/calls`,
    lead_details : `${BASE_URL}/graph/lead`,
    download_call : `${BASE_URL}/graph/call/download`,
    get_campaigns : `${BASE_URL}/graph/campaigns`
  }
  
  this.request = async (EP, PARAMS, RP)=>{
    if (!this.ACCESS_TOKEN && this.AUTH_CODE){
      await this.getAccessToken(this.AUTH_CODE)
    }
    if (!this.ACCESS_TOKEN){
      throw new Error('No access token')
      return
    }
    const params = Object.keys(PARAMS || {}).map(cur=>`${cur}=${encodeURIComponent(PARAMS[cur])}`).join('&');
    
    const options = {
		  uri: `${EP}?access_token=${encodeURIComponent(this.ACCESS_TOKEN)}&${params}`,
		  method: "GET",
      json: true,
    };
    
    if (RP){
      Object.keys(RP).forEach(k=>{
        options[k] = RP[k]
      })
    }
    
    return request(options)
  }
  
  Object.keys(endpoints).forEach(ep=>{
    this[ep] = (params,rp)=>this.request(endpoints[ep], params, rp)
  })
  
  this.sign = params=>{
    const hmac = crypto.createHmac('sha256', this.CLIENT_SECRET);
    const keys = Object.keys(params);
    if (!params.ts){
      params.ts = Date.now()
    }
    keys.sort()
    const query = keys.filter(k=>k!='signature').map(k=>`${k}=${encodeURIComponent(params[k])}`).join('&')
    hmac.update(query);
    return hmac.digest('base64')
  }
  
  this.verifySignature = params=>{
    if (Math.abs(Date.now() - params.ts) > 10000){
      //this means that it might be a replay
      return false
    }
    return this.sign(params) == params.signature
  }
  
  
  
  this.getAuthCodeUri = (scope, state)=>`${BASE_URL}/app/auth?client_id=${this.CLIENT_ID}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&scope=${encodeURIComponent(scope||'')}&state=${encodeURIComponent(state||'')}`
  
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





