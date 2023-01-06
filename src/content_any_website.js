'use strict';

import { LS, null_field, click, scroll_to_bottom_page } from './constants.js';

console.log('💪Mr_Scraper - Any-Website content script injected💪');
let job_id;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.message == 'Next Review Page Extracted') {
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
  chrome.runtime.sendMessage(
    {
      message: 'Any-Website Extractor Completed the Job',
      extractedInfo: extracted_info,
    },
    (res) => {}
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
  if (document.URL.includes('?any-website')) {
    chrome.runtime.sendMessage(
      {
        message: 'What are the extraction rules for any-website?',
        scraper: 'Any Website',
        url: document.URL,
      },
      (res) => {
        console.log('Background response for jobs:');
        console.log(res);
        job_id = res.jobId;
        scroll_to_bottom_page();
        startAutomation(res.rules);
      }
    );
  }
}, 1000);
