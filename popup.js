import oauth from './authorize.js';
(async() => {
  const AuthorizeButton = document.getElementById("authorize");
  const AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
// TODO: Check auth token, if it is null, show authorize tab
// if not null, try to authorize, if success, show user info
// if fail, show authorize tab
  if (AuthToken) {
    console.log(AuthToken);
    await oauth.begin();
    const Avatar = (await chrome.storage.local.get("avatar")).avatar;
    const Username = (await chrome.storage.local.get("username")).username;
    const UsernameElement = document.createElement("h6");
    UsernameElement.textContent = `Welcome ${Username}!`;
    document.body.appendChild(UsernameElement);
    const AvatarImgElement = document.createElement("img");
    AvatarImgElement.src=Avatar;
    document.body.appendChild(AvatarImgElement);

  } else {
    console.log(AuthToken);
    AuthorizeButton.removeAttribute("hidden");
  }
  AuthorizeButton.addEventListener("click", async () => {
    await oauth.begin();
  });

})();
