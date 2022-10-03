'use strict';

import { LS, null_field } from './constants.js';

console.log('Mr_Scraper - Content Script Injected');

function startAutomation() {
    let rules = [
		{property: 'company_name', rule: `span[dir='ltr']`, type: 'dom'},
		{property: 'Headline', rule: `.org-top-card-summary__tagline`, type:'dom'},
		{property: 'Followers', rule: `(?<= )[^A-Za-z]*(?= followers)`, type:'regexp'},
		{property: 'overview', rule: `.org-top-card-summary__tagline`, type:'dom'},
	]
    let extracted_info = {}
    for (let i = 0; i < rules.length; i++) {
        console.log('Rule: \n' + rules[i].rule)
        extracted_info[rules[i].property] = document.querySelector(rules[i].rule).innerText;
    }
    console.log('Extracted info: \n', extracted_info)
}
startAutomation();
// if (window.name == 'auto') {
//   chrome.runtime.sendMessage(
//     { title: 'What are the extraction rules?' },
//     (res) => {
//       startAutomation(res.rules);
//     }
//   );
// }
