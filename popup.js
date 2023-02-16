import oauth from './authorize.js';
(async() => {
  let Username;
  const AuthorizeButton = document.getElementById("authorize");
  const AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
  const Repository = (await chrome.storage.local.get("repository")).repository;
  const RepositoryElement = document.getElementById("repository");
  const RepositoryLabel = document.getElementById("repository_label");
  const RepositoryInput = document.getElementById("repository_input");
  const RepositoryButton = document.getElementById("repository_button");
  const RepositoryUnlink = document.getElementById("repository_unlink");

  console.log(Repository);
// TODO: Check auth token, if it is null, show authorize tab
// if not null, try to authorize, if success, show user info
// if fail, show authorize tab
  if (AuthToken) {
    console.log(AuthToken);
    await oauth.begin();
    const Avatar = (await chrome.storage.local.get("avatar")).avatar;
    Username = (await chrome.storage.local.get("username")).username;
    const UsernameElement = document.createElement("h6");
    UsernameElement.textContent = `Welcome ${Username}!`;
    const brElement = document.querySelector('br');
    brElement.insertAdjacentElement("beforebegin", UsernameElement);
    // document.body.appendChild(UsernameElement);
    const AvatarImgElement = document.createElement("img");
    AvatarImgElement.src=Avatar;
    brElement.insertAdjacentElement("beforebegin", AvatarImgElement);
    // document.body.appendChild(AvatarImgElement);
  } else {
    console.log(AuthToken);
    AuthorizeButton.classList.remove("hidden");
  }
  AuthorizeButton.addEventListener("click", async () => {
    await oauth.begin();
  });

  if (Repository) {
    RepositoryElement.textContent = Repository;
    console.log(RepositoryElement);
    RepositoryElement.classList.remove("hidden");
    RepositoryUnlink.classList.remove("hidden");
    RepositoryLabel.classList.add("hidden");
    RepositoryInput.classList.add("hidden");
    RepositoryButton.classList.add("hidden");
  } else {
    if (Username) {
      RepositoryElement.classList.add("hidden");
      RepositoryUnlink.classList.add("hidden");
      RepositoryLabel.classList.remove("hidden");
      RepositoryInput.classList.remove("hidden");
      RepositoryButton.classList.remove("hidden");
      RepositoryButton.addEventListener("click", async () => {
        await oauth.getRepoInfo(Username, RepositoryInput.value);
      })
    }
  }
  RepositoryUnlink.addEventListener("click", async () => {
    await chrome.storage.local.set({"repository": ""});
    RepositoryElement.classList.add("hidden");
    RepositoryUnlink.classList.add("hidden");
    RepositoryLabel.classList.remove("hidden");
    RepositoryInput.classList.remove("hidden");
    RepositoryButton.classList.remove("hidden");
  })
})();
