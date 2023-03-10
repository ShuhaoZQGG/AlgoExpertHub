(async () => {
  const LanguageMapping= {
    "Python": ".py",
    "JavaScript": ".js",
    "TypeScript": ".ts",
    "C#": ".cs",
    "Go": ".go",
    "Java": ".java",
    "Kotlin": ".kts",
    "Switf": ".swift"
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
  const questionClass = "html";
  const solutionDivClass = "_5Y_y5dN7pkjcKB22vQiZ"
  const codeClass = "cm-content"
  const titleClass = "wBpuKvBGWdd7o3KaUFOQ";
  let ErrorMessage = "";
  try {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      // Get all button elements
      setTimeout(() => {
        if (request.type="currentTab") {
          Question = "";
          Code = "";
          QuestionTitle = "";
          Question = "";
          const title = document.getElementsByClassName(titleClass)[0]?.innerText;
          const buttons = document.getElementsByTagName('button');
          const questionDiv = document.getElementsByClassName(questionClass);
          const questionDivChildNodes = questionDiv[0]?.childNodes;
          const solutionDiv = document.getElementsByClassName(solutionDivClass)
          const codeDiv = document.getElementsByClassName(codeClass);
          SolutionDiv = solutionDiv;
          CodeDiv = codeDiv;
          QuestionTitle = title;
          Question += "# " + QuestionTitle + '\n';
          if (questionDivChildNodes) {
            for (const [key, value] of Object.entries(questionDivChildNodes)) {
              if (value.innerText && (value.innerText.includes("Sample Input") || value.innerText.includes("Sample Output"))) {
                Question += "**" + value.innerText + "**"
              } else if (value.textContent) {
                Question += value.textContent;
              } else if (value.innerText) {
                Question += value.innerText
              } 
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
        SubmitButton?.addEventListener('click', async function() {
          Code = CodeDiv[CodeDiv.length-1].innerText;
  
          for (const [key, value] of Object.entries(SolutionDiv[0]?.childNodes)) {
            if(value.classList.length == 2) {
              SolutionButton = value.innerText;
            }
          }
          const languageClass = "oWoHqZGV1RWlIC1vbJQA";
          const resultClassName = "jq63ZT06FaZykTzWRxJS";
          setTimeout(() => {
            const language = document?.getElementsByClassName(languageClass);
            Language = language[0]?.innerText;
            Extension = LanguageMapping[Language];
            const resultPara = document?.getElementsByClassName(resultClassName);
            if (resultPara) {
              const resultText = resultPara[0]?.innerText;
              if (resultText?.includes("Congratulations!")) {
                // This function will be executed when the button is clicked
                if (chrome.runtime?.id) {
                  chrome.runtime.sendMessage({
                    contentScriptQuery: "create solution",
                    name: QuestionTitle,
                    solutionNo: SolutionButton,
                    question: Question,
                    code: Code,
                    language: Language,
                    extension: Extension
                  }, function (response) {
                    if (response) {
                      console.log(response);
                    }
                    if (chrome.runtime.lastError && ErrorMessage != chrome.runtime.lastError.message) {
                      console.log('Error: ' + chrome.runtime.lastError.message);
                      ErrorMessage = chrome.runtime.lastError.message;
                    }
                  });

                  sendResponse("ok");
                }
              } else {
                sendResponse("error");
                console.log("solution is wrong, not sending anything");
              }
            }
            return true;
          }, 1000)
        });
        return true;
      }, 1000)

      sendResponse("finished");
      return true;
    });
  } catch (error) {
    sendResponse("error");
    console.log(error);
  }
})();

