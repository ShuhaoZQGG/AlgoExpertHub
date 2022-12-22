import {oauth} from './authorize.js';
const AuthorizeButton = document.getElementById("authorize");
AuthorizeButton.addEventListener("click", async () => {
  oauth.begin();
});