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
  }
};
