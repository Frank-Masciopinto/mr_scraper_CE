import { API_ENDPOINTS, LS } from './constants.js';

export var API = {
  check_for_new_job: function () {
    console.log('Checking for new Jobs...');
    return new Promise(async function (resolve, reject) {
      let LS_loggedIn_Apps = await LS.getItem('loggedIn_Apps');
      let params = '';
      for (let i = 0; i < LS_loggedIn_Apps.length; i++) {
        params = params.concat('&', LS_loggedIn_Apps[i], '=true');
      }
      console.log(
        (await LS.getItem('API_Endpoint')) +
          API_ENDPOINTS.check_for_new_job +
          (await LS.getItem('CE_uuid')) +
          params
      );
      fetch(
        (await LS.getItem('API_Endpoint')) +
          API_ENDPOINTS.check_for_new_job +
          (await LS.getItem('CE_uuid')) +
          params,
        {
          // Adding method type
          method: 'POST',
        }
      )
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
        })
        .catch((err) => console.log("❌ ", err));
    });
  },
  update_job: function (extracted_info) {
    console.log('Updating Job Result... Payload:');
    console.log(extracted_info);
    return new Promise(async function (resolve, reject) {
      fetch((await LS.getItem('API_Endpoint')) + API_ENDPOINTS.update_job, {
        // Adding method type
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extracted_info),
      })
        .then((response) => response.json())
        .then((jsonResponse) => {
          console.log('Api JsonResponse: ');
          console.log(jsonResponse);
          resolve('success');
        })
        .catch((e) => {
          console.log(e);
          resolve('failure');
        });
    });
  },
};
