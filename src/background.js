'use strict';
import { API } from './api.js';
import { LS, notify, interval_check_new_job } from './constants.js';
const { v1: uuidv1 } = require('uuid');
import undom from 'undom';


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.message == "getClipboard") {
    sendResponse(getClipboard());
  }
});

async function start_linkedin_worker(url) {
  //Open url using tab name for activating content script and extract info
  window.open(
    url,
    'auto',
    'height=100,width=200',
    '_blank'
  );
  return new Promise((resolve, reject) => {
    console.log('start_linkedin_worker()');
    var extractionInterval = setInterval(function () {
      //wait for getting email
      if (window.localStorage.getItem('is extraction completed?') == 'true') {
        console.log('Company details fetched');
        clearInterval(extractionInterval);
        window.localStorage.setItem('is extraction completed?', 'false');
        resolve('Fetched');
      } else if (
        window.localStorage.getItem('is extraction completed?') == '404'
      ) {
        console.log('Company Linkedin page not found');
        window.localStorage.setItem('is extraction completed?', 'false');
        clearInterval(extractionInterval);
        resolve('404');
      }
      //All Contacts LISTED
      else {
        console.log('Company details not fetched yet, in loop...');
      }
    }, 3000);
  });
}
function getClipboard() {
  console.log('Getting clipboard...');
  let bg = undom();
  bg.document.body.innerHTML= ""; // clear the background page

  // add a DIV, contentEditable=true, to accept the paste action
  var helperdiv = bg.document.createElement("div");
  helperdiv.contentEditable = true;
  bg.appendChild(helperdiv);

  navigator.clipboard
  .readText()
  .then(
    (clipText) => (console.log(clipText))
  );
  // trigger the paste action
  // read the clipboard contents from the helperdiv
}
//Periodically check for new jobs
setInterval(async () => {
  let response = await API.check_for_new_job();
  if (response.is_there_job) {
    //handler for job
    console.log('Starting new job with id: ' + response.job.JobId);
    LS.setItem('CurrentJob', response.job);
    start_linkedin_worker(response.job.Url)
  }
}, interval_check_new_job);

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == 'install') {
    await LS.setItem('CE_uuid', uuidv1());
    notify(
      'Mr Scraper Installed Successfully',
      'Get started!',
      '../icons/icon_128.png'
    );
  }
});
