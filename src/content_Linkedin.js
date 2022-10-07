'use strict';

import { LS, null_field, click, scroll_to_bottom_page } from './constants.js';

console.log('Mr_Scraper - Content Script Injected');

function startAutomation() {
  let rules = [
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
  for (let i = 0; i < rules.length; i++) {
    console.log('Rule: \n' + rules[i].rule);
    extracted_info[rules[i].property] = document.querySelector(
      rules[i].rule
    ).innerText;
  }
  console.log('Extracted info: \n', extracted_info);
}

function extract_querySelector(rule) {
  let interestedElement = document.querySelector(rule);
  if (interestedElement.tagName == 'A') {
    return interestedElement.href;
  } else {
    return interestedElement.innerText;
  }
}
function extract_regex(rule) {
  return document.body.innerText.match(rule)[0];
}
function extract_similar_pages(xpath) {
  let all_pages = [];
  let all_pages_people_also_viewed = document
    .evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue.parentElement.nextElementSibling.querySelectorAll(
      'li > div > a'
    );
  for (let i = 0; i < all_pages_people_also_viewed.length; i++) {
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
}

async function extract_single_social_post(post_to_extract, extracted_posts) {
  return new Promise(function(resolve, reject) {
    console.log(post_to_extract);
    let caption = post_to_extract.querySelector('.update-components-text')
      ? post_to_extract.querySelector('.update-components-text').innerText
      : null_field;
    let number_of_reactions = post_to_extract.querySelector(
      '.social-details-social-counts__reactions-count'
    )
      ? post_to_extract.querySelector('.social-details-social-counts__reactions-count')
          .innerText
      : null_field;
    let number_of_comments = post_to_extract.querySelector(
      '.social-details-social-counts__comments'
    )
      ? post_to_extract
          .querySelector('.social-details-social-counts__comments')
          .innerText.replace(/ comments | comment/, '').match(/\d*/)[0]
      : null_field;
    let link_to_post;
    //Open dropdown for copy post link
    click(post_to_extract.querySelector('.feed-shared-control-menu__trigger'));
    let wait_for_menu_loaded = setInterval(() => {
      if (post_to_extract
        .querySelector('.feed-shared-control-menu__content')
        .querySelector('.option-share-via')) {//If menu is open than click copy link
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

async function extract_social_posts(selector) {
  console.log('Extracting social posts...');
  let all_posts = document.querySelectorAll(
    `.scaffold-finite-scroll__content > div`
  );
  let extracted_posts = [];
  for (let i = 0; i < all_posts.length; i++) {
    await extract_single_social_post(all_posts[i], extracted_posts)
  }
  console.log("returning all_posts")
  console.log("Number of posts Extracted: ", extracted_posts.length)
  console.log(extracted_posts)
  return extracted_posts;
}

setTimeout(() => {
  scroll_to_bottom_page()
}, 3000);
setTimeout(() => {
  extract_social_posts('s');
}, 5000);


//startAutomation();
// if (window.name == 'auto') {
//   if (document.URL.includes("/posts/")) {
//     scroll_to_bottom_page();
//     setTimeout(() => {
//       chrome.runtime.sendMessage(
//         { title: 'What are the extraction rules?' },
//         (res) => {
//           startAutomation(res.rules);
//         }
//       );
//     }, 3000);
//   }
//   else {
//     chrome.runtime.sendMessage(
//       { title: 'What are the extraction rules?' },
//       (res) => {
//         startAutomation(res.rules);
//       }
//     );
//   }
// }
