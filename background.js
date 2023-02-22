import "./credentials.js";
import { createAuthToken, getUserInfo, getContent, createContent, updateContent } from "./githubApiCalls.js";
(async () => {
  // Add a listener to handle the alarm
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "awake algoexperthub") {
      console.log("alarm, awakening extension");
      // Do something here to keep your extension running
    }
  });
  
  chrome.runtime.onInstalled.addListener(async () => {
    for (const cs of chrome.runtime.getManifest().content_scripts) {
      for (const tab of await chrome.tabs.query({url: cs.matches})) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: cs.js,
        });
      }
    }
    chrome.alarms.get('awake algoexperthub', alarm => {
      if (!alarm) {
        // Set up an alarm to go off every 5 minutes
        chrome.alarms.create("awake algoexperthub", { periodInMinutes: 1 });
        console.log("creating alarm");
      }
    });
  });

  let Owner = (await chrome.storage.local.get("username")).username;
  let Repo = (await chrome.storage.local.get('repository')).repository;
  let AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
  // When an existing extension refreshed, reload content scripts for all tabs that match the permissions

  
  const client_id = (await chrome.storage.local.get('client_id')).client_id;
  const client_secret = (await chrome.storage.local.get('client_secret')).client_secret;
  chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    // Check if the tab's URL has changed
    if (
      changeInfo.status === "complete"
    ) {
     if (tab.url && tab.url.match(/\?code=([\w\/\-]+)/)){
        const code = tab.url.match(/\?code=([\w\/\-]+)/)[1];
        await chrome.storage.local.set({"code": code});
        if (!AuthToken) {
          const AuthTokenResponse = await createAuthToken(client_id, client_secret, code);
          const AuthTokenData = await AuthTokenResponse.json();
          AuthToken = AuthTokenData.access_token;
          await chrome.storage.local.set({"auth_token": AuthToken});
        }

        if (!Owner) {
          const UserInfo = await getUserInfo(AuthToken);
          const UserInfoData = await UserInfo.json();
          Owner = UserInfoData.login;
        }
     }

     if (tab.url.startsWith("https://www.algoexpert.io/questions/")) {
      chrome.tabs.sendMessage(
          tabId,
          {
            type: "currentTab",
            text: "algo expert is focused",
            tabId: tabId
          },
          function (response) {
            if (chrome.runtime.lastError) {
              console.log('Error: ' + chrome.runtime.lastError.message);
              console.log(response);
            }
          }
      )
     }
    }
  });

  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  try {
    chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
      if (request.Authorization_URL) {
        chrome.tabs.create({url: request.Authorization_URL});
        sendResponse("ok");
        return false;
      }
  
      if (request.contentScriptQuery === "create solution") {
        Owner = (await chrome.storage.local.get("username")).username;
        Repo = (await chrome.storage.local.get('repository')).repository;
        AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
        try {
          /**
           *  @todo get file path: if readme is already created: skip it
           *  @todo get file path: if any solution is already existed, get the sha number and update the content
           * */ 
                  
          const createReadMeMessage = "create the folder for the question and write question information into a README.md";
          const { contentScriptQuery, name, solutionNo, question, code, language, extension } = request;
          console.log("AuthToken received", AuthToken);
          const getReadMeResponse = await getContent(Owner, Repo, `${name}/README.md`, AuthToken);
          if (getReadMeResponse.ok != true) {
            const createReadMeResponse = await createContent(Owner, Repo, `${name}/README.md`, AuthToken, question, createReadMeMessage);
            console.log("createReadMeResponse", createReadMeResponse);
          } else {}
  
          const createSolutionMessage = `Create ${language} ${solutionNo} for question ${name}`;
          const changeSolutionMessage = `Change ${language} ${solutionNo} for question ${name}`;
          const getSolutionResponse = await getContent(Owner, Repo, `${name}/${solutionNo}/${name}${extension}`, AuthToken)
          const solutionData = await getSolutionResponse.json();
          const sha = solutionData.sha;
          if (getReadMeResponse.ok == true) {
            const changeSolutionResponse = await updateContent(Owner, Repo, `${name}/${solutionNo}/${name}${extension}`, sha, AuthToken, code, changeSolutionMessage);
            console.log("changeSolutionResponse", changeSolutionResponse);
          } else {
            const createSolutionResponse = await createContent(Owner, Repo, `${name}/${solutionNo}/${name}${extension}`, AuthToken, code, createSolutionMessage); 
            console.log("createSolutionResponse", createSolutionResponse);
          }

          sendResponse("ok");
          return true;
        } catch(error) {
          sendResponse("error");
          console.log(error);
          return false;
        }
        /**
         * @description return true for ascyncronous functions
         * @error Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, 
         *        but the message channel closed before a response was received
         */
      }
      sendResponse("finishied");
      return true;
    });  
  } catch (error) {
    console.log("error", error);
  }
})();
