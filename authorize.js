const oauth = {
  async init() {
    this.CLIENT_ID = await chrome.storage.local.get('client_id');
    this.CLIENT_SECRET = await chrome.storage.local.get('client_secret');
    this.CODE = await chrome.storage.local.get("code");
    this.AUTH_TOKEN = await chrome.storage.local.get("auth_token");
    this.ACCESS_TOKEN_URL =
    'https://github.com/login/oauth/access_token';
    this.AUTHORIZATION_URL =
      'https://github.com/login/oauth/authorize';
    this.REDIRECT_URL = 'https://github.com/';
  },

  async begin() {
    await this.init();
    try {
      const params = new URLSearchParams();
      const client_id = this.CLIENT_ID;
      const client_secret = this.CLIENT_SECRET;
      console.log(client_id);
      params.append("client_id", client_id.client_id);
      params.append("redirect_url", this.ACCESS_TOKEN_URL);
      const AuthorizeResponse = await fetch(`https://github.com/login/oauth/authorize?${params.toString()}`, {
        method: "GET",
        redirect: "follow"
      })
      console.log(AuthorizeResponse);
      console.log(AuthorizeResponse.url);

      chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
        // Check if the tab's URL has changed
        if (
          changeInfo.status === "complete"
        ) {
         if (tab.url && tab.url.match(/\?code=([\w\/\-]+)/)){
            const code = tab.url.match(/\?code=([\w\/\-]+)/)[1]
            await chrome.storage.local.set({"code": code});
            const AuthTokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              "client_id": client_id.client_id,
              "client_secret": client_secret.client_secret,
              "code": code,
            })
          });
  
          const AuthTokenData = await AuthTokenResponse.json();
          const AuthToken = AuthTokenData.access_token;
          await chrome.storage.local.set({"auth_toke": AuthToken})
          const UserInfoResposne = await fetch("https://api.github.com/user", {
            headers: {
              "Authorization": `Bearer ${AuthToken}`
            }
          });
          if (UserInfoResposne.ok === true) {
            const AuthorizeButton = document.getElementById("authorize");
            AuthorizeButton.style.display = "none";
          }
         }
        }
      });
      chrome.tabs.create({url: AuthorizeResponse.url});

      // await chrome.runtime.sendMessage({"name": "AuthorizeUrlMessage", "AuthorizeUrl": AuthorizeResponse.url });
    } catch (error) {
      console.error(error);
    }
  }
}

export {oauth};
// const AuthorizeButton = document.getElementById("authorize");
// AuthorizeButton.addEventListener("click", async () => {
//   const params = new URLSearchParams();
//   const client_id = await chrome.storage.local.get('client_id');
//   params.append("client_id", client_id.client_id);
//   params.append("state", "success");
//   params.append("redirect_url", "htttps://github.com");
//   console.log(params.toString());
//   try {
//     const AuthorizeResponse = await fetch(`https://github.com/login/oauth/authorize?${params.toString()}`, {
//       method: "GET",
//     })
//     window.open(AuthorizeResponse.url);

//     window.addEventListener("load", function() {
//       const GithubAuthorizeButton = document.getElementById("js-oauth-authorize-btn")
//       GithubAuthorizeButton.addEventListener("click", function(){
//         console.log("click");
//       })
//     })
    
//     await chrome.runtime.sendMessage({"name": "AuthorizeUrlMessage", "AuthorizeUrl": AuthorizeResponse.url });
//   } catch (error) {
//     console.error(error);
//   }

//   chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.name === "AuthorizeState" && request.authorized) {
//       if (request.authorized === "true") {
//         AuthorizeButton.style.display = "none";
//       }
//     }
//   });
// })