(function () {
  console.log('🔫 REQUEST INTERCEPTOR INJECTED');
  let CE_id = 'apnnmchjlppmonaepaeikhommenadlgk';
  let WithNetworkPayload;
  let gotResponse = false;
  let job_network_payload = [];
  let job_network_urls = [];
  var port = chrome.runtime.connect(CE_id);
  port.postMessage({
    message: 'Response Interceptor Injected and Active, Ready for Work!',
  });
  port.onMessage.addListener(async function (request) {
    if (request.message === 'New Job for Request Interceptor') {
      console.log('📰 Received message from background script');
      console.log(request);
      WithNetworkPayload = request.WithNetworkPayload;
      if (WithNetworkPayload) {
        console.log('There is a withnetworkpayload, Requests saved as far: ');
        console.log(request_list);
        for (let i = 0; i < WithNetworkPayload.length; i++) {
          console.log(
            'Loop for checking exisisting network call for: ',
            WithNetworkPayload[i]
          );
          await checkIfNetworkCallExists();
          async function checkIfNetworkCallExists() {
            return new Promise(function (resolve, reject) {
              const requests_matching_substring = request_list.filter(
                check_if_any_request_match_Substring
              );
              function check_if_any_request_match_Substring(single_request) {
                console.log(
                  'Filtering all previous network request to match substring...'
                );
                return single_request.request.url.includes(
                  WithNetworkPayload[i]
                );
              }
              if (requests_matching_substring.length != 0) {
                //If a request matched the substring, then repeat the request and save payload
                console.log(
                  '🛸 Job Substring matched a request, proceeding with reapply the request and extracting payload'
                );
                console.log(requests_matching_substring);
                XHR.open = send.apply(
                  requests_matching_substring[0].request,
                  requests_matching_substring[0].args
                );
                let waitResponse = setInterval(() => {
                  if (gotResponse) {
                    clearInterval(waitResponse);
                    gotResponse = false;
                    resolve();
                  }
                }, 150);
              } else resolve();
            });
          }
        }
        console.log({
          message: 'Request Responses Intercepted',
          WithNetworkPayload: job_network_payload,
          WithNetworkUrls: job_network_urls,
        });
        port.postMessage({
          message: 'Request Responses Intercepted',
          WithNetworkPayload: job_network_payload,
          WithNetworkUrls: job_network_urls,
        });
      }
    }
  });
  let request_list = [];
  var XHR = XMLHttpRequest.prototype;
  var send = XHR.send;
  var open = XHR.open;
  XHR.open = function (method, url) {
    this.url = url; // the request url
    request_list.push({
      request: this,
      args: arguments,
    });
    job_network_urls.push(url);
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
  function sendActivationtoBackground(response) {
    chrome.runtime.sendMessage(
      CE_id,
      { message: 'Response Interceptor Injected and Active on this tab' },
      (response) => {
        console.log('Response from Background page: ', response);
      }
    );
  }
  //Get response from chosen request
  XHR.send = function () {
    this.addEventListener('load', function () {
      console.log('Got Response 🤯');
      console.log(this);
      try {
        this.response
          .text()
          .then((res) => {
            job_network_payload.push({ endpoint: this.url, payload: res });
            console.log(res);
          })
          .catch((err) => {
            job_network_payload.push({ endpoint: this.url, payload: err });
            console.log('❌ Error on getting response.Text()');
            console.log(err);
          });
      } catch (err) {
        console.log('❌ Error on getting response.Text()');
        console.log(err);
        job_network_payload.push({
          endpoint: this.url,
          payload: this.response,
        });
      }
      gotResponse = true;
      //sendResponsetoBackground(this.response);
    });
    return;
  };
})();
