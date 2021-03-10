# mmg-graph for nodejs
MMG Fusion allows third parties to create apps that can be installed by MMG customers. Apps can request specific permissions that would give them access to read and write data from/to customers' who have installed their apps. Apps can also register webhooks and listen for certain events, expose a an admin-UI, customer-UI and patient-UI that can respectively be used by their own team, the customers who installed the app and patients of the customers who have installed their app.

MMG Fusion uses standard oAuth2 protocol for authentication and authorization and have graph-like REST APIs to allow third parties to read/write data. In this document we cover how MMG partners can create apps.

This library is a nodeJS interface to access MMG resources in nodejs without using REST APIs directly. 


##Installation
```bash
npm install mmg-graph
```

##Basic use
```javascript
const MMG = require('mmg-graph');
const MMGClient = new MMG({
  CLIENT_ID: CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET,
  REDIRECT_URI: `${PROTOCOL}://${DOMAIN}/auth`
})

/*send this link to the MMG customers that would like to install your app.
They will be prompted to give your app permission to access their data.*/
const authUri = MMGClient.getAuthCodeUri(); 

const leads = await MMGClient.get_leads({
  //rangeBeg,
  //rangeEnd,
}); //if the app has access to read leads, this function will give access to leads.
```


##Functions


    get_leads : Get the list of leads
    get_calls : Get the list of calls
    lead_details : Get more details about a specific lead
    download_call : Download the audio file of a recorded call
    get_campaigns : Get the list of all campaigns


## Sample App
Check [mmg-graph sample nodejs app](https://github.com/MMGFusion/mmg-sample-app) for lambda to get up and running quickly.


