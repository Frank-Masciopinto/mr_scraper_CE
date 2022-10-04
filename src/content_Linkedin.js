'use strict';

import { LS, null_field } from './constants.js';

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
            name: all_pages_people_also_viewed[i].querySelector(".artdeco-entity-lockup__title").innerText,
            followers: all_pages_people_also_viewed[i].querySelector(".artdeco-entity-lockup__caption").innerText
        }
        all_pages.push(singlePage);
    }
    return all_pages;
}
function getClipboard() {
    var result = null;
    var textarea = document.getElementById('ta');
    textarea.value = '';
    textarea.select();

    if (document.execCommand('paste')) {
        result = textarea.value;
    } else {
        console.log('failed to get clipboard content');
    }

    textarea.value = '';
    return result;
}
function extract_social_posts(selector) {
    console.log("Extracting social posts...");
    let all_posts = document.querySelectorAll(`.scaffold-finite-scroll__content > div`)
    let extracted_posts = [];
    for(let i = 0; i < all_posts.length; i++) {
        console.log(all_posts[i]);
        let caption = all_posts[i].querySelector(".update-components-text").innerText
        let link_to_post;
        //Open dropdown for copy post link
        all_posts[i].querySelector(".feed-shared-control-menu__trigger").click()
        setTimeout(() => {
            console.log("CLicking copy link...")
            click(document.querySelector(".feed-shared-control-menu__content").querySelector(".option-share-via").firstElementChild)
        }, 3000);
        setTimeout(() => {
            // chrome.runtime.sendMessage({message: "getClipboard"}, (response) => {
            //     console.log(response)})
            navigator.clipboard
            .readText()
            .then(
                (clipText) => link_to_post = clipText
            );
        }, 4000);
        if (i == 0) {
            break
        }
    }
}
extract_social_posts("s")
async function click(btn) {
    return new Promise((res, rej) => {
        btn.scrollIntoView();
        btn.click();
        btn.dispatchEvent(new MouseEvent('mousedown', {
                'bubbles': true
            }));
        btn.dispatchEvent(new MouseEvent('mouseup', {
                'bubbles': true
            }));
        res();
    })
}

//startAutomation();
// if (window.name == 'auto') {
//   chrome.runtime.sendMessage(
//     { title: 'What are the extraction rules?' },
//     (res) => {
//       startAutomation(res.rules);
//     }
//   );
// }
