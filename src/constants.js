// export const domain = 'http://127.0.0.1:8000/';
//Production environment
// export const domain = '';

export const null_field = "N/A"

export const LS = {
  getAllItems: () => chrome.storage.local.get(),
  getItem: async (key) => (await chrome.storage.local.get(key))[key],
  setItem: (key, val) => chrome.storage.local.set({ [key]: val }),
  removeItems: (keys) => chrome.storage.local.remove(keys),
};
let CE_id = async () => await LS.getItem('CE_id')

export const API_ENDPOINTS = {
  post_ticket_info: domain + 'api/company/updateSocialProfiles',
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
