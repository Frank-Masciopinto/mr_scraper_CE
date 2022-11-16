'use strict';
import { LS, optionPageURL } from './constants.js';

let LS_uuid;
async function fetch_state() {
  LS_uuid = await LS.getItem('CE_uuid');
  return;
}

fetch_state()
  .then((res) => {//populate fields and table in popup
    console.log(LS_uuid);
    let uuidInput = document.getElementById('uuid');
    uuidInput.value = LS_uuid ? LS_uuid : '';
    uuidInput.addEventListener('change', async (event) => {
      await LS.setItem('CE_uuid', uuidInput.value);
    });
  })
  function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }