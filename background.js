import "./credentials.js";
(async () => {
  const client_id = (await chrome.storage.local.get('client_id')).client_id;
  const client_secret = (await chrome.storage.local.get('client_secret')).client_secret;
  console.log(client_id);
  console.log(client_secret);
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
          "client_id": client_id,
          "client_secret": client_secret,
          "code": code,
        })
      });
      const AuthTokenData = await AuthTokenResponse.json();
      console.log(AuthTokenData);
      const AuthToken = AuthTokenData.access_token;
      console.log(AuthToken);
      await chrome.storage.local.set({"auth_token": AuthToken});
      await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${AuthToken}`
        }
      });
     }

     if (tab.url.startsWith("https://www.algoexpert.io/questions")) {
      chrome.tabs.sendMessage(
          tabId,
          {
            type: "currentTab",
            text: "algo expert is focused"
          }
      )
     }
    }
  });

  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  console.log(await chrome.tabs.query(queryOptions));
  chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.Authorization_URL) {
      chrome.tabs.create({url: request.Authorization_URL});
    }

    if (request.contentScriptQuery === "createREADME") {
      console.log("receive createREADME Instruction");
      try {
        const owner = request.owner;
        const repo = request.repo;
        const path = request.path;
        const AuthToken = request.authToken;
        console.log("AuthToken received", AuthToken);
        const message = request.message;
        const content = request.content;
        const createReadMeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${AuthToken}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
          },
          body: JSON.stringify({
            message: message,
            content: btoa(content)
          })
        });
        console.log("createReadMeResponse", createReadMeResponse);

        const RepoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${AuthToken}`
          }
        });
        console.log("RepoInfoResponse", RepoInfoResponse);
      } catch(error) {
        console.log(error);
      }    
    }
  });  
})();
