import { getAuthorize, getUserInfo, getRepoInfo, createRepo } from "./githubApiCalls.js";
const oauth = {
  async init() {
    this.CLIENT_ID = (await chrome.storage.local.get('client_id')).client_id;
    this.CLIENT_SECRET = (await chrome.storage.local.get('client_secret')).client_secret;
    this.CODE = (await chrome.storage.local.get("code")).code;
    this.AUTH_TOKEN = (await chrome.storage.local.get("auth_token")).auth_token;
    this.ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
    this.AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
    this.REDIRECT_URL = 'https://github.com/';
  },

  async resetState() {
    // Store client credentials before clearing
    const client_id = this.CLIENT_ID;
    const client_secret = this.CLIENT_SECRET;
    
    // Clear all stored data except credentials
    await chrome.storage.local.clear();
    
    // Restore client credentials
    if (client_id && client_secret) {
      await chrome.storage.local.set({
        'client_id': client_id,
        'client_secret': client_secret
      });
    }

    // Reset UI elements
    const elements = {
      authorize: document.getElementById("authorize"),
      logout: document.getElementById("logout"),
      repository: document.getElementById("repository"),
      repositoryUnlink: document.getElementById("repository_unlink"),
      repositoryLabel: document.getElementById("repository_label"),
      repositoryInput: document.getElementById("repository_input"),
      repositoryButton: document.getElementById("repository_button")
    };

    // Reset UI visibility
    elements.authorize.classList.remove("hidden");
    elements.logout.classList.add("hidden");
    elements.repository.classList.add("hidden");
    elements.repositoryUnlink.classList.add("hidden");
    elements.repositoryLabel.classList.add("hidden");
    elements.repositoryInput.classList.add("hidden");
    elements.repositoryButton.classList.add("hidden");

    // Remove username and avatar if they exist
    const usernameElement = document.querySelector('h6');
    const avatarElement = document.querySelector('img');
    if (usernameElement) usernameElement.remove();
    if (avatarElement) avatarElement.remove();

    // Reset internal state
    this.AUTH_TOKEN = null;
    this.CODE = null;
  },

  async begin() {
    await this.init();
    const auth_token = this.AUTH_TOKEN;
    if (auth_token) {
      await this.getAuthorizedUser();
    } else {
      await this.authorizeNewUser(); 
    }
  },

  async authorizeNewUser() {
    await this.init();
    try {
      const AuthorizeButton = document.getElementById("authorize");
      AuthorizeButton.classList.remove("hidden");
      const params = new URLSearchParams();
      const client_id = this.CLIENT_ID;
      params.append("client_id", client_id);
      params.append("redirect_url", this.ACCESS_TOKEN_URL);
      params.append("scope", "repo");
      const AuthorizeResponse = await getAuthorize(params);
      await chrome.runtime.sendMessage({"Authorization_URL": AuthorizeResponse.url}, function(response) {
        console.log(response);
      });
    } catch (error) {
      console.error("Authorization error:", error);
      await this.resetState();
    }
  },

  async handleAuthorizationSuccess(code) {
    try {
      // Get auth token using the code
      const AuthTokenResponse = await createAuthToken(this.CLIENT_ID, this.CLIENT_SECRET, code);
      const AuthTokenData = await AuthTokenResponse.json();
      
      if (AuthTokenResponse.ok) {
        const authToken = AuthTokenData.access_token;
        await chrome.storage.local.set({"auth_token": authToken});
        this.AUTH_TOKEN = authToken;
        
        // Get user info and update UI
        await this.getAuthorizedUser();
      } else {
        throw new Error("Failed to get auth token");
      }
    } catch (error) {
      console.error("Error handling authorization success:", error);
      await this.resetState();
    }
  },

  async getAuthorizedUser() {
    await this.init();
    try {
      const AuthToken = this.AUTH_TOKEN;
      if (!AuthToken) {
        throw new Error("No auth token available");
      }

      const UserInfoResponse = await getUserInfo(AuthToken);
      
      // Handle unauthorized or invalid token
      if (UserInfoResponse.status === 401 || UserInfoResponse.status === 403) {
        console.log("Token expired or invalid, resetting state");
        await this.resetState();
        return;
      }

      const UserInfoData = await UserInfoResponse.json();
      const Username = UserInfoData.login;
      const AvatarUrl = UserInfoData.avatar_url;

      if (UserInfoResponse.ok === true) {
        await chrome.storage.local.set({"username": Username});
        await chrome.storage.local.set({"avatar": AvatarUrl});
        
        // Update UI
        const UsernameElement = document.createElement("h6");
        UsernameElement.textContent = `Welcome ${Username}!`;
        const brElement = document.querySelector('br');
        brElement.insertAdjacentElement("beforebegin", UsernameElement);
        
        const AvatarImgElement = document.createElement("img");
        AvatarImgElement.src = AvatarUrl;
        brElement.insertAdjacentElement("beforebegin", AvatarImgElement);
        
        // Hide authorize button and show logout button
        document.getElementById("authorize").classList.add("hidden");
        document.getElementById("logout").classList.remove("hidden");
      } else {
        throw new Error("Failed to get user info");
      }
    } catch (error) {
      console.error("Error getting authorized user:", error);
      await this.resetState();
    }
  },

  // Get the repository info from get request https://api.github.com/repos/{owner}/{repo}
  async getRepoInfo(owner, repo) {
    const elements = {
      repository: document.getElementById("repository"),
      repositoryUnlink: document.getElementById("repository_unlink"),
      repositoryLabel: document.getElementById("repository_label"),
      repositoryInput: document.getElementById("repository_input"),
      repositoryButton: document.getElementById("repository_button")
    };

    try {
      await this.init();
      const RepoInfoResponse = await getRepoInfo(owner, repo, this.AUTH_TOKEN);
      
      // Handle unauthorized or invalid token
      if (RepoInfoResponse.status === 401 || RepoInfoResponse.status === 403) {
        console.log("Token expired or invalid, resetting state");
        await this.resetState();
        return;
      }

      const RepoInfoData = await RepoInfoResponse.json();
      
      // check if the response is ok (repo exists)
      if (RepoInfoResponse.ok === true) {
        elements.repository.textContent = repo;
        await chrome.storage.local.set({"repository": repo});
        elements.repositoryLabel.classList.add("hidden");
        elements.repositoryInput.classList.add("hidden");
        elements.repositoryButton.classList.add("hidden");
        elements.repository.classList.remove("hidden");
        elements.repositoryUnlink.classList.remove("hidden");
      }
      // if not, create a new repo and change chrome storage and change dom
      else if (RepoInfoResponse.status === 404) {
        try {
          const CreateRepoResponse = await createRepo(repo, this.AUTH_TOKEN);
          if (CreateRepoResponse.ok) {
            elements.repository.textContent = repo;
            await chrome.storage.local.set({"repository": repo});
            elements.repositoryLabel.classList.add("hidden");
            elements.repositoryInput.classList.add("hidden");
            elements.repositoryButton.classList.add("hidden");
            elements.repository.classList.remove("hidden");
            elements.repositoryUnlink.classList.remove("hidden"); 
          } else {
            throw new Error("Failed to create repository");
          }
        } catch(e) {
          console.error("Error creating repository:", e);
          if (e.status === 401 || e.status === 403) {
            await this.resetState();
          }
        }
      } else {
        throw new Error(`Unexpected response: ${RepoInfoResponse.status}`);
      }
    } catch (error) {
      console.error("Error in getRepoInfo:", error);
      if (error.status === 401 || error.status === 403) {
        await this.resetState();
      }
    }
  }
}

export default oauth;