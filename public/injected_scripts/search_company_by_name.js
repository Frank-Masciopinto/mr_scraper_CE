console.log('👉 search_company_by_name.js is here!');

let CE_id = 'ikloafbfooegcdglmhahaeifcgjbhkon';
let all_scraped_companies = [];


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
      search_result_list[i].identifier.permalink
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

function searchByCompanyName(companyName) {
  console.log('searchByCompanyName(): ', companyName);
  let crunchbase_API_searchByName =
    'https://www.crunchbase.com/v4/data/autocompletes?query=' +
    companyName +
    '&collection_ids=organizations&limit=25&source=topSearch';

  fetch(crunchbase_API_searchByName, {
    // Adding method type
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((jsonResponse) => {
      console.log('👉 Crunchbase Api JsonResponse: ');
      console.log(jsonResponse);
      let searchResultsList = jsonResponse.entities;
      loop_extract_all_companies(searchResultsList);
    });
}

chrome.runtime.sendMessage(
  CE_id,
  { message: 'What is the company name I need to search for on Crunchbase?' },
  (response) => {
    console.log('Response from Background page', response.companyName);
    searchByCompanyName(response.companyName);
  }
);
