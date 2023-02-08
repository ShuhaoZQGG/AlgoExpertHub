(async () => {
  let SubmitButton = null;
  let QuestionTitle = "";
  let Question = "";
  let ReadMePath = null;
  const owner = (await chrome.storage.local.get("username")).username;
  const repo = (await chrome.storage.local.get('repository')).repository;
  const AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
  console.log("AuthToken", AuthToken);
  console.log("usename", owner);
  console.log("repository name", repo);
  const titleClass = "wBpuKvBGWdd7o3KaUFOQ";
  const createReadMeMessage = "create the folder for the question and write question information into a README.md";
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Get all button elements
    setTimeout(() => {
      if (request.type="currentTab") {
        const title = document.getElementsByClassName(titleClass)[0].innerText;
        const buttons = document.getElementsByTagName('button');
        const div = document.getElementsByClassName("html");
        const childNodes = div[0].childNodes;
        console.log(childNodes);
        // console.log(typeof(childNodes));
        QuestionTitle = title;
        Question += "# " + QuestionTitle + '\n';
        for (const [key, value] of Object.entries(childNodes)) {
          if (value.innerText && (value.innerText.includes("Sample Input") || value.innerText.includes("Sample Output"))) {
            console.log('sample');
            Question += "**" + value.innerText + "**"
          } else if (value.innerText) {
            Question += value.innerText;
          } else if (value.textContent) {
            Question += value.textContent
          } 
        }
        const readMePath = `${QuestionTitle}/README.md`;
        ReadMePath = readMePath;
        console.log(typeof(Question));
        console.log(QuestionTitle);
        console.log(Question);
        // Iterate through the buttons
        for (const button of buttons) {
          // Get the span element inside the button
          const span = button.querySelector('span');
          // Check the content of the span element
          if (span && span.textContent === 'Submit Code') {
            // Do something with the button element
            SubmitButton = button;
            break;
          }
        }
      }
      console.log(request);
      SubmitButton.addEventListener('click', async function() {
        // This function will be executed when the button is clicked
        chrome.runtime.sendMessage({
          contentScriptQuery: "createREADME",
          authToken: AuthToken,
          owner: owner,
          repo: repo,
          path: ReadMePath,
          message: createReadMeMessage,
          content: Question
        });
        QuestionTitle = "";
        Question = "";
        SubmitButton = null;
        ReadMePath = null;
      });
    }, 1000)
  });
})();

