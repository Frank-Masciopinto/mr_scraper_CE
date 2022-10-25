'use strict';

import { LS, null_field, click, scroll_to_bottom_page } from './constants.js';

console.log('💪Mr_Scraper - G2 content script injected💪');
let job_id;
let all_reviews_STATE = [];
let all_reviews_pages_extracted = false;
let last_page_to_scrap;
// window.onload = function () {
//   var bodyList = document.querySelector('body');
//   var observer = new MutationObserver(function (mutations) {
//     mutations.forEach(function (mutation) {
//       if (
//         oldHref != document.location.href &&
//         !oldHref.includes('?CEaewtoron=12345')
//       ) {
//         oldHref = document.location.href;
//         console.log('Previous URL doesnt have parameters');
//         if (document.URL.includes('/jobs/search/')) {
//           let waitPageLoad = setInterval(() => {
//             if (document.querySelector('.jobs-search-results-list')) {
//               chrome.runtime.sendMessage(
//                 { message: 'What are the extraction rules?' },
//                 (res) => {
//                   if (res) {
//                     //If background waiting for extraction
//                     console.log('ASked for Job Id to background... Repsonse: ');
//                     console.log(res.jobId);
//                     job_id = res.jobId;
//                     extract_all_jobs();
//                   }
//                 }
//               );
//               clearInterval(waitPageLoad);
//             }
//           }, 2000);
//         }
//       } else if (oldHref != document.location.href) {
//         console.log('Mutation has different url from previous one...');
//         oldHref = document.location.href;
//       }
//     });
//   });

//   var config = {
//     childList: true,
//     subtree: true,
//   };

//   observer.observe(bodyList, config);
// };

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

// async function wait_for_all_pages_extractions() {
//   last_page_to_scrap = parseInt(
//     document
//       .querySelector('div[data-poison-omit] > ul > li:last-child > a')
//       .href.match(/(?<=\?page\=).*/)
//   );
//   return new Promise(function (resolve, reject) {
//     let wait_for_all_pages_extractions = setInterval(() => {
//       if (all_reviews_pages_extracted) {
//         console.log('📪 All pages have been extracted');
//         clearInterval(wait_for_all_pages_extractions);
//         resolve(true);
//       }
//       else {
//         console.log('🕒 Still waiting for all pages to be extracted 🕒');
//       }
//     }, 3000);
//   });
// }
startAutomation('t');
async function startAutomation(rules) {
  console.log('Start Automation with rules: ');
  console.log(rules);
  rules = [
    {
      property: 'company_name',
      rule: `div.product-head__title > div`,
      type: 'dom',
    },
    {
      property: 'average_rating ',
      rule: `meta[value*="⭐"]`,
      type: 'dom',
    },
    {
      property: 'reviews_count',
      rule: `li.list--piped__li > a.js-log-click`,
      type: 'dom',
    },
    {
      property: 'company_description',
      rule: `[itemprop="description"]`,
      type: 'dom',
    },
    {
      property: 'languages_supported',
      rule: `.icon-globe + div`,
      type: 'dom',
    },
    {
      property: 'product_description',
      rule: `.grid-x + div.hide > p`,
      type: 'dom',
    },
    {
      property: 'position_against_competitors',
      rule: `.grid-x + div.hide + div.hide > p:nth-of-type(2)`,
      type: 'dom',
    },
    {
      property: 'website',
      rule: `.icon-website + div > a`,
      type: 'dom',
    },
    {
      property: 'year_founded',
      rule: `.flex > .icon-calendar + div`,
      type: 'dom',
    },
    {
      property: 'hq_location',
      rule: `.flex > .icon-location_pin + div`,
      type: 'dom',
    },
    {
      property: 'twitter',
      rule: `(?<=Twitter<\/div>).*?(?=<br)`,
      type: 'regexp_innerHTML',
    },
    {
      property: 'linkedin_url',
      rule: `.flex > .icon-linkedin + div > a`,
      type: 'dom',
    },
    {
      property: 'videos',
      rule: `[data-equalizer-watch="video"]`,
      type: 'multiple_dom',
    },
    {
      property: 'official_screenshots',
      rule: `a[ue="colorbox"]`,
      type: 'multiple_dom',
    },
    {
      property: 'official_downloads',
      rule: `div.cell.text-center > a`,
      type: 'multiple_dom',
    },
    {
      property: 'recap_votes',
      rule: `.f-3`,
      type: 'multiple_dom',
    },
    {
      property: 'video_reviews',
      rule: `a[href*="/survey_responses/"] > img.x-deferred-image-initialized`,
      type: 'multiple_dom',
    },
    {
      property: 'top_industries_represented',
      rule: `h5 + div[data-chart-doughnut-options]`,
      type: 'multiple_dom',
    },
    {
      property: 'user_ratings',
      rule: `div.grid-y`,
      type: 'multiple_dom',
    },
    {
      property: 'categories_on_G2',
      rule: `div[data-test-id="product"]`,
      type: 'multiple_dom',
    },
  ];
  console.log(JSON.stringify(rules));
  let extracted_info = {};
  let status;
  let uuid = await LS.getItem('uuid');
  // try {
  for (let i = 0; i < rules.length; i++) {
    console.log('Rule: \n' + rules[i].property);
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
    } else if (rules[i].property == 'videos') {
      console.log('Rule property: ' + rules[i].property);
      let extracted_value = extract_all_videos(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'recap_votes') {
      console.log('Rule property: ' + rules[i].property);
      let extracted_value = extract_recap_votes(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'official_downloads') {
      console.log('Rule property: ' + rules[i].property);
      let extracted_value = extract_official_downloads(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'official_screenshots') {
      console.log('Rule property: ' + rules[i].property);
      let extracted_value = extract_official_screenshots(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].type == 'regexp_innerHTML') {
      console.log('Rule type: ' + rules[i].type);
      let extracted_value = extract_regex_innerhtml(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'average_rating') {
      console.log('Rule name: ' + rules[i].property);
      let extracted_value = extract_average_rating(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'video_reviews') {
      console.log('Rule name: ' + rules[i].property);
      let extracted_value = extract_video_reviews(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'top_industries_represented') {
      console.log('Rule name: ' + rules[i].property);
      let extracted_value = extract_top_industries_represented(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'categories_on_G2') {
      console.log('Rule name: ' + rules[i].property);
      let extracted_value = extract_categories_on_G2(rules[i].rule);
      console.log('Extracted value: ' + extracted_value);
      extracted_info[rules[i].property] = extracted_value;
    } else if (rules[i].property == 'user_ratings') {
      console.log('Rule name: ' + rules[i].property);
      await click(document.querySelector(rules[i].rule));
      setTimeout(() => {
        let extracted_value = extract_user_ratings(rules[i].rule);
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = extracted_value;
      }, 500);
    }
  }
  status = 'success';
  // } catch (e) {
  //   console.log('ERROR: ' + e.message);
  //   status = 'failure';
  // }
  console.log('Extracted info: \n', extracted_info);
  console.log('Waiting for all reviews pages extraction...');
  let payload = {
    uuid: await LS.getItem('CE_uuid'),
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
  // API.update_job(payload).then(() => {
  //   notify_background_extraction_completed();
  // });
  console.log(payload);
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

function extract_average_rating(rule) {
  console.log('Inside extract_average_rating... extraction rule: ' + rule);
  let doesElementExist = document.querySelector(rule);
  if (doesElementExist)
    return doesElementExist.getAttribute('value').match(/.*(?= )/)[0];
  else return null_field;
}

function extract_all_videos(rule) {
  let all_videos_elements = document.querySelectorAll(rule);
  let all_videos = [];
  for (let i = 0; i < all_videos_elements.length; i++) {
    all_videos.push(
      JSON.parse(all_videos_elements[i].getAttribute('data-video')).embed_url
    );
  }
  return all_videos;
}

function extract_recap_votes(rule) {
  let all_elements = document.querySelectorAll(rule);
  let all_recap_votes = {
    '5_Stars_Votes': all_elements[0].innerText,
    '4_Stars_Votes': all_elements[1].innerText,
    '3_Stars_Votes': all_elements[2].innerText,
    '2_Stars_Votes': all_elements[3].innerText,
    '1_Star_Votes': all_elements[4].innerText,
  };
  return all_recap_votes;
}

function extract_video_reviews(rule) {
  console.log('extract_video_reviews');
  let all_elements = document.querySelectorAll(rule);
  let all_video_reviews = [];
  for (let i = 0; i < all_elements.length; i++) {
    let reviewer_name =
      all_elements[i].parentElement.parentElement.parentElement
        .previousElementSibling.childNodes[1].innerText;
    let image_link = all_elements[i].src;
    let caption =
      all_elements[i].parentElement.parentElement.parentElement.innerText;
    let video_link = all_elements[i].parentElement.href;
    let old_stars = parseInt(
      all_elements[i].parentElement.parentElement.parentElement
        .querySelector('.stars')
        .getAttribute('class')
        .match(/(?<=stars-).*/)[0]
    );
    //calculate new range for stars
    let OldRange = 10 - 1;
    let NewRange = 5 - 1;
    let stars = ((old_stars - 1) * NewRange) / OldRange + 1;

    all_video_reviews.push({
      reviewer_name: reviewer_name,
      image_link: image_link,
      caption: caption,
      video_link: video_link,
      stars: stars.toFixed(1),
    });
  }
  return all_video_reviews;
}

function extract_official_screenshots(rule) {
  let all_elements = document.querySelectorAll(rule);
  let all_official_screenshots = [];
  for (let i = 0; i < all_elements.length; i++) {
    let caption = all_elements[i].getAttribute('data-colorbox-description');
    let link = all_elements[i].href;
    all_official_screenshots.push({
      caption: caption,
      url: link,
    });
  }
  return all_official_screenshots;
}

function extract_official_downloads(rule) {
  let all_elements = document.querySelectorAll(rule);
  let all_official_downloads = [];
  for (let i = 0; i < all_elements.length; i++) {
    let title = all_elements[i].innerHTML.match(/(?<=alt\=\").*?(?=\" )/)[0];
    let download_link = all_elements[i].href;
    let image_url = all_elements[i].querySelector('img').src;
    all_official_downloads.push({
      title: title,
      download_link: download_link,
      image_url: image_url,
    });
  }
  return all_official_downloads;
}
function extract_top_industries_represented(rule) {
  let all_elements = document
    .querySelector(rule)
    .parentElement.querySelectorAll('div.d-f.jc-sb');
  let top_industries_represented = [];
  for (let i = 0; i < all_elements.length; i++) {
    let title = all_elements[i].childNodes[0].innerText;
    let number = all_elements[i].childNodes[1].innerText;
    top_industries_represented.push({
      title: title,
      number: number,
    });
  }
  return top_industries_represented;
}
function extract_user_ratings(rule) {
  let all_elements = document.querySelector(rule).querySelectorAll('div.cell');
  let top_industries_represented = [];
  for (let i = 0; i < all_elements.length; i++) {
    let chart_rating = all_elements[i].querySelector(
      'div.charts--doughnut__reviews'
    ).innerText;
    let all_text = all_elements[i].querySelector('.small-7').innerText;
    let title = all_text.split('\n')[0];
    let category = all_elements[i]
      .querySelector('.small-7')
      .innerText.split('\n')[1]
      .split('Average:')[0];
    let average_rating = all_elements[i]
      .querySelector('.small-7')
      .innerText.split('\n')[1]
      .split('Average:')[1];

    top_industries_represented.push({
      title: title,
      chart_rating: chart_rating,
      category: category,
      average_rating: average_rating,
    });
  }
  return top_industries_represented;
}
function extract_categories_on_G2(rule) {
  let all_elements = document.querySelector(rule).childNodes;
  let top_industries_represented = [];
  for (let i = 0; i < all_elements.length; i++) {
    top_industries_represented.push(all_elements[i].innerText);
  }
  return top_industries_represented;
}

if (document.URL.includes('?CEaewtoron=12345')) {
  //open all reviews page for extraction
  //window.open(document.URL.replace('?CEaewtoron=12345', ""), 'scrape_all_reviews');
  chrome.runtime.sendMessage(
    { message: 'What are the extraction rules?' },
    (res) => {
      console.log('Background response for jobs:');
      console.log(res);
      job_id = res.jobId;
      startAutomation(res.rules);
    }
  );
}
