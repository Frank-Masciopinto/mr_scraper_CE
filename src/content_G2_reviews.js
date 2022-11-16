console.log('content_G2_reviews is HERE!');
import { LS, null_field, click } from './constants.js';

async function scrape_all_reviews() {
  let all_reviews_elements = document.querySelectorAll(
    '[class="paper paper--white paper--box mb-2 position-relative border-bottom "]'
  );
  let all_extracted_reviews = [];
  for (let i = 0; i < all_reviews_elements.length; i++) {
    console.log('Extracting following user:');
    console.log(all_reviews_elements[i]);
    let user = await scrape_user_data(all_reviews_elements[i]);
    console.log('User:');
    console.log(user);
    let review = await scrape_review_data(all_reviews_elements[i]);
    console.log('Review:');
    console.log(review);
    all_extracted_reviews.push({
      user: user,
      review: review,
    });
  }
  return all_extracted_reviews;
}

let userScraper = {
  extract_green_badges: function (review_element) {
    let all_green_badges_elements = review_element.querySelector(
      '[class="tags--teal"]'
    ).childNodes;
    let green_badges = [];
    for (let i = 0; i < all_green_badges_elements.length; i++) {
      green_badges.push(all_green_badges_elements[i].innerText);
    }
    return green_badges;
  },
  extract_company_info: function (review_element) {
    let company_info = review_element.querySelector('.mt-4th') ? review_element.querySelector('.mt-4th').innerText : null_field;
    let job_title;
    let company_size;
    if (company_info.includes('Enterprise')) {
      job_title = 'Enterprise';
      company_size = company_info.split('Enterprise')[1];
    } else if (company_info.includes('Small-Business')) {
      job_title = 'Small-Business';
      company_size = company_info.split('Small-Business')[1];
    } else if (company_info.includes('Mid-Market')) {
      job_title = 'Mid-Market';
      company_size = company_info.split('Mid-Market')[1];
    } else {
      job_title = company_info;
      if (review_element.querySelector('.mt-4th')) {
        company_size =
          review_element.querySelector('.mt-4th').nextElementSibling ? review_element.querySelector('.mt-4th').nextElementSibling.innerText : null_field;
      }
      else company_size = null_field;
    }
    return [job_title, company_size];
  },
  extract_name: function (review_element) {
    return review_element.querySelector(
      'a.link--header-color[href^="https://www.g2.com/users/"]'
    )
      ? review_element.querySelector(
          'a.link--header-color[href^="https://www.g2.com/users/"]'
        ).innerText
      : review_element.querySelector('[itemprop="author"]').innerText;
  },
  extract_avatar: function (review_element) {
    return review_element.querySelector('.avatar > img')
      ? review_element
          .querySelector('.avatar > img')
          .getAttribute('data-deferred-image-src')
      : null_field;
  },
};

async function scrape_user_data(review_element) {
  console.log('scrape_user_data');
  return new Promise(function (resolve, reject) {
    let avatar = userScraper.extract_avatar(review_element);
    let name = userScraper.extract_name(review_element);
    let company_info = userScraper.extract_company_info(review_element);
    let job_title = company_info[0];
    let company_size = company_info[1];
    let green_badges = userScraper.extract_green_badges(review_element);
    resolve({
      avatar: avatar,
      name: name,
      job_title: job_title,
      company_size: company_size,
      green_badges: green_badges,
    });
  });
}

function scrape_review_stars(review_element) {
  let old_stars = parseInt(
    review_element
      .querySelector('.stars')
      .getAttribute('class')
      .match(/(?<=stars-).*/)[0]
  );
  //calculate new range for stars
  let OldRange = 10 - 1;
  let NewRange = 5 - 1;
  return (((old_stars - 1) * NewRange) / OldRange + 1).toFixed(1);
}

async function scrape_review_data(review_element) {
  console.log('scrape_review_data');
  //expand review text
  if (review_element.querySelector('a > div[class*="expanded-review"]'))
    click(review_element.querySelector('a > div[class*="expanded-review"]'));
  return new Promise(function (resolve, reject) {
    let stars = scrape_review_stars(review_element);
    let current_date = review_element.querySelector(
      '.x-current-review-date'
    ).innerText;
    let original_date = review_element.querySelector('.x-original-review-date')
      ? review_element.querySelector('.x-original-review-date').innerText
      : null_field;
    let review_text = review_element
      .querySelectorAll('.f-1')[1]
      .innerText.replaceAll(
        '\nReview collected by and hosted on G2.com.\n',
        ''
      );
    resolve({
      stars: stars,
      current_date: current_date,
      original_date: original_date,
      review_text: review_text,
    });
  });
}

// let wait_for_show_more_buttons = setInterval(() => {
//   if(document.querySelector('a > div[class*="expanded-review-"]')) {
//     clearInterval(wait_for_show_more_buttons)
//     scrape_all_reviews();
//   }
// }, 500);

function start_main_automation() {
  //extract and dont close the window
  setTimeout(() => {
    scrape_all_reviews().then((res) => {
      console.log('Finished:');
      console.log(res);
      //get page number and send it to content_G2 to check if this is last page
      let page_number = document.URL.includes('page=')
        ? parseInt(document.URL.match(/(?<=page\=).*/)[0])
        : 1;
      let last_page_to_scrap = document.querySelector('div[data-poison-omit] > ul > li:last-child > a')
      chrome.runtime.sendMessage(
        {
          message: 'Next Review Page Extracted',
          reviews: res,
          page_number: page_number,
          is_last_page: last_page_to_scrap ? false : true,
        },
        (res) => {
          if (!last_page_to_scrap) window.close();
          else {
            //click next page and keep extracting
            let nextPage = page_number + 1;
            console.log('Next Page number: ' + nextPage);
            let nextPageUrl = document.URL.split('#')[0];
            nextPageUrl = nextPageUrl.split('?')[0];
            window.location = nextPageUrl + '?page=' + nextPage;
          }
        } //if not on first page, close window
      );
    });
  }, 3000);
}

if (window.name == 'scrape_all_reviews' && document.querySelector('div[class="paper__bd paper__bd--multi"]')) {
  start_main_automation();
}
