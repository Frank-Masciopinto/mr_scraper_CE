(function () {
  console.log('Checking REQUESTS 🌡️');
  let CE_id = 'ikloafbfooegcdglmhahaeifcgjbhkon'
  var XHR = XMLHttpRequest.prototype;
  var send = XHR.send;
  var open = XHR.open;
  XHR.open = function (method, url) {
    this.url = url; // the request url
    return open.apply(this, arguments);
  };
  function sendResponsetoBackground(response) {
    chrome.runtime.sendMessage(
      CE_id,
      { message: 'Crunchbase Request Response', crunchbase_response: response },
      (response) => {
        console.log('Response sent to Background page', response);
      }
    );
  }

  XHR.send = function () {
    this.addEventListener('load', function () {
      if (this.url.includes('/v4/data/entities/organizations/')) {
        console.log('Found Request 🤯');
        console.log(this.response);
        sendResponsetoBackground(this.response);
      }
    });
    return send.apply(this, arguments);
  };
})();

