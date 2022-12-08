'use strict';
import { API } from './api.js';
import { LS, notify, interval_check_new_job } from './constants.js';
const { v1: uuidv1 } = require('uuid');
//test current job for api problem
let currentJob = {
  JobId: 666,
  Url: 'https://www.binance.com/en/blog',
  Rules: [
    {
      property: 'title',
      rule: 'title',
      type: 'dom',
    },
  ],
  WithNetwork: true,
  WithNetworkPayload: ['/authcenter/auth', '/configs/header/'],
};
let all_reviews_STATE = [];
let ready_for_network_interceptions = false;
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('💌 Message Received 💌');
  console.log(request);
  if (request.message == 'What are the extraction rules?') {
    console.log('currentJob:');
    console.log(currentJob);
    sendResponse({
      rules: JSON.parse(currentJob.rules),
      jobId: currentJob.jobId,
    });
  } else if (request.message == 'Extraction Completed') {
    await LS.setItem('is extraction completed?', true);
    sendResponse('Done');
    chrome.tabs.remove(sender.tab.id);
  } else if (request.message == 'Pricing Extracted') {
    console.log('👉updating extracted info state with G2 Pricing information');
    await LS.setItem('Pricing Extracted', true);
    let company_extracted_info = await LS.getItem('Company Extracted Info');
    company_extracted_info.response.pricing_G2 = request.pricingG2;
    console.log(company_extracted_info);
    await LS.setItem('Company Extracted Info', company_extracted_info);
    chrome.tabs.remove(sender.tab.id);
    sendResponse('Done');
  } else if (request.message == 'Features Extracted') {
    console.log('👉updating extracted info state with G2 Features information');
    await LS.setItem('Features Extracted', true);
    let company_extracted_info = await LS.getItem('Company Extracted Info');
    company_extracted_info.response.features = request.features;
    console.log(company_extracted_info);
    await LS.setItem('Company Extracted Info', company_extracted_info);
    chrome.tabs.remove(sender.tab.id);
    sendResponse('Done');
  } else if (request.message == 'Next Review Page Extracted') {
    all_reviews_STATE = [...all_reviews_STATE, ...request.reviews];
    console.log('Updating review state...');
    console.log(all_reviews_STATE);
    if (request.is_last_page) {
      console.log('Last page detected, calling API');
      let company_extracted_info = await LS.getItem('Company Extracted Info');
      company_extracted_info.response.all_reviews = all_reviews_STATE;
      API.update_job(company_extracted_info).then(async () => {
        await LS.setItem('is extraction completed?', true);
      });
    }
    sendResponse('Done');
  } else if (request.message == 'Company Info on First Page Extracted') {
    console.log('Setting up first extracted info...');
    await LS.setItem('Company Extracted Info', request.extractedInfo);
    //check if one of the rules is pricing than open the pricing page
  } else if (request.message == 'Any-Website Extractor Completed the Job') {
    console.log('Checking if job requires network request interception...');
    await LS.setItem('Any-Website Extracted Info', request.extractedInfo);
    ready_for_network_interceptions = true;
  } else if (
    request.message == 'What are the extraction rules for any-website?'
  ) {
    // console.log('currentJob:');
    // console.log(currentJob);
    // sendResponse({
    //   rules: JSON.parse(currentJob.rules),
    //   jobId: currentJob.jobId,
    // });
    sendResponse({
      rules: [
        {
          property: 'title',
          rule: 'title',
          type: 'dom',
        },
      ],
      jobId: 666,
    });
  } else if (request.message == 'What to extract on Crunchbase?') {
    console.log('currentJob:');
    console.log(currentJob);
    sendResponse({
      job: currentJob,
    });
  }
});

chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    console.log('🔰 Message From Injected Script 🔰');
    console.log(request);
    if (request.message == 'Crunchbase Request Response') {
      console.log(request.crunchbase_response);
      sendResponse('done');
    } else if (
      request.message ==
      'What is the company name I need to search for on Crunchbase?'
    ) {
      let companyName = encodeURIComponent(
        currentJob.url.match(/(?<=\?company_name=).*/)[0]
      );
      sendResponse({ companyName: companyName });
    } else if (
      request.message == 'How many days in the past should I search?'
    ) {
      let number_of_days = currentJob.url.match(/(?<=\?number_of_days=).*/)[0];
      sendResponse({ number_of_days: number_of_days });
    } else if (
      request.message == 'SearchByCompanyName Extraction completed successfully'
    ) {
      let payload = {
        uuid: await LS.getItem('CE_uuid'),
        job_id: currentJob.jobId,
        response: request.all_companies,
        status: 'success',
      };
      API.update_job(payload).then(async () => {
        await LS.setItem('is extraction completed?', true);
        sendResponse('Done');
        chrome.tabs.remove(sender.tab.id);
      });
    } else if (
      request.message == 'Response Interceptor Injected and Active on this tab'
    ) {
      await LS.setItem(
        'TabID where Response Interceptor is Active',
        sender.tab.id
      );
    }
  }
);

function waitForInterceptingNetworkRequests() {
  console.log('🕙 Waiting for Intercepting network requests LOOP ...');
  let waitingInterval = setInterval(() => {}, 1000);
}

chrome.runtime.onConnectExternal.addListener(function (port) {
  let wait_for_extraction_completed = setInterval(async () => {
    if (ready_for_network_interceptions) {
      console.log(
        'Ready for network interception... Checking if WithNetwork is True'
      );
      console.log(currentJob.WithNetwork);
      if (currentJob.WithNetwork) {
        clearInterval(wait_for_extraction_completed);
        port.postMessage({
          message: 'New Job for Request Interceptor',
          WithNetworkPayload: currentJob.WithNetworkPayload,
        });
        waitForInterceptingNetworkRequests();
      } else {
        clearInterval(wait_for_extraction_completed);
        let payload = {
          uuid: await LS.getItem('CE_uuid'),
          job_id: currentJob.jobId,
          response: await LS.getItem('Any-Website Extracted Info'),
          status: 'success',
        };
        API.update_job(payload).then(async () => {
          await LS.setItem('is extraction completed?', true);
        });
      }
    }
  }, 2000);
  port.onMessage.addListener(async function (request) {
    console.log(
      'Received a long-lived connection message from external script'
    );
    console.log(request);
    if (request.message == 'Request Responses Intercepted') {
      let extracted_info = await LS.getItem('Any-Website Extracted Info');
      extracted_info.networkConnections = request.WithNetworkUrls;
      extracted_info.networkPayload = request.WithNetworkPayload;
      //Saved responses and send back to api to close job
      let payload = {
        uuid: await LS.getItem('CE_uuid'),
        job_id: currentJob.JobId,
        response: extracted_info,
        status: 'success',
      };
      API.update_job(payload).then(async () => {
        await LS.setItem('is extraction completed?', true);
      });
    }
  });
});

async function start_linkedin_worker(url) {
  //Open url using tab name for activating content script and extract info
  console.log('Opening url: ' + url);
  await LS.setItem('currently extracting', true);
  chrome.tabs.create({ url: url + '?CEaewtoron=12345' });
  return new Promise((resolve, reject) => {
    console.log('start_linkedin_worker()');
    var extractionInterval = setInterval(async function () {
      //wait for getting email
      if ((await LS.getItem('is extraction completed?')) == true) {
        console.log('Company details fetched');
        clearInterval(extractionInterval);
        await LS.setItem('is extraction completed?', false);
        resolve('Fetched');
      } else if ((await LS.getItem('is extraction completed?')) == 404) {
        console.log('Company Linkedin page not found');
        await LS.setItem('is extraction completed?', false);
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
async function start_any_website_worker(url) {
  //Open url using tab name for activating content script and extract info
  console.log('start_any_website_worker Opening url: ' + url);
  await LS.setItem('currently extracting', true);
  chrome.tabs.create({ url: url });
  return new Promise((resolve, reject) => {
    var extractionInterval = setInterval(async function () {
      //wait for getting email
      if ((await LS.getItem('is extraction completed?')) == true) {
        console.log('Any-Website details fetched');
        clearInterval(extractionInterval);
        await LS.setItem('is extraction completed?', false);
        resolve('Fetched');
      } else if ((await LS.getItem('is extraction completed?')) == 404) {
        console.log('Any-Website 404 not found');
        await LS.setItem('is extraction completed?', false);
        clearInterval(extractionInterval);
        resolve('404');
      }
      //All Contacts LISTED
      else {
        console.log('Any-Website details not fetched yet, in loop...');
      }
    }, 3000);
  });
}

async function start_crunchbase_worker(job) {
  //Open url using tab name for activating content script and extract info
  console.log('start_crunchbase_worker() 🦄');
  await LS.setItem('currently extracting', true);
  chrome.tabs.create({ url: job.url + '?CEaewtoron=12345' });
  return new Promise((resolve, reject) => {
    var extractionInterval = setInterval(async function () {
      //wait for getting email
      if ((await LS.getItem('is extraction completed?')) == true) {
        console.log('🔚 All Companies details fetched and sent to API...');
        clearInterval(extractionInterval);
        await LS.setItem('is extraction completed?', false);
        resolve('Fetched');
      } else if ((await LS.getItem('is extraction completed?')) == 404) {
        console.log('Company Crunchbase page not found');
        await LS.setItem('is extraction completed?', false);
        clearInterval(extractionInterval);
        resolve('404');
      }
      //All Contacts LISTED
      else {
        console.log(
          '🦄 Company details not fetched yet, Crunchbase in loop...'
        );
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
      console.log(response.job);
      await LS.setItem('CurrentJob', response.job);
      currentJob = response.job;
      if (currentJob.rules.includes('company_to_search'))
        await start_crunchbase_worker(currentJob);
      else if (currentJob.url.includes('?any-website')) {
        await start_any_website_worker(currentJob.url);
      } else await start_linkedin_worker(currentJob.url);
    } else {
      await LS.setItem('currently extracting', false);
      console.log('No Job found... Waiting 30 minutes before next call...');
      break;
    }
  }
}
setTimeout(() => {
  checkJobInterval();
}, 200);

async function checkJobInterval() {
  let interval_check_new_job = await LS.getItem('getJob_interval');
  console.log(interval_check_new_job);
  checkJobLoop()
  //Periodically check for new jobs if previous extraction loop is not running
  setInterval(async () => {
    if (!(await LS.getItem('currently extracting'))) checkJobLoop();
  }, interval_check_new_job);
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == 'install') {
    await LS.setItem('CE_uuid', uuidv1());
    await LS.setItem('getJob_interval', 1800000);
    await LS.setItem('API_Endpoint', "https://api.saascafe.io/");
    await LS.setItem('loggedIn_Apps', []);
    notify(
      'Mr Scraper Installed Successfully',
      'Get started!',
      '../icons/icon_128.png'
    );
  }
});
