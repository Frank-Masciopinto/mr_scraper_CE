export const domain = 'https://api.saascafe.io/';
//Production environment
// export const domain = '';

export const null_field = "N/A"

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
    behavior: 'smooth'
});
}

let CE_id = async () => await LS.getItem('CE_id')
let minutes_interval = 30
export const interval_check_new_job = minutes_interval*60*1000
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
