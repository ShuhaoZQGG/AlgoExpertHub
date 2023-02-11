import "./credentials.js";
(async () => {
  const client_id = (await chrome.storage.local.get('client_id')).client_id;
  const client_secret = (await chrome.storage.local.get('client_secret')).client_secret;
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
            text: "algo expert is focused",
            tabId: tabId
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

    if (request.contentScriptQuery === "create solution") {
      console.log("receive create solution Instruction");
      try {
        /**
         *  @todo get file path: if readme is already created: skip it
         *  @todo get file path: if any solution is already existed, get the sha number and update the content
         * */ 
                
        const createReadMeMessage = "create the folder for the question and write question information into a README.md";
        const { contentScriptQuery, name, authToken, owner, repo, solutionNo, question, code, language, extension } = request;
        console.log("AuthToken received", authToken);
        const getReadMeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${name}/README.md`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Accept": "application/vnd.github+json"
          }
        });
        console.log('getReadMeResponse', getReadMeResponse);
        if (getReadMeResponse.ok != true) {
          const createReadMeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${name}/README.md`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Accept": "application/vnd.github+json",
            },
            body: JSON.stringify({
              message: createReadMeMessage,
              content: btoa(question)
            })
          });
          console.log("createReadMeResponse", createReadMeResponse);
        } else {}

        const createSolutionMessage = `Create ${language} ${solutionNo} for question ${name}`;
        const changeSolutionMessage = `Change ${language} ${solutionNo} for question ${name}`;
        const getSolutionResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${name}/${solutionNo}/${name}.${extension}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Accept": "application/vnd.github+json"
          }
        });

        const solutionData = await getSolutionResponse.json();
        const sha = solutionData.sha;
        console.log('sha', sha);
        if (getReadMeResponse.ok == true) {
          const changeSolutionResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${name}/${solutionNo}/${name}.${extension}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Accept": "application/vnd.github+json",
            },
            body: JSON.stringify({
              message: changeSolutionMessage,
              content: btoa(code),
              sha: sha
            })
          });
          console.log("changeSolutionResponse", changeSolutionResponse);
        } else {
          const createSolutionResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${name}/${solutionNo}/${name}.${extension}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Accept": "application/vnd.github+json",
            },
            body: JSON.stringify({
              message: createSolutionMessage,
              content: btoa(code)
            })
          });
          console.log("createSolutionResponse", createSolutionResponse);
        }
      } catch(error) {
        console.log(error);
      }    
    }
  });  
})();
