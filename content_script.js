(async () => {
  const authorize = chrome.runtime.getURL('./authorize.js');
  const contentScript = await import(authorize);
})();