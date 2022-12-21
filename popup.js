const button = document.querySelector("button");
button.addEventListener("click", async () => {
  const params = new URLSearchParams();
  const client_id = await chrome.storage.session.get('client_id');
  params.append("client_id", client_id.client_id);
  params.append("state", "success");
  params.append("redirect_url", "htttps://github.com");
  console.log(params.toString());
  try {
    const AuthorizeResponse = await fetch(`https://github.com/login/oauth/authorize?${params.toString()}`, {
      method: "GET",
      redirect: "follow"
    })
  
    await chrome.runtime.sendMessage({ "AuthorizeUrl": AuthorizeResponse.url });
  } catch (error) {
    console.error(error);
  }
})

