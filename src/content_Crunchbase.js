'use strict';

import { LS, null_field, click, scroll_to_bottom_page } from './constants.js';

console.log('💪Mr_Scraper - Crunchbase content script injected💪');
 
function intercept_request_for_company_info() {
  function interceptData() {
    var xhrOverrideScript = document.createElement('script');
    xhrOverrideScript.type = 'text/javascript';
    xhrOverrideScript.src = chrome.runtime.getURL('./injected_scripts/response_interceptor.js');
    document.head.prepend(xhrOverrideScript);
  }
  function checkForDOM() {
    if (document.body && document.head) {
      interceptData();
    } else {
      requestIdleCallback(checkForDOM);
    }
  }
  requestIdleCallback(checkForDOM);
}

function inject_script_search_company_by_name() {
  console.log("inject_script_search_company_by_name()")
  var xhrOverrideScript = document.createElement('script');
  xhrOverrideScript.type = 'text/javascript';
  xhrOverrideScript.src = chrome.runtime.getURL('./injected_scripts/search_company_by_name.js');
  document.head.prepend(xhrOverrideScript);
}

function inject_script_search_latest_companies() {
  console.log("inject_script_search_latest_companies()")
  var xhrOverrideScript = document.createElement('script');
  xhrOverrideScript.type = 'text/javascript';
  xhrOverrideScript.src = chrome.runtime.getURL('./injected_scripts/search_latest_companies.js');
  document.head.prepend(xhrOverrideScript);
}

function wait_for_main_page_load() {
    let wait_for_main_page_load = setInterval(() => {
      if (document.querySelector('grid-body')) {
        clearInterval(wait_for_main_page_load);
        chrome.runtime.sendMessage(
          { message: 'What to extract on Crunchbase?', scraper: 'Crunchbase' },
          (res) => {
            console.log('Background response for jobs:');
            console.log(res);
            let job = res.job;
            if (job.rules == 'company_to_search') inject_script_search_company_by_name();
            else inject_script_search_latest_companies()
          }
        );
      }
    }, 1000)
}

if (document.URL.includes('?CEaewtoron=12345')) {
  //ask background for type of job
  wait_for_main_page_load() 
}
