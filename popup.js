import oauth from './authorize.js';
(async() => {
  const elements = {
    authorize: document.getElementById("authorize"),
    logout: document.getElementById("logout"),
    repository: document.getElementById("repository"),
    repositoryLabel: document.getElementById("repository_label"),
    repositoryInput: document.getElementById("repository_input"),
    repositoryButton: document.getElementById("repository_button"),
    repositoryUnlink: document.getElementById("repository_unlink")
  };

  // Initialize the extension
  await oauth.init();
  
  // Set up event listeners
  elements.authorize.addEventListener("click", async () => {
    await oauth.authorizeNewUser();
  });

  elements.logout.addEventListener("click", async () => {
    await oauth.resetState();
  });

  elements.repositoryButton.addEventListener("click", async () => {
    const username = (await chrome.storage.local.get("username")).username;
    if (username) {
      await oauth.getRepoInfo(username, elements.repositoryInput.value);
    }
  });

  elements.repositoryUnlink.addEventListener("click", async () => {
    await chrome.storage.local.set({"repository": ""});
    elements.repository.classList.add("hidden");
    elements.repositoryUnlink.classList.add("hidden");
    elements.repositoryLabel.classList.remove("hidden");
    elements.repositoryInput.classList.remove("hidden");
    elements.repositoryButton.classList.remove("hidden");
  });

  // Check initial state and update UI
  const AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
  const Repository = (await chrome.storage.local.get("repository")).repository;

  if (AuthToken) {
    const Username = (await chrome.storage.local.get("username")).username;
    const Avatar = (await chrome.storage.local.get("avatar")).avatar;
    
    if (Username && Avatar) {
      // Update UI with user info
      const UsernameElement = document.createElement("h6");
      UsernameElement.textContent = `Welcome ${Username}!`;
      const brElement = document.querySelector('br');
      brElement.insertAdjacentElement("beforebegin", UsernameElement);
      
      const AvatarImgElement = document.createElement("img");
      AvatarImgElement.src = Avatar;
      brElement.insertAdjacentElement("beforebegin", AvatarImgElement);
      
      elements.authorize.classList.add("hidden");
      elements.logout.classList.remove("hidden");
    }
    
    if (Repository) {
      elements.repository.textContent = Repository;
      elements.repository.classList.remove("hidden");
      elements.repositoryUnlink.classList.remove("hidden");
      elements.repositoryLabel.classList.add("hidden");
      elements.repositoryInput.classList.add("hidden");
      elements.repositoryButton.classList.add("hidden");
    } else {
      elements.repository.classList.add("hidden");
      elements.repositoryUnlink.classList.add("hidden");
      elements.repositoryLabel.classList.remove("hidden");
      elements.repositoryInput.classList.remove("hidden");
      elements.repositoryButton.classList.remove("hidden");
    }
  } else {
    elements.authorize.classList.remove("hidden");
    elements.logout.classList.add("hidden");
  }
})();
