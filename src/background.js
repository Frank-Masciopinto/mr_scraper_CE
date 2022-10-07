'use strict';
import { API } from './api.js';
import { LS, notify, interval_check_new_job } from './constants.js';
const { v1: uuidv1 } = require('uuid');
import undom from 'undom';

let currentJob;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.message == 'What are the extraction rules?') {
    console.log("currentJob:")
    console.log(currentJob);
    sendResponse({ rules: JSON.parse(currentJob.rules)});
  }
});

async function start_linkedin_worker(url) {
  //Open url using tab name for activating content script and extract info
  chrome.tabs.create({url: url + "?CEaewtoron=12345"});
  return new Promise((resolve, reject) => {
    console.log('start_linkedin_worker()');
    var extractionInterval = setInterval(async function () {
      //wait for getting email
      if (await LS.getItem('is extraction completed?') == 'true') {
        console.log('Company details fetched');
        clearInterval(extractionInterval);
        await LS.setItem('is extraction completed?', 'false');
        resolve('Fetched');
      } else if (
        await LS.getItem('is extraction completed?') == '404'
      ) {
        console.log('Company Linkedin page not found');
        await LS.setItem('is extraction completed?', 'false');
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

async function checkJobLoop() {
  while (true) {
    let response = await API.check_for_new_job();
    if (response.is_there_job) {
      //handler for job
      console.log('Starting new job with id: ' + response.job.jobId);
      await LS.setItem('CurrentJob', response.job);
      currentJob = response.job;
      await start_linkedin_worker(response.job.url);
    } else {
      console.log('No Job found... Waiting 30 minutes before next call...');
      break;
    }
  }
}
checkJobLoop();
//Periodically check for new jobs
setInterval(async () => {
  checkJobLoop();
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
