console.log('👉 search_company_by_name.js is here!');

let CE_id = 'ikloafbfooegcdglmhahaeifcgjbhkon';
let all_scraped_companies = [];
let company_permalink_list = [];

async function scrapeSingleCompany(singleCompanyPermalink) {
  return new Promise((resolve, reject) => {
    fetch(singleCompanyPermalink, {
      // Adding method type
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        console.log('👽 Crunchbase Single-Company Api JsonResponse: ');
        console.log(jsonResponse);
        all_scraped_companies.push(jsonResponse);
        resolve();
      });
  });
}

async function loop_extract_all_companies(search_result_list) {
  let params_for_search_single_company =
    '?field_ids=%5B%22identifier%22,%22layout_id%22,%22facet_ids%22,%22title%22,%22short_description%22,%22is_locked%22%5D&layout_mode=view_v2';
  let crunchbase_API_single_company =
    'https://www.crunchbase.com/v4/data/entities/organizations/';
  for (let i = 0; i < search_result_list.length; i++) {
    let permalink = encodeURIComponent(
      search_result_list[i].properties.identifier.permalink
    );
    const singleCompanyPermalink =
      crunchbase_API_single_company +
      permalink +
      params_for_search_single_company;
    await scrapeSingleCompany(singleCompanyPermalink);
  }
  console.log(
    '🔚 All companies extracted successfully, returning to our API...'
  );
  chrome.runtime.sendMessage(
    CE_id,
    {
      message: 'SearchByCompanyName Extraction completed successfully',
      all_companies: all_scraped_companies,
    },
    (response) => {}
  );
}


function search_by_number_of_days() {
  console.log("📅 search_by_number_of_days()");
  fetch(
    'https://www.crunchbase.com/v4/data/searches/organization.companies?source=custom_advanced_search',
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json',
        'sec-ch-ua':
          '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-requested-with': 'XMLHttpRequest',
        'x-xsrf-token': 'iI13vglQ1OCG/ZeJo/Naa8KXPVC7SuF5T4ynyx9na6s',
      },
      referrer:
        'https://www.crunchbase.com/discover/organization.companies/f0248b21cbf306189728f28da20b645a',
      referrerPolicy: 'same-origin',
      body: '{"field_ids":["identifier","founded_on","categories","location_identifiers","short_description","rank_org_company","num_investments_funding_rounds","num_diversity_spotlight_investments","num_exits","last_funding_type","last_funding_at","funding_stage","website"],"order":[{"field_id":"rank_org_company","sort":"asc"}],"query":[{"type":"predicate","field_id":"founded_on","operator_id":"gte","include_nulls":false,"values":["30 days ago"]}],"field_aggregators":[],"collection_id":"organization.companies","limit":1000}',
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
    }
  )
    .then((response) => response.json())
    .then((jsonResponse) => {
      console.log('👉 Crunchbase Api JsonResponse: ');
      console.log(jsonResponse);
      loop_extract_all_companies(jsonResponse.entities);
    });
}

chrome.runtime.sendMessage(
  CE_id,
  { message: 'How many days in the past should I search?' },
  (response) => {
    console.log('Response from Background page', response.number_of_days);
    search_by_number_of_days(response.number_of_days);
  }
);
