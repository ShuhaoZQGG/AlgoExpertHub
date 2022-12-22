import {oauth} from './authorize.js';
const AuthorizeButton = document.getElementById("authorize");

// TODO: Check auth token, if it is null, show authorize tab
// if not null, try to authorize, if success, show user info
// if fail, show authorize tab

AuthorizeButton.addEventListener("click", async () => {
  oauth.begin();
});