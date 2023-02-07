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
      AuthorizeButton.removeAttribute("hidden");
      const params = new URLSearchParams();
      const client_id = this.CLIENT_ID;
      console.log(client_id);
      params.append("client_id", client_id);
      params.append("redirect_url", this.ACCESS_TOKEN_URL);
      params.append("scope", "repo");
      const AuthorizeResponse = await fetch(`https://github.com/login/oauth/authorize?${params.toString()}`, {
        method: "GET",
      })
      console.log(AuthorizeResponse);
      console.log(AuthorizeResponse.url);

      await chrome.runtime.sendMessage({"Authorization_URL": AuthorizeResponse.url});

      // await chrome.runtime.sendMessage({"name": "AuthorizeUrlMessage", "AuthorizeUrl": AuthorizeResponse.url });
    } catch (error) {
      console.error(error);
    }
  },

  async getAuthorizedUser() {
    await this.init();
    const AuthToken = this.AUTH_TOKEN;
    const UserInfoResposne = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${AuthToken}`
      }
    });
    const UserInfoData = await UserInfoResposne.json();
    const Username = UserInfoData.login;
    const AvartarUrl = UserInfoData.avatar_url
    if (UserInfoResposne.ok === true) {
      await chrome.storage.local.set({"username": Username});
      await chrome.storage.local.set({"avatar": AvartarUrl});
      console.log(UserInfoResposne);
      console.log(UserInfoData);
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
    const RepoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${AuthToken}`
      }
    });
    
    const RepoInfoData = await RepoInfoResponse.json();
    // check if the reponse is ok (repo exists)
    // if yes, set chrome.storage and change dom
    if (RepoInfoResponse.ok === true) {
      RepositoryElement.textContent = repo;
      await chrome.storage.local.set({"repository": repo});
      RepositoryLabel.setAttribute("hidden", "");
      RepositoryInput.setAttribute("hidden", "");
      RepositoryButton.setAttribute("hidden", "");
      RepositoryElement.removeAttribute("hidden");
      RepositoryUnlink.removeAttribute("hidden");
      console.log(RepoInfoResponse);
      console.log(RepoInfoData);
    }

    // if not, create a new repo and change chrome storage and change dom
    else if (RepoInfoResponse.status === 404) {
      console.log(AuthToken);
      try {
        const CreateRepoResposne = await fetch(`https://api.github.com/user/repos`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${AuthToken}`,
            "Content-Type": "application/json",
            "accept": "application/json"
          },
          body: JSON.stringify({
            name: repo,
            description: "This is the test for AlgoExpertHub Extension",
            private: false,
          })
        });
        const CreateRepoData = await CreateRepoResposne.json();
        if (CreateRepoResposne.ok) {
          RepositoryElement.textContent = repo;
          await chrome.storage.local.set({"repository": repo});
          RepositoryLabel.setAttribute("hidden", "");
          RepositoryInput.setAttribute("hidden", "");
          RepositoryButton.setAttribute("hidden", "");
          RepositoryElement.removeAttribute("hidden");
          RepositoryUnlink.removeAttribute("hidden");
          console.log(CreateRepoResposne);
          console.log(CreateRepoData);      
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