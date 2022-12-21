import "./credentials.js";
(async () => {
  const client_id = await chrome.storage.session.get('client_id');
  const client_secret = await chrome.storage.session.get('client_secret');

  chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.AuthorizeUrl) {
      const code = request.AuthorizeUrl.match(/\?code=([\w\/\-]+)/)[1];
      const state = request.AuthorizeUrl.match(/\&state=([\w\/\-]+)/)[1];
      if (state == "success") {
        try {
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
          const UserInfoResposne = await fetch("https://api.github.com/user", {
            headers: {
              "Authorization": `Bearer ${AuthToken}`
            }
          });

          const UserData = await UserInfoResposne.json();
          console.log(UserData);
        } catch (err) {
          console.error(err);
        }
      }
    }
  })
})();
