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
    {
      property: 'top_rated_alternatives',
      rule: `div[class="paper paper--white paper--nestable paper--box"] > a`,
      type: 'multiple_dom',
    },
    {
      property: 'pricing_G2',
      rule: `tbody[class="editions__tbody"] > tr`,
      type: 'multiple_dom',
    },
    {
      property: 'features',
      rule: `div[class="grid-x grid-margin-x"]`,
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
    try {
      if (
        rules[i].type == 'dom' &&
        !(rules[i].property.includes('reviews_count') ||
          rules[i].property.includes('year_founded'))
      ) {
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
      } else if (rules[i].property == 'year_founded') {
        console.log('Rule type: ' + rules[i].type);
        let extracted_value = extract_querySelector(rules[i].rule);
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = parseInt(
          extracted_value.replace('Year Founded', '')
        );
      } else if (rules[i].property == 'reviews_count') {
        console.log('Rule type: ' + rules[i].type);
        let extracted_value = extract_querySelector(rules[i].rule);
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = parseInt(
          extracted_value.match(/\d*/)[0]
        );
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
        let extracted_value = await extract_user_ratings(rules[i].rule);
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = extracted_value;
      } else if (rules[i].property == 'top_rated_alternatives') {
        console.log('Rule name: ' + rules[i].property);
        let extracted_value = await extract_top_rated_alternatives(
          rules[i].rule
        );
        console.log('Extracted value: ' + extracted_value);
        extracted_info[rules[i].property] = extracted_value;
      }
    } catch {
      extracted_info[rules[i].property] = null_field;
    }
  }
  status = 'success';
  // } catch (e) {
  //   console.log('ERROR: ' + e.message);
  //   status = 'failure';
  // }
  console.log('Extracted info: \n', extracted_info);
  let payload = {
    uuid: await LS.getItem('CE_uuid'),
    job_id: job_id,
    response: extracted_info,
    status: status,
  };
  chrome.runtime.sendMessage(
    {
      message: 'Company Info on First Page Extracted',
      scraper: "G2",
      url: document.URL,
      extractedInfo: payload,
    },
    (res) => {
      // window.close()
      check_if_pricing_and_features_are_needed(rules);
    }
  );
}
function check_if_pricing_and_features_are_needed(rules) {
  if (rules.some((e) => e.property === 'pricing_G2')) {
    let pricingURL = document.URL.replace('/reviews', '/pricing').replace(
      '?CEaewtoron=12345',
      ''
    );
    window.open(pricingURL, 'extract_pricingG2');
  }
  if (rules.some((e) => e.property === 'features')) {
    let pricingURL = document.URL.replace('/reviews', '/features').replace(
      '?CEaewtoron=12345',
      ''
    );
    window.open(pricingURL, 'extract_features');
  }
  setTimeout(() => {
    window.open(
      document.URL.replace('?CEaewtoron=12345', ''),
      'scrape_all_reviews'
    );
    window.close();
  }, 5000);
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
function scrape_review_stars(review_element) {
  let old_stars = parseInt(
    review_element
      .querySelector('.stars')
      .getAttribute('class')
      .split(' ')[2]
      .match(/(?<=stars-).*/)[0]
  );
  //calculate new range for stars
  let OldRange = 10 - 1;
  let NewRange = 5 - 1;
  return (((old_stars - 1) * NewRange) / OldRange + 1).toFixed(1);
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
async function extract_user_ratings(rule) {
  let all_elements = document
    .querySelector(rule)
    .querySelectorAll('div[class="cell"]');
  console.log('Number of elements: ' + all_elements.length);
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
  console.log('Number of elements: ' + all_elements.length);
  let top_industries_represented = [];
  for (let i = 0; i < all_elements.length; i++) {
    top_industries_represented.push({
      link: all_elements[i].firstElementChild.href,
      name: all_elements[i].innerText,
    });
  }
  return top_industries_represented;
}

function extract_top_rated_alternatives(rule) {
  let all_elements = document.querySelectorAll(rule);
  console.log('Number of elements: ' + all_elements.length);
  let top_rated_alternatives = [];
  for (let i = 0; i < all_elements.length; i++) {
    let stars = scrape_review_stars(all_elements[i]);
    top_rated_alternatives.push({
      company_name:
        all_elements[i].querySelector('.col-2').firstElementChild.innerText,
      score: stars,
      link: all_elements[i].href,
      avatar_image_link: all_elements[i].querySelector('img').src,
    });
  }
  return top_rated_alternatives;
}

function extract_pricingG2(rule) {
  let date_of_last_update = document
    .querySelector('div[class="text-tiny"]')
    .innerText.match(/(?<=Pricing information was last updated on).*/)[0];
  let free_trial_available = document.querySelector(
    'svg[class="color-success mr-4th icon-checkmark-circle nessy-only"]'
  )
    ? true
    : false;
  let all_elements = document.querySelectorAll(rule);
  console.log('Number of elements: ' + all_elements.length);
  let pricingG2 = [];
  for (let i = 0; i < all_elements.length; i++) {
    let all_features_elements = all_elements[i].querySelectorAll('ul > li');
    console.log('All features elements: ' + all_features_elements.length);
    let all_features_for_the_price = [];
    for (let i = 0; i < all_features_elements.length; i++) {
      all_features_for_the_price.push(all_features_elements[i].innerText);
    }
    pricingG2.push({
      name: all_elements[i].querySelector('.editions__name').innerText,
      cost: all_elements[i].querySelector('.editions__pricing').innerText,
      features_of_this_plan: all_features_for_the_price,
    });
  }
  let all_pricing = {
    date_of_last_update: date_of_last_update,
    free_trial_available: free_trial_available,
    pricingG2: pricingG2,
  };
  return all_pricing;
}

function extract_features(rule) {
  let container = document.querySelector(rule);
  let summary_of_features = [];
  let all_elements = container.querySelectorAll('div.px-1 > ul');
  for (let i = 0; i < all_elements.length; i++) {
    let macro_area = all_elements[i].previousElementSibling.innerText;
    let all_related_features = [];
    let all_related_features_element = all_elements[i].querySelectorAll('li');
    for (let i = 0; i < all_related_features_element.length; i++)
      all_related_features.push(all_related_features_element[i].innerText);
    summary_of_features.push({
      macro_area: macro_area,
      all_related_features: all_related_features,
    });
  }
  let all_features_by_area = [];
  let all_containers_by_area = container.querySelector('.mb-3').childNodes;
  for (let i = 0; i < all_containers_by_area.length; i++) {
    let area = all_containers_by_area[i].querySelector('h2').innerText;
    let all_related_features = [];
    let all_related_features_elements =
      all_containers_by_area[i].querySelectorAll('tr');
    for (let i = 0; i < all_related_features_elements.length; i++) {
      let title =
        all_related_features_elements[i].querySelector('h3').innerText;
      let containers_reviews = all_related_features_elements[
        i
      ].querySelectorAll(
        '[class="product-mentioned-feature__cell product-mentioned-feature__cell--bottom-row"]'
      );
      let description = containers_reviews[0].innerText;
      let percentage = containers_reviews[1].firstChild.innerText;
      let reviews_number = containers_reviews[1].childNodes[1]
        ? containers_reviews[1].childNodes[1].innerText
        : null_field;
      all_related_features.push({
        title: title,
        description: description,
        percentage: percentage,
        reviews_number: reviews_number,
      });
    }
    let all_extracted_features = {
      area: area,
      all_related_features: all_related_features,
    };
    all_features_by_area.push(all_extracted_features);
  }
  return { summary_of_features, all_features_by_area };
}

if (
  document.URL.includes('/reviews?CEaewtoron=12345') &&
  document.querySelector('div[class="paper__bd paper__bd--multi"]')
) {
  //open all reviews page for extraction
  click(document.querySelector('div.grid-y'));
  chrome.runtime.sendMessage(
    { message: 'What are the extraction rules?', scraper: 'Main Page' },
    (res) => {
      console.log('Background response for jobs:');
      console.log(res);
      job_id = res.jobId;
      startAutomation(res.rules);
    }
  );
} else if (window.name == 'extract_pricingG2') {
  chrome.runtime.sendMessage(
    { message: 'What are the extraction rules?', scraper: 'Pricing G2' },
    (res) => {
      console.log('Background response for all rules:');
      console.log(res);
      let rule = res.rules.find((rule) => rule.property == 'pricing_G2');
      console.log('Found one pricing rule: ');
      console.log(rule);
      job_id = res.jobId;
      chrome.runtime.sendMessage(
        {
          message: 'Pricing Extracted',
          pricingG2: extract_pricingG2(rule.rule),
        },
        (res) => {}
      );
    }
  );
} else if (window.name == 'extract_features') {
  chrome.runtime.sendMessage(
    { message: 'What are the extraction rules?', scraper: 'Features' },
    (res) => {
      console.log('Background response for all rules:');
      console.log(res);
      let rule = res.rules.find((rule) => rule.property == 'features');
      console.log('Found one feature rule: ');
      console.log(rule);
      job_id = res.jobId;
      if (document.URL.includes('/features')) {
        chrome.runtime.sendMessage(
          {
            message: 'Features Extracted',
            features: extract_features(rule.rule),
          },
          (res) => {}
        );
      } else {
        chrome.runtime.sendMessage(
          {
            message: 'Features Extracted',
            features: 'No feature page found',
          },
          (res) => {}
        );
      }
    }
  );
}
