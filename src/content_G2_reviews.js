console.log('content_G2_reviews is HERE!');
import { LS, null_field, click } from './constants.js';

async function scrape_all_reviews() {
  let all_reviews_elements = document.querySelectorAll(
    '[class="paper paper--white paper--box mb-2 position-relative border-bottom "]'
  );
  for (let i = 0; i < all_reviews_elements.length; i++) {
    let user = await scrape_user_data(all_reviews_elements[i]);
    let review = await scrape_review_data(all_reviews_elements[i]);
  }
}

async function scrape_user_data(review_element) {
  return new Promise(function (resolve, reject) {
    let avatar = review_element.querySelector('.avatar > img')
      ? review_element.querySelector('.avatar > img').src
      : null_field;
    let name = review_element.querySelector(
      'a.link--header-color[href^="https://www.g2.com/users/"]'
    )[0].innerText;
    let job_title = review_element.querySelector('.mt-4th').innerText;
    let company_size;
    if (job_title.includes('Enterprise')) {
      job_title = 'Enterprise';
      company_size = job_title.split('Enterprise')[1];
    } else {
      company_size =
        review_element.querySelector('.mt-4th').nextElementSibling.innerText;
    }
    let all_green_badges_elements = review_element.querySelectorAll(
      '[class="tag x-tooltip-initialized top"]'
    );
    let green_badges = [];
    for (let i = 0; i < all_green_badges_elements.length; i++) {
      green_badges.push(all_green_badges_elements[i].innerText);
    }
    resolve({
      avatar: avatar,
      name: name,
      job_title: job_title,
      company_size: company_size,
      green_badges: green_badges,
    });
  });
}

async function scrape_review_data(review_element) {
  return new Promise(function (resolve, reject) {});
}

if (window.name == 'scrape_all_reviews') {
  scrape_all_reviews();
}
