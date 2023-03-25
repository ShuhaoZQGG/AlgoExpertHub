import "./credentials.js";
import { createAuthToken, getUserInfo, getContent, createContent, updateContent } from "./githubApiCalls.js";
(async () => {
    chrome.runtime.onInstalled.addListener(async () => {
    for (const cs of chrome.runtime.getManifest().content_scripts) {
      for (const tab of await chrome.tabs.query({url: cs.matches})) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: cs.js,
        });
      }
    }
    // Set up a listener for when the extension is installed or updated
    chrome.alarms.get('awake algoexperthub', alarm => {
      if (!alarm) {
        // Set up an alarm to go off every 5 minutes
        chrome.alarms.create("awake algoexperthub", { delayInMinutes: 1 });
        console.log("creating alarm");
      }
    });
  });
  // Set up a listener for when the alarm goes off
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    // Check if the alarm that went off is the one we set
    if (alarm && alarm.name === "awake algoexperthub") {
      console.log("alarm, awakening extension");
      // Set the alarm to go off again in 5 minutes
      chrome.alarms.create('awake algoexperthub', { delayInMinutes: 5 });
    }
  });
  
  // Set up a listener for when the user becomes idle
  chrome.idle.onStateChanged.addListener(function(state) {
    // Check if the user is now idle
    console.log(state);
    if (state === 'idle') {
      // Set the alarm to go off in 1 minute
      chrome.alarms.create('awake algoexperthub', { delayInMinutes: 1 });
      console.log("creating alarm when app goes to inactive");
    }
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

     if (tab.url.startsWith("https://www.algoexpert.io/questions/") && tab.url !== "https://www.algoexpert.io/questions/") {
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
      if (request && request.Authorization_URL) {
        chrome.tabs.create({url: request.Authorization_URL});
        sendResponse("ok");
        return false;
      }
    });  
  } catch (error) {
    console.log("error", error);
  }
})();
