var refreshToken = null;
var accessToken;
const redirectURL = chrome.identity.getRedirectURL();  
const clientId = '970247099537-umrp24dhikgi0ttj9jm6cgndgci3dh49.apps.googleusercontent.com';
const clientSecret = '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';
var authcode;

async function getToken(){
    if(refreshToken==null){
        const authParams = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectURL,
            scope: ['https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events.readonly',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'].join(' '),
            access_type: 'offline',
            prompt: 'consent'       
        });
        const authURL = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`;
        var responseUrl= await chrome.identity.launchWebAuthFlow({ url: authURL, interactive: true });
        const url = new URL(responseUrl);
        const urlParams = new URLSearchParams(url.search.slice(1));
        const params = Object.fromEntries(urlParams.entries());
        authcode = params['code'];
        const refresh_data = new URLSearchParams({ 
        code: authcode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectURL,
        grant_type: 'authorization_code',  
        });      
        const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Host': 'oauth2.googleapis.com',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: refresh_data,
        });
        const tokenData = await response.json();
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token;
        chrome.storage.local.set({'token': refreshToken});  
    }
    else{
        const access_data = new URLSearchParams({ 
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken, 
        grant_type: 'refresh_token', 
        })
        const token_response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Host': 'oauth2.googleapis.com',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: access_data,
        });
        const accessTokenData = await token_response.json();
        accessToken = accessTokenData.access_token;
        chrome.storage.local.set({'token': refreshToken});
    }
    return accessToken;
}

chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
    if(message ='authorization'){
        chrome.storage.local.get('token', function(result) {
        refreshToken = result.token; 
        getToken().then(sendResponse);
        });
    }
    return true;
});