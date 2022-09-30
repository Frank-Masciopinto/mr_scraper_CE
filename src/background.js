'use strict';
import { notifications, LS, notify, optionPageURL } from './constants.js';
const { v1: uuidv1 } = require('uuid');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == 'install') {
    await LS.setItem('CE_id', uuidv1());
    notify(
      'Mr Scraper Installed Successfully',
      'Get started!',
      '../icons/icon_128.png'
    );
  }
});
