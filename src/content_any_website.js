'use strict';

import { LS, null_field, click, scroll_to_bottom_page } from './constants.js';

console.log('💪Mr_Scraper - G2 content script injected💪');
let job_id;
let all_reviews_STATE = [];
let all_reviews_pages_extracted = false;
let last_page_to_scrap;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.message == 'Next Review Page Extracted') {
    all_reviews_STATE = [...all_reviews_STATE, ...request.reviews];
    console.log('Next Review Page Extracted... 💻Updating state...');
    console.log(all_reviews_STATE);
    if (request.page_number == last_page_to_scrap) {
      all_reviews_pages_extracted = true;
      sendResponse('Last Page Extracted, Close window');
    } else sendResponse('Done');
  }
});

async function startAutomation(rules) {
  console.log('Start Automation with rules: ');
  console.log(rules);
  let extracted_info = {};
  let status;
  let uuid = await LS.getItem('uuid');
  // try {
  for (let i = 0; i < rules.length; i++) {
    console.log('Rule: \n' + rules[i].property);
    try {
      if (rules[i].type == 'dom') {
        console.log('Rule type: ' + rules[i].type);
        let extracted_value = extract_querySelector(rules[i].rule);
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = extracted_value;
      } else if (rules[i].type == 'regexp') {
        console.log('Rule type: ' + rules[i].type);
        let extracted_value = extract_regex(rules[i].rule);
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = extracted_value;
      }
    } catch {
      extracted_info[rules[i].property] = null_field;
    }
  }
  status = 'success';
  console.log('Extracted info: \n', extracted_info);
  let payload = {
    uuid: uuid,
    job_id: job_id,
    response: extracted_info,
    status: status,
  };
  chrome.runtime.sendMessage(
    {
      message: 'Company Info on First Page Extracted',
      extractedInfo: payload,
    },
    (res) => {
      // window.close()
    }
  );
}

function extract_querySelector(rule) {
  let interestedElement = document.querySelector(rule);
  if (interestedElement) {
    if (interestedElement.getAttribute('itemprop') == 'url') {
      return interestedElement.href;
    } else if (interestedElement.getAttribute('href') == 'linkedin.com') {
      return interestedElement.href;
    } else if (interestedElement.getAttribute('name') == 'twitter:data2') {
      return interestedElement.getAttribute('value').match(/.*(?= )/)[0];
    } else return interestedElement.innerText;
  } else return null_field;
}
function extract_regex(rule) {
  console.log('Inside regexp extraction rule: ' + rule);
  let doesElementExist = document.body.innerText.match(rule);
  if (doesElementExist) return document.body.innerText.match(rule)[0];
  else return null_field;
}
function extract_regex_innerhtml(rule) {
  console.log('Inside regexp extraction rule: ' + rule);
  let doesElementExist = document.body.innerHTML.match(rule);
  if (doesElementExist) return doesElementExist[0];
  else return null_field;
}

setTimeout(() => {
  chrome.runtime.sendMessage(
    { message: 'What are the extraction rules for any-website?', scraper: 'Any Website', url: document.URL },
    (res) => {
      console.log('Background response for jobs:');
      console.log(res);
      job_id = res.jobId;
      startAutomation(res.rules);
    }
  );
}, 1000);
