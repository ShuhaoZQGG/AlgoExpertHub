import { getAuthorize, getUserInfo, getRepoInfo, createRepo } from "./githubApiCalls.js";
const oauth = {
  async init() {
    this.CLIENT_ID = (await chrome.storage.local.get('client_id')).client_id;
    this.CLIENT_SECRET = (await chrome.storage.local.get('client_secret')).client_secret;
    this.CODE = (await chrome.storage.local.get("code")).code;
    this.AUTH_TOKEN = (await chrome.storage.local.get("auth_token")).auth_token;
    this.ACCESS_TOKEN_URL =
    'https://github.com/login/oauth/access_token';
    this.AUTHORIZATION_URL =
      'https://github.com/login/oauth/authorize';
    this.REDIRECT_URL = 'https://github.com/';
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
      console.error(error);
    }
  },

  async getAuthorizedUser() {
    await this.init();
    const AuthToken = this.AUTH_TOKEN;
    const UserInfoResposne = await getUserInfo(AuthToken);
    const UserInfoData = await UserInfoResposne.json();
    const Username = UserInfoData.login;
    const AvartarUrl = UserInfoData.avatar_url
    if (UserInfoResposne.ok === true) {
      await chrome.storage.local.set({"username": Username});
      await chrome.storage.local.set({"avatar": AvartarUrl});
    }
  },

  // Get the repository info from get request https://api.github.com/repos/{owner}/{repo}
  async getRepoInfo(owner, repo) {
    const RepositoryLabel = document.getElementById("repository_label");
    const RepositoryInput = document.getElementById("repository_input");
    const RepositoryButton = document.getElementById("repository_button");
    const RepositoryElement = document.getElementById("repository");
    const RepositoryUnlink = document.getElementById("repository_unlink");
    const AuthToken = this.AUTH_TOKEN;
    const RepoInfoResponse = await getRepoInfo(owner, repo, AuthToken);
    
    const RepoInfoData = await RepoInfoResponse.json();
    // check if the reponse is ok (repo exists)
    // if yes, set chrome.storage and change dom
    if (RepoInfoResponse.ok === true) {
      RepositoryElement.textContent = repo;
      await chrome.storage.local.set({"repository": repo});
      RepositoryLabel.classList.add("hidden");
      RepositoryInput.classList.add("hidden");
      RepositoryButton.classList.add("hidden");
      RepositoryElement.classList.remove("hidden");
      RepositoryUnlink.classList.remove("hidden");
    }

    // if not, create a new repo and change chrome storage and change dom
    else if (RepoInfoResponse.status === 404) {
      try {
        const CreateRepoResposne = await createRepo(repo, AuthToken)
        // const CreateRepoData = await CreateRepoResposne.json();
        if (CreateRepoResposne.ok) {
          RepositoryElement.textContent = repo;
          await chrome.storage.local.set({"repository": repo});
          RepositoryLabel.classList.add("hidden");
          RepositoryInput.classList.add("hidden");
          RepositoryButton.classList.add("hidden");
          RepositoryElement.classList.remove("hidden");
          RepositoryUnlink.classList.remove("hidden"); 
       }
      } catch(e) {
        console.error(e);
      }
    } else {
      console.log("something is wrong");
    }
  }
}

export default oauth;