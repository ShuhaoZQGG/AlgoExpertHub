const button = document.querySelector("button");
button.addEventListener("click", async () => {
  console.log("sign in!!!");
  const params = new URLSearchParams();
  const client_id = await chrome.storage.session.get('client_id');
  const client_secret = await chrome.storage.session.get('client_secret');
  // chrome.storage.sync.get(['client_id'], function(result) {
  //   console.log('Client_id retrieved: ' + result.key);
  // });
  // chrome.storage.sync.get(['client_secret'], function(result) {
  //   console.log('Client_secret retrieved: ' + result.key);
  // });
  params.append("client_id", client_id.client_id);
  params.append("login", "ShuhaoZQGG");
  params.append("state", "success");
  console.log(params.toString());
  const AuthorizeResponse = await fetch(`https://github.com/login/oauth/authorize?${params.toString()}&redirect_uri=https://github.com`, {
    method: "GET",
    redirect: "follow"
  })
  const code = AuthorizeResponse.url.split("?")[1].split("&")[0].split("=")[1];
  const state = AuthorizeResponse.url.split("?")[1].split("&")[1].split("=")[1];
  console.log(code);
  console.log(state);
})

const client_id = document.getElementById("client_id");
const client_secret = document.getElementById("client_secret");
client_id.addEventListener("input", function() {
  console.log(this.value);
});
client_secret.addEventListener("input", function() {
  console.log(this.value);
});
