'use strict';

import { API } from './api.js';
import { LS, null_field, click, scroll_to_bottom_page, scroll_to_last_job } from './constants.js';

console.log('Mr_Scraper - Linkedin content script injected');
let job_id;
async function startAutomation(rules) {
  console.log('Start Automation with rules: ');
  console.log(rules);
  let generalRules = [
    { property: 'company_name', rule: `span[dir='ltr']`, type: 'dom' },
    {
      property: 'Headline',
      rule: `.org-top-card-summary__tagline`,
      type: 'dom',
    },
    {
      property: 'followers',
      rule: `(?<= )[^A-Za-z]*(?= followers)`,
      type: 'regexp',
    },
    { property: 'overview', rule: `section.mb4 > .break-words`, type: 'dom' },
    { property: 'website', rule: `dd.mb4 > a`, type: 'dom' },
    {
      property: 'company_size_range',
      rule: `(?<=Company size\n).*(?= emplo)`,
      type: 'regexp',
    },
    {
      property: 'company_size_onLinkedin',
      rule: `(?<=\n).*(?= on LinkedIn \n)`,
      type: 'regexp',
    },
    { property: 'date_founded', rule: `(?<=\nFounded\n).*(?=\n)`, type: 'dom' },
    { property: 'locations', rule: `div.org-location-card > p`, type: 'dom' },
    {
      property: 'headquarter',
      rule: `(?<=Headquarters\n).*(?=\n)`,
      type: 'regexp',
    },
    {
      property: 'funding',
      rule: `[href^="https://www.crunchbase.com/"]`,
      type: 'dom',
    },
    {
      property: 'pages_people_also_viewed',
      rule: `//h3[text()='Pages people also viewed']`,
      type: 'multiple_dom',
    },
    {
      property: 'pages_people_also_follow',
      rule: `//h3[text()='People also follow']`,
      type: 'multiple_dom',
    },
    {
      property: 'company_posts',
      rule: `.scaffold-finite-scroll__content > div`,
      type: 'multiple_dom',
    },
  ];
  let extracted_info = {};
  let status;
  let uuid = await LS.getItem("uuid");
  try {
    for (let i = 0; i < rules.length; i++) {
      console.log('Rule: \n' + rules[i]);
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
      } else if (rules[i].property == 'pages_people_also_viewed') {
        console.log('Rule name: ' + rules[i].property);
        let extracted_value = extract_similar_pages(rules[i].rule);
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = extracted_value;
      } else if (rules[i].property == 'company_posts') {
        if (document.URL.includes('/posts/')) {
          console.log('Rule name: ' + rules[i].property);
          let extracted_value = extract_similar_pages(rules[i].rule);
          console.log('Extracted value: ' + extracted_value);
          extracted_info[rules[i].property] = extracted_value;
        } else {
          console.log('NOT on company/posts/ url, returning N/A');
          extracted_info[rules[i].property] = null_field;
        }
      }
    }
    status = "success";
  }
  catch (e) {
    console.log('ERROR: ' + e.message);
    status = "error";
  }
  console.log('Extracted info: \n', extracted_info);
  let payload = {
    "uuid": await LS.getItem('CE_uuid'),
    "job_id": job_id,
    "response": extracted_info,
    "status": status
  };
  API.update_job(payload);
}

function extract_querySelector(rule) {
  let interestedElement = document.querySelector(rule);
  if (interestedElement) {
    if (interestedElement.tagName == 'A') {
      return interestedElement.href;
    } else {
      return interestedElement.innerText;
    }
  } else return null_field;
}
function extract_regex(rule) {
  console.log('Inside regexp extraction rule: ' + rule);
  let doesElementExist = document.body.innerText.match(rule);
  if (doesElementExist) return document.body.innerText.match(rule)[0];
  else return null_field;
}
function extract_similar_pages(xpath) {
  console.log('Extracting by Xpath: ', xpath);
  let all_pages = [];
  let all_pages_people_also_viewed = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  if (all_pages_people_also_viewed) {
    console.log(
      'All pages_people_also_viewed exist, continuing with extraction'
    );
    all_pages_people_also_viewed =
      all_pages_people_also_viewed.singleNodeValue.parentElement.nextElementSibling.querySelectorAll(
        'li > div > a'
      );
    for (let i = 0; i < all_pages_people_also_viewed.length; i++) {
      console.log('Inside all pages loop...');
      let singlePage = {
        url: all_pages_people_also_viewed[i].href,
        name: all_pages_people_also_viewed[i].querySelector(
          '.artdeco-entity-lockup__title'
        ).innerText,
        followers: all_pages_people_also_viewed[i].querySelector(
          '.artdeco-entity-lockup__caption'
        ).innerText,
      };
      all_pages.push(singlePage);
    }
    return all_pages;
  } else return [null_field];
}

async function extract_single_social_post(post_to_extract, extracted_posts) {
  return new Promise(function (resolve, reject) {
    console.log(post_to_extract);
    let caption = post_to_extract.querySelector('.update-components-text')
      ? post_to_extract.querySelector('.update-components-text').innerText
      : null_field;
    let number_of_reactions = post_to_extract.querySelector(
      '.social-details-social-counts__reactions-count'
    )
      ? post_to_extract.querySelector(
          '.social-details-social-counts__reactions-count'
        ).innerText
      : null_field;
    let number_of_comments = post_to_extract.querySelector(
      '.social-details-social-counts__comments'
    )
      ? post_to_extract
          .querySelector('.social-details-social-counts__comments')
          .innerText.replace(/ comments | comment/, '')
          .match(/\d*/)[0]
      : null_field;
    let link_to_post;
    //Open dropdown for copy post link
    click(post_to_extract.querySelector('.feed-shared-control-menu__trigger'));
    let wait_for_menu_loaded = setInterval(() => {
      if (
        post_to_extract
          .querySelector('.feed-shared-control-menu__content')
          .querySelector('.option-share-via')
      ) {
        //If menu is open than click copy link
        console.log('CLicking copy link...');
        click(
          post_to_extract
            .querySelector('.feed-shared-control-menu__content')
            .querySelector('.option-share-via').firstElementChild
        );
        clearInterval(wait_for_menu_loaded);
        setTimeout(() => {
          navigator.clipboard.readText().then((clipText) => {
            link_to_post = clipText;
            extracted_posts.push({
              caption: caption,
              number_of_reactions: number_of_reactions,
              number_of_comments: number_of_comments,
              link_to_post: link_to_post,
            });
            resolve();
          });
        }, 1500);
      }
    }, 1000);
  });
}

async function extract_social_posts() {
  console.log('Extracting social posts...');
  let all_posts = document.querySelectorAll(
    `.scaffold-finite-scroll__content > div`
  );
  let extracted_posts = [];
  for (let i = 0; i < all_posts.length; i++) {
    await extract_single_social_post(all_posts[i], extracted_posts);
  }
  console.log('returning all_posts');
  console.log('Number of posts Extracted: ', extracted_posts.length);
  console.log(extracted_posts);
  let payload = {
    "uuid": await LS.getItem('CE_uuid'),
    "job_id": job_id,
    "response": extracted_posts,
    "status": "success"
  };
  API.update_job(payload);
}

async function fetch_page_jobs(extracted_jobs){
  // scroll to bottom of jobs container to get all the jobs in viewport
  scroll_to_last_job('artdeco-entity-lockup__title', '.');
  return new Promise(function (resolve, reject) {
    console.log("Let jobs scroll to last");

    setTimeout(function(){
      let all_jobs = document.querySelectorAll('.jobs-search-results__list-item');
      // loop over all the jobs available in a container
      for (let i = 0; i < all_jobs.length; i++) {
        var job_title = "";
        var job_location = "";
        var title_ele = all_jobs[i].querySelector('.job-card-list__title');
        var location_ele  = all_jobs[i].querySelector(".artdeco-entity-lockup__caption");
        if (title_ele !=null)
          job_title = title_ele.innerText.trim();

        if (location_ele !=null){
          job_location = location_ele.innerText.trim();
          if (job_location.indexOf("\n") != -1)
            job_location = job_location.replace("\n", " "); 
        }

        if (job_title.length){
          extracted_jobs.push({
            "job_title":job_title,
            "job_location":job_location,
          });
          resolve();     
        }
      }
    },10000);
  });
}

async function extract_all_jobs() {
  let extracted_jobs = [];
  // scroll to bottom of jobs container to see pagination element
  //scroll_to_last_job('jobs-search-results__list-item', '.');
  // check if pagination element exists or not
  let pagination_ele = document.querySelector(".jobs-search-results-list__pagination");
  console.log("IN PAG", pagination_ele);
  if (pagination_ele != null) {
    console.log("IN PAG NULL ");
    // means we have pagination ele
    let last_li_ele = pagination_ele.querySelector("li.artdeco-pagination__indicator:last-child");
    if (last_li_ele != null){
      var last_page = last_li_ele.getAttribute("data-test-pagination-page-btn");
      if (last_page){
        for (var j = 1; j < last_page; j++) {
          var job_start = (j - 1)*25;
          var current_url = document.URL;
          var next_job_url = "";
          if (current_url.indexOf("start") !== -1)
            next_job_url = current_url.split("start")[0].concat("start="+job_start);
          else
            next_job_url = current_url.concat("start="+job_start);
        }
      }
    }    
  }
  else{
    console.log("I M HERE");
    // we have only jobs on the current page
    await fetch_page_jobs(extracted_jobs);
    console.log("JON DSTA", extracted_jobs, extracted_jobs.length);
  }
}


extract_all_jobs()

//startAutomation();
if (document.URL.includes('?CEaewtoron=12345')) {
  if (document.URL.includes('/posts/')) {
    // scrape jobs here
    let job_exists = extract_regex(rules[i].rule);
    console.log('Extracted value: ' + extracted_value);

    setTimeout(() => {
      scroll_to_bottom_page();
    }, 3000);
    setTimeout(() => {
      chrome.runtime.sendMessage(
        { message: 'What are the extraction rules?' },
        (res) => {
          job_id = res.job_id;
          extract_social_posts()
        }
      );
    }, 5000);
  } else {
    chrome.runtime.sendMessage(
      { message: 'What are the extraction rules?' },
      (res) => {
        console.log('Background response: ');
        console.log(res);
        startAutomation(res.rules);
      }
    );
  }
}
