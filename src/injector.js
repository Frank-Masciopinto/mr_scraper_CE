function inject_response_interceptor() {
  function interceptData() {
    var xhrOverrideScript = document.createElement('script');
    xhrOverrideScript.type = 'text/javascript';
    xhrOverrideScript.src = chrome.runtime.getURL(
      './injected_scripts/response_interceptor.js'
    );
    document.head.prepend(xhrOverrideScript);
  }

  let interval = setInterval(() => {
    if (document.head) {
      clearInterval(interval);
      interceptData();
    }
  }, 100);
}
if (document.URL.includes("?any-website")) inject_response_interceptor();
