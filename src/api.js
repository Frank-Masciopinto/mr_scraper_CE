import { API_ENDPOINTS } from './constants.js';

export var API = {
  sendTicketInfo: function (data) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', API_ENDPOINTS.post_ticket_info);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = async function () {
        if (xhr.readyState === 4) {
            console.log(xhr.response);
            console.log(xhr.status);
            var jsonResponse = JSON.parse(xhr.response);
            var first_digit_response_status_number = String(xhr.status).charAt(0);
            if (first_digit_response_status_number == '4' || jsonResponse.code == 400) {
            console.log('INSIDE ERROR');
            resolve(false)
            } else {
            console.log('Company Details Submitted Successfully');
            resolve(true)
            console.log(jsonResponse);
            }
        }
        };

        xhr.send(JSON.stringify(data));
    });
  },
  check_for_new_job: function () {
    console.log('Checking for new Jobs...');
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', API_ENDPOINTS.check_for_extension_update);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = async function () {
        if (xhr.readyState === 4) {
          console.log(xhr.response);
          console.log(xhr.status);
          let jsonResponse = JSON.parse(xhr.response);
          var first_digit_response_status_number = String(xhr.status).charAt(0);
          if (first_digit_response_status_number == '4') {
            console.log('INSIDE ERROR');
            console.log(xhr.response);
            var obj = JSON.parse(xhr.response);
            alert(xhr.responseText);
          } else {
            //check if new jobs
            if (jsonResponse.newJob) {
              console.log("New Job found");
              //Handler below
              let res = {
                is_there_job: true,
                job: jsonResponse
              }
              resolve(res);
            }
            else {
              console.log("No jobs found...");
              let res = {
                is_there_job: false
              }
              resolve(res);
            }
          }

        }
      };

      xhr.send();
    });
  },
};
