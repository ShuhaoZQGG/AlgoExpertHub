const button = document.querySelector("button");
button.addEventListener("click", () => {
  console.log("sign in!!!");
  const params = new URLSearchParams();
  params.append("client_id", client_id.value);
  params.append("login", "ShuhaoZQGG");
  params.append("state", "success");
  console.log(params.toString());
  fetch(`https://github.com/login/oauth/authorize?${params.toString()}&redirect_uri=https://github.com`, {
  method: "GET",
  })
  .then((res) => {
    console.log(res)
    console.log(res.url);
    console.log(res.text);
    console.log(res.code);
  })
  .catch((err) => {
    console.error(err);
  })

  // fetch('https://api.github.com/user', {
  //   method: "GET"
  // })
  // .then((res) => {
  //   console.log(res)
  // })
  // .catch((err) => {
  //   console.error(err);
  // })
})

const client_id = document.getElementById("client_id");
const client_secret = document.getElementById("client_secret");
client_id.addEventListener("input", function() {
  console.log(this.value);
});
client_secret.addEventListener("input", function() {
  console.log(this.value);
});
