export const domain = 'https://api.saascafe.io/';
//Production environment
// export const domain = '';

export const null_field = 'N/A';

export const LS = {
  getAllItems: () => chrome.storage.local.get(),
  getItem: async (key) => (await chrome.storage.local.get(key))[key],
  setItem: (key, val) => chrome.storage.local.set({ [key]: val }),
  removeItems: (keys) => chrome.storage.local.remove(keys),
};

export async function click(btn) {
  return new Promise((res, rej) => {
    btn.focus();
    btn.scrollIntoView();
    btn.click();
    btn.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
      })
    );
    btn.dispatchEvent(
      new MouseEvent('mouseup', {
        bubbles: true,
      })
    );
    res();
  });
}

export function scroll_to_bottom_page() {
  window.scrollBy({
    top: 10000,
    left: 100,
    behavior: 'smooth',
  });
}

let CE_id = async () => await LS.getItem('CE_id');
let minutes_interval = 30;
export const interval_check_new_job = minutes_interval * 60 * 1000;
export const API_ENDPOINTS = {
  check_for_new_job: domain + 'api/scraping-job?uuid=423423',
  update_job: domain + 'api/scraping-job-update',
};
 
export function notify(title, message, iconUrl) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: 1,
  });
}

export var notifications = {
  ticketInfoSent: function () {
    let title = 'Company Details Sent to Managers';
    let message = 'Wait...';
    let iconUrl = '../icons/icon_128.png';
    notify(title, message, iconUrl);
  },
};

function isInViewport(element) {
  if (element == null) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
export async function scroll_to_last_job(selector, selectorOffset = '.') {
  return new Promise(function (resolve, reject) {
    let length = document.querySelectorAll(selectorOffset + selector).length;
    let jobScroll = setInterval(function () {
      var containerElements = document.querySelectorAll(
        selectorOffset + selector
      );
      var paginationElement = document.querySelector(
        '.jobs-search-results-list__pagination'
      );
      var seeMoreElement = document.querySelector('.occludable-update');
      var lastElement = containerElements[containerElements.length - 1];
      //lastElement.scrollIntoView();
      for (var i = 0; i < containerElements.length; i++) {
        var title_ele = containerElements[i].querySelector(
          '.job-card-list__title'
        );
        //console.log("TE", title_ele);
        if (title_ele != null) {
          //console.log("TE INNER", title_ele.innerText);
          if (title_ele.innerText == '') {
            console.log('HERE in missing title...');
            containerElements[i].scrollIntoView();
          } else {
            let currentEleBoundary =
              containerElements[i].getBoundingClientRect();
            const y = currentEleBoundary.top + currentEleBoundary.height * 3;
            console.log(
              'ELSE',
              currentEleBoundary,
              y,
              window.pageYOffset,
              document.body.scrollTop
            );
            window.scrollTo({
              top: y,
              left: currentEleBoundary.left,
              right: currentEleBoundary.right,
              behavior: 'smooth',
            });
            // scroll
            //containerElements[i].nextSibling.scrollIntoView();
          }
        }
      }

      const page_result = isInViewport(paginationElement);
      const see_more_result = isInViewport(seeMoreElement);

      if (paginationElement) {
        console.log('paginationElement', page_result);
        // clear the job scroll interval
        clearInterval(jobScroll);
      }
      console.log('seeMORERESULT', see_more_result);
      /*if(see_more_result){
      // clear the job scroll interval
      //clearInterval(jobScroll);      
    }*/
    }, 500);
  });
}
