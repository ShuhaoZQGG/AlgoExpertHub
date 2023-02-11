(async () => {
  const LanguageMapping= {
    "Python": ".py"
  }

  let SubmitButton = null;
  let QuestionTitle = "";
  let Question = "";
  let CodeDiv = null;
  let Code = "";
  let SolutionDiv = null;
  let SolutionButton = null;
  let Language = "";
  let Extension = "";
  const owner = (await chrome.storage.local.get("username")).username;
  const repo = (await chrome.storage.local.get('repository')).repository;
  const AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
  // console.log("AuthToken", AuthToken);
  // console.log("usename", owner);
  // console.log("repository name", repo);
  const questionClass = "html";
  const solutionDivClass = "_5Y_y5dN7pkjcKB22vQiZ"
  const codeClass = "cm-content"
  const titleClass = "wBpuKvBGWdd7o3KaUFOQ";
  const languageClass = "oWoHqZGV1RWlIC1vbJQA";
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Get all button elements
    setTimeout(() => {
      if (request.type="currentTab") {
        Question = "";
        Code = "";
        QuestionTitle = "";
        Question = "";
        const title = document.getElementsByClassName(titleClass)[0].innerText;
        const buttons = document.getElementsByTagName('button');
        const questionDiv = document.getElementsByClassName(questionClass);
        const questionDivChildNodes = questionDiv[0].childNodes;
        const solutionDiv = document.getElementsByClassName(solutionDivClass)
        const codeDiv = document.getElementsByClassName(codeClass);
        const language = document.getElementsByClassName(languageClass);
        Language = language[0].innerText;
        SolutionDiv = solutionDiv;
        CodeDiv = codeDiv;
        Extension = LanguageMapping[Language];
        QuestionTitle = title;
        Question += "# " + QuestionTitle + '\n';
        for (const [key, value] of Object.entries(questionDivChildNodes)) {
          if (value.innerText && (value.innerText.includes("Sample Input") || value.innerText.includes("Sample Output"))) {
            Question += "**" + value.innerText + "**"
          } else if (value.textContent) {
            Question += value.textContent;
          } else if (value.innerText) {
            Question += value.innerText
          } 
        }
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
      SubmitButton.addEventListener('click', async function() {
        Code = CodeDiv[CodeDiv.length-1].innerText;

        for (const [key, value] of Object.entries(SolutionDiv[0].childNodes)) {
          if(value.classList.length == 2) {
            SolutionButton = value.innerText;
          }
        }

        const resultClassName = "jq63ZT06FaZykTzWRxJS";
        setTimeout(() => {
          const resultPara = document.getElementsByClassName(resultClassName);
          if (resultPara) {
            const resultText = resultPara[0].innerText;
            if (resultText.includes("Congratulations!")) {
                      // This function will be executed when the button is clicked
              console.log('send request');
              chrome.runtime.sendMessage({
                contentScriptQuery: "create solution",
                name: QuestionTitle,
                authToken: AuthToken,
                owner: owner,
                repo: repo,
                solutionNo: SolutionButton,
                question: Question,
                code: Code,
                language: Language,
                extension: Extension
              });

            } else {
              console.log("solution is wrong, not sending anything");
            }
          }
        }, 1000)

        // setTimeout(() => {
        //   window.location.reload();
        // }, 5000);
      });
    }, 1000)
  });
})();

