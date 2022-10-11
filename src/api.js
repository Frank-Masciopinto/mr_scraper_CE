import { API_ENDPOINTS } from './constants.js';

export var API = {
  check_for_new_job: function () {
    console.log('Checking for new Jobs...');
    return new Promise(function (resolve, reject) {
      fetch(API_ENDPOINTS.check_for_new_job, {
        // Adding method type
        method: 'POST',
      })
        .then((response) => response.json())
        .then((jsonResponse) => {
          console.log('Api JsonResponse: ');
          console.log(jsonResponse);
          if (jsonResponse.message) {
            console.log('ERROR');
            console.log(jsonResponse.message);
            let res = {
              is_there_job: false,
            };
            resolve(res);
          } else {
            //check if new jobs
            if (jsonResponse.jobId) {
              console.log('New Job found');
              //Handler below
              let res = {
                is_there_job: true,
                job: jsonResponse,
              };
              resolve(res);
            } else {
              console.log('No jobs found...');
              let res = {
                is_there_job: false,
              };
              resolve(res);
            }
          }
        });
    });
  },
  update_job: function (extracted_info) {
    console.log('Updating Job Result... Payload:');
    console.log(extracted_info);
    return new Promise(function (resolve, reject) {
      fetch(API_ENDPOINTS.update_job, {
        // Adding method type
        method: 'POST',
        headers: {
          "Content-Type": 'application/json'},
        body: JSON.stringify(extracted_info),
      })
        .then((response) => response.json())
        .then((jsonResponse) => {
          console.log('Api JsonResponse: ');
          console.log(jsonResponse);
          resolve('success');
          // if (jsonResponse.message) {
          //   console.log('ERROR');
          //   console.log(jsonResponse.message);
          //   resolve("failure");
          // } else {
          //   if (jsonResponse.message) {
          //     console.log('Job Updated Successfully');
          //     resolve("success");
          //   } else {
          //     console.log('No jobs found...');
          //     resolve("failure");
          //   }
          // }
        })
        .catch((e) => {
          console.log(e);
          resolve('failure');
        });
    });
  },
};
 