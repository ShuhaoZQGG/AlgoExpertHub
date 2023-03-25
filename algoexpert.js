(async () => {
  const githubApiCalls = chrome.runtime.getURL('./githubApiCalls.js');
  const githubApiCallsFunctions = await import(githubApiCalls);
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
  const Owner = (await chrome.storage.local.get("username")).username;
  const Repo = (await chrome.storage.local.get('repository')).repository;
  const AuthToken = (await chrome.storage.local.get("auth_token")).auth_token;
  //console.log("AuthToken", AuthToken);
  //console.log("Owner", Owner);
  //console.log("Repo", Repo);
  let SubmitButton = null;
  let QuestionTitle = "";
  let Question = "";
  let CodeDiv = null;
  let Code = "";
  let SolutionDiv = null;
  let SolutionNo = null;
  let Language = "";
  let Extension = "";
  const questionClass = "html";
  const solutionDivClass = "_5Y_y5dN7pkjcKB22vQiZ"
  const codeClass = "cm-content"
  const titleClass = "wBpuKvBGWdd7o3KaUFOQ";
  // TODO Get scratchPad Content, publish it as a new file if it only has one child and the content !== Write whatever you want here.
  const scratchPadClass = "cm-activeLine cm-line";
  const scratchPadDiv = document.getElementsByClassName(scratchPadClass);
  let scratchPadContent;
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
          Question += '<pre>' + `\n` + "# " + QuestionTitle + '\n';
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
          Question += '</pre>';
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
          scratchPadContent = '<pre>'+ `\n` + scratchPadDiv[0]?.innerText + `\n`;
          let scratchPadCurrentNode = scratchPadDiv[0];
          // check if the next sibling of scratchPadDiv is a div with class cm-line, if yes, then continue to get the content of the next sibling until the next sibling is not a div with class cm-line
          while (scratchPadCurrentNode?.nextSibling?.classList?.contains("cm-line")) {
            scratchPadCurrentNode = scratchPadCurrentNode?.nextSibling;
            // console.log(scratchPadCurrentNode);
            scratchPadContent += scratchPadCurrentNode.innerText + `\n`;
          }
          scratchPadContent += '</pre>';
          // console.log('scratchPadDiv', scratchPadDiv);
          // console.log("scratchPadContent", scratchPadContent);

          Code = CodeDiv[CodeDiv.length-1].innerText;
  
          for (const [key, value] of Object.entries(SolutionDiv[0]?.childNodes)) {
            if(value.classList.length == 2) {
              SolutionNo = value.innerText;
            }
          }
          const languageClass = "oWoHqZGV1RWlIC1vbJQA";
          const resultClassName = "jq63ZT06FaZykTzWRxJS";
          setTimeout(async () => {
            const language = document?.getElementsByClassName(languageClass);
            Language = language[0]?.innerText;
            Extension = LanguageMapping[Language];
            const resultPara = document?.getElementsByClassName(resultClassName);
            if (resultPara) {
              const resultText = resultPara[0]?.innerText;
              if (resultText?.includes("Congratulations!")) {
                // This function will be executed when the button is clicked
                  //console.log("AuthToken received", AuthToken);
                  const getReadMeResponse = await githubApiCallsFunctions.getContent(Owner, Repo, `${QuestionTitle}/README.md`, AuthToken);
                  if (getReadMeResponse.ok != true) {
                    const createReadMeMessage = "create the folder for the question and write question information into a README.md";
                    await githubApiCallsFunctions.createContent(Owner, Repo, `${QuestionTitle}/README.md`, AuthToken, Question, createReadMeMessage);
                    // const createReadMeResponse = await githubApiCallsFunctions.createContent(Owner, Repo, `${QuestionTitle}/README.md`, AuthToken, Question, createReadMeMessage);
                    // console.log("createReadMeResponse", createReadMeResponse);
                  } else {
                    const getReadMeData = await getReadMeResponse.json();
                    const readMeSha = getReadMeData.sha;
                    const updateReadMeMessage = "update the README.md with the question information";
                    await githubApiCallsFunctions.updateContent(Owner, Repo, `${QuestionTitle}/README.md`, readMeSha, AuthToken, Question, updateReadMeMessage);
                    // const updateReadMeResponse = await githubApiCallsFunctions.updateContent(Owner, Repo, `${QuestionTitle}/README.md`, readMeSha, AuthToken, Question, updateReadMeMessage);
                    // console.log("updateReadMeResponse", updateReadMeResponse);
                  }
                  

                  const getScratchPadResponse = await githubApiCallsFunctions.getContent(Owner, Repo, `${QuestionTitle}/ScratchPad.md`, AuthToken);
                  if (getScratchPadResponse.ok != true) {
                    const createScratchPadMessage = `Create ScratchPad for question ${QuestionTitle}`;
                    await githubApiCallsFunctions.createContent(Owner, Repo, `${QuestionTitle}/ScratchPad.md`, AuthToken, scratchPadContent, createScratchPadMessage);
                  } else {
                    const getScratchPadData = await getScratchPadResponse.json();
                    const scratchPadSha = getScratchPadData.sha;
                    const updateScratchPadMessage = `Update ScratchPad for question ${QuestionTitle}`;
                    await githubApiCallsFunctions.updateContent(Owner, Repo, `${QuestionTitle}/ScratchPad.md`, scratchPadSha, AuthToken, scratchPadContent, updateScratchPadMessage);
                  }



                  const createSolutionMessage = `Create ${Language} ${SolutionNo} for question ${QuestionTitle}`;
                  const changeSolutionMessage = `Change ${Language} ${SolutionNo} for question ${QuestionTitle}`;
                  const getSolutionResponse = await githubApiCallsFunctions.getContent(Owner, Repo, `${QuestionTitle}/${SolutionNo}/${QuestionTitle}${Extension}`, AuthToken)
                  const solutionData = await getSolutionResponse.json();
                  const sha = solutionData.sha;
                  if (getSolutionResponse.ok == true) {
                    const changeSolutionResponse = await githubApiCallsFunctions.updateContent(Owner, Repo, `${QuestionTitle}/${SolutionNo}/${QuestionTitle}${Extension}`, sha, AuthToken, Code, changeSolutionMessage);
                    if (changeSolutionResponse.status != 200 && changeSolutionResponse.status != 201) {
                      throw new Erwror("create solution failed");
                    } else {
                      // console.log("changeSolutionResponse", changeSolutionResponse);
                    }          
                  } else {
                    const createSolutionResponse = await githubApiCallsFunctions.createContent(Owner, Repo, `${QuestionTitle}/${SolutionNo}/${QuestionTitle}${Extension}`, AuthToken, Code, createSolutionMessage); 
                    if (createSolutionResponse.status != 200 && createSolutionResponse.status != 201) {
                      throw new Error("create solution failed");
                    } else {
                      // console.log("createSolutionResponse", createSolutionResponse);
                    }
                  }}
              } else {
                console.log("solution is wrong, not sending anything");
              }
            }, 1000)
        });
        return false;
      }, 1000)

      sendResponse("finished");
      return false;
    });
  } catch (error) {
    console.log(error);
  }
})();

