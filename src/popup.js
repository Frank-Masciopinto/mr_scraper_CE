'use strict';
import { LS, optionPageURL } from './constants.js';

let LS_uuid;
let LS_loggedIn_Apps;
let LS_API_Endpoint;
let LS_getJob_interval;
async function fetch_state() {
  LS_uuid = await LS.getItem('CE_uuid');
  LS_API_Endpoint = await LS.getItem('API_Endpoint');
  LS_getJob_interval = await LS.getItem('getJob_interval');
  LS_loggedIn_Apps = await LS.getItem('loggedIn_Apps');
  LS_loggedIn_Apps = LS_loggedIn_Apps ? LS_loggedIn_Apps : []
  return;
}
//checkboxes visibility
var checkList = document.getElementById('list1');
checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
  if (checkList.classList.contains('visible'))
    checkList.classList.remove('visible');
  else checkList.classList.add('visible');
};
fetch_state().then((res) => {
  //populate fields and table in popup
  let uuidInput = document.getElementById('uuid');
  uuidInput.value = LS_uuid ? LS_uuid : '';
  uuidInput.addEventListener('change', async (event) => {
    await LS.setItem('CE_uuid', uuidInput.value.trim());
    uuidInput.value = uuidInput.value.trim()
  });
  let api_endpoint_Input = document.getElementById('api-endpoint');
  api_endpoint_Input.value = LS_API_Endpoint ? LS_API_Endpoint : '';
  api_endpoint_Input.addEventListener('change', async (event) => {
    await LS.setItem('API_Endpoint', api_endpoint_Input.value.trim());
    api_endpoint_Input.value = api_endpoint_Input.value.trim()
  });
  console.log("GetJob Interval Saved in LS: ")
  console.log(LS_getJob_interval)
  let getJob_interval_Input = document.getElementById('job-interval');
  getJob_interval_Input.value = LS_getJob_interval ? LS_getJob_interval / 1000 : '';
  getJob_interval_Input.addEventListener('change', async (event) => {
    await LS.setItem('getJob_interval', getJob_interval_Input.value * 1000);
  });
  console.log("LoggedIn Apps: ")
  console.log(LS_loggedIn_Apps);
  for (let i = 0; i <LS_loggedIn_Apps.length; i++) {
    var checkbox = document.querySelector(`input[type=checkbox][name=${LS_loggedIn_Apps[i]}]`);
    checkbox.checked = true;
  };
  var checkboxes = document.querySelectorAll('input[type=checkbox]');
  let enabledSettings = [];
  // Use Array.forEach to add an event listener to each checkbox.
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', async function () {
      enabledSettings = Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
        .filter((i) => i.checked) // Use Array.filter to remove unchecked checkboxes.
        .map((i) => i.getAttribute('name')); // Use Array.map to extract only the checkbox values from the array of objects.
      await LS.setItem('loggedIn_Apps', enabledSettings);
      console.log(enabledSettings);
    });
  });
});
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
