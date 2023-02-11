async function getAuthorize(params) {
  return await fetch(`https://github.com/login/oauth/authorize?${params.toString()}`, {
    method: "GET",
  })
}

async function createAuthToken(client_id, client_secret, code) {
  return await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "client_id": client_id,
          "client_secret": client_secret,
          "code": code,
        })
      });
}

async function getUserInfo(AuthToken) {
  return await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${AuthToken}`
    }
  });
}

async function getRepoInfo(owner, repo, AuthToken) {
  return await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${AuthToken}`
    }
  });
}

async function createRepo(repo, AuthToken) {
  return await fetch(`https://api.github.com/user/repos`, {
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
}

async function getContent(owner, repo, filePath, authToken) {
  return await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Accept": "application/vnd.github+json"
          }
        });
}

async function createContent(owner, repo, filePath, authToken, content) {
  return await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Accept": "application/vnd.github+json",
            },
            body: JSON.stringify({
              message: createReadMeMessage,
              content: btoa(content)
            })
          });
}

async function updateContent(owner, repo, filePath, sha, authToken, content) {
  return await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Accept": "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: changeSolutionMessage,
      content: btoa(content),
      sha: sha
    })
  });
}

export { getAuthorize, createAuthToken, getUserInfo, getRepoInfo, createRepo, getContent, createContent, updateContent };