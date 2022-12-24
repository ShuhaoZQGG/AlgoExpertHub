(() => {
  let SubmitButton;
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Get all button elements
    setTimeout(() => {
      if (request.type="currentTab") {
        const buttons = document.getElementsByTagName('button');
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
      SubmitButton.addEventListener('click', function() {
        // This function will be executed when the button is clicked
        console.log('Button was clicked!');
      });
    }, 1000)
  });
})();

